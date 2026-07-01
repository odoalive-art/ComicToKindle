// 转换选项（非敏感，存 localStorage）。字段与 main 的 convert.ts DEFAULTS 保持一致。
export const CONVERT_OPTIONS_KEY = 'comic-to-kindle-convert-options'
export type DeviceProfileOpt = 'pw6' | 'ko3' | 'pw5' | 'pw3' | 'scribe' | 'original'
export const PROFILE_ORDER: DeviceProfileOpt[] = ['pw6', 'ko3', 'pw5', 'pw3', 'scribe', 'original']
export interface ConvertOptionsState {
  deviceProfile: DeviceProfileOpt
  mangaMode: boolean
  grayscale: boolean
  splitDoublePages: boolean
  imageQuality: number
  maxVolumeSize: number
}
export const DEFAULT_CONVERT_OPTIONS: ConvertOptionsState = {
  deviceProfile: 'pw6',
  mangaMode: true,
  grayscale: true,
  splitDoublePages: true,
  imageQuality: 85,
  maxVolumeSize: 45
}
export function loadConvertOptions(): ConvertOptionsState {
  try {
    const raw = window.localStorage.getItem(CONVERT_OPTIONS_KEY)
    if (raw) return { ...DEFAULT_CONVERT_OPTIONS, ...JSON.parse(raw) }
  } catch {
    /* 解析失败回退默认 */
  }
  return { ...DEFAULT_CONVERT_OPTIONS }
}
