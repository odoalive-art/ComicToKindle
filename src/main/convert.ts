import { promises as fs } from 'fs'
import { createWriteStream, statSync } from 'fs'
import { basename, extname, join } from 'path'
import sharp from 'sharp'
import { ZipArchive } from 'archiver'

/**
 * 漫画 → Kindle 友好固定版式 EPUB3 转换引擎。
 *
 * 移植自既有的 quirky-planck/converter.js，仅保留经验证的转换技术实现：
 *   - sharp 图像管线：灰度（封面保留彩色）、按设备档位缩放、mozjpeg 压缩
 *   - 双页拆分：横图按阅读方向切成左右两页
 *   - 按体积分卷：超过单卷上限时切成多个 EPUB
 *   - archiver 打包：mimetype 必须第一个且不压缩
 *
 * 与原实现的差异：去掉 Calibre/AZW3 外部依赖；图片来源改为「显式有序绝对路径列表」
 * 以支持库内「单话子文件夹」的嵌套卷册（由 library.collectVolumeImagePaths 提供）。
 */

// ---------- 设备档位 ----------
export type DeviceProfile = 'pw3' | 'pw5' | 'pw6' | 'ko3' | 'oasis' | 'scribe' | 'original'

export const PROFILE_RES: Record<DeviceProfile, { width: number; height: number } | null> = {
  pw3: { width: 1072, height: 1448 },
  pw5: { width: 1236, height: 1648 },
  pw6: { width: 1264, height: 1680 },
  ko3: { width: 1264, height: 1680 }, // Kindle Oasis 3 / Paperwhite 6 同分辨率
  oasis: { width: 1264, height: 1680 },
  scribe: { width: 1860, height: 2480 },
  original: null
}

export interface ConvertOptions {
  deviceProfile?: DeviceProfile
  mangaMode?: boolean // RTL 阅读
  grayscale?: boolean
  splitDoublePages?: boolean
  imageQuality?: number
  maxVolumeSize?: number // MB
  backgroundColor?: string
  concurrency?: number
}

export interface ConvertOutput {
  path: string
  fileName: string
  sizeBytes: number
  volTitle: string
}

export interface ConvertResult {
  outputs: ConvertOutput[]
  pageCount: number
  totalVolumes: number
}

const DEFAULTS: Required<ConvertOptions> = {
  deviceProfile: 'pw6', // pw6/ko3 = 1264x1680
  mangaMode: true,
  grayscale: true,
  splitDoublePages: true,
  imageQuality: 85,
  maxVolumeSize: 45,
  backgroundColor: '#ffffff',
  concurrency: 6
}

// ---------- 辅助 ----------
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })
const naturalSort = (arr: string[]): string[] => arr.sort(collator.compare)

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '&':
        return '&amp;'
      case "'":
        return '&apos;'
      case '"':
        return '&quot;'
      default:
        return c
    }
  })
}

// 简单并发映射
async function pMap<T, R>(
  array: T[],
  mapper: (item: T, index: number) => Promise<R>,
  concurrency: number
): Promise<R[]> {
  const results: R[] = []
  const iterator = array.entries()
  const workers = Array(Math.max(1, concurrency))
    .fill(null)
    .map(async () => {
      for (const [index, item] of iterator) {
        results[index] = await mapper(item, index)
      }
    })
  await Promise.all(workers)
  return results
}

interface Dimensions {
  width: number
  height: number
}

// 单页处理内核：灰度 → 按档位缩放 → mozjpeg 压缩，产出 buffer。转换（落盘）与
// 预览（返回 data URL）共用同一条管线，保证预览所见即最终产物。
async function processImageToBuffer(
  pipeline: sharp.Sharp,
  targetWidth: number | null,
  targetHeight: number | null,
  grayscale: boolean,
  imageQuality: number
): Promise<{ buffer: Buffer; info: sharp.OutputInfo }> {
  let p = pipeline
  if (grayscale) p = p.grayscale()
  if (targetWidth && targetHeight) {
    p = p.resize(targetWidth, targetHeight, { fit: 'inside', withoutEnlargement: false })
  }
  const { data, info } = await p
    .jpeg({ quality: imageQuality, progressive: true, mozjpeg: true })
    .toBuffer({ resolveWithObject: true })
  return { buffer: data, info }
}

