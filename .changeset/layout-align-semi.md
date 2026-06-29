---
"@chenzy-design/svelte": minor
---

Layout 家族 API 对齐 Semi：

- Layout / Header / Content / Footer / Sider 全部新增 `style`（透传内联样式，叠加在派生样式之后可覆盖）、`ariaLabel`、`role`（可访问性透传，对齐 Semi ≥2.3.0）。
- Sider 新增 `onBreakpoint(matched, breakpoint)` 回调（headless createSider 早已支持，此前未在组件层暴露），命中响应式断点时触发。
