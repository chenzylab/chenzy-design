# SPEC · AIChatInput（独立立项 · 未实现）

> 分类：show（Semi 归 Ai） · 阶段：独立立项（M?）
> 对标 Semi：[AIChatInput](https://semi.design/zh-CN/ai/aiChatInput)
> **状态：未实现，独立立项。** 本文件是立项书 —— 记录技术路线、依赖、Semi 源码位置、分阶段计划，供后续会话从明确起点开工。
> **为何独立**：这是本仓库最大的单组件工程 —— 基于 tiptap 富文本编辑器，40+ props，工程量超过前 8 个富媒体组件总和，无法在常规会话里可靠一次交付。

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
1. **阶段 0 · 技术验证**：先在 Svelte 里把 `@tiptap/core` 跑通（一个最小富文本输入 + Svelte runes 绑定 + onContentChange），确认路线可行、体积可接受。评估 `svelte-tiptap` 是否可用。
2. **阶段 1 · 基础输入**：richTextInput（input-slot）+ 发送（sendHotKey/canSend/generating/stop）+ Upload 附件。
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
