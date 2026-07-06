# SPEC · SideBar（AI 侧边信息栏）

> 分类：show（AI） · 阶段：M4（增补，重量级组合组件，分阶段交付）
> 对标 Semi：[Sidebar 侧边信息栏](https://semi.design/zh-CN/ai/sidebar)（Semi AI 系列）
> **立项书**：SideBar 是 Semi AI 场景组合套件（Container 浮层壳 + MCPConfigure + Annotation + CodeContent + FileContent），体量约等于前 5 个增补组件之和，且 FileContent 需引入 tiptap v3 + prosemirror 全链。本 SPEC 定义分阶段交付计划。

## 0. 立项与分阶段

SideBar 不是单个组件，而是一个「基础浮层容器 + 4 类 AI 业务视图」的套件。按依赖与体量分阶段：

| 阶段 | 交付 | 依赖 | 体量 |
|---|---|---|---|
| **P0 Container** | 可伸缩浮层壳（resizable + 动画 + header/close + Esc + a11y） | `floating`/`focus-trap`/`inert`/既有 Resizable 能力 | 中 |
| **P1 主壳 + Options** | Sidebar 主组件（mode 路由 main/detail）+ 顶部 Options 图标 tab 组 | P0 | 中 |
| **P2 Annotation** | 参考来源/引用溯源折叠列表（video/text 卡片） | P1 + Collapse | 中 |
| **P3 MCPConfigure** | MCP 工具配置面板（内置/自定义双列表 + 搜索 + 启用开关 role=switch） | P1 + Input/Switch | 中 |
| **P4 CodeContent** | 代码/JSON 预览列表 | P1 + **CodeHighlight + JsonViewer（已有）** | 中 |
| **P5 FileContent** | 富文本查看/编辑列表 | P1 + **tiptap v3 + prosemirror + 图片上传 Node** | 高（最重） |

每阶段独立 PR、独立 DoD、逐步合入。P4 复用已实现的 CodeHighlight/JsonViewer；P5 复用 AIChatInput 已引入的 tiptap 动态 import 范式（见记忆 aichatinput-phased-build）。

### P5 tiptap 实现指引（对标 Semi `sideBar/widget/file.js` + `imageSlot.js`，已核对）
- **本库现状**：已装 `@tiptap/core` / `@tiptap/pm` / `@tiptap/starter-kit` / `svelte-tiptap`（AIChatInput 在用，动态 import 范式已成熟）。
- **P5 需补装 3 个 tiptap 官方扩展**（框架无关，Semi FileContent 用到、本库尚未装）：`@tiptap/extension-text-style`、`@tiptap/extension-image`、`@tiptap/extension-text-align`。
- **默认扩展集对齐 Semi**：`StarterKit`（configure link openOnClick:false）+ TextStyleKit + Image + TextAlign(types:['heading','paragraph']) + 自研 SelectionMark + 自研 ImageUploadNode，末尾拼接使用方传入的 `extensions`。
- **编辑器**：`editable` / `content` / `onUpdate → onContentChange(editor.getHTML())`，对齐 Semi。
- **imageSlot（ImageUploadNode）**：`Node.create({ name:'imageUpload' })`，Svelte 侧用 **svelte-tiptap 的 NodeViewRenderer**（替代 Semi 的 ReactNodeViewRenderer），节点视图内嵌本库 **Upload**（draggable），支持 `getUploadImageSrc`（继承 UploadProps + getUploadImageSrc = ImageUploadNodeOptions）。
- **Svelte 适配差异**：Semi 用 `@tiptap/react` 的 useEditor/EditorContent/ReactNodeViewRenderer；本库用 `svelte-tiptap` 对应物。逻辑照搬，绑定层换 Svelte。

## 1. 概述

SideBar 在 AI 对话/编辑器场景提供**右侧可伸缩浮层**，承载：MCP 工具配置、参考来源溯源、代码/JSON 预览、富文本查看编辑。通过 `mode` 在主视图与详情视图间路由。

## 2. 设计语义

**何时用**：AI 产品需要一个侧边信息/配置面板（工具配置、引用溯源、内容预览）。
**何时不用**：
- 通用侧边导航 → 用 `Nav`。
- 通用抽屉 → 用 `SideSheet`/`Drawer`。
- 仅需可伸缩浮层 → 用 P0 的 Container（或未来给 SideSheet 加 resizable）。

## 3. 分层实现

- **headless（core/）**：
  - `createSideBarContainer`：resizable 拖拽几何 + 动画状态 + Esc/键盘（P0）。
  - `createMcpConfigure`：内置/自定义列表状态 + 搜索过滤 + 启用态缓存（P3）。
  - 步进/路由逻辑（mode 路由）内联主壳（P1）。
- **渲染（svelte/）**：`SideBar.svelte`（主壳）+ `SideBarContainer.svelte` + `SideBarMcpConfigure.svelte` + `SideBarAnnotation.svelte` + `SideBarCodeContent.svelte` + `SideBarFileContent.svelte`。

## 4. API

> 完整 API 见各阶段实现时细化。此处列主组件与 Container 核心。

### SideBar（主组件）Props

| 名称 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `mode` | `'main' \| 'code' \| 'file' \| string` | `'main'` | 展示模式，main 主视图，其余详情视图。 |
| `detailContent` | `CodeItemProps \| FileItemProps` | — | 详情区数据源。 |
| `activeKey` | `string` | — | 主视图激活 option。 |
| `options` | `Option[]` | — | 顶部图标 tab 组（`{ icon, name, key }`）。 |
| `onActiveOptionChange` | `(e, key: string) => void` | — | option 切换。 |
| `renderMainContent` | `(key) => Snippet` | — | 主视图内容。 |
| `renderDetailContent` | `(mode) => Snippet` | — | 详情内容。 |
| `renderDetailHeader` | `(mode, detail) => Snippet` | — | 详情头部。 |
| `fileEditable` | `boolean` | `true` | file 模式富文本可编辑。 |
| `onFileContentChange` | `(content: string) => void` | — | 富文本变更。 |
| `onBackWard` | `(e, mode) => void \| Promise` | — | 详情返回主视图（可异步）。 |
| `onDetailContentCopy` | `(e, content, ok) => void` | — | 详情复制回调。 |
| `imgUploadProps` | `ImageUploadNodeOptions` | — | 富文本图片上传配置。 |

### SideBar.Container Props

| 名称 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `visible` | `boolean` | — | 是否可见。 |
| `title` | `string \| Snippet` | — | 标题。 |
| `onCancel` | `(e) => void` | — | 关闭回调。 |
| `afterVisibleChange` | `(v: boolean) => void` | — | 可见变化后。 |
| `motion` | `boolean` | `true` | 展开/收起动画。 |
| `resizable` | `boolean` | `true` | 宽度可拖拽。 |
| `minWidth` | `string \| number` | `150` | 最小宽度。 |
| `maxWidth` | `string \| number` | — | 最大宽度。 |
| `defaultSize` | `{ width?; height? }` | — | 默认尺寸。 |
| `showClose` | `boolean` | `true` | 显示关闭按钮。 |
| `renderHeader` | `() => Snippet` | — | 自定义头部。 |
| `class` / `style` | `string` | — | 样式。 |

子组件（MCPConfigure/Annotation/CodeContent/FileContent）的完整 API 在对应阶段实现时补齐，均继承 Container props。

## 5. 主题 / Token 表

各阶段补齐组件 token（`--cd-sidebar-*`）：容器背景/边框/宽度、拖拽把手、Annotation 卡片、MCP 列表项、圆点等。P0 先立容器 token，后续阶段增补。

## 6. 无障碍

对标 Semi 的**增强**（Semi 关闭按钮硬编码英文 aria-label、无 focus trap、无 role=dialog、Resizable 无键盘）：

- Container `role="dialog"` + `aria-labelledby`（title）；打开移焦、Esc 关闭、焦点归还（复用 focus-trap）。
- Resizable 把手：键盘可调（←→ 调宽）+ `aria-label` + `role="separator"` `aria-valuenow`。
- MCPConfigure 启用开关：`role="switch"` + `aria-checked`。
- Annotation 折叠项：`aria-expanded`。
- 返回/复制图标按钮：`aria-label`（i18n）。
- 关闭 aria-label 走 i18n（修 Semi 硬编码）。

## 7. 国际化

- locale `SideBar`：`close`（关闭）、`copySuccess`（复制成功）、`searchPlaceholder`（搜索占位，修 Semi 硬编码「请输入」）、`back`（返回）等。
- Annotation `duration` 时长本地化格式化；RTL 下浮层贴左、拖拽/返回箭头方向翻转。

## 8. 文案

- 内置文案（关闭/复制/搜索占位/空态/返回）全走 i18n，遵循 content-guidelines。

## 9. 性能（Perf Budget）

| 维度 | 预算 | 说明 |
|---|---|---|
| Container gzip | ≤ 4 KB | 浮层壳 |
| 主壳 + Options gzip | ≤ 3 KB | |
| Annotation gzip | ≤ 3 KB | |
| MCPConfigure gzip | ≤ 4 KB | |
| CodeContent gzip | ≤ 2 KB（不含 CodeHighlight/JsonViewer 内核） | 复用已有 |
| FileContent 主壳 gzip | ≤ 6 KB（tiptap/pm 全程动态 import，不计入主壳） | 对齐 AIChatInput 范式 |

- tiptap/prosemirror 全部动态 import（惰性），不进初始包。
- resizable 拖拽用几何计算，rAF 去抖。

## 10. AI 元数据

各阶段组件均提供 `component.meta.ts`。主组件 `name: 'SideBar'`、`category: 'show'`、`stage: 'M4'`、`semiEquivalent: 'Sidebar'`、`aiScene: true`，记录子组件关系与分阶段。

## 11. 测试

- 各阶段独立 core 单测 + 组件测 + a11y 测。
- Container：resizable 几何、Esc、focus trap、动画。
- MCPConfigure：列表状态、搜索、启用态。
- Annotation：折叠、卡片渲染。
- CodeContent/FileContent：复用内核的集成测试（jsdom 限制沿用 CodeHighlight/JsonViewer/AIChatInput 的 skip 策略）。

## 12. 验收标准（对照 AGENTS.md §5 DoD）

按阶段逐个满足 DoD：
- [ ] P0 Container · [ ] P1 主壳+Options · [ ] P2 Annotation · [ ] P3 MCPConfigure · [ ] P4 CodeContent · [ ] P5 FileContent
- 每阶段：分层正确 · 类型+JSDoc · Token 注册 · a11y 通过 · i18n 无硬编码 · 测试达标 · Perf 达标 · meta 提供 · 文档 demo。
