// 自定义 macOS 签名钩子。
//
// 背景：electron-builder 自带签名器（@electron/osx-sign）在本机会卡死在 signing
// 步骤（疑似签名后的 Gatekeeper/spctl 联网评估，国内网络挂起）；而直接
// `codesign --deep` 对同一个 app 包只需 ~0.6 秒。这里绕开自带签名器，直接 codesign。
//
// 自签 + 不公证的包不需要 Apple 安全时间戳，故 `--timestamp=none`，否则会再联网。
//
// 用法：electron-builder.yml 里 `mac.identity: "-"` +
// `mac.sign: scripts/sign-mac.cjs`。identity 的 "-" 只是让 electron-builder 进入钩子；
// 设为 null 会在钩子解析之前直接跳过整个签名流程。
// 传 CTK_SIGN_IDENTITY=<自签证书名> 用该证书签（自动更新依赖稳定签名身份）；
// 不传则 ad-hoc 签（`--sign -`，Apple Silicon 至少要 ad-hoc 才能启动）。
const { execFileSync } = require('node:child_process')

exports.default = async function sign(configuration) {
  const appPath = configuration.app || configuration.path
  if (!appPath) {
    throw new Error(
      '[sign-mac] 未拿到 app 路径；configuration keys=' +
        Object.keys(configuration || {}).join(',')
    )
  }

  const identity = process.env.CTK_SIGN_IDENTITY && process.env.CTK_SIGN_IDENTITY.trim()
  const signArg = identity || '-' // '-' = ad-hoc

  console.log(`[sign-mac] codesign --deep "${appPath}" → ${identity ? `"${identity}"` : 'ad-hoc'}`)
  execFileSync('codesign', ['--force', '--deep', '--timestamp=none', '--sign', signArg, appPath], {
    stdio: 'inherit'
  })
  console.log('[sign-mac] 签名完成')
}
