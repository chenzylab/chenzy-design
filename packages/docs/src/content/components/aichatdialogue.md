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
  import ChatCompletionToMessage from '../../demos/ai-chat-dialogue/16-chat-completion-to-message.svelte';
  import chatCompletionToMessageSrc from '../../demos/ai-chat-dialogue/16-chat-completion-to-message.svelte?raw';
  import StreamingChatCompletionToMessage from '../../demos/ai-chat-dialogue/17-streaming-chat-completion-to-message.svelte';
  import streamingChatCompletionToMessageSrc from '../../demos/ai-chat-dialogue/17-streaming-chat-completion-to-message.svelte?raw';
  import ResponseToMessage from '../../demos/ai-chat-dialogue/18-response-to-message.svelte';
  import responseToMessageSrc from '../../demos/ai-chat-dialogue/18-response-to-message.svelte?raw';
  import StreamingResponseToMessage from '../../demos/ai-chat-dialogue/19-streaming-response-to-message.svelte';
  import streamingResponseToMessageSrc from '../../demos/ai-chat-dialogue/19-streaming-response-to-message.svelte?raw';
  import MessageEdit from '../../demos/ai-chat-dialogue/04-message-edit.svelte';
  import messageEditSrc from '../../demos/ai-chat-dialogue/04-message-edit.svelte?raw';
  import AnnotationShare from '../../demos/ai-chat-dialogue/13-annotation-share.svelte';
  import annotationShareSrc from '../../demos/ai-chat-dialogue/13-annotation-share.svelte?raw';
  import CustomStepType from '../../demos/ai-chat-dialogue/14-custom-step-type.svelte';
  import customStepTypeSrc from '../../demos/ai-chat-dialogue/14-custom-step-type.svelte?raw';
  import RenderContentAdvanced from '../../demos/ai-chat-dialogue/15-render-content-advanced.svelte';
  import renderContentAdvancedSrc from '../../demos/ai-chat-dialogue/15-render-content-advanced.svelte?raw';
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

<Notice type="primary" title="本库补充">

