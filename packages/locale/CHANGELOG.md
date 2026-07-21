# @chenzy-design/locale

## 0.4.1

## 0.4.0

### Minor Changes

- b681334: AIChatDialogue 全场景对齐 Semi：补齐引用（references）与自定义渲染会话框（dialogueRenderConfig）两块能力，并将 docs demo 补全至 Semi 官方全部场景。

  组件新增能力：

  - **引用 references**：`AIDialogueMessage` 增显式 `references` 字段；新增 `showReference` prop（仅 user 消息生效）+ `onReferenceClick` 回调；DialogueBox 在内容下方渲染引用区，支持文本引用（两行裁剪）与文件引用（带图标），全走 alias token。补 `AIChatDialogue.references` locale（zh/en）。
  - **自定义渲染会话框 dialogueRenderConfig**（对齐 Semi 最新 `dialogueRenderConfig`，非旧 `chatBoxRenderConfig`）：新增 `render-config.ts` 定义 `DialogueRenderConfig`（`renderDialogueAvatar` / `renderDialogueTitle` / `renderDialogueContent` / `renderDialogueAction` + 整块 `renderFullDialogue`）。DialogueBox 将头像/标题/内容/操作四区块抽为 `default*` snippet，各区块可覆盖或整块替换，`default*` 节点可复用。类型从 svelte 主 index 导出（并补 `ContentItem` 原名）。

  docs demo 补齐（4 → 12），按 Semi 官方顺序排列：消息状态、引用、选择、提示、自定义渲染提示、自定义渲染会话框、自定义渲染消息、流式数据转换（`streamingResponseToMessage` 逐块增量归约驱动）。`meta.ts` 与 spec §4 同步新增 props/events/slots。

- 0c724b5: feat: 全库图标引用对齐 Semi + Upload 破坏性重写

  - **Icon**：删自造实现，复用 `@chenzy-design/icons` 已对齐基类（font-size 驱动尺寸 8/12/16/20/24、`cd-icon-spinning`、恒 role=img、fill/type/inherit）；移除 Semi 无的 `status`/`color` prop 与孤儿 token `--cd-icon-*`。
  - **IconButton**：去掉自造的 icon/ariaLabel 必填约束与 dev warn，三者可选；补齐 Semi 的 iconPosition/iconSize/iconStyle/noHorizontalPadding 等 props；新增「图标+文字」「iconPosition」demo。
  - **消费方图标引用对齐 Semi**：约 30 个组件（Select/Cascader/TreeSelect/Tree/Transfer/Input/InputNumber/TextArea/TagInput/DatePicker/RangePicker/TimePicker/Tabs/BackTop/Breadcrumb/Nav/Carousel/Collapse/Form/Steps/Checkbox/Rating/ColorPicker/JsonViewer/Typography 等）约 70 处手写功能性 svg 改为 `@chenzy-design/icons` 具名图标；image/upload 内部及 descriptions/breadcrumb/divider demo 同步；upload/tag-input 字面字形（×/↻/!）改具名图标。Semi 也手写的（tooltip/popover TriangleArrow、fileCard ErrorSvg/ReplaceSvg/DirectorySvg）保持手写；纯几何/插画（spin/progress/illustrations）保留。
  - **Upload 破坏性重写**：listType 改 `list`(默认)/`picture`/`none`；受控 prop 改 `fileList`/`defaultFileList`；`draggable`/`name`/`data`/`validateStatus`(+success) 对齐 Semi；删自造 `size`/`concurrency`；回调签名展开对齐 Semi（onSuccess/onError/onProgress/beforeUpload/beforeCrop）；拆独立 `FileCard.svelte`（renderPic/renderFile 双分支，引入 Button/Spin/Progress(circle)/Typography.Text/Tooltip）；DOM class 由 BEM `cd-upload__*` 全改 Semi 连字符 `cd-upload-*` 体系；补 ErrorSvg/DirectorySvg 手写图形；补 7 个 demo 场景（prompt/directory/pic-size/after-upload/before-upload/custom-drag-area/min-max-size）；4 个内部消费方（sidebar/chat/ai-chat-input/form）适配。
  - **locale**：补 Upload 3 键（selectedFiles/fail/illegalSize）。
  - **tokens**：删 icon 孤儿 token；upload placeholder-bg 由 fill-2 近似改 grey-3 精确对齐 Semi。

