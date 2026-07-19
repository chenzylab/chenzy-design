# 富媒体组件缺口盘点（对标 Semi Plus 族）

> 盘点日期：2026-07-04。来源：Semi Design `latest` 组件全集（94 项）× 本仓库 `packages/svelte/src` 现有组件（69 项）交叉核对。
> **底层依赖已从 Semi 源码坐实**：解包 `@douyinfe/semi-ui@2.101.0` + `@douyinfe/semi-foundation@2.101.0`，逐组件读 import + package.json，非猜测。
> 关注维度：**富媒体 / 内容展示类**组件——音视频、代码/数据/文档渲染、AI 会话、图像处理。
> 结论：本仓库已覆盖 Semi 全部**基础/输入/导航/展示/反馈**组件，缺口集中在 Semi 的 `category: Plus`（进阶富媒体）一族，共 **7 个组件 + 2 个 AI 子件**，另 Lottie 需复核。

## 0. 实施状态（2026-07-04 更新）

**7 个富媒体组件全部已实现并合入 main**，每个均达发布级 DoD（测试 + typecheck + token 无悬空 + i18n + meta + size-limit 门禁 + docs demo）：

| 组件 | 底层 | 组件壳 gzip | 测试 | 备注 |
|---|---|---|---|---|
| CodeHighlight | prismjs | 9.40 KB（含 core） | ✅ | |
| MarkdownRender | unified(remark/rehype→hast) | 2.88 KB | ✅ | unified 动态 import |
| VideoPlayer | 原生 `<video>` | 7.66 KB | 44+5 | 零第三方 |
| AudioPlayer | 原生 `<audio>` | 4.26 KB | 24+7 | 零第三方 |
| JsonViewer | @douyinfe/semi-json-viewer-core | 3.21 KB | 11+4skip | 内核动态 import；jsdom 无 Worker |
| Chat | MarkdownRender+Upload+prismjs | 7.17 KB | 30+6 | 完整（dragUpload/canSend/detailProps 已补齐，见「未做/后续」） |
| Cropper | 原生 canvas 几何引擎 | 3.13 KB | 22+11 | 几何在 core；jsdom 无布局/canvas |

全库 **1173 passed + 5 skip**、typecheck 0 errors、perf:check 75 组件全过。

### Lottie 复核结论：已推翻旧取舍，严格对齐 Semi 重写为极简 Lottie（2026-07）
> **历史决策（已作废）**：曾决定「不新建通用 Lottie 组件」，把本库 `lottie-icon`（依赖注入式 player 工厂、图标级 size/color、library-agnostic）当作等价替代，理由是「硬绑 lottie-web 违反 core 库无关原则」。
>
> **现结论（严格对齐 Semi 工程）**：推翻上述取舍。`lottie-icon` 的图标化 + 依赖注入设计**偏离 Semi Lottie 语义**（Semi 是通用容器 + 内置 lottie-web + `params` 透传 + 暴露原始 `AnimationItem`），且用户方向为「严格对齐 Semi，不保留超集」。
> - **推翻重写为极简 `Lottie`**：目录 `lottie-icon`→`lottie`、导出 `LottieIcon`→`Lottie`；仅 `params`/`width`/`height`/`getAnimationInstance`/`getLottie`/`class`/`style` 7 prop；**内置 lottie-web ^5.13**（对齐 Semi，svelte 包声明依赖，动态 import + onMount 兜 SSR）。
> - **删除的超集**：依赖注入 player 工厂、`src` fetch、`size`/`color`/`trigger`/`segments`/`flipRtl`/`visible`/`canvas`/`renderer`、命令式 play/pause/stop、reduced-motion 首帧降级、a11y role/label——播放控制全部改由 `getAnimationInstance` 拿到的实例处理。
> - **删除的分层**：core `lottie-icon.ts`（+test）整删（Semi foundation 极简、强依赖 lottie-web，无跨框架价值，逻辑内联 svelte）；tokens 18 个整删（Semi 零 token）；locale 文案整删。
> - **Demo 对齐 Semi 文档 4 例**：path CDN / animationData 打包 / getAnimationInstance / getLottie。

