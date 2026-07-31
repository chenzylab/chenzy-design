---
title: AIChatInput AI 聊天输入框
name: aichatinput
category: ai
brief: 基于富文本编辑器的 AI 聊天输入框，支持引用、附件、建议、技能与配置区。
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';
  import Notice from '$lib/components/Notice.svelte';

  import Basic from '../../demos/ai-chat-input/01-basic.svelte';
  import basicSrc from '../../demos/ai-chat-input/01-basic.svelte?raw';
  import Generating from '../../demos/ai-chat-input/02-generating.svelte';
  import generatingSrc from '../../demos/ai-chat-input/02-generating.svelte?raw';
  import HotkeyUpload from '../../demos/ai-chat-input/03-hotkey-upload.svelte';
  import hotkeyUploadSrc from '../../demos/ai-chat-input/03-hotkey-upload.svelte?raw';
  import References from '../../demos/ai-chat-input/04-references.svelte';
  import referencesSrc from '../../demos/ai-chat-input/04-references.svelte?raw';
  import Suggestions from '../../demos/ai-chat-input/05-suggestions.svelte';
  import suggestionsSrc from '../../demos/ai-chat-input/05-suggestions.svelte?raw';
  import Skills from '../../demos/ai-chat-input/06-skills.svelte';
  import skillsSrc from '../../demos/ai-chat-input/06-skills.svelte?raw';
  import Configure from '../../demos/ai-chat-input/07-configure.svelte';
  import configureSrc from '../../demos/ai-chat-input/07-configure.svelte?raw';
  import WithDialogue from '../../demos/ai-chat-input/08-with-dialogue.svelte';
  import withDialogueSrc from '../../demos/ai-chat-input/08-with-dialogue.svelte?raw';
  import ActionArea from '../../demos/ai-chat-input/09-action-area.svelte';
  import actionAreaSrc from '../../demos/ai-chat-input/09-action-area.svelte?raw';
  import UploadButtonRound from '../../demos/ai-chat-input/10-upload-button-round.svelte';
  import uploadButtonRoundSrc from '../../demos/ai-chat-input/10-upload-button-round.svelte?raw';
  import TopSlot from '../../demos/ai-chat-input/11-top-slot.svelte';
  import topSlotSrc from '../../demos/ai-chat-input/11-top-slot.svelte?raw';
  import PlaceholderSkillOnly from '../../demos/ai-chat-input/12-placeholder-skill-only.svelte';
  import placeholderSkillOnlySrc from '../../demos/ai-chat-input/12-placeholder-skill-only.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { AIChatInput } from '@chenzy-design/svelte';