- fix(checkbox): 点击文字/整个 wrapper 都能选中，对齐 Semi（切换挂根 wrapper onclick + input pointer-events 隔离 + 点击/键盘互斥防双触发）

  feat(table): 分页对齐 Semi —— 补 range 文案「显示第 X 条-第 Y 条，共 N 条」（新增 locale `Table.pageText` 键），分页器固定 default 尺寸（不再误传表格 size 致紧凑 1/4）

- e4a6c5c: 新增 DragMove 通用拖拽移动组件（other，对标 Semi 2.101.0 并做 a11y 增强）。包裹单个子元素使其可被拖拽在页面/约束区内自由移动（与 Resizable 改尺寸正交，DragMove 改位置）。core 沉淀第二个通用拖拽原语 `createDragMove`（继 createResizeDrag 之后）：pointerdown 记录起点 → document 绑 mouse/touch move/up → 计算 clamp 到 constrainer 的 top/left → customMove 或写 style.top/left → up 解绑 + 卸载兜底（命令式几何，红线 #3，不用响应式读几何），设计以能替换 Modal 可拖拽标题栏 / Cropper 画布拖拽为目标（后续收敛）。约束区支持 `'parent'`/自定义 DOM/无约束；`allowMove` 谓词拦截；`allowInputDrag` 控制是否从 input/textarea 发起（默认 false，避免干扰文本选择）；鼠标/触摸事件全透传。超越 Semi：可选 `keyboard` 把手键盘可达（tabindex + 方向键移动 + i18n aria-label），触摸 `touch-action:none`。新增 `--cd-dragmove-cursor` component token（默认 move）与 locale key `DragMove.handleAriaLabel`（zh「拖动」/ en「Drag to move」）。
- e7c9cd7: 新增 Feedback 用户反馈弹窗（对标 Semi 2.101.0，全量核实时发现的漏判组件——Semi 正式 `export { Feedback }`）。以 Modal 或 SideSheet 形态收集结构化用户反馈，纯组合本库现成组件。

  - svelte：`Feedback.svelte` 按 `mode`（modal→Modal / popup→SideSheet）复用外壳，按 `type`（text→TextArea / emoji→自建 radiogroup 表情行 / radio→RadioGroup / checkbox→CheckboxGroup / custom→renderContent slot）渲染内容；外壳的 focus-trap / inert / Esc / 锁滚直接复用。
  - props：mode / type / value（FeedbackValue = string | string[] | EmojiResult）/ onValueChange / options / textAreaProps / renderContent / content / onOk（异步 await 期间外壳 loading）/ onCancel / afterClose / emojis + 透传外壳（open / title / width / placement / onOpenChange）。value 归一化内联（逻辑简单，未建 core）。
  - a11y：emoji 评分 `role="radiogroup"` + 每 emoji `role="radio"` + aria-label（表情语义走 i18n）+ 方向键 roving 选择（对齐 Rating 键盘范式）；提交 loading 时按钮 aria-busy；外壳 dialog / focus-trap / Esc 复用 Modal / SideSheet。
  - tokens：`--cd-feedback-emoji-size` / `--cd-feedback-emoji-gap` / `--cd-feedback-emoji-active-scale` / `--cd-feedback-content-gap`。
  - locale：`Feedback.{submit,cancel,placeholder,ratingLabel,emojiVeryBad/Bad/Neutral/Good/VeryGood}`（zh_CN / en_US）。

