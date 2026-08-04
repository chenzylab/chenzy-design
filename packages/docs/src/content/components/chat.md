---
title: Chat 对话
name: chat
category: plus
brief: 用于普通会话、AI 会话等场景的对话组件。
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/chat/01-basic.svelte';
  import basicSrc from '../../demos/chat/01-basic.svelte?raw';
  import Status from '../../demos/chat/02-status.svelte';
  import statusSrc from '../../demos/chat/02-status.svelte?raw';
  import Dynamic from '../../demos/chat/03-dynamic.svelte';
  import dynamicSrc from '../../demos/chat/03-dynamic.svelte?raw';
  import ClearContext from '../../demos/chat/04-clear-context.svelte';
  import clearContextSrc from '../../demos/chat/04-clear-context.svelte?raw';
  import CustomRender from '../../demos/chat/05-custom-render.svelte';
  import customRenderSrc from '../../demos/chat/05-custom-render.svelte?raw';
  import FullChatBox from '../../demos/chat/06-full-chatbox.svelte';
  import fullChatBoxSrc from '../../demos/chat/06-full-chatbox.svelte?raw';
  import CustomAction from '../../demos/chat/10-custom-action.svelte';
  import customActionSrc from '../../demos/chat/10-custom-action.svelte?raw';
  import CustomInput from '../../demos/chat/07-custom-input.svelte';
  import customInputSrc from '../../demos/chat/07-custom-input.svelte?raw';
  import Hints from '../../demos/chat/08-hints.svelte';
  import hintsSrc from '../../demos/chat/08-hints.svelte?raw';
  import CustomHint from '../../demos/chat/09-custom-hint.svelte';
  import customHintSrc from '../../demos/chat/09-custom-hint.svelte?raw';
</script>

## 使用场景

Chat 组件可用于普通会话，AI 会话等场景。

对话内容渲染基于 [MarkdownRender](/components/markdownrender) 组件，可实现图片、表格、链接、加粗、代码区等常用富文本功能。

> Chat 中的 MarkdownRender 使用 `format="md"`。本库的 MarkdownRender 不支持 MDX（Svelte 无 jsx-runtime，详见该组件页说明）；需要在对话内容中渲染自定义组件时，通过 `markdownRenderProps` 透传 `components` 注册标签。

## 代码演示

### 如何引入

```jsx
import { Chat } from '@chenzy-design/svelte';
```

### 基本用法

通过设置 `chats` 和 `onChatsChange`、`onMessageSend` 实现基础对话显示和交互。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 消息状态

通过 `status` 设置消息状态，可选值为 `loading`、`incomplete`、`complete`、`error`。

<DemoBox code={statusSrc}><Status /></DemoBox>

### 动态更新数据

发送消息后先插入 loading 状态的回复，待异步内容返回后原地更新为完整内容。

<DemoBox code={dynamicSrc}><Dynamic /></DemoBox>

### 清除上下文

设置 `showClearContext` 展示清除上下文按钮，点击后在消息末尾追加一条分割线，可通过 `onClear` 感知。

<DemoBox code={clearContextSrc}><ClearContext /></DemoBox>

### 自定义渲染会话框

通过 `renderChatBoxAvatar`、`renderChatBoxTitle`、`renderChatBoxContent`、`renderChatBoxAction` 分别自定义头像、标题、内容与操作区。

<DemoBox code={customRenderSrc}><CustomRender /></DemoBox>

鼠标移动到会话上，即可显示会话操作区，通过 `renderChatBoxAction` 自定义渲染操作区。`defaultActionsObj` 提供拆分好的默认操作节点（copy / like / dislike / reset / delete），可与自定义节点（如 Dropdown 菜单）自由组合。

<DemoBox code={customActionSrc}><CustomAction /></DemoBox>

### 完全自定义会话框

通过 `renderFullChatBox` 拿到拆分好的节点（avatar / title / content / action），自由组合整条消息的布局。

<DemoBox code={fullChatBoxSrc}><FullChatBox /></DemoBox>

### 自定义渲染输入框

通过 `renderInputArea` 自定义输入区：既可包裹默认节点 `defaultNode`，也可用 `detailProps` 拆分节点自由组合。

<DemoBox code={customInputSrc}><CustomInput /></DemoBox>

### 提示信息

通过 `hints` 提供快捷提问，点击时触发 `onHintClick`。

<DemoBox code={hintsSrc}><Hints /></DemoBox>

### 自定义提示信息渲染

通过 `renderHintBox` 自定义每个提示项的渲染，可拿到 `content`、`index` 与 `onHintClick`。

<DemoBox code={customHintSrc}><CustomHint /></DemoBox>