async function processAndSaveImage(
  pipeline: sharp.Sharp,
  destPath: string,
  targetWidth: number | null,
  targetHeight: number | null,
  grayscale: boolean,
  imageQuality: number
): Promise<Dimensions> {
  const { buffer, info } = await processImageToBuffer(
    pipeline,
    targetWidth,
    targetHeight,
    grayscale,
    imageQuality
  )
  await fs.writeFile(destPath, buffer)
  return { width: info.width, height: info.height }
}

// ---------- 单页预览 ----------
export interface PreviewPageOutput {
  dataUrl: string
  width: number
  height: number
  bytes: number
}

export interface PreviewPageResult {
  isCover: boolean
  split: boolean
  profile: { width: number | null; height: number | null }
  original: { width: number; height: number; bytes: number; dataUrl: string }
  outputs: PreviewPageOutput[]
}

const toDataUrl = (buf: Buffer): string => `data:image/jpeg;base64,${buf.toString('base64')}`

/**
 * 对单张源页跑一遍真实转换管线，返回处理前后的图与体积，供「模拟 Kindle 预览」调参。
 * 复用与整本转换完全相同的封面判定 / 双页拆分 / 灰度 / 缩放 / mozjpeg 逻辑。
 * pageIndex 仅用于判定是否封面（首页保留彩色）；切页由调用方传入对应的源路径。
 */
export async function previewConvertPage(
  srcPath: string,
  pageIndex: number,
  options: ConvertOptions = {}
): Promise<PreviewPageResult> {
  const opt = { ...DEFAULTS, ...options }
  const res = PROFILE_RES[opt.deviceProfile]
  const targetWidth = res?.width ?? null
  const targetHeight = res?.height ?? null

  const metadata = await sharp(srcPath).metadata()
  const ow = metadata.width ?? 0
  const oh = metadata.height ?? 0
  const srcBytes = (await fs.stat(srcPath)).size

  // 「转换前」展示原图（彩色），缩到适合显示的尺寸，不动质量判断
  const origPreview = await sharp(srcPath)
    .resize(1400, 1400, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 90 })
    .toBuffer()
  const original = { width: ow, height: oh, bytes: srcBytes, dataUrl: toDataUrl(origPreview) }

  const isCover = pageIndex === 0
  const applyGrayscale = isCover ? false : opt.grayscale

  const outputs: PreviewPageOutput[] = []
  const makeOutput = async (pipeline: sharp.Sharp): Promise<void> => {
    const { buffer, info } = await processImageToBuffer(
      pipeline,
      targetWidth,
      targetHeight,
      applyGrayscale,
      opt.imageQuality
    )
    outputs.push({
      dataUrl: toDataUrl(buffer),
      width: info.width,
      height: info.height,
      bytes: buffer.length
    })
  }

  const isWide = ow > 0 && oh > 0 && ow > oh
  if (opt.splitDoublePages && isWide) {
    const halfWidth = Math.floor(ow / 2)
    const leftCrop = { left: 0, top: 0, width: halfWidth, height: oh }
    const rightCrop = { left: halfWidth, top: 0, width: ow - halfWidth, height: oh }
    // RTL：右半在前
    const [p1Crop, p2Crop] = opt.mangaMode ? [rightCrop, leftCrop] : [leftCrop, rightCrop]
    await makeOutput(sharp(srcPath).extract(p1Crop))
    await makeOutput(sharp(srcPath).extract(p2Crop))
  } else {
    await makeOutput(sharp(srcPath))
  }

  return {
    isCover,
    split: outputs.length > 1,
    profile: { width: targetWidth, height: targetHeight },
    original,
    outputs
  }
}

// ---------- content.opf ----------
interface OpfArgs {
  title: string
  author: string
  mangaMode: boolean
  viewWidth: number
  viewHeight: number
  processedImages: string[]
  coverIndex: number
}