- c203124: FloatButton / FloatButtonGroup 破坏性重写，严格对齐 Semi Design（无向后兼容）。

  - **DOM 对齐**：改为 Semi 的纯 `div + onClick`（外层 div 带 size+shape class，body 带 shape+size(+colorful?+disabled?) class），Group 为 `div` 容器 + `div.item[data-value]` 事件委托直接读 `e.target.dataset.value` 回传。href 靠 JS 跳转（`_blank` → `window.open`，否则 `location.href`）。
  - **移除自造 API**：`ariaLabel`、`children`（文字内容）、自定义 shape 字符串、Group 的 `direction`、item 的独立 `disabled/ariaLabel`；移除 `<button>/<a>` 语义化、focus-ring、reduced-motion、dev warn。
  - **Token 值/DOM 对齐 Semi**：尺寸修正 24/32/40、z=1000、square 圆角 8px、位置 24px；配色 bg=fill-0、text=primary、disabled 用 disabled-bg/text；Group item bg-hover/active=fill-1/fill-2、补字号 14/行高 20/字重 400。移除中间变量 `colorful-gradient`/`focus-ring`/`motion-duration`/`disabled-opacity`/`border`。
  - **新增 AI 色板 alias**：`--cd-color-ai-general/-hover/-active`（明暗双主题，镜像 Semi `--semi-color-ai-general` general-5/6/7 的 `linear-gradient(278deg, 4 色标)`），colorful 直接消费之。
  - **移除 locale key** `FloatButton.groupAriaLabel`（Group 不再有 aria-label）。
  - Demo 按 Semi 机制重组为 7 个（基础/尺寸/形状/href/colorful/带徽章/Group），覆盖 Semi 全部场景。

- 57d5e82: 新增 FloatButton + FloatButtonGroup 悬浮操作按钮（basic，对标 Semi 2.101.0 并做 a11y 增强）。悬浮固定在视口的可操作入口：无 href 渲染 `<button type="button">`，有 href 渲染 `<a href target rel>`（`_blank` 自动补 `rel="noopener noreferrer"`），天然键盘可达；icon-only 必须 `ariaLabel`（dev 缺失 warn）。支持 shape(round/square)、size(small/default/large)、colorful AI 渐变、可选包裹 Badge。定位靠 style 逻辑属性（inset-inline-end/inset-block-end），RTL 友好。FloatButtonGroup 平铺容器（role="group"）遍历 items 渲染并事件委托回传 value。新增 `--cd-floatbutton-*` component token 与 locale key `FloatButton.groupAriaLabel`。
- 7ab4b65: 新增 HotKeys 快捷键组件（对标 Semi 2.101.0）。声明一组键盘组合、绑定全局/局部 keydown 监听、命中触发回调，并渲染语义化 `<kbd>` 键位提示。core headless 提供 Keys 常量枚举、keyToCode、isValidHotKeys 校验、matchHotKeys（修饰键精确匹配 + 普通键用 event.code 物理键位）。修复 Semi 未生效的 mergeMetaCtrl —— 真正实现跨平台合并 Cmd/Ctrl。a11y 增强（超越 Semi 的 span）：`<kbd>` 语义、`+` 分隔符 aria-hidden、aria-keyshortcuts、键位文本可选中。支持 preventDefault 拦截浏览器默认行为、content/render 自定义提示、getListenerTarget 局部监听。
- a602da2: Layout：破坏性重写严格对齐 Semi（纯布局容器，无背景/尺寸样式，无组件 token，无折叠功能）。

  - **组件**：Layout / Header / Footer / Content 仅保留 `class` / `style` / `aria-label` / `role`（Layout 另有 `hasSider`）；DOM 与 class 对齐 Semi（`cd-layout` / `cd-layout-has-sider` / `cd-layout-header` / `-footer` / `-content` / `-sider` / `-sider-children`），补齐 box-sizing 与 has-sider 行内 `overflow-x:hidden`、RTL `direction`。
  - **Sider**：破坏性移除 `collapsed` / `defaultCollapsed` / `collapsible` / `width` / `collapsedWidth` / `reverseArrow` / `placement` / `onCollapse` / `trigger` / `zeroWidthTriggerStyle` 及折叠动画、零宽触发块。只保留 Semi 的 `breakpoint`（数组）/ `onBreakpoint(screen, matched)` / `class` / `style` / `aria-label` / `role`；内联对齐 Semi 的 responsiveMap（xs 为 max-width，其余 min-width）+ matchMedia 监听。DOM 为 `<aside><div class="cd-layout-sider-children">`。
  - **tokens**：删除全部 `--cd-layout-*` 组件 token（Semi 无 variables.scss，Layout 不附带任何样式），移除 tokens 注册。
  - **core**：删除 `createSider` 状态机（`packages/core/src/sider.ts` 及导出）——Semi 无此逻辑。
  - **locale**：删除 Semi 没有的 `Sider` 文案键；新增对齐 Semi 的 `Navigation.collapseText` / `Navigation.expandText`，`Nav.Footer` 折叠按钮文案改用之。
  - **demos**：重写为 Semi 的 8 例（三行 / 左侧栏 / 右侧栏 / 侧边栏 / 响应式 / 顶部导航 / 顶部导航-侧边 / 侧边导航），移除依赖已删功能的 8 个自造 demo。
  - meta / content 全量对齐新 API。