示例额外传了 `messageEditRender`，让 user 消息的编辑按钮点击可用（复用 AIChatInput 编辑器）。
Semi 官方基本用法 demo 未传该 prop——未传时点击编辑，内容会直接变空白（`messageEditRender` 未传
返回 `undefined`），详见[消息编辑](#消息编辑)一节的完整说明。

</Notice>

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 消息状态

`status` 支持 `queued`、`in_progress`、`incomplete`、`completed`、`failed`、`cancelled`，对应 3 种展示样式：成功（`completed`）、请求中（`queued` / `in_progress` / `incomplete`）、失败（`failed` / `cancelled`）。

<DemoBox code={messageStatusSrc}><MessageStatus /></DemoBox>

### 消息展示

消息内容支持字符串或 `ContentItem[]`，涵盖文本、输入图片（input_image）、输入文件（input_file）、推理过程（reasoning）、工具调用（function_call）、带引用标注（annotations）的正文、以及分步展示（steps）等类型。

<DemoBox code={contentItemsSrc}><ContentItems /></DemoBox>

分步展示还可以用 Semi 官方 demo 那套写法：自定义类型（如 `plan`）+ `renderDialogueContentItem` + `AIChatDialogue.Step` 静态子组件手动接线——`renderDialogueContentItem` 命中时优先于内置 `steps` 分支，可以完全接管任意自定义类型名。

<DemoBox code={customStepTypeSrc}><CustomStepType /></DemoBox>

### 引用

通过消息的 `references` 字段定义当前消息引用的文件或文本，`showReference` 在用户消息上展示可引用图标，`onReferenceClick` 接收点击。

<DemoBox code={referencesSrc}><ReferencesDemo /></DemoBox>

助手消息的 `output_text` 若带 `annotations`，会渲染成正文上方的来源徽标，点击触发 `onAnnotationClick`（回传整组，`file_citation` / `container_file_citation` 已过滤）。同一示例还演示了 `escapeHtml`（用户消息里的 HTML 标签原样显示）与 `onMessageShare`（消息 completed 时分享按钮恒渲染，点击触发该回调）。

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

通过 `dialogueRenderConfig` 分区块自定义渲染，每个区块都是 `Snippet`，未提供则走默认渲染：

- `renderDialogueAvatar: Snippet<[RenderAvatarProps]>` —— 头像。参数：`message`、`role`、`defaultAvatar`（默认头像节点）。
- `renderDialogueTitle: Snippet<[RenderTitleProps]>` —— 标题。参数：`message`、`role`、`defaultTitle`（默认标题节点）。
- `renderDialogueContent: Snippet<[RenderContentProps]>` —— 内容区。参数：`message`、`role`、`defaultContent`（默认内容节点）、`className`（气泡/角色/错误态修饰类）。提供该回调后默认的气泡外层容器不再渲染——想保留气泡外观就把 `className` 挂在自己的容器上，不想要就完全自定义（如卡片样式）。
- `renderDialogueAction: Snippet<[RenderActionProps]>` —— 操作栏。参数：`message`、`defaultAction`（默认整块操作栏节点）、`className`（值为 `cd-ai-chat-dialogue-action`，供包一层容器时复用默认显隐样式）、`defaultActions`（按钮节点 `Snippet[]`，可按下标单独取用，如只渲染复制按钮：`{@render defaultActions[0]()}`）、`defaultActionsObj`（`{ copyNode?, likeNode?, dislikeNode?, resetNode?, moreNode? }`，按名字单独取用；当前消息不该显示的按钮对应字段为 `undefined`）。
- `renderFullDialogue: Snippet<[RenderFullDialogueProps]>` —— 整条会话框替换，优先级最高。参数：`message`、`role`、`defaultNodes`（`{ avatar, title, content, action }` 四个默认节点集合，可自由组合复用）。

<DemoBox code={renderDialogueSrc}><RenderDialogue /></DemoBox>

### 自定义渲染消息内容

通过 `renderDialogueContentItem` 按消息块类型返回渲染映射，覆盖内置的分块渲染。渲染器签名统一是 `(item: ContentItem, message: AIDialogueMessage) => Snippet`，第二个参数是该块所属的完整消息，常见用法是按 `message.role` 分支渲染不同样式；工具调用类型（`function_call` / `custom_tool_call` / `mcp_call`）支持二级映射，按 `item.name` 精确匹配；`default` 键签名是 `(text: string, message: AIDialogueMessage) => Snippet`，仅当消息内容是纯字符串、或非字符串但 `output_text` 有值时生效，命中后整条消息改由它接管，不再逐块渲染。

<DemoBox code={renderContentSrc}><RenderContent /></DemoBox>

覆盖 `reasoning` 类型时，可以把 `item` 展开传给 `AIChatDialogue.Reasoning` 静态子组件，用它的 `customRenderer` 自定义内容区渲染（仅替换折叠面板内部，不影响头部图标/标题/箭头）；`customRenderer` 收到组件的完整 props（含展开传入的额外字段，如消息数据里挂的 `annotations`）。

<DemoBox code={renderContentAdvancedSrc}><RenderContentAdvanced /></DemoBox>

### 消息数据转换

把服务端返回的数据适配成组件消息结构后传入 `chats`：`responseToMessage` / `chatCompletionToMessage` 处理非流式返回；`streamingResponseToMessage` / `streamingChatCompletionToMessage` 处理流式返回，逐 chunk 增量归约。

使用 [Chat Completion API](https://platform.openai.com/docs/api-reference/chat/create) 接口返回非流式数据时，可以通过 `chatCompletionToMessage` 函数将 Chat Completion Object 转换为 Dialogue Message 消息块格式。注意，因为 Chat Completion API 可以通过 `n` 来控制每条输入消息生成多少个结果，所以该函数的返回值为数组（如果 n > 1，需自行决定将哪条数据添加到 message 中展示）。

<DemoBox code={chatCompletionToMessageSrc}><ChatCompletionToMessage /></DemoBox>

使用 Chat Completion API 接口返回流式数据时，可以通过 `streamingChatCompletionToMessage` 函数将 Chat Completion Chunk Object List 转换为 Dialogue Message 消息块格式。

<DemoBox code={streamingChatCompletionToMessageSrc}><StreamingChatCompletionToMessage /></DemoBox>

使用 [Response API](https://platform.openai.com/docs/api-reference/responses/create) 接口返回非流式数据时，可以通过 `responseToMessage` 函数将 Response Object 转换为 Dialogue Message 消息块格式。

<DemoBox code={responseToMessageSrc}><ResponseToMessage /></DemoBox>

使用 Response API 接口返回流式数据时，可以通过 `streamingResponseToMessage` 函数将 Response Chunk Object List 转换为 Dialogue Message 消息块格式。

<DemoBox code={streamingResponseToMessageSrc}><StreamingResponseToMessage /></DemoBox>

### 消息编辑

<Notice type="primary" title="本库补充">

本库补充的示例，演示 `messageEditRender` + `onMessageEdit` 的编辑态（Semi 无对应文档章节）。点击
user 消息的编辑按钮后，组件内部会把该消息 `editing` 置为 `true` 并通过 `onChatsChange` 回写，
`messageEditRender` 用它替代内容渲染——未传该 prop 时，内容区会直接变空白（对齐 Semi
`messageEditRender?.()` 未传返回 `undefined` 的行为）。

</Notice>

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
| onMessageShare | 分享消息回调（消息 completed 时分享按钮恒渲染，与是否传入本回调无关） | `(message: Message) => void` | - |
| onReferenceClick | 引用按钮点击回调 | `(item: Reference) => void` | - |
| onSelect | 选择项变更回调 | `(selectedIds: string[]) => void` | - |
| renderActionIcon | steps 块 action 图标渲染（Semi `action.icon` 直接是 ReactNode 可塞组件实例；本库 icon 字段类型为 `unknown`，靠这层 Snippet 间接渲染） | `Snippet<[{ icon: unknown }]>` | - |
| renderDialogueContentItem | 按消息类型返回内容渲染映射 | `Record<string, Snippet<[ContentItem]>>` | - |
| renderHintBox | 自定义提示项渲染 | `Snippet<[{ content, index, onHintClick }]>` | - |
| roleConfig | 角色配置（user/assistant/system 等元数据） | `RoleConfig` | - |
| selecting | 是否开启选择模式 | boolean | false |
| showReference | 是否在文字或者文件消息中展示可被引用图标，仅对用户消息生效 | boolean | false |
| showReset | 是否展示重置操作 | boolean | true |
| style | 样式 | string | - |

### RoleConfig

`Metadata \| Map<string, Metadata>`：单一元数据或按消息 `name` 字段查表的多角色元数据（同一 role 下按不同 `name` 各配头像/名称，适合多智能体场景）。

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| assistant | 助手信息 | `Metadata \| Map<string, Metadata>` | - |
| system | 系统信息 | `Metadata \| Map<string, Metadata>` | - |
| user | 用户信息 | `Metadata \| Map<string, Metadata>` | - |

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
| editing | 是否处于编辑态（本库补充；受控，仅 user 消息生效，编辑态用 messageEditRender 替代内容） | boolean | false |
| id | 唯一标识 | `string \| number` | - |
| model | 模型名称 | string | - |
| name | 名称 | string | - |
| output_text | 助手消息的输出文本直读字段（对齐 OpenAI Response Object） | string | - |
| references | 该消息引用的文件或文本，`showReference` 开启时在 user 消息展示 | `Reference[]` | - |
| role | 角色 | string | - |
| status | 消息状态，可选值为 `queued`、`in_progress`、`incomplete`、`completed`、`failed`、`cancelled` | string | `completed` |
| updatedAt | 更新时间 | number | - |

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

### Static Properties

挂在 `AIChatDialogue` 上的静态子组件，`renderDialogueContentItem` 自定义渲染时可直接复用它们手动组装节点（如把自定义类型映射成 `<AIChatDialogue.Step steps={steps} />`）。

| 属性 | 说明 | 类型 |
| --- | --- | --- |
| Annotation | 引用来源摘要组件 | `Component`（Props：`annotation` / `description` / `maxCount` / `onClick`） |
| Reasoning | 思考过程折叠块组件 | `Component`（Props：`status` / `summary` / `content` / `markdownRenderProps` / `customRenderer`） |
| Step | 分步展示组件 | `Component`（Props：`steps` / `renderActionIcon`） |
| defaultComponents | 默认的 Markdown 渲染组件集合，包含增强版的 Code 组件（语言标识 + 复制按钮），可用于 `markdownRenderProps.components` 的二次封装 | `{ code: Component }` |

### ContentItem

`content` 为 `ContentItem[]` 时，逐块渲染以下类型（对齐 Semi OpenAI Response Input/Output Item，工具调用相关的多个具体类型本库合并为一个宽松的 `ToolCallContentItem`）：

| 类型 | type 值 | 说明 |
| --- | --- | --- |
| InputMessage | `message`（input 侧） | 用户输入消息，`content` 为字符串或 `(InputText\|InputImage\|InputFile\|InputAudio)[]` |
| ItemReference | - | 携带 `file_id` 的引用项 |
| OutputMessage | `message`（output 侧） | 助手输出消息，`content` 为 `(OutputText\|Refusal)[]` |
| Reasoning | `reasoning` | 思考过程块，`summary` / `content` 均为 `{text,type}[]` |
| StepsContentItem | `steps`（本库自有类型，对齐 Semi `AIChatDialogue.Step`） | 分步展示，`steps` 为 `DialogueStep[]` |
| ToolCallContentItem | `function_call` / `custom_tool_call` / `mcp_call` / 其余以 `_call` 结尾 | 工具调用块，含 `name` / `arguments` / `call_id`，其余字段按需透传 |
| CustomContentItem | 任意未知 type | 兜底，交由 `renderDialogueContentItem` 自定义渲染 |