function generateContentOpf({
  title,
  author,
  mangaMode,
  viewWidth,
  viewHeight,
  processedImages,
  coverIndex
}: OpfArgs): string {
  const manifestItems: string[] = []
  const spineItems: string[] = []

  manifestItems.push(
    `    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`
  )

  processedImages.forEach((imgFile, k) => {
    const pageIndexStr = String(k).padStart(4, '0')
    const xhtmlId = `page-${pageIndexStr}`
    const imgId = `img-${pageIndexStr}`
    manifestItems.push(
      `    <item id="${xhtmlId}" href="xhtml/page-${pageIndexStr}.xhtml" media-type="application/xhtml+xml"/>`
    )
    if (k === coverIndex) {
      manifestItems.push(
        `    <item id="${imgId}" href="images/${imgFile}" media-type="image/jpeg" properties="cover-image"/>`
      )
    } else {
      manifestItems.push(
        `    <item id="${imgId}" href="images/${imgFile}" media-type="image/jpeg"/>`
      )
    }
    spineItems.push(`    <itemref idref="${xhtmlId}"/>`)
  })

  const uuid = `urn:uuid:${Math.random().toString(36).substring(2, 15)}`
  const dateStr = new Date().toISOString().substring(0, 19) + 'Z'
  const writingMode = mangaMode ? 'horizontal-rl' : 'horizontal-lr'
  const pageProgression = mangaMode ? 'rtl' : 'ltr'
  const coverImgId = `img-${String(coverIndex).padStart(4, '0')}`

  return `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="pub-id" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="pub-id">${uuid}</dc:identifier>
    <dc:title>${escapeXml(title)}</dc:title>
    <dc:creator>${escapeXml(author)}</dc:creator>
    <dc:language>zh</dc:language>
    <meta property="dcterms:modified">${dateStr}</meta>

    <!-- Fixed-Layout Specs -->
    <meta property="rendition:layout">pre-paginated</meta>
    <meta property="rendition:orientation">auto</meta>
    <meta property="rendition:spread">none</meta>

    <!-- Kindle Specific Comic Metadata -->
    <meta name="cover" content="${coverImgId}"/>
    <meta name="book-type" content="comic"/>
    <meta name="fixed-layout" content="true"/>
    <meta name="original-resolution" content="${viewWidth}x${viewHeight}"/>
    <meta name="orientation-lock" content="none"/>
    <meta name="primary-writing-mode" content="${writingMode}"/>
    <meta name="zero-gutter" content="true"/>
    <meta name="zero-margin" content="true"/>
  </metadata>

  <manifest>
${manifestItems.join('\n')}
  </manifest>

  <spine page-progression-direction="${pageProgression}">
${spineItems.join('\n')}
  </spine>
</package>`
}

// ---------- zip ----------
function zipEPUB(srcDir: string, destZipPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = createWriteStream(destZipPath)
    // archiver 8：用 ZipArchive 类替代旧的 archiver('zip', …) 工厂调用
    const archive = new ZipArchive({ zlib: { level: 1 } })
    output.on('close', () => resolve())
    archive.on('error', (err) => reject(err))
    archive.pipe(output)
    // mimetype 必须第一个且不压缩
    archive.append('application/epub+zip', { name: 'mimetype', store: true })
    archive.directory(join(srcDir, 'META-INF'), 'META-INF')
    archive.directory(join(srcDir, 'OEBPS'), 'OEBPS')
    archive.finalize()
  })
}

// ---------- 主流程 ----------
export interface ConvertParams {
  imagePaths: string[] // 按阅读顺序的源图片绝对路径
  outputDir: string
  title: string
  author?: string
  options?: ConvertOptions
  onProgress?: (percent: number, message: string) => void
  onLog?: (message: string) => void
  checkCancelled?: () => boolean
}

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif', '.avif'])