- aee0462: 新增 PinCode 分格验证码输入组件（对标 Semi 2.101.0）。支持四种字符校验格式（number/mixed/RegExp/函数）、跨格键盘导航、整串粘贴自动分发、受控/非受控、输入法组合态过滤。a11y 增强：分组语义 role=group、每格位次 aria-label、autoComplete=one-time-code OTP 自动填充。
- e2bd5f7: 新增 Resizable 可伸缩组件族（对标 Semi Resizable，单体逻辑参考 re-resizable v6.10.0，分栏几何对齐 Semi ResizeGroupFoundation）。

  - **core 拖拽原语**：`createResizeDrag`（全库首个下沉 core 的通用单次拖拽生命周期——pointerdown 记录起始尺寸+指针坐标 → document 命令式绑 pointermove/pointerup → move 内按轴 clamp min/max + grid 吸附 + scale/ratio/lockAspectRatio 修正 → up/destroy 解绑兜底，绝不用响应式 attachment 读几何）；`computeGroupResize`（分栏相邻两项联动一增一减、总和守恒、越界 clamp 后另一项=两项和−clamp 项；judgeConstraint/adjustNewSize/getOffset 补偿 padding/border）。设计以覆盖 Table 列宽拖拽场景为验收基准。
  - **svelte 组件**：`Resizable`（单体，8 向可选把手 + enable 子集 + 受控/非受控 + 锁比例/网格/缩放）、`ResizeGroup/ResizeItem/ResizeHandler`（分栏，context 声明式注册用普通数组簿记避免 effect 循环，首帧测量延后纳入 cleanup）。
  - **a11y 增强（超越 Semi 的裸 div）**：把手 `role="separator"` + aria-orientation + aria-value\* + i18n aria-label + 键盘 ←→/↑↓（调尺寸）/Home/End（到 min/max）+ RTL 镜像 + 命中区 ≥24px。
  - token（把手命中区/线色/hover/focus/间隙）、locale（Resizable.handleAriaLabel zh「调整大小」/en「Resize」）、meta（relatedTo Table/SideBar）。

