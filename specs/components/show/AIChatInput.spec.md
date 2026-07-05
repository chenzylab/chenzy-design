# SPEC · AIChatInput（独立立项 · 分阶段实现中）

> 分类：show（Semi 归 Ai） · 阶段：独立立项（M?）
> 对标 Semi：[AIChatInput](https://semi.design/zh-CN/ai/aiChatInput)
> **状态：阶段 0～5 全部 ✅ 已完成（技术验证/基础输入/引用+建议/技能+模版/配置区/Adapter 桥）。剩收尾（DoD 复核）。** 本文件是立项书 —— 记录技术路线、依赖、Semi 源码位置、分阶段计划，供后续会话从明确起点开工。
> **为何独立**：这是本仓库最大的单组件工程 —— 基于 tiptap 富文本编辑器，40+ props，工程量超过前 8 个富媒体组件总和，无法在常规会话里可靠一次交付。

## 0. 阶段 0 验证结论（2026-07-05 已完成 ✅）

在本项目 Svelte 5 + jsdom 管线实证跑通了 tiptap，**路线确认可行**。POC：`packages/svelte/src/_experiments/tiptap-poc/`（临时验证代码，`_experiments/` 不进 index 导出）。

- **选型：用 `svelte-tiptap@^3.0.1`**（社区包，peer 明确 `svelte: ^5.0.0`，Svelte 5 原生）。它提供 `createEditor`（返回 `Readable<Editor>` store）、`EditorContent`、以及关键的 **`SvelteNodeViewRenderer`/`NodeViewWrapper`/`NodeViewContent`**（用 Svelte 组件写 tiptap 自定义 NodeView —— 正是 input-slot/select-slot/skill-slot 三种自定义节点需要的）。**不必从零手写 @tiptap/core 绑定层**。
- **runes 桥接模式**（已验证）：`$effect` 内 `createEditor(...)` + `store.subscribe(ed => editor = ed)`，cleanup 时 `unsub()` + `editor.destroy()`。editor 是命令式实例（同 JsonViewer/AudioPlayer 的 MVVM 适配模式，autofixer 关于「$effect 里赋值 $state」的建议不适用）。
- **已验证能力**：组件挂载不抛错、`.ProseMirror` 容器渲染、初始 content 生效、`onContentChange` 随 setContent 触发（形态 `{html,text}`）、ref 方法 setContent/focusEditor/getText/getHTML。3 个 dom 测试全过；typecheck 0 error（tiptap d.ts 完全兼容）；全量 1197 passed。
- **⚠️ 体积（关键约束）**：`@tiptap/core + @tiptap/pm + starter-kit` 最小集 = **gzip ~126 KB**（minified 400KB）。远超其他组件。**AIChatInput 必须动态 import 整个 editor 内核**（像 JsonViewer 内核 / MarkdownRender 的 unified 那样），绝不进主 bundle；size-limit 需按「组件壳 ignore tiptap」的口径记账。
- **已装依赖**（svelte 包 deps）：`@tiptap/core ^3.0.0` `@tiptap/pm ^3.0.0` `@tiptap/starter-kit ^3.0.0` `svelte-tiptap ^3.0.1` `@floating-ui/dom ^1.0.0`。后续阶段按需加 extension 包（mention/text-align/image 等）。
- **POC 去留**：阶段 1 正式实现 AIChatInput 时，`_experiments/tiptap-poc/` 可删（其结论已固化于此）或升格为基座。

## 0.1 阶段 1 结论（基础输入 · 已完成 ✅）

落地文件：headless `packages/core/src/ai-chat-input.ts`（+ test）；渲染 `packages/svelte/src/ai-chat-input/`（AIChatInput.svelte / index.ts / meta.ts / a11y.test.ts）；token `packages/tokens/src/components/ai-chat-input.ts`；i18n `AIChatInput.{editor,placeholder,send,stop,upload}`（zh/en）；size-limit 加 `ai-chat-input` 条目 + tiptap 内核 ignore。

- **架构分层**：canSend 推断 / sendHotKey 判定（enter vs shift+enter）/ MessageContent 组装 / tiptap doc→Content[] 归一（transformer 可覆盖）全在 core（14 单测）；svelte 层只做渲染 + tiptap 桥接。
- **tiptap 桥接**：**直接 `new Editor({ element })`**（不经 svelte-tiptap store —— 阶段 1 无 Svelte NodeView 需求，直接持有实例更简）。`$effect` 内 `await Promise.all([import('@tiptap/core'), import('@tiptap/starter-kit'), import('@tiptap/extensions')])` 动态 import 三包 → new Editor → 赋值 `$state`，cleanup `destroy()`。占位符用 `@tiptap/extensions` 的 `Placeholder`（Semi 也用它，非独立 extension-placeholder 包）。
- **体积达标**：组件壳实测 **gzip 2.9 KB**（预算 4 KB），tiptap 内核经 size-limit per-component ignore 不计入壳（内核 gzip ~126KB 惰性加载，同 §0）。
- **发送态**：`generating` 时发送键变停止键（方块图标）、aria-label=stop、Enter 不发送、点击走 onStopGenerate；非 generating 空态禁用（canSend 推断），点击/热键走 onMessageSend（载荷 `{ inputContents, attachments }`）。
- **a11y**：编辑区 role=textbox / aria-multiline / aria-label(i18n)；发送/停止/上传按钮 aria-label 走 i18n；14 dom+axe 测试全过（真实键盘/IME/光标留浏览器）。
- **新增依赖**：`@tiptap/extensions ^3.0.0`（Placeholder + UndoRedo）。
- **阶段 1 范围外（明确留后）**：input-slot/select-slot/skill-slot 自定义 NodeView（需 svelte-tiptap SvelteNodeViewRenderer）、references/suggestions/skill/template/configure/renderTopSlot/round 之外的布局插槽、Adapter 桥。paste-upload 复用 Upload 能力但未接 onPaste 回调。

## 0.2 阶段 2 结论（引用 + 建议 · 已完成 ✅）

在阶段 1 基座上加 references 引用条、suggestions 建议浮层、top 布局插槽与自定义渲染。落地：headless 追加到 `packages/core/src/ai-chat-input.ts`（suggestionContent/nextSuggestionIndex/referenceLabel/isImageReference，core 单测 14→24）；渲染层扩 `AIChatInput.svelte`；token 追加引用条/建议面板；i18n 加 `deleteReference/suggestions`（zh/en）。

- **引用条**：受控 `references` 渲染于编辑区上方 top area。默认渲染 text→content / file→name / image→缩略图（core `referenceLabel`/`isImageReference` 归一）；`renderReference` 整条覆盖；`onReferenceClick`/`onReferenceDelete`。**a11y 关键**：chip 容器非交互，内部「名称按钮」与「删除按钮」平级 —— 避免 nested-interactive（axe 实测触发过，已修）。
- **建议浮层**：`suggestions`（`string | {content}`）。编辑区 focus 时（tiptap `editorProps.handleDOMEvents.focus`）弹面板；键盘 ↑↓ 环绕（core `nextSuggestionIndex`）/ Enter 选中高亮项 / Esc 关闭，均在 `handleKeyDown` 里先于发送判定拦截；点击外部关闭走 core `useDismiss`（escape:false，Esc 已由编辑区键盘处理）。面板 role=listbox / 项 role=option aria-selected。选中：`onSuggestClick` 未提供时默认 `setContent` 填入编辑器。项用 `onmousedown`+preventDefault（避免编辑器先 blur 触发 useDismiss 关闭）。
- **top 插槽**：`renderTopSlot({references,attachments})` + `topSlotPosition`（top/bottom，相对引用条）。
- **发送载荷**：`onMessageSend` 现带 `references`（buildMessageContent 已支持，空则省略）。
- **体积**：组件壳 gzip 阶段 1 2.9KB → 阶段 2 **4.57KB**（预算校准至 5.5KB）；tiptap 内核仍 ignore。
- **测试**：core 24 单测；dom+axe 24 测（引用渲染/点击/删除/axe、建议弹出/键盘/选中/悬浮/axe）。全量 1245 passed、svelte-check 0 err。
- **jsdom 提示**：建议面板由 tiptap 原生 focus DOM 事件打开（非 svelte 委托事件），jsdom 下向 `.ProseMirror` 派发 `FocusEvent('focus')` 可触发，测得通（区别于 svelte5 委托 change 测不出的情况）。
- **阶段 2 范围外（留后）**：input-slot/select-slot/skill-slot 自定义 NodeView、skill/template、configure、Adapter 桥。suggestion 面板未做浮动定位（floating-ui）——绝对定位在编辑区下方够用。

## 0.3 阶段 3 结论（技能 + 模版 · 已完成 ✅）

首次引入 **tiptap 自定义 NodeView**（skill-slot），路线确认：**用 svelte-tiptap 的 `SvelteNodeViewRenderer` 渲染 Svelte 组件**，跑通。落地：core 追加 skillLabel/getSkillSlotHTML/shouldOpenSkillPanel（单测 24→32）；新增 `SkillSlotNode.svelte`（NodeView 组件）+ `skill-slot-extension.ts`（Node 工厂）；主组件扩 skill 面板 + 模版；token 加 skill-slot chip/模版按钮；i18n 加 skills/deleteSkill/template。

- **skill-slot 自定义节点**：`Node.create({ name:'skillSlot', inline, atom, ... , addNodeView: () => SvelteNodeViewRenderer(SkillSlotNode) })`。工厂 `createSkillSlotExtension(Node, mergeAttributes, SvelteNodeViewRenderer)` 由主组件在**动态 import 链内**调用（`import('svelte-tiptap')` + `import('./skill-slot-extension.js')` 与 tiptap 内核一起懒加载，均不进主 bundle）。**始终注册**（不随 skills 变化重建 editor）；面板是否弹出另由 skills 数量决定。NodeView（`SkillSlotNode.svelte`）用 `NodeViewWrapper as="span"` 渲染 inline chip（label + 删除按钮 deleteNode）。
- **skill 面板**：复用建议面板 UI（listbox/option）。空编辑区按 `skillHotKey`（默认 `/`，core `shouldOpenSkillPanel` 判定）弹出；↑↓ 环绕 / Enter 选中 / Esc 关闭在 handleKeyDown 里先于 suggestion/发送判定处理；点击外部 useDismiss。选中：`setContent(getSkillSlotHTML(skill))` 插入节点 + `onSkillChange` + 记 currentSkill。
- **模版**：`currentSkill.hasTemplate && renderTemplate && showTemplateButton` 时 footer 显模版按钮（aria-expanded），点击弹 `renderTemplate({skill, setContent})` 面板；setContent 填入并关面板。ref `changeTemplateVisible(v)`；`onTemplateVisibleChange`。
- **体积**：组件壳 gzip 阶段 2 4.57 → 阶段 3 **6.08KB**（预算校准 7KB）；svelte-tiptap 加入 per-component ignore（在懒加载链）。
- **测试**：core 32 单测；dom+axe 29 测（skillSlot NodeView 渲染、skillHotKey 弹面板、选中 onSkillChange+插入节点、模版按钮、axe）。全量 1258 passed、svelte-check 0 err。
- **jsdom 提示**：skillHotKey 走 tiptap ProseMirror `handleKeyDown`，jsdom 下向 `.ProseMirror` 派发 `KeyboardEvent('keydown')` 可触发面板，测得通。SkillSlotNode 的 svelte-tiptap NodeView 在 jsdom 下正常挂载渲染。
- **阶段 3 范围外（留后）**：input-slot/select-slot 自定义节点（skill-slot 已跑通同一套 SvelteNodeViewRenderer 路线，input/select 可照做）、configure 配置区、Adapter 桥。

## 0.4 阶段 4 结论（配置区 · 已完成 ✅）

对齐 Semi Configure（React context + getConfigureItem HOC）→ **Svelte context 适配**。落地：core 追加 setConfigureField/removeConfigureField（不可变，单测 32→36）；新增 `configure-context.ts`（context key + get/set）+ `AIChatInputConfigureSelect/Button/RadioButton.svelte`；主组件持 configureValue $state + setContext + 发送并入 setup。

- **架构**：Semi 用 React context Provider（Configure 组件）+ getConfigureItem HOC 把任意组件包成受控字段。Svelte 无 HOC → **主组件直接 `setContext` 提供 `{ getValue, setField, removeField }`**（configureValue 是主组件 $state），Configure 子组件 `getContext` 用 `field` 绑定（读 value[field]、变更 setField({[field]:v})、卸载 removeField）。比 Semi 少一层 Configure wrapper 组件。
- **子组件（3 个，独立 entry 按需引入）**：`ConfigureSelect`（包 Select）、`ConfigureButton`（布尔 toggle，aria-pressed）、`ConfigureRadioButton`（包 RadioGroup type=button）。各含 initValue 注册（init=true 不触发 onConfigureChange）+ 卸载清理。**Semi 的 Configure.Mcp 未做**（MCP 服务选择器复杂，留后或消费方自定义）。
- **主组件**：`renderConfigureArea` snippet 渲染于 footer 左侧；发送时 `buildMessageContent({ ..., setup: configureValue })`；`onConfigureChange(value, changed)` 在 setField 非 init 时触发；`configureDefaultValue` 初始值（untrack 只取初始）；ref `getConfigureValue()`。
- **体积**：主壳 gzip 6.08→**6.47KB**（预算 7KB 内，无需调整）；Configure 子组件独立 entry（各引 Select/Radio 兄弟组件），不计入主壳。
- **测试**：core 36 单测；dom+axe 33 测（含配置 fixture：值绑定、onConfigureChange、setup 并入、axe）。全量 1266 passed、svelte-check 0 err。
- **阶段 4 范围外（留后）**：Configure.Mcp、input-slot/select-slot 节点、Adapter 桥。

## 0.5 阶段 5 结论（Adapter 桥 · 已完成 ✅）

AIChatInput ↔ AIChatDialogue / OpenAI API 的桥（对齐 Semi dataAdapter 反向）。**core 纯函数**（无渲染层，单测 36→42），从 svelte 包透传。

- **messageToChatInput(message, opts?)** → `AIDialogueMessage`（role='user'）：把 onMessageSend 载荷转成一条 user 消息，content 为单个 `{type:'message', role:'user', content: parts}`，parts 含 `input_text`（inputContents）/`input_image`/`input_file`（attachments 按 name/url 图片扩展名分流）。opts.id（AIChatDialogue 需唯一 id，调用方提供，缺省 ''）/opts.model。→ 直接 push 进 AIChatDialogue 的 chats。
- **chatInputToChatCompletion(message)** → `{ role:'user', content: parts }`：OpenAI ChatCompletion 请求的 user message，parts 为 `text`/`image_url`/`file` 多模态。→ 直接放进 messages 喂 API。
- **图片判定**：`AIChatInputAttachment.type` 是 `'file'|'directory'`（非 mime），故按 name/url 图片扩展名判图（不看 type）。
- **端到端 demo**（08-with-dialogue）：AIChatInput 发送 → messageToChatInput → AIChatDialogue 展示，直观演示桥。
- **测试**：core 42 单测（含两 Adapter 各分支）。全量 svelte-check 0 err。
- **阶段 5 范围外（留后）**：input-slot/select-slot 节点、Configure.Mcp 为可选补充；references 未进 Adapter 输出（Semi 也未固定其位置，留消费方按需并入）。

## 0.6 可选补充 · select-slot 自定义节点（已完成 ✅）

照阶段 3 skill-slot 同一 SvelteNodeViewRenderer 路线补 **select-slot**（内联下拉，用于 renderTemplate 模版填空）。落地：core `getSelectSlotHTML(options, value?)`（生成 `<select-slot options='JSON' value>`，转义防注入）；`transformDocToContents` 内建 selectSlot（取 attrs.value）/skillSlot（取 label）归一 —— 内联 slot 文本开箱进 content，无需消费方传 transformer；`SelectSlotNode.svelte`（NodeView 渲染项目 Select，`updateAttributes({value})` 写回）+ `select-slot-extension.ts`（atom node 工厂）；主组件动态 import 链注册 selectSlot（与 skillSlot 并列，始终注册不重建 editor）。

- **用法**：renderTemplate 里 `setContent(\`...${getSelectSlotHTML(['英文','日文'],'英文')}...\`)`，模版中嵌可选参数下拉；发送时 select-slot 的 value 自动进 inputContents。
- **测试**：core 42→46（getSelectSlotHTML + 内联 slot 归一）；dom 33→35（NodeView 渲染 + value 进 content）。壳 gzip 6.48→6.82KB（预算 7KB 内）。demo 06 模版含 select-slot。
- **仍留后**：input-slot（content='inline*' 可编辑节点，需 NodeViewContent + ProseMirror 光标 plugins，复杂度高）、Configure.Mcp。

## 1. 概述
AI 聊天场景的输入框：富文本输入（tiptap）+ 上传 + 引用 + 建议 + 技能/模版 + 配置区（模型参数/联网/深度思考/MCP）+ 丰富自定义渲染。搭配 AIChatDialogue（已落地）构建完整 AI 会话。

## 2. 核心技术路线（关键决策）

### tiptap 集成 —— 最大难点
- **Semi 用 `@tiptap/react`**（React 绑定），**Svelte 完全不能复用**。
- Svelte 方案：引 **`@tiptap/core` + `@tiptap/pm`（ProseMirror）+ 各 extension 包**，**自己写 Svelte 响应式绑定层**（把 tiptap Editor 实例接入 Svelte 5 runes：`$effect` 创建/销毁 editor、`$state` 同步 editor 内容、transaction → onContentChange）。
- 社区有 `svelte-tiptap`（第三方）可参考/评估是否直接用，但需核对 Svelte 5 兼容性 + 体积 + 是否够灵活（Semi 用了大量自定义 node/extension）。
- Semi 依赖的 tiptap 包（13 个，见 semi-ui package.json）：
  `@tiptap/core` `@tiptap/pm` `@tiptap/starter-kit` `@tiptap/react`(换掉) `@tiptap/extension-document` `@tiptap/extension-paragraph` `@tiptap/extension-text` `@tiptap/extension-hard-break` `@tiptap/extension-image` `@tiptap/extension-mention` `@tiptap/extension-text-align` `@tiptap/extension-text-style` `@tiptap/extensions`。

### 三种自定义节点（Semi 内置 extension）
- **input-slot**：文本输入 + placeholder。
- **select-slot**：简单选择（选项仅 string）。
- **skill-slot**：技能展示块。
> 这三个是 tiptap 自定义 node，需在 Svelte 侧用 tiptap Node API 重建（框架无关，可复用 Semi 的 node 定义思路，但渲染层要 Svelte）。

## 3. Semi 源码位置（已定位，供扒源码）
- **semi-ui**：`@douyinfe/semi-ui/lib/es/aiChatInput/`
  - `index.js`（24.9K，主组件）、`richTextInput.js`（10.7K，tiptap 封装）、`skillItem.js`、`suggestionItem.js`、`horizontalScroller.js`、`interface.d.ts`（5K 类型）、`configure/`（配置区 Select/Button/Mcp/RadioButton）、`extension/`（自定义 extension）。
- **拉包命令**：`npm pack @douyinfe/semi-ui@latest` + `@douyinfe/semi-foundation@latest`，解包看 `lib/es/aiChatInput/`。

## 4. API（对齐 Semi，40+ props —— 完整见 Semi 文档）
### 核心 Props
canSend / defaultContent(TiptapContent) / generating / onContentChange / onMessageSend / onStopGenerate / sendHotKey / placeholder / uploadProps / onUploadChange / references / renderReference / onReferenceDelete / onReferenceClick / skills / skillHotKey / onSkillChange / suggestions / onSuggestClick / renderSuggestionItem / renderTemplate / showTemplateButton / renderConfigureArea / onConfigureChange / renderActionArea / renderUploadButton / renderTopSlot / topSlotPosition / showReference / showUploadFile / showUploadButton / round / extensions / transformer / clearContentOnGenerating。
### Configure 子组件
`Configure.Select` / `Configure.Button` / `Configure.RadioButton` / `Configure.Mcp` / `getConfigureItem`（扩展自定义组件为 Configure 类型）。
### Methods（ref）
setContent / setContentWhileSaveTool / getEditor（返回 tiptap Editor 实例）/ focusEditor / deleteContent / deleteUploadFile / changeTemplateVisible。

## 5. 与已落地组件的关系
- **AIChatDialogue（已落地）**：AIChatInput 的 `onMessageSend` 输出 → 经 Adapter（`messageToChatInput`/`chatInputToChatCompletion`，本次未做，随 AIChatInput 补）→ 喂给 AIChatDialogue 展示。这两个 Adapter 是 AIChatInput ↔ AIChatDialogue 的桥，立项时一并做。
- **Upload（已有）** / **MarkdownRender（已有）** 可复用。

## 6. 分阶段建议（立项后）
1. ~~**阶段 0 · 技术验证**~~ ✅ **已完成（2026-07-05）**：见 §0。结论——用 `svelte-tiptap`，runes 桥接跑通，体积 gzip ~126KB 须动态 import。
2. ~~**阶段 1 · 基础输入**~~ ✅ **已完成**：richTextInput + 发送（sendHotKey/canSend/generating/stop）+ Upload 附件。见 §0.1。（input-slot 自定义节点留阶段 2+ 随引用/建议一起做。）
3. ~~**阶段 2 · 引用 + 建议**~~ ✅ **已完成**：references + suggestions（类 AutoComplete）+ 自定义渲染。见 §0.2。
4. ~~**阶段 3 · 技能 + 模版**~~ ✅ **已完成**：skill-slot + skillHotKey + renderTemplate。见 §0.3。
5. ~~**阶段 4 · 配置区**~~ ✅ **已完成**：Configure.Select/Button/RadioButton（context+field 绑定，替代 Semi getConfigureItem HOC）+ onConfigureChange + setup。**Configure.Mcp 未做**（留后）。见 §0.4。
6. ~~**阶段 5 · Adapter 桥**~~ ✅ **已完成**：messageToChatInput / chatInputToChatCompletion（接 AIChatDialogue / OpenAI API）。见 §0.5。
7. **收尾**：token/i18n/meta/size-limit/docs demo（对齐已落地组件 DoD）。
> 每阶段独立可合并、独立验证，避免一次做出无法验证的巨型半成品。

## 7. 风险
- tiptap 体积大（ProseMirror + 多 extension），需 size-limit 单独口径（可能动态 import）。
- Svelte 5 与 tiptap 的响应式桥接是新工作，无现成范式，阶段 0 必须先验证。
- 自定义 node（input-slot/select-slot/skill-slot）的 Svelte 渲染需要 tiptap NodeView 的 Svelte 适配。

## 8. 验收标准（DoD · 阶段 0~5 全完成后复核 ✅）

对齐 AGENTS.md §5 统一 DoD，逐条勾：

- [x] **分层**：headless 在 `core/ai-chat-input.ts`（42 单测）；渲染在 `svelte/ai-chat-input/`（AIChatInput + SkillSlotNode + 3 Configure 子组件）。
- [x] **类型 + JSDoc**：全部 props/events/slots/methods 有 TS 类型 + JSDoc；类型从 core 透传。
- [x] **Token**：`tokens/components/ai-chat-input.ts` 注册（容器/编辑区/引用条/建议-技能面板/skill-slot chip/模版-配置按钮），深浅双主题，值回退 Alias，无悬空。
- [x] **a11y**：编辑区 role=textbox；建议/技能面板 listbox/option；引用 chip 平级 button（避免 nested-interactive）；模版按钮 aria-expanded；配置按钮 aria-pressed；键盘 ↑↓/Enter/Esc/skillHotKey；axe 0 violations（多态覆盖）。
- [x] **i18n**：`AIChatInput.{editor,placeholder,send,stop,upload,deleteReference,suggestions,skills,deleteSkill,template}`（zh/en），无硬编码用户可见字符串。
- [x] **测试**：core 42 单测（发送/快捷键/归一/键盘/skill/configure/adapter 全分支）；dom+axe 33 测（渲染/发送/引用/建议/技能/模版/配置/端到端）。
- [x] **Perf**：见 §9；主壳 gzip 6.48KB < 7KB 预算；tiptap 内核 + svelte-tiptap 动态 import 不进主 bundle。
- [x] **meta**：`meta.ts` 提供（props/events/slots/methods/a11y/tokens/examples），4 个 exports。
- [x] **文档页**：8 个 demo（基础/发送态/快捷键/附件/引用/建议/技能模版/配置/接入对话），`nameToDir` 已登记；API 表由 meta 生成——收尾时把 AIChatInput + 所有此前缺失的富媒体组件（dialogue/chat/cropper/json-viewer/markdown-render/audio-player/video-player/code-highlight）补进 `build-components-json.ts` 生成器（70→79），详情页 API 表数据源恢复；docs typecheck 0 err。

## 9. 性能（Perf Budget）

| 指标 | 预算 | 实测 | 口径 |
|---|---|---|---|
| 组件壳 gzip | ≤ 7 KB | **6.48 KB** | `{ AIChatInput }` entry，minify+gzip |
| tiptap 内核 | 不进主 bundle | gzip ~126KB | 动态 import，size-limit per-component ignore（`@tiptap/core`+`starter-kit`+`extensions`+`svelte-tiptap`） |
| Configure 子组件 | 独立 entry 按需引入 | — | 各引 Select/RadioGroup 兄弟组件，不计入主壳 |

- 内核惰性加载：`$effect` 内 `Promise.all([import('@tiptap/core'), ...])`，编辑器仅在挂载时拉取，绝不进主 bundle。
- 预算演进（各阶段实测校准）：阶段 1 壳 2.9KB → 2 引用/建议 4.57KB → 3 技能/模版 6.08KB → 4 配置区 6.47KB → 5 Adapter 6.48KB。predicate 保守 7KB 上限。