### 未做/后续
- **AIChatDialogue**：**已于 2026-07-04 落地 + 2026-07-05 补齐 P1 大部**（core OpenAI 消息类型全谱 + 非流式/流式 Adapter + 消息编辑 + 渲染层 ContentItem 分块 + 选择/提示 + demo + 门禁 5.13KB）。**P1 全部完成**：streaming Adapter（PR #427）、消息编辑（PR #428）、tool_call/MCP 完整块交互（状态/折叠/JSON 格式化/MCP server，超越 Semi，PR #430）。**AIChatDialogue 无未实现功能**。见 `AIChatDialogue.spec.md §13`。
- **AIChatInput**：**已于 2026-07-05 完整落地**（PR #425）——tiptap 富文本巨型组件，独立立项分阶段交付：阶段 1~5（基础输入/引用+建议/技能+模版/配置区/Adapter 桥）+ 收尾 DoD + 三种自定义节点（skill-slot/select-slot/input-slot，input-slot 含全套零宽锚点+光标 plugin ~400 行）+ Configure 全族（Select/Button/RadioButton/Mcp/Item）+ 双 Adapter（messageToChatInput/chatInputToChatCompletion 接 AIChatDialogue/OpenAI）。**与 Semi 公开 API 全面对齐，无未实现功能**。tiptap 内核+pm+svelte-tiptap 全程动态 import（主壳 gzip 10.44KB）；core 50 单测 + dom/axe 44 测 + 9 demo。详见 `AIChatInput.spec.md`（§0.1~§0.8）。
- ~~**Chat dragUpload**、canSend、renderInputArea detailProps~~：**已于 2026-07-04 补齐**（dragUpload 整容器拖拽 + Upload.addFiles 导出、canSend prop、detailProps 拆分节点），见 `Chat.spec.md`。

## 1. 交叉核对方法

- Semi 全集 94 项，剔除内部原语（`_base`/`_portal`/`_sortable`/`_utils`/`_cssanimation`）、构建产物（`index.*`/`*-adapter.*`/`icons`/`locale`）、以及**已有对应实现**的组件。
- 逐个 grep 本仓库排除别名内嵌：`resizable`/`collapsible` 仅作 Table/Tabs 形容词，非独立组件；`highlight` 是**文本关键词高亮**，≠ `codehighlight`（语法高亮）；`image` 已含 `ImagePreview` 灯箱但**不含裁剪**。
- **底层依赖来源**：`semi-foundation@2.101.0` 的 `dependencies` 是唯一权威（`semi-ui` 层已 externalize，es 产物看不到）。下方每个组件的“Semi 底层”列均引自该处或组件 foundation 的实际 import。

## 2. 富媒体缺口清单（含 Semi 权威底层依赖）