```

### 基本用法

通过 `onMessageSend` 接收发送内容，`onContentChange` 感知输入变化。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 消息发送

`sendHotKey` 设置发送快捷键（`enter` / `shift+enter`）；`generating` 为 true 时发送按钮变停止按钮，点击触发 `onStopGenerate`。

<DemoBox code={generatingSrc}><Generating /></DemoBox>

<DemoBox code={hotkeyUploadSrc}><HotkeyUpload /></DemoBox>

### 富文本输入区

AIChatInput 使用 [tiptap](https://tiptap.dev/docs/editor/getting-started/overview) 作为富文本输入框的编辑器，用户可以在输入框中输入文本，使用内置的 extensions（引用槽、选择槽、技能槽）。用户也可以通过 `extensions` 自定义扩展来扩展编辑器的功能。

<Notice type="primary" title="按需加载">

tiptap 内核体积较大，本库**全程动态 import**，不进主 bundle——只有真正渲染 AIChatInput 时才会加载。

</Notice>

### 引用

通过 `references` 传入引用列表，`renderReference` 自定义单条渲染，`onReferenceClick` / `onReferenceDelete` 接收交互。

<DemoBox code={referencesSrc}><References /></DemoBox>

### 配置区域

通过 `renderConfigureArea` 自定义底部配置区，内部放 `AIChatInputConfigureSelect` / `Button` / `RadioButton` 等；其值在发送时并入消息的 `setup` 字段，变更经 `onConfigureChange` 通知。

<DemoBox code={configureSrc}><Configure /></DemoBox>

### 操作区域

输入框右下角为操作区域，用户可以通过 `renderActionArea` 自定义操作区域，展示自定义的操作按钮。

<DemoBox code={actionAreaSrc}><ActionArea /></DemoBox>

### 自定义上传按钮与底部按钮形状

底部操作区左侧默认会渲染上传按钮。可以通过 `renderUploadButton` **仅自定义按钮 UI**（内置上传/粘贴逻辑仍由组件托管）。

通过 `round` 配置底部按钮的形状，默认是 `true`（圆角按钮），可以设置为 `false` 配置为方形按钮。

<DemoBox code={uploadButtonRoundSrc}><UploadButtonRound /></DemoBox>

### 建议

通过 `suggestions` 传入建议列表，聚焦空输入区时弹出；`renderSuggestionItem` 自定义单条渲染，`onSuggestClick` 接收选中。

<DemoBox code={suggestionsSrc}><Suggestions /></DemoBox>

### 技能及模版

通过 `skills` 传入技能列表，空输入区按 `skillHotKey`（默认 `/`）弹出面板；选中后插入技能槽节点。当前技能 `hasTemplate` 时展示模版按钮，点击弹出 `renderTemplate`。

<DemoBox code={skillsSrc}><Skills /></DemoBox>

默认情况下选中技能后 placeholder 即消失。开启 `showPlaceholderWhenSkillOnly` 后，「只选了技能、尚未输入正文」时 placeholder 仍然显示，并排在技能后方。

<DemoBox code={placeholderSkillOnlySrc}><PlaceholderSkillOnly /></DemoBox>

### 自定义渲染顶部区域

通过 `renderTopSlot` 自定义渲染顶部区域，可自行渲染引用、上传内容以及配置项。可结合 `showReference` 和 `showUploadFile` 控制是否展示内置的引用与上传文件区域。另外，可通过 `topSlotPosition` 配置自定义渲染内容相对于引用区域、上传展示区域的相对位置。

<DemoBox code={topSlotSrc}><TopSlot /></DemoBox>

### 自定义扩展

富文本区域可以自定义扩展，实现可参考 [Tiptap 自定义扩展](https://tiptap.dev/docs/editor/extensions/custom-extensions/create-new)。通过 `extensions` 可将自定义扩展添加到组件中。如果添加了自定义扩展，需要在 `transformer` 中添加对应的转换规则，以保证在 `onContentChange` 中得到的该节点数据符合预期。

```jsx
import { AIChatInput } from '@chenzy-design/svelte';
import Mention from '@tiptap/extension-mention';

const transformer = new Map([['mention', (node) => ({ type: 'mention', id: node.attrs.id })]]);

