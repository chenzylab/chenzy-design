---
'@chenzy-design/svelte': patch
'@chenzy-design/unocss-preset': patch
'@chenzy-design/theme-cli': patch
'@chenzy-design/illustrations': patch
---

fix: 修复内部依赖 workspace:\* 协议未替换为真实版本号的发布缺陷

1.0.0 发布过程中部分包改用 `npm publish` 手动补发（因新包首发遇到 npm
OIDC 404 中断了 CI 的 `pnpm release`），`npm publish` 不识别 pnpm 的
`workspace:*` 协议，导致 `@chenzy-design/svelte`（依赖 core/icons/
illustrations/locale/tokens）、`@chenzy-design/unocss-preset`、
`@chenzy-design/theme-cli`（均依赖 tokens）三个包的已发布 tarball 里，
对应内部依赖字段原样写着 `workspace:*` 而非真实版本号——外部用户
`pnpm/npm/yarn install` 时会直接因无法解析该协议而失败。

本次修复通过正常 `pnpm release`（CI 内置的 `pnpm -r publish`）重新发布，
pnpm publish 会正确将 `workspace:*` 替换为对应包的当前真实版本号。