- 01b9b4d: 新增 7 个富媒体组件（对标 Semi Design Plus 族，底层选型从 semi-foundation 源码坐实）：

  - **CodeHighlight**：代码语法高亮，底层 prismjs（297 语言、行号、可关默认主题）。
  - **MarkdownRender**：Markdown 渲染，unified 管线（remark-parse + remark-gfm + remark-rehype → hast，Svelte 递归渲染），`components` 可注册 Svelte 组件覆盖元素 / 当自定义标签；代码块默认接 CodeHighlight。unified 生态动态 import。
  - **VideoPlayer**：视频播放器，纯原生 `<video>` 自建控件（倍速 / 清晰度 / 线路 / 章节标记 / 画中画 / 镜像 / 全屏 / 字幕），零第三方媒体库。
  - **AudioPlayer**：音频播放器，纯原生 `<audio>`，支持单曲 / 列表 / 封面标题，零第三方媒体库。
  - **JsonViewer**：JSON 展示 / 编辑，引 `@douyinfe/semi-json-viewer-core` 框架无关内核（虚拟化大数据、搜索替换、自定义渲染规则、格式化），内核动态 import 不进主 bundle。
  - **Chat**：AI / 普通会话容器，消息流 + SSE 流式 + 附件上传（复用 Upload）+ 角色配置 + 提示区 + 丰富的 render snippet；内容复用 MarkdownRender。
  - **Cropper**：图片裁切，纯原生 DOM/canvas 几何引擎（8 角点 resize / 拖拽 / 缩放 / 旋转 / aspectRatio 约束 / rect·round·roundRect 形状 / getCropperCanvas 取结果），零第三方。

  均含 Component Token（暗色）、i18n、组件 meta、a11y、size-limit 体积门禁与文档站 demo。所有对 Semi 的偏离已在各组件 spec §与 `specs/00-foundation/rich-media-gap-tracker.md` 登记。

- 6b11fb5: feat(sidebar): SideBar Annotation 引用溯源（P2）

  新增 `SideBarAnnotation`——AI 侧边信息栏的参考来源/引用溯源折叠列表：外层复用
  `SideBarContainer` 浮层壳（透传全部 Container props，`title` 默认走 i18n），内部用
  `Collapse` 渲染 `info` 分组（每组一个折叠面板，`aria-expanded` 由 Collapse 落实），
  展开区渲染 video（封面/时长/播放态，`duration` 走 locale 数值格式化为 mm:ss）/text
  （站点 logo/名称/引用序号）卡片。可点击卡片（`url` 或 `onClick`）用原生 `<button>`
  （键盘 Enter/Space + focus 环 + 时长/序号本地化可访问文本），`renderItem` 可整条覆盖。
  新增 `--cd-sidebar-annotation-*` token 与 `SideBar` locale（annotationTitle/annotationEmpty/
  videoDuration/citationOrder）。

- 4a46919: SideBar P4：新增 SideBarCodeContent 代码/JSON 预览折叠列表（对标 Semi sideBar/widget/code）。Collapse 折叠列表，每项一个 CodeItem，按 `isJson` 分流：`true` 用 JsonViewer 渲染 content（内核动态 import 惰性加载），`false` 用 CodeHighlight 按 `language` 语法高亮；透传 `jsonViewerProps` / `codeHighlightProps`。折叠头显示图标 + `name` + 全屏展开按钮，点击展开按钮走 `onExpand(e, code, 'code')` 不触发折叠。受控 `activeKey`（不回写，仅 `onChange` 通知，内部兜底非受控）。a11y：折叠头 `aria-expanded` 由 Collapse.Panel 提供，展开按钮 `aria-label` 走 i18n（新增 `SideBar.expand`）。新增 `--cd-sidebar-code-*` component token。
- da59fd4: feat(sidebar): FileContent 富文本查看/编辑列表（P5）

  SideBar 套件 P5 阶段：新增 `SideBarFileContent` 富文本折叠列表 + `SideBarFileItem` 单编辑器。
  基于 tiptap v3，默认扩展集对齐 Semi：StarterKit（link openOnClick:false）+ TextStyleKit + Image
  - TextAlign(types:['heading','paragraph']) + 自研 SelectionMark + 自研 ImageUploadNode（用
    svelte-tiptap NodeViewRenderer 内嵌本库 Upload，支持 getUploadImageSrc），末尾拼接使用方 extensions。
    `editable` 控制查看/编辑（编辑态渲染格式工具栏），`content` 为初始 HTML，`onContentChange`
    回调 editor.getHTML()。tiptap 内核 + 3 官方扩展（@tiptap/extension-text-style /
    extension-image / extension-text-align）+ svelte-tiptap 全程动态 import，不进主 bundle。