### API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| align | 对话布局方式，支持 `leftRight`、`leftAlign` | string | `leftRight` |
| bottomSlot | 底部插槽 | Snippet | - |
| canSend | 发送按钮是否可以发送。通常无需设置，由内部逻辑决定；如有设置，以此设置为准 | boolean | - |
| chats | 受控对话列表 | `Message[]` | - |
| class | 自定义类名 | string | - |
| enableUpload | 是否启用上传。传 boolean 同时控制拖拽、点击上传按钮、粘贴上传；传对象可分别设置，未设置的项默认为 true | `boolean \| { pasteUpload: boolean, clickUpload: boolean, dragUpload: boolean }` | true |
| escapeHtml | 是否对用户消息中的 HTML 标签进行转义，防止被 Markdown 解析器当作 HTML 处理导致内容丢失 | boolean | true |
| hintCls | 提示区最外层样式类名 | string | - |
| hintStyle | 提示区最外层样式 | string | - |
| hints | 提示信息 | `string[]` | - |
| inputBoxCls | 输入框类名 | string | - |
| inputBoxStyle | 输入框样式 | string | - |
| markdownRenderProps | 透传给对话内容渲染所用的 MarkdownRender 组件，详见 [MarkdownRenderProps](/components/markdownrender#api) | object | - |
| mode | 对话模式，支持 `bubble`、`noBubble`、`userBubble` | string | `bubble` |
| onChatsChange | 对话列表变化时触发 | `(chats: Message[]) => void` | - |
| onClear | 清除上下文消息时候触发 | `() => void` | - |
| onHintClick | 点击提示信息时触发 | `(hint: string) => void` | - |
| onInputChange | 输入区域信息变化时触发 | `(props: { value: string, attachment: FileItem[] }) => void` | - |
| onMessageBadFeedback | 消息负向反馈时触发 | `(message: Message) => void` | - |
| onMessageCopy | 复制消息时触发 | `(message: Message) => void` | - |
| onMessageDelete | 删除消息时触发 | `(message: Message) => void` | - |
| onMessageGoodFeedback | 消息正向反馈时触发 | `(message: Message) => void` | - |
| onMessageReset | 重置消息时触发 | `(message: Message) => void` | - |
| onMessageSend | 发送消息时触发 | `(content: string, attachment: FileItem[]) => void` | - |
| onStopGenerator | 点击停止生成按钮时触发 | `() => void` | - |
| placeholder | 输入框占位符 | string | - |
| renderChatBoxAction | 自定义渲染操作区 | `Snippet<[RenderActionProps]>` | - |
| renderChatBoxAvatar | 自定义渲染头像 | `Snippet<[RenderAvatarProps]>` | - |
| renderChatBoxContent | 自定义渲染内容 | `Snippet<[RenderContentProps]>` | - |
| renderChatBoxTitle | 自定义渲染标题 | `Snippet<[RenderTitleProps]>` | - |
| renderDivider | 自定义渲染分割线 | `Snippet<[Message]>` | - |
| renderFullChatBox | 完全自定义渲染会话框 | `Snippet<[RenderFullChatBoxProps]>` | - |
| renderHintBox | 自定义渲染提示信息 | `Snippet<[RenderHintBoxProps]>` | - |
| renderInputArea | 自定义渲染输入框 | `Snippet<[RenderInputAreaProps]>` | - |
| roleConfig | 角色信息配置，具体见 [RoleConfig](#roleconfig) | RoleConfig | - |
| sendHotKey | 发送输入内容的键盘快捷键，支持 `enter`、`shift+enter` | string | `enter` |
| showClearContext | 是否展示清除上下文按钮 | boolean | false |
| showStopGenerate | 是否展示停止生成按钮 | boolean | false |
| style | 内联样式 | string | - |
| topSlot | 顶部插槽 | Snippet | - |
| uploadProps | 上传组件属性，详情参考 [Upload](/components/upload#api-参考) | UploadProps | - |
| uploadTipProps | 上传组件提示属性，详情参考 [Tooltip](/components/tooltip#api-参考) | TooltipProps | - |

> **与 Semi 的差异**：Semi 另有 `chatBoxRenderConfig`（把 5 个 `renderChatBox*` 收进一个对象）与 `customMarkDownComponents`。本库统一走扁平的 `renderChatBox*` snippet；自定义 Markdown 组件通过 `markdownRenderProps.components` 传入。

#### RoleConfig

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| assistant | 助手信息 | Metadata | - |
| system | 系统信息 | Metadata | - |
| user | 用户信息 | Metadata | - |

#### Metadata

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| avatar | 头像，支持图片 URL | string | - |
| color | 头像背景色，同 Avatar 组件的 color 参数 | string | `grey` |
| name | 名称 | string | - |

#### Message

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| content | 文本内容 | `string \| Content[]` | - |
| createAt | 创建时间 | number | - |
| id | 唯一标识 | `string \| number` | - |
| name | 名称 | string | - |
| parentId | 父节点 id | string | - |
| role | 角色 | string | - |
| status | 消息状态，可选值为 `loading`、`incomplete`、`complete`、`error` | string | `complete` |

#### Content

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| file_url | 当类型为 `file_url` 时的内容数据 | `{ url: string; name: string; size: string; type: string }` | - |
| image_url | 当类型为 `image_url` 时的内容数据 | `{ url: string }` | - |
| text | 当类型为 `text` 时的内容数据 | string | - |
| type | 类型，可选值 `text`、`image_url`、`file_url` | string | - |

#### Methods

| 方法 | 说明 |
| --- | --- |
| clearContext | 清除上下文 |
| resetMessage | 重置消息 |
| scrollToBottom(animation: boolean) | 滚动到最底部，animation 为 true 则有动画，反之无动画 |
| sendMessage(content: string, attachment: FileItem[]) | 发送消息 |
