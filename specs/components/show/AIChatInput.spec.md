# SPEC · AIChatInput（独立立项 · 分阶段实现中）

> 分类：show（Semi 归 Ai） · 阶段：独立立项（M?）
> 对标 Semi：[AIChatInput](https://semi.design/zh-CN/ai/aiChatInput)
> **状态：阶段 0（技术验证）✅、阶段 1（基础输入）✅ 已完成，阶段 2+ 待做。** 本文件是立项书 —— 记录技术路线、依赖、Semi 源码位置、分阶段计划，供后续会话从明确起点开工。
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
3. **阶段 2 · 引用 + 建议**：references + suggestions（类 AutoComplete）+ 自定义渲染。
4. **阶段 3 · 技能 + 模版**：skill-slot + skillHotKey + renderTemplate。
5. **阶段 4 · 配置区**：Configure.Select/Button/Mcp/RadioButton + getConfigureItem + onConfigureChange。
6. **阶段 5 · Adapter 桥**：messageToChatInput / chatInputToChatCompletion（接 AIChatDialogue）。
7. **收尾**：token/i18n/meta/size-limit/docs demo（对齐已落地组件 DoD）。
> 每阶段独立可合并、独立验证，避免一次做出无法验证的巨型半成品。

## 7. 风险
- tiptap 体积大（ProseMirror + 多 extension），需 size-limit 单独口径（可能动态 import）。
- Svelte 5 与 tiptap 的响应式桥接是新工作，无现成范式，阶段 0 必须先验证。
- 自定义 node（input-slot/select-slot/skill-slot）的 Svelte 渲染需要 tiptap NodeView 的 Svelte 适配。

## 8. 验收标准
立项完成后按各阶段 DoD；全部完成后对齐富媒体组件统一 DoD（测试/typecheck/token/i18n/meta/perf/docs）。
