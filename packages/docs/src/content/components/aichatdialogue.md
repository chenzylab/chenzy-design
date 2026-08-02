---
title: AIChatDialogue AI 对话
name: aichatdialogue
category: ai
brief: AI 对话消息流，支持多种消息类型、引用标注、选择模式与自定义渲染。
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';
  import Notice from '$lib/components/Notice.svelte';

  import Basic from '../../demos/ai-chat-dialogue/01-basic.svelte';
  import basicSrc from '../../demos/ai-chat-dialogue/01-basic.svelte?raw';
  import MessageStatus from '../../demos/ai-chat-dialogue/05-message-status.svelte';
  import messageStatusSrc from '../../demos/ai-chat-dialogue/05-message-status.svelte?raw';
  import ContentItems from '../../demos/ai-chat-dialogue/02-content-items.svelte';
  import contentItemsSrc from '../../demos/ai-chat-dialogue/02-content-items.svelte?raw';
  import ReferencesDemo from '../../demos/ai-chat-dialogue/06-references.svelte';
  import referencesSrc from '../../demos/ai-chat-dialogue/06-references.svelte?raw';
  import SelectDemo from '../../demos/ai-chat-dialogue/07-select.svelte';
  import selectSrc from '../../demos/ai-chat-dialogue/07-select.svelte?raw';
  import Hints from '../../demos/ai-chat-dialogue/08-hints.svelte';
  import hintsSrc from '../../demos/ai-chat-dialogue/08-hints.svelte?raw';
  import RenderHint from '../../demos/ai-chat-dialogue/09-render-hint.svelte';
  import renderHintSrc from '../../demos/ai-chat-dialogue/09-render-hint.svelte?raw';
  import RenderDialogue from '../../demos/ai-chat-dialogue/11-render-dialogue.svelte';
  import renderDialogueSrc from '../../demos/ai-chat-dialogue/11-render-dialogue.svelte?raw';
  import RenderContent from '../../demos/ai-chat-dialogue/10-render-content.svelte';
  import renderContentSrc from '../../demos/ai-chat-dialogue/10-render-content.svelte?raw';
  import Adapter from '../../demos/ai-chat-dialogue/03-adapter.svelte';
  import adapterSrc from '../../demos/ai-chat-dialogue/03-adapter.svelte?raw';
  import StreamingAdapter from '../../demos/ai-chat-dialogue/12-streaming-adapter.svelte';
  import streamingAdapterSrc from '../../demos/ai-chat-dialogue/12-streaming-adapter.svelte?raw';
  import MessageEdit from '../../demos/ai-chat-dialogue/04-message-edit.svelte';
  import messageEditSrc from '../../demos/ai-chat-dialogue/04-message-edit.svelte?raw';
  import AnnotationShare from '../../demos/ai-chat-dialogue/13-annotation-share.svelte';
  import annotationShareSrc from '../../demos/ai-chat-dialogue/13-annotation-share.svelte?raw';
</script>

## 使用场景

