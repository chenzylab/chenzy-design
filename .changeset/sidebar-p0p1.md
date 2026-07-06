---
"@chenzy-design/svelte": minor
"@chenzy-design/core": minor
"@chenzy-design/tokens": minor
"@chenzy-design/locale": minor
---

新增 SideBar（AI 侧边信息栏套件，show/AI，对标 Semi Sidebar）P0+P1 阶段。P0 SideBarContainer 为可伸缩浮层壳：贴视口右侧（RTL 贴左），`role="dialog"` + `aria-labelledby`(title)，打开移焦 + focus-trap 焦点捕获/归还 + Esc 关闭，堆叠 z-index 复用 modal/z-stack 计数器（与 Modal/SideSheet 统一层栈，后开者在上）；resizable 时左边缘（RTL 右边缘）把手拖拽调宽——复用 core `createResizeDrag`（axis:'x' 单轴 + clamp minWidth/maxWidth），把手 `role="separator"` + `aria-orientation="vertical"` + `aria-valuenow` + 键盘 ←→/Home/End（与 Resizable 同套 a11y，不重造拖拽几何）；motion 展开/收起为 CSS transition（reduced-motion / motion=false 退化即时显隐）。P1 SideBar 主壳按 mode 路由：main 渲染顶部 Options 图标 tab 组（`role="tablist"` + roving tabindex + 键盘，name 作无障碍名）+ renderMainContent(activeKey)；detail 渲染 renderDetailHeader + 返回按钮（onBackWard 可异步，await 期间禁用防重触发）+ renderDetailContent(mode)。core 新增纯函数 `parseSideBarWidth` / `clampSideBarWidth`。新增 `--cd-sidebar-*` component token 与 locale key `SideBar.close` / `SideBar.back`。detail 里 code/file 具体渲染与 Annotation/MCPConfigure 留待 P2~P5 接续。
