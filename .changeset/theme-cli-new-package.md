---
'@chenzy-design/theme-cli': minor
---

新增 `@chenzy-design/theme-cli` 主题 CLI 包：

- `defineTheme(config)`：类型化配置辅助。
- `chenzy-theme init`：生成 `theme.config.ts` 模板（已存在则不覆盖）。
- `chenzy-theme build`：读 `theme.config.{ts,mts,mjs,js}`（TS 用 tsx 加载），
  按 `@chenzy-design/tokens` 的 token-manifest 校验 key 合法性，
  产出 `dist/theme.css`——`:root{}`（alias 段）+ `[data-theme="dark"]{}`（暗色段）。