| # | 组件 | Semi 分类 | **Semi 实际底层依赖** | 核心能力 | 优先级 |
|---|---|---|---|---|---|
| 1 | **CodeHighlight** | Plus | **`prismjs@^1.29.0`**（foundation dep） | 代码语法高亮（297 语言）、行号、可关默认主题 | **P0** |
| 2 | **MarkdownRender** | Plus | **`@mdx-js/mdx@^3.0.1` + `remark-gfm@^4.0.0`**（foundation dep） | 渲染 Markdown/MDX、`components` 覆盖元素、remark/rehype 插件 | **P0** |
| 3 | **VideoPlayer** | Plus | **无第三方**（原生 `<video>` + lodash + semi-icons 自建控件） | 控件裁剪、倍速、清晰度/线路切换、章节标记、画中画、字幕、亮暗主题 | **P1** |
| 4 | **AudioPlayer** | Plus | **无第三方**（原生 `<audio>` + lodash + semi-icons） | 单曲/列表、封面、工具栏、跳转、亮暗主题 | **P1** |
| 5 | **Chat** | Plus | **依赖 MarkdownRender + `prismjs`**（代码块高亮） | AI/普通会话：消息流、SSE 流式、附件上传、角色配置、停止生成、提示区、全区插槽自定义 | **P2** |
| 6 | **JsonViewer** | Plus | **`@douyinfe/semi-json-viewer-core@2.101.0`**（Semi 自研独立 npm 包，仿 VS Code text-buffer） | JSON 展示/编辑：虚拟化（300w 行内）、搜索替换、自定义渲染规则、格式化 | **P2** |
| 7 | **Cropper** | Plus | **无第三方**（原生 canvas + lodash 自建） | 图片裁剪 | **P3** |
| — | AIChatInput / AIChatDialogue | Plus | 随 Chat（#5） | Chat 的输入框 / 对话弹窗子件 | 随 #5 |
| 复核 | **Lottie** | Plus | **`lottie-web@^5.13.0`**（foundation dep） | 通用 Lottie 动画容器 | 见 §4 |

> Semi 这些均属 **Plus（进阶）** 族，官方按付费/进阶定位。本仓库无此分层，全部纳入开源常规组件。

## 3. 对齐方案（Semi 用什么，我们用什么）

原则：**默认对齐 Semi 的底层选型**，仅在 Svelte 生态无法直接复用 React 侧库、或有一等公民等价物时才替换，并显式标注理由。

| 组件 | Semi 底层 | 本仓库对齐方案 | 是否偏离 & 理由 |
|---|---|---|---|
| **CodeHighlight** | `prismjs` | **对齐用 `prismjs`**。prismjs 是框架无关的纯 JS 高亮库，Svelte 侧可直接 `import prismjs`，无需换。 | ✅ 对齐。<br>⚠️ 注意：文档站自身用的是 shiki（见记忆 `docs-deploy-tsx-and-shiki-pitfalls`），但那是**文档站构建期**高亮；**组件运行时**应对齐 Semi 用 prismjs（体积小、运行时友好、按需 `prism-<lang>.js`）。两者不冲突，不要为省事把组件也换 shiki 而偏离 Semi 的 API 与行为（`defaultTheme` 关闭主题、`language` prop 等）。 |
| **MarkdownRender** | `@mdx-js/mdx` + `remark-gfm` | **对齐用 `@mdx-js/mdx` + `remark-gfm`**。`@mdx-js/mdx` 是编译器（框架无关），产出的 JSX 需绑定到框架 runtime——React 侧用 `react/jsx-runtime`，**Svelte 侧需接 Svelte 的 jsx runtime 或走 `mdsvex` 的 unified 管线**。 | ⚠️ 底层编译器对齐（unified/remark/rehype 生态一致），但 **MDX→组件的绑定层必然不同**（React runtime 无法用）。这是框架差异的必要偏离，不是选型偏离。remark-gfm 直接复用。 |
| **VideoPlayer** | 原生 `<video>` 自建 | **对齐——纯 Svelte 封装原生 `<video>`**，控件全自建，不引 plyr/video.js/xgplayer。 | ✅ 完全对齐，无第三方，Svelte 侧照搬控件逻辑即可。 |
| **AudioPlayer** | 原生 `<audio>` 自建 | **对齐——纯 Svelte 封装原生 `<audio>`**。 | ✅ 完全对齐。 |
| **Chat** | MarkdownRender + prismjs | **对齐**——复用本仓库 MarkdownRender（#2）+ CodeHighlight（#1），Upload 已有。 | ✅ 对齐，依赖内部组件。 |
| **JsonViewer** | `@douyinfe/semi-json-viewer-core` | **两条路**：① 直接依赖 Semi 发布的 `@douyinfe/semi-json-viewer-core`（框架无关的 core，仿 VS Code text-buffer）作为 headless 内核，我们只写 Svelte 渲染层——**最省且行为对齐**；② 若不愿引 Semi 包，则自研 text-buffer（工程量最大）。**建议先评估 ① 的可行性**。 | ✅ 对齐优先走 ①。core 是独立 npm 包，非 React 耦合，值得先试引。 |
| **Cropper** | 原生 canvas 自建 | **对齐——纯 Svelte + canvas 自建**，不引 cropperjs。 | ✅ 完全对齐。 |
| **Lottie** | `lottie-web` | **已推翻旧 `lottie-icon`，严格对齐重写为极简 `Lottie`**：内置 lottie-web ^5.13、`params` 透传、`getAnimationInstance`/`getLottie`；删依赖注入/图标级超集。 | ✅ 完全对齐（见 §0「Lottie 复核结论」）。 |

