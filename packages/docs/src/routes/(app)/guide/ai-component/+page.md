<script>
  import { base } from '$app/paths';
</script>

# AIComponent AI 组件能力介绍

`chenzy-design` 的 AI 组件是一套面向 AI 应用场景的组件能力集合，以「人机智能协同」为理念，让用户与 AI 系统的协作更高效、可控、可感知。整体对标 Semi Design 的 AI 组件体系，并以 Svelte 5 与框架无关的 headless 内核（`@chenzy-design/core`）重新实现。

能力分为两块：

- **AI 风格**：在 `Button` / `Tag` / `FloatButton` 上提供 AI 多彩（`colorful`）风格，以品牌蓝 → 紫渐变呈现，对齐 Semi AI 视觉语言。
- **AI Chat 组件**：面向智能问答、多模态输入与多轮对话场景的 `AIChatInput`、`AIChatDialogue`、`SideBar`，以及轻量对话组件 `Chat`。

> 关于 `Chat` 与 `AIChatInput` / `AIChatDialogue` 如何选型，见本页末尾的 FAQ。

## AI 风格

AI 风格通过组件的 `colorful` 属性开启，底层用品牌蓝 → 紫的双色渐变（冷色调），与常规主题色区分，用于标记 AI 相关的操作入口。

- **AI Button**：`colorful` 仅在 `type="primary"` / `type="tertiary"` 下生效，其余 type 回退为 primary。支持 `loading` / `disabled` 态，可纯图标或图标 + 文字。详见 <a href="{base}/components/button">Button</a>。
- **AI Tag**：`colorful` 开启多彩标签，配合 `gradient` 区分渐变色与单色紫，与 `type`（solid/light/ghost）、`shape`、`prefixIcon` 组合；多彩标签字重比常规标签更重。详见 <a href="{base}/components/tag">Tag</a>。
- **AI FloatButton**：悬浮按钮的 `colorful` 渐变形态，适合作为常驻的 AI 助手入口。详见 <a href="{base}/components/floatbutton">FloatButton</a>。

渐变色由 AI 语义色驱动：Button / FloatButton 消费 `--cd-color-ai-general`（4 色 278° 渐变，亮暗双套，1:1 镜像 Semi），Tag 用可编辑的 `--cd-tag-colorful-from` 三色。暗色模式与品牌定制均随 token 体系联动。

## AI Chat 组件

面向复杂 AI 会话场景，推荐将 `AIChatInput` 与 `AIChatDialogue` 搭配使用，`SideBar` 承载产物与引用资料的侧边展示。

### AIChatInput 富文本输入

基于 tiptap 富文本编辑器（内核与 `svelte-tiptap` 走动态 import 懒加载），支持：

- 可定制的**配置区域**（左下角，如模型选择、联网搜索、MCP）与**操作区域**（右下角，如发送、停止生成）。
- **富文本输入区**：支持输入模板与 `input-slot` 占位插槽。
- **引用**展示与删除。
- 附件上传（复用 `Upload` 能力）。

详见 <a href="{base}/components/aichatinput">AIChatInput</a>。

### AIChatDialogue 会话展示

消息数据结构以 OpenAI Response Object 为原型，`content` 支持 `ContentItem` 数组，可开箱承接 OpenAI [Response](https://platform.openai.com/docs/api-reference/responses/create) / [Chat Completion](https://platform.openai.com/docs/api-reference/chat/create) 格式的响应。支持：

- 按消息类型的**自定义渲染**（`renderDialogueContentItem`）。
- 消息**引用**与**选择**操作。
- 消息**编辑**（`messageEditRender`）与转换。
- 多角色（`roleConfig`）头像与名称标识，适用于 Multiple Agent 场景。

详见 <a href="{base}/components/aichatdialogue">AIChatDialogue</a>。

### SideBar 多功能侧边栏

可伸缩的侧边信息栏套件（分阶段交付）：贴视口右侧的可伸缩浮层壳，用于承载产物编辑、产物查看、引用资料展示等内容，与对话区联动。详见 <a href="{base}/components/sidebar">SideBar</a>。

### Chat 轻量对话

`Chat` 组件默认集成输入与消息展示，内容走 `MarkdownRender`，适合仅需普通文字对话与简单图片、文件展示的轻量场景。详见 <a href="{base}/components/chat">Chat</a>。

## FAQ

**Chat 组件和 AI Chat 系列组件应该如何选型？**

- **场景简单**（仅普通文字对话 + 简单图片/文件展示）：推荐 <a href="{base}/components/chat">Chat</a>。它默认集成 input 与消息展示，理解简单、上手快；缺点是复杂的输入框或消息展示定制相对困难。
- **场景复杂**：推荐 <a href="{base}/components/aichatinput">AIChatInput</a> + <a href="{base}/components/aichatdialogue">AIChatDialogue</a> 搭配使用。
  - `AIChatInput` 支持更复杂的样式定制：可定制配置区 / 操作区、富文本输入模板、引用展示、附件上传。
  - `AIChatDialogue` 消息展示的灵活性更高：兼容 OpenAI Response / Chat Completion 格式，支持按消息类型定制渲染、消息引用与选择、消息编辑。

## 规划

未来将支持更多 AI Chat 组件，例如结合 `AIChatInput` 与 `AIChatDialogue` 的一体化组件，以满足复杂 AI 应用下的信息与结果管理需求。