- 7243000: SideBar P3：新增 SideBarMcpConfigure MCP 工具配置面板（对标 Semi sideBar/mcpConfigure）。外层复用 SideBarContainer（继承并透传全部 Container props，`title` 默认走 i18n `SideBar.mcpTitle`）；内部顶部显示已启用计数（`已启用 N/总数`）+ 搜索框（复用本库 Input，前缀放大镜 + `aria-label`），下方并列渲染内置（`options`）/ 自定义（`customOptions`）双列表（Semi 用 radio 二选一切换，本库改并列双列表更直观）。每项：前置图标（`string` 按图片 URL / `Snippet` 自定义）+ `label` + `desc` + 动作按钮（内置 `configure=true` 显示配置 / 自定义显示编辑，`aria-label` 含工具名走 i18n）+ 启用开关（复用本库 Switch，原生 `role="switch"` + `aria-checked`，`disabled` 预设项锁定 + `title` tooltip）。搜索支持自定义 `filter(input, option)` 谓词（默认 label/value 大小写不敏感包含匹配）；启用变化经 headless `toggleMcpOptionActive` 产出「下一份数组 + custom 标记」上抛 `onStatusChange`，绝不回写 prop（受控红线）。自定义组为空显示添加入口（`onAddClick`），无搜索结果显示提示。

  core 新增框架无关纯函数 `filterMcpOptions` / `toggleMcpOptionActive` / `countActiveMcpOptions` 与类型 `McpOptionCore`。新增 `--cd-sidebar-mcp-*` component token 与 `SideBar.mcp*` locale（含修 Semi 硬编码「请输入」的 `mcpSearchPlaceholder`）。

- 84b6975: 新增 SideBar（AI 侧边信息栏套件，show/AI，对标 Semi Sidebar）P0+P1 阶段。P0 SideBarContainer 为可伸缩浮层壳：贴视口右侧（RTL 贴左），`role="dialog"` + `aria-labelledby`(title)，打开移焦 + focus-trap 焦点捕获/归还 + Esc 关闭，堆叠 z-index 复用 modal/z-stack 计数器（与 Modal/SideSheet 统一层栈，后开者在上）；resizable 时左边缘（RTL 右边缘）把手拖拽调宽——复用 core `createResizeDrag`（axis:'x' 单轴 + clamp minWidth/maxWidth），把手 `role="separator"` + `aria-orientation="vertical"` + `aria-valuenow` + 键盘 ←→/Home/End（与 Resizable 同套 a11y，不重造拖拽几何）；motion 展开/收起为 CSS transition（reduced-motion / motion=false 退化即时显隐）。P1 SideBar 主壳按 mode 路由：main 渲染顶部 Options 图标 tab 组（`role="tablist"` + roving tabindex + 键盘，name 作无障碍名）+ renderMainContent(activeKey)；detail 渲染 renderDetailHeader + 返回按钮（onBackWard 可异步，await 期间禁用防重触发）+ renderDetailContent(mode)。core 新增纯函数 `parseSideBarWidth` / `clampSideBarWidth`。新增 `--cd-sidebar-*` component token 与 locale key `SideBar.close` / `SideBar.back`。detail 里 code/file 具体渲染与 Annotation/MCPConfigure 留待 P2~P5 接续。
- 47f42ee: feat(tag): 新增 TagGroup 与 SplitTagGroup 两个 Tag 子组件（深度对标 Semi 2.101.0 导出符号级核对补齐）

  - TagGroup：一组 Tag 成组渲染，`tagList` 数据驱动或 `children`；超过 `maxTagCount` 折叠剩余为「+N」标签，`showPopover` 时 hover 在 Popover 弹层展示被折叠项。透传 `size`/`avatarShape`，支持 `restCount`/`onTagClose`/`onPlusNMouseEnter`/`popoverProps`。复用本库 Tag/Popover。
  - SplitTagGroup：连接式标签组，首子前缘圆角、末子后缘圆角、中间合并边，形成分段控件外观（纯 CSS 装饰）；`ariaLabel` 组可访问名。
  - a11y：两者 `role="group"`；TagGroup +N 带 `aria-label`（i18n `TagGroup.restTagsAriaLabel`，含 {count}），弹层复用 Popover 键盘/Esc；SplitTagGroup 组容器 `aria-label`。
  - tokens：新增 `--cd-taggroup-gap`、`--cd-splittaggroup-divider-width`、`--cd-splittaggroup-divider-color`。
  - locale：新增 `TagGroup.restTagsAriaLabel`（zh/en）。