## 4. 复核项（非新增，需确认现状）

- [x] **Lottie**：结论**已推翻旧取舍，严格对齐 Semi 重写为极简 `Lottie`**（见 §0「Lottie 复核结论」）——目录/导出改 lottie/Lottie、内置 lottie-web ^5.13、`params` 透传 + `getAnimationInstance`/`getLottie`；删依赖注入 player/图标级超集、core headless、18 token、locale 文案。
- [x] **JsonViewer core 引入评估**：确认 `@douyinfe/semi-json-viewer-core` 框架无关、无 React 耦合，走 §3 方案①**已落地**（§0 表格：组件壳 gzip 3.21 KB，内核动态 import；jsdom 无 Worker 故 4 测 skip）。
- [x] **CodeHighlight 主题**：**已落地**——prismjs 高亮主题接入本仓库 token 体系 + 暗色模式（§0 表格：CodeHighlight ✅，9.40 KB 含 core）。
- [x] **Image 裁剪**：**已按结论落地**——Cropper（#7）作独立组件实现（§0 表格：Cropper 3.13 KB ✅），未并入 Image；`image` 仍仅含预览灯箱。

## 5. 依赖链与建设次序

```
CodeHighlight (P0, prismjs) ──┐
                              ├──> Chat (P2)
MarkdownRender (P0, mdx+gfm) ─┘      └── Upload（已有）

VideoPlayer / AudioPlayer (P1, 原生)  —— 独立，可并行
JsonViewer (P2, semi-json-viewer-core) —— 独立，先评估引 core
Cropper (P3, canvas)                   —— 独立，收尾
```

**推荐次序**：
1. **CodeHighlight（prismjs）+ MarkdownRender（@mdx-js/mdx + remark-gfm）**——最高频，且是 Chat 的前置。
2. **VideoPlayer + AudioPlayer**——纯原生，无重依赖，可并行两个 agent。
3. **Chat**——强依赖 #1/#2，排其后。
4. **JsonViewer**——先做 §4 core 引入评估再定工作量。
5. **Cropper**——收尾。

## 6. 落地 DoD 提醒

遵循既有 DoD（记忆 `new-component-needs-token-and-meta`）：`.svelte` + Component Token + `tokens/index` 注册 + `meta.ts`；headless 逻辑下沉 `packages/core`；补 demo 目录后重启 dev server。富媒体组件额外注意：

- **对齐优先**：API 命名、prop 语义、默认值**对齐 Semi**（如 VideoPlayer 的 `controlsList`/`markers`/`seekTime`、CodeHighlight 的 `defaultTheme`/`language`、MarkdownRender 的 `raw`/`format`/`components`），偏离必须在本文件登记理由。
- **性能预算**：VideoPlayer/JsonViewer 属大数据/高频事件，按 `performance.spec.md` 设体积与运行时预算。
- **a11y**：媒体播放器需键盘控件（空格播放/暂停、←→ 跳转）、字幕、`aria-label`；Chat 消息流需 live region 播报。
- **i18n**：播放器/Chat 控件提示、状态文案全部走 locale。