export async function convertMangaToEPUB({
  imagePaths,
  outputDir,
  title,
  author = 'Unknown',
  options = {},
  onProgress = () => {},
  onLog = () => {},
  checkCancelled = () => false
}: ConvertParams): Promise<ConvertResult> {
  const opt = { ...DEFAULTS, ...options }
  const taskId = Math.random().toString(36).substring(2, 9)
  const tempDir = join(outputDir, `tmp_${taskId}`)

  try {
    onLog(`[Start] 初始化转换：${title}`)
    onLog(
      `[Config] 档位=${opt.deviceProfile} 灰度=${opt.grayscale} 双页拆分=${opt.splitDoublePages} 方向=${opt.mangaMode ? 'RTL' : 'LTR'} 分卷上限=${opt.maxVolumeSize}MB`
    )

    const imageFiles = imagePaths.filter((p) => IMAGE_EXTS.has(extname(p).toLowerCase()))
    if (imageFiles.length === 0) throw new Error('这一卷里没有可转换的图片。')
    onLog(`[Scan] 源图片 ${imageFiles.length} 张`)

    const res = PROFILE_RES[opt.deviceProfile]
    const targetWidth = res?.width ?? null
    const targetHeight = res?.height ?? null
    onLog(
      targetWidth
        ? `[Resolution] 优化档位 ${opt.deviceProfile} (${targetWidth}x${targetHeight})`
        : `[Resolution] 保持原始分辨率`
    )

    await fs.mkdir(outputDir, { recursive: true })
    const tempImagesDir = join(tempDir, 'processed_images')
    await fs.mkdir(tempImagesDir, { recursive: true })

    const fileDimensions: Record<string, Dimensions> = {}
    let completedCount = 0

    const processSingleImage = async (srcPath: string, i: number): Promise<string[]> => {
      if (checkCancelled()) throw new Error('Cancelled')
      const img = sharp(srcPath)
      let metadata: sharp.Metadata
      try {
        metadata = await img.metadata()
      } catch {
        onLog(`[Warning] 跳过损坏图片：${basename(srcPath)}`)
        return []
      }

      // 封面页保留彩色（彩色设备/云端阅读器显示更好）
      const isCoverPage = i === 0
      const applyGrayscale = isCoverPage ? false : opt.grayscale

      const localProcessed: string[] = []
      const fileBase = basename(srcPath, extname(srcPath)) + `_${String(i).padStart(4, '0')}`

      if (opt.splitDoublePages && (metadata.width ?? 0) > (metadata.height ?? 0)) {
        const width = metadata.width as number
        const height = metadata.height as number
        const halfWidth = Math.floor(width / 2)
        const leftCrop = { left: 0, top: 0, width: halfWidth, height }
        const rightCrop = { left: halfWidth, top: 0, width: width - halfWidth, height }
        // RTL：右半在前
        const [p1Crop, p2Crop] = opt.mangaMode ? [rightCrop, leftCrop] : [leftCrop, rightCrop]
        const p1Name = `${fileBase}_p1.jpg`
        const p2Name = `${fileBase}_p2.jpg`

        fileDimensions[p1Name] = await processAndSaveImage(
          sharp(srcPath).extract(p1Crop),
          join(tempImagesDir, p1Name),
          targetWidth,
          targetHeight,
          applyGrayscale,
          opt.imageQuality
        )
        localProcessed.push(p1Name)
        fileDimensions[p2Name] = await processAndSaveImage(
          sharp(srcPath).extract(p2Crop),
          join(tempImagesDir, p2Name),
          targetWidth,
          targetHeight,
          applyGrayscale,
          opt.imageQuality
        )
        localProcessed.push(p2Name)
      } else {
        const destName = `${fileBase}.jpg`
        fileDimensions[destName] = await processAndSaveImage(
          img,
          join(tempImagesDir, destName),
          targetWidth,
          targetHeight,
          applyGrayscale,
          opt.imageQuality
        )
        localProcessed.push(destName)
      }

      completedCount++
      onProgress(
        Math.floor((completedCount / imageFiles.length) * 60),
        `处理图片 ${completedCount}/${imageFiles.length}`
      )
      return localProcessed
    }

    const pMapResults = await pMap(imageFiles, processSingleImage, opt.concurrency)
    const processedFiles = naturalSort(pMapResults.flat().filter(Boolean))
    onLog(`[Image Processing] 完成，产出 ${processedFiles.length} 张`)

    // 按体积分卷
    const maxBytes = opt.maxVolumeSize * 1024 * 1024
    const volumes: string[][] = []
    let currentVolume: string[] = []
    let currentVolumeSize = 0
    for (const file of processedFiles) {
      const size = statSync(join(tempImagesDir, file)).size
      if (currentVolume.length > 0 && currentVolumeSize + size > maxBytes) {
        volumes.push(currentVolume)
        currentVolume = [file]
        currentVolumeSize = size
      } else {
        currentVolume.push(file)
        currentVolumeSize += size
      }
    }
    if (currentVolume.length > 0) volumes.push(currentVolume)
    onLog(`[Splitting] 分为 ${volumes.length} 卷`)

    const viewWidth = targetWidth ?? 1200
    const viewHeight = targetHeight ?? 1600
    const outputs: ConvertOutput[] = []

    for (let v = 0; v < volumes.length; v++) {
      if (checkCancelled()) throw new Error('Cancelled')
      const volFiles = volumes[v]
      const volNumber = v + 1
      const volTitle = volumes.length > 1 ? `${title} (${volNumber}-${volumes.length})` : title

      onLog(`[Compile] 构建第 ${volNumber}/${volumes.length} 卷：${volTitle}`)
      onProgress(
        70 + Math.floor((v / volumes.length) * 20),
        `编译第 ${volNumber}/${volumes.length} 卷`
      )

      const volEpubDir = join(tempDir, `vol_${v}`)
      const volMetaDir = join(volEpubDir, 'META-INF')
      const volOebpsDir = join(volEpubDir, 'OEBPS')
      const volOebpsImagesDir = join(volOebpsDir, 'images')
      const volOebpsXhtmlDir = join(volOebpsDir, 'xhtml')
      await fs.mkdir(volMetaDir, { recursive: true })
      await fs.mkdir(volOebpsImagesDir, { recursive: true })
      await fs.mkdir(volOebpsXhtmlDir, { recursive: true })

      for (const file of volFiles) {
        await fs.rename(join(tempImagesDir, file), join(volOebpsImagesDir, file))
      }

      await fs.writeFile(join(volEpubDir, 'mimetype'), 'application/epub+zip', 'utf8')
      await fs.writeFile(
        join(volMetaDir, 'container.xml'),
        `<?xml version="1.0" encoding="UTF-8" ?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`,
        'utf8'
      )
      await fs.writeFile(
        join(volOebpsDir, 'nav.xhtml'),
        `<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>Navigation</title>
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>Table of Contents</h1>
    <ol>
      <li><a href="xhtml/page-0000.xhtml">Start</a></li>
    </ol>
  </nav>
</body>
</html>`,
        'utf8'
      )

      for (let k = 0; k < volFiles.length; k++) {
        const imgFile = volFiles[k]
        const pageIndexStr = String(k).padStart(4, '0')
        const dim = fileDimensions[imgFile] ?? { width: viewWidth, height: viewHeight }
        await fs.writeFile(
          join(volOebpsXhtmlDir, `page-${pageIndexStr}.xhtml`),
          `<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Page ${k}</title>
  <meta name="viewport" content="width=${viewWidth}, height=${viewHeight}"/>
  <style type="text/css">
    body { margin: 0; padding: 0; background-color: ${opt.backgroundColor}; }
    div { position: absolute; width: ${dim.width}px; height: ${dim.height}px; top: 0; bottom: 0; left: 0; right: 0; margin: auto; padding: 0; }
    img { position: absolute; top: 0; bottom: 0; left: 0; right: 0; margin: auto; width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div>
    <img src="../images/${imgFile}" alt="Page ${k}"/>
  </div>
</body>
</html>`,
          'utf8'
        )
      }

      await fs.writeFile(
        join(volOebpsDir, 'content.opf'),
        generateContentOpf({
          title: volTitle,
          author,
          mangaMode: opt.mangaMode,
          viewWidth,
          viewHeight,
          processedImages: volFiles,
          coverIndex: 0
        }),
        'utf8'
      )

      const volEpubName = `${volTitle.replace(/[/\\?%*:|"<>\s]/g, '_')}.epub`
      const finalEpubPath = join(outputDir, volEpubName)
      await zipEPUB(volEpubDir, finalEpubPath)
      outputs.push({
        path: finalEpubPath,
        fileName: volEpubName,
        sizeBytes: statSync(finalEpubPath).size,
        volTitle
      })
      onLog(`[Zip] EPUB 已生成：${volEpubName}`)
    }

    onProgress(95, '清理临时文件…')
    await fs.rm(tempDir, { recursive: true, force: true })
    onLog(`[Success] 共生成 ${outputs.length} 卷`)
    return { outputs, pageCount: processedFiles.length, totalVolumes: outputs.length }
  } catch (error) {
    onLog(`[Error] 转换失败：${(error as Error).message}`)
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {})
    throw error
  }
}