<AIChatInput extensions={[Mention]} {transformer} />;
```

### 接入对话

与 `AIChatDialogue` 组合使用，构成完整的对话界面。

<DemoBox code={withDialogueSrc}><WithDialogue /></DemoBox>

## API 参考

### AIChatInput

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| canSend | 是否可以发送，未设置时根据输入框内容、上传内容、引用内容决定 | boolean | - |
| class | 自定义类名 | string | - |
| clearContentOnGenerating | 当 generating 从 false 变为 true 时，是否清空输入框内容和附件 | boolean | true |
| defaultContent | 输入框默认内容，支持 html string 及 tiptap Content | string | `''` |
| extensions | 自定义扩展，类型同 tiptap 的 Extension | `Extension[]` | `[]` |
| generating | 是否正在生成中 | boolean | false |
| onBlur | 富文本输入框失焦的回调 | `(event: FocusEvent) => void` | - |
| onConfigureChange | 配置区域发生变化的回调 | `(value, changedValue) => void` | - |
| onContentChange | 输入框内容变化时候的回调 | `(payload) => void` | - |
| onFocus | 富文本输入框聚焦的回调 | `(event: FocusEvent) => void` | - |
| onMessageSend | 发送消息回调 | `(message: { references?, attachments?, inputContents?, setup? }) => void` | - |
| onPaste | 监听输入框粘贴事件（携带粘贴的文件，不阻止默认粘贴行为） | `(files: File[]) => void` | - |
| onReferenceClick | 引用点击回调 | `(reference) => void` | - |
| onReferenceDelete | 引用删除回调 | `(reference) => void` | - |
| onSkillChange | 技能切换回调 | `(skill) => void` | - |
| onStopGenerate | 停止生成回调 | `() => void` | - |
| onSuggestClick | 建议点击回调 | `(suggestion) => void` | - |
| onTemplateVisibleChange | 模板弹出层可见性变化回调 | `(visible: boolean) => void` | - |
| onUploadChange | 上传文件相关回调 | `(attachments) => void` | - |
| placeholder | 输入框占位符（对齐 Semi：无内置默认文案） | string | - |
| references | 输入框引用列表 | `AIChatInputReference[]` | `[]` |
| renderActionArea | 自定义底部的操作区域 | `Snippet<[{ canSend, generating }]>` | - |
| renderConfigureArea | 自定义底部的配置区域 | Snippet | - |
| renderReference | 自定义渲染引用 | `Snippet<[reference]>` | - |
| renderSkillItem | 自定义技能列表的 item 渲染 | `Snippet<[{ skill, active }]>` | - |
| renderSuggestionItem | 自定义建议列表的 item 渲染 | `Snippet<[{ suggestion, active }]>` | - |
| renderTemplate | 自定义模板渲染 | `Snippet<[{ skill, setContent }]>` | - |
| renderTopSlot | 自定义顶部 slot | `Snippet<[{ references, attachments }]>` | - |
| renderUploadButton | 自定义底部操作区上传按钮 UI（内置上传/粘贴逻辑仍由组件托管） | `Snippet<[{ openFileDialog, disabled, attachments }]>` | - |
| round | 底部的配置区域和操作区域形状是否为全圆角 | boolean | true |
| sendHotKey | 发送输入内容的键盘快捷键，支持 `enter`、`shift+enter` | string | `enter` |
| showPlaceholderWhenSkillOnly | 当仅选中技能（无其他内容）时是否显示 placeholder，开启后 placeholder 会显示在 skill 后方 | boolean | false |
| showReference | 是否展示引用区域，用于配合 renderTopSlot 使用 | boolean | true |
| showTemplateButton | 是否展示模板按钮 | boolean | true |
| showUploadButton | 是否显示上传按钮 | boolean | true |
| showUploadFile | 是否展示上传文件区域，用于配合 renderTopSlot 使用 | boolean | true |
| skillHotKey | 输入框中触发技能的热键 | string | `/` |
| skills | 技能列表 | `AIChatInputSkill[]` | `[]` |
| style | 自定义样式 | string | - |
| suggestions | 建议列表 | `AIChatInputSuggestion[]` | `[]` |
| topSlotPosition | 自定义顶部内容相对引用/上传区域的位置 | `'top' \| 'bottom'` | `top` |
| transformer | 富文本节点归一覆盖（配合自定义 extensions） | `Map<string, (node) => Content>` | - |
| uploadProps | 透传给内部 Upload 的 props | object | - |

> **与 Semi 的差异**：
>
> - `immediatelyRender` 是 tiptap 在 React SSR 下的专用开关，本库 SSR 机制不同（tiptap 全程动态 import、仅客户端实例化），无需该参数。
> - `dropdownMatchTriggerWidth` / `popoverProps`：本库建议/技能面板不经 Popover 组件承载，故不透传这两项。