- 046dc34: UserGuide 用户引导破坏性重写，严格对齐 Semi userGuide（DOM / token / API / demo 全量对齐，无向后兼容）。popup 模式复用本库 Popover（`trigger="custom"`）贴气泡讲解 + svg mask 挖洞 spotlight 遮罩逐个高亮目标（四块透明矩形让高亮区可交互，目标不在视口时 scrollIntoView）；modal 模式复用本库 Modal（header/footer=null、centered、bodyStyle padding:0）图文引导（cover 封面 + 圆点指示器）。core headless `createUserGuide` 步进状态机对齐 Semi foundation：current 受控/非受控、handlePrev/handleNext/handleSkip 回调去重、末步 handleNext 触发 finish、visible false→true 重置 current=0 并锁 body 滚动（补偿滚动条宽、getPopupContainer 时跳过）、spotlight padding 三层覆盖（step>props>默认5）。指示器 popup 为纯文本 `n/total`（对齐 Semi 无 i18n），modal 为圆点。移除自造的、Semi 无的能力：focus-trap / inert / Esc / 箭头键 / role=dialog 契约 / live-announcer / stepIndicator i18n key。tokens 逐条镜像 Semi `variables.scss`（名 / 值 / 作用 DOM 对齐），移除 Semi 无的中间变量。position 支持 Semi 14 方位。demo 补齐至 8 个对齐 Semi（基本 / 主题 / 弹出位置 / 高亮区域大小 / 定制按钮 / 受控 / 弹窗式 / 无遮罩）。onFinish/onSkip 不自动关闭，使用方置 visible=false。

### Patch Changes

