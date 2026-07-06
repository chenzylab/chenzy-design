---
"@chenzy-design/svelte": minor
"@chenzy-design/tokens": minor
"@chenzy-design/locale": minor
---

SideBar P4：新增 SideBarCodeContent 代码/JSON 预览折叠列表（对标 Semi sideBar/widget/code）。Collapse 折叠列表，每项一个 CodeItem，按 `isJson` 分流：`true` 用 JsonViewer 渲染 content（内核动态 import 惰性加载），`false` 用 CodeHighlight 按 `language` 语法高亮；透传 `jsonViewerProps` / `codeHighlightProps`。折叠头显示图标 + `name` + 全屏展开按钮，点击展开按钮走 `onExpand(e, code, 'code')` 不触发折叠。受控 `activeKey`（不回写，仅 `onChange` 通知，内部兜底非受控）。a11y：折叠头 `aria-expanded` 由 Collapse.Panel 提供，展开按钮 `aria-label` 走 i18n（新增 `SideBar.expand`）。新增 `--cd-sidebar-code-*` component token。
