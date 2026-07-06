---
"@chenzy-design/svelte": minor
"@chenzy-design/core": minor
"@chenzy-design/tokens": minor
"@chenzy-design/locale": minor
---

SideBar P3：新增 SideBarMcpConfigure MCP 工具配置面板（对标 Semi sideBar/mcpConfigure）。外层复用 SideBarContainer（继承并透传全部 Container props，`title` 默认走 i18n `SideBar.mcpTitle`）；内部顶部显示已启用计数（`已启用 N/总数`）+ 搜索框（复用本库 Input，前缀放大镜 + `aria-label`），下方并列渲染内置（`options`）/ 自定义（`customOptions`）双列表（Semi 用 radio 二选一切换，本库改并列双列表更直观）。每项：前置图标（`string` 按图片 URL / `Snippet` 自定义）+ `label` + `desc` + 动作按钮（内置 `configure=true` 显示配置 / 自定义显示编辑，`aria-label` 含工具名走 i18n）+ 启用开关（复用本库 Switch，原生 `role="switch"` + `aria-checked`，`disabled` 预设项锁定 + `title` tooltip）。搜索支持自定义 `filter(input, option)` 谓词（默认 label/value 大小写不敏感包含匹配）；启用变化经 headless `toggleMcpOptionActive` 产出「下一份数组 + custom 标记」上抛 `onStatusChange`，绝不回写 prop（受控红线）。自定义组为空显示添加入口（`onAddClick`），无搜索结果显示提示。

core 新增框架无关纯函数 `filterMcpOptions` / `toggleMcpOptionActive` / `countActiveMcpOptions` 与类型 `McpOptionCore`。新增 `--cd-sidebar-mcp-*` component token 与 `SideBar.mcp*` locale（含修 Semi 硬编码「请输入」的 `mcpSearchPlaceholder`）。