- f8e51b8: feat(banner): 破坏性重写严格对齐 Semi（DOM/tokens/API/demo 全量对齐）

  以 Semi `semi-ui/banner` + `semi-foundation/banner` 源码为唯一基准破坏性重写，移除全部 Semi 没有的自造能力，无向后兼容。

  **移除的自造能力**：
  - `resolveBannerRole` / `dynamic` / role·aria-live 推断 → 改为 Semi 固定 `role="alert"`；删除 `@chenzy-design/core` 的 `banner.ts`（`resolveBannerRole`/`BannerType`/`BannerRoleProps`）及其导出与单测。
  - `closeOnEsc` / `animation` / slide 关闭过渡 / `onAfterClose` / `onOpenChange` / 受控 `open`·`defaultOpen` / `action` 插槽 / `ariaLabel`。
  - 自造 SVG 语义图标 → 改用已对齐 Semi 的 `IconInfoCircle`/`IconTickCircle`/`IconAlertTriangle`/`IconAlertCircle`（`size="large"`）；关闭按钮改用已对齐 Semi 的 `IconButton`（`theme=borderless size=small type=tertiary` + `IconClose`）；标题/描述改用已对齐 Semi 的 `Typography.Title`(heading=5)/`Typography.Paragraph`。
  - `full` 模式左侧 accent 竖条（Semi 无此概念）。

  **DOM 结构对齐 Semi**：`div.cd-banner.cd-banner-{type}.cd-banner-full|in-container[.cd-banner-bordered] > .cd-banner-content-wrapper > (.cd-banner-content > .cd-banner-icon + .cd-banner-content-body(Title + Paragraph)) + .cd-banner-close`，`children` 渲染于平级 `.cd-banner-extra`。

  **tokens 对齐**：移除全部 Semi 没有的自造中间消费层（`--cd-banner-radius`/`-accent`/`-motion`/`-close-*`/`-info-bg` 等约 30 个），仅保留 Semi `variables.scss` 的 22 个变量（名值一一对应），组件样式直连消费。样式逐条镜像 Semi `banner.scss` + `rtl.scss`。

  **API（对齐 Semi）**：`type` / `fullMode` / `bordered` / `title` / `description` / `icon`(Snippet|null) / `closeIcon`(Snippet|null) / `children` / `onClose` / `class` / `style`；本库 Snippet 化补充 `titleSnippet` / `descriptionSnippet`（对齐 Semi title/description 传 ReactNode）。

  **demo（对齐 Semi 机制、场景不少于 Semi）**：5 个 —— 基本用法（显隐切换 + onClose）、不同类型、非全屏模式（bordered + Link）、自定义内容（children→extra）、自定义图标（补全 Semi 官方未展示的 icon/closeIcon 自定义）。

  **关联修复**：`@chenzy-design/locale` 三份文件移除无消费方的 `Banner.info/success/warning/danger` 键（保留 `closeButtonAriaLabel`）；docs content 与 component-briefs 简介同步为新实现。

- 6ce31d0: feat(color-picker)!: 破坏性重写严格对齐 Semi（值改 ColorValue 对象 + 复用六件套 + token 去死中间层）

  破坏性重写 ColorPicker 严格对齐 Semi Design，无向后兼容。

  **值契约**：`value` / `defaultValue` / `onChange` 从 hex 字符串改为 Semi `ColorValue`
  对象 `{ hsva, rgba, hex }`（`hsva` 的 `s`/`v` 为 0-100）。`defaultValue` 默认改为
  Semi 品牌绿 `#39c5bb` 对象；`defaultFormat` 枚举 `hex|rgb|hsv|hsl` → `hex|rgba|hsva`。
  core 新增 `color-value.ts`（三态互转 + 输入串格式化/解析，镜像 Semi convert 语义）。

  **复用组件六件套**：DataPart 复用本库 Popover / Input / InputNumber(alpha% suffix +
  hideButtons) / Select / InputGroup / Button(吸管)，替换原生自造浮层 / dismiss /
  focus-trap / 原生 `<input>`/`<select>`/`<button>`。`usePopover` 时包裹 Popover，
  `children` 缺省渲染默认色块 trigger。

  **删超集**：`open`/`defaultOpen`/`onOpenChange`、`presets`、`size`、`status`、
  `disabled`、`outputUppercase`、`format`/`showFormatToggle`/`onFormatChange`、`inline`
  （改 `usePopover`）、`recentColors`/`recentMax`、`ariaLabel`。
  **补缺失**：`popoverProps`、`class`、`width`/`height`、topSlot/bottomSlot。

  **token**：20 个 Semi token 全部改为组件真消费（非对称圆角、InputNumber/Select 宽、
  间距、demoblock/alphaSliderInner 圆角、popover padding、把手边框），删除原 20+ 死中间层。

  **demos**：删 presets/states/format/BasicDemo（4 例），保留/改写 basic/alpha/eyeDropper/
  slots/custom-trigger/controlled（均改 ColorValue 对象受控）。

## 0.3.1

## 0.2.1

### Patch Changes

- 56a53aa: 补充 `license: "MIT"` 字段（此前 npm 显示 Proprietary）；新增 `@chenzy-design/svelte` 包 README，含安装、引入 tokens.css、快速开始接入说明。

## 0.2.0

### Minor Changes

- cacdfdc: Initial public release — 86 个 Svelte 5 组件，对标 Semi Design。