AIChatDialogue 组件可搭配 AIChatInput 使用，实现更丰富的、功能覆盖更全面、定制更加便捷的 AI 会话场景。
组件消息格式以 OpenAI 的 [Response Object](https://platform.openai.com/docs/api-reference/responses/object) 为原型，默认支持 OpenAI 社区 [Response](https://platform.openai.com/docs/api-reference/responses/create) / [Chat Completion](https://platform.openai.com/docs/api-reference/chat/create) 格式标准，对 GPT-5、GPT-4o 系列模型的响应均支持开箱即用，详见[消息数据转换](#消息数据转换)。

## 代码演示

### 如何引入

```jsx
import { AIChatDialogue } from '@chenzy-design/svelte';
```

### 基本用法

通过 `chats` 传入消息列表、`roleConfig` 配置角色元数据（名称/头像/色），`onChatsChange` 接收变更。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 消息状态

`status` 支持 `queued`、`in_progress`、`incomplete`、`completed`、`failed`、`cancelled`。

<DemoBox code={messageStatusSrc}><MessageStatus /></DemoBox>

### 消息展示

消息内容支持字符串或 `ContentItem[]`，涵盖文本、图片、文件、推理过程（reasoning）、工具调用（function_call）等类型。

<DemoBox code={contentItemsSrc}><ContentItems /></DemoBox>

### 引用

`showReference` 在用户消息上展示可引用图标，`onReferenceClick` 接收点击。

<DemoBox code={referencesSrc}><ReferencesDemo /></DemoBox>

助手消息的 `output_text` 若带 `annotations`，会渲染成正文上方的来源徽标，点击触发 `onAnnotationClick`（回传整组，`file_citation` / `container_file_citation` 已过滤）。同一示例还演示了 `escapeHtml`（用户消息里的 HTML 标签原样显示）与 `onMessageShare`（传了回调才渲染分享按钮）。

<DemoBox code={annotationShareSrc}><AnnotationShare /></DemoBox>

### 选择

`selecting` 开启选择模式，`onSelect` 回传选中的消息 id 列表；可通过实例方法 `selectAll` / `deselectAll` 批量操作。

<DemoBox code={selectSrc}><SelectDemo /></DemoBox>

### 提示

通过 `hints` 传入提示词，点击触发 `onHintClick`；`hintCls` / `hintStyle` 可定制提示区外层样式。

<DemoBox code={hintsSrc}><Hints /></DemoBox>

### 自定义渲染提示

通过 `renderHintBox` 自定义每个提示项的渲染。

<DemoBox code={renderHintSrc}><RenderHint /></DemoBox>

### 自定义渲染会话框

通过 `dialogueRenderConfig` 分区块自定义渲染（头像 / 标题 / 内容 / 操作区），或整条替换。

<DemoBox code={renderDialogueSrc}><RenderDialogue /></DemoBox>

### 自定义渲染消息内容

通过 `renderDialogueContentItem` 按消息块类型返回渲染映射，覆盖内置的分块渲染。

<DemoBox code={renderContentSrc}><RenderContent /></DemoBox>

### 消息数据转换

把服务端返回的数据适配成组件消息结构后传入 `chats`。

<DemoBox code={adapterSrc}><Adapter /></DemoBox>

<Notice type="primary" title="本库补充">

下方「流式数据转换」与「消息编辑」是本库补充的两个示例：前者演示流式返回时的增量拼装，后者演示 `messageEditRender` + `onMessageEdit` 的编辑态。

</Notice>

<DemoBox code={streamingAdapterSrc}><StreamingAdapter /></DemoBox>

<DemoBox code={messageEditSrc}><MessageEdit /></DemoBox>

## API 参考

### AIChatDialogue

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| align | 对话布局方式 | `'leftRight' \| 'leftAlign'` | `leftRight` |
| chats | 受控对话消息列表 | `Message[]` | `[]` |
| class | 自定义类名 | string | - |
| dialogueRenderConfig | 自定义各区块渲染 | `DialogueRenderConfig` | - |
| disabledFileItemClick | 是否禁用文件点击 | boolean | false |
| editable | 是否展示编辑操作（仅 user 消息显示编辑按钮，本库补充） | boolean | true |
| escapeHtml | 是否对用户消息中的 HTML 标签进行转义，防止被 Markdown 解析器当作 HTML 处理导致内容丢失 | boolean | true |
| hintCls | 提示区最外层样式类名 | string | - |
| hintStyle | 提示区最外层样式 | string | - |
| hints | 提示信息 | `string[]` | - |
| markdownRenderProps | 透传给对话框渲染所用的 MarkdownRender 组件，详见 [MarkdownRenderProps](/components/markdownrender#api) | object | - |
| messageEditRender | 自定义消息编辑渲染 | `Snippet<[MessageContent]>` | - |
| mode | 对话模式 | `'bubble' \| 'noBubble' \| 'userBubble'` | `bubble` |
| onAnnotationClick | annotation 点击回调（回传整组，已过滤 file_citation） | `(annotations) => void` | - |
| onChatsChange | 对话消息列表变更回调 | `(chats: Message[]) => void` | - |
| onFileClick | 附件文件点击回调 | `(file) => void` | - |
| onHintClick | 点击提示词回调 | `(hint: string) => void` | - |
| onImageClick | 图片点击回调 | `(image) => void` | - |
| onMessageBadFeedback | 消息负向反馈回调 | `(message: Message) => void` | - |
| onMessageCopy | 复制消息回调 | `(message: Message) => void` | - |
| onMessageDelete | 删除消息回调 | `(message: Message) => void` | - |
| onMessageEdit | 编辑消息回调 | `(message: Message) => void` | - |
| onMessageGoodFeedback | 消息正向反馈回调 | `(message: Message) => void` | - |
| onMessageReset | 重置消息回调 | `(message: Message) => void` | - |
| onMessageShare | 分享消息回调（传了才渲染分享按钮） | `(message: Message) => void` | - |
| onReferenceClick | 引用按钮点击回调 | `(item: Reference) => void` | - |
| onSelect | 选择项变更回调 | `(selectedIds: string[]) => void` | - |
| renderDialogueContentItem | 按消息类型返回内容渲染映射 | `Record<string, Snippet<[ContentItem]>>` | - |
| renderHintBox | 自定义提示项渲染 | `Snippet<[{ content, index, onHintClick }]>` | - |
| roleConfig | 角色配置（user/assistant/system 等元数据） | `RoleConfig` | - |
| selecting | 是否开启选择模式 | boolean | false |
| showReference | 是否在文字或者文件消息中展示可被引用图标，仅对用户消息生效 | boolean | false |
| showReset | 是否展示重置操作 | boolean | true |
| style | 样式 | string | - |

### RoleConfig

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| assistant | 助手信息 | Metadata | - |
| system | 系统信息 | Metadata | - |
| user | 用户信息 | Metadata | - |

### Metadata

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| avatar | 头像 | string | - |
| color | 头像背景色，同 Avatar 组件的 color 参数 | string | `grey` |
| name | 名称 | string | - |

### Message

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| content | 消息内容 | `string \| ContentItem[]` | - |
| createdAt | 创建时间 | number | - |
| id | 唯一标识 | `string \| number` | - |
| model | 模型名称 | string | - |
| name | 名称 | string | - |
| role | 角色 | string | - |
| status | 消息状态，可选值为 `queued`、`in_progress`、`incomplete`、`completed`、`failed`、`cancelled` | string | `completed` |

### Reference

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| content | 文本内容 | string | - |
| id | 唯一标识 | `string \| number` | - |
| name | 名称 | string | - |
| type | 类型 | string | - |
| url | 地址 | string | - |

### Methods

绑定在组件实例上的方法，通过 `bind:this` 拿到实例后调用。

| 方法 | 说明 |
| --- | --- |
| deselectAll | 取消全选所有消息 |
| scrollToBottom(animation: boolean) | 滚动到最底部，animation 为 true 则有动画，反之无动画 |
| scrollToTop(animation: boolean) | 滚动到最顶部，animation 为 true 则有动画，反之无动画 |
| selectAll | 全选所有消息 |
