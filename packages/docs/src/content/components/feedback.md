---
title: Feedback 反馈
name: feedback
category: feedback
brief: 用于收集用户对产品或功能的反馈。
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/feedback/01-basic.svelte';
  import basicSrc from '../../demos/feedback/01-basic.svelte?raw';
  import Text from '../../demos/feedback/02-text.svelte';
  import textSrc from '../../demos/feedback/02-text.svelte?raw';
  import RadioDemo from '../../demos/feedback/03-radio.svelte';
  import radioSrc from '../../demos/feedback/03-radio.svelte?raw';
  import CheckboxDemo from '../../demos/feedback/04-checkbox.svelte';
  import checkboxSrc from '../../demos/feedback/04-checkbox.svelte?raw';
  import Custom from '../../demos/feedback/05-custom.svelte';
  import customSrc from '../../demos/feedback/05-custom.svelte?raw';
  import ModalDemo from '../../demos/feedback/06-modal.svelte';
  import modalSrc from '../../demos/feedback/06-modal.svelte?raw';
  import Thanks from '../../demos/feedback/07-thanks.svelte';
  import thanksSrc from '../../demos/feedback/07-thanks.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { Feedback } from '@chenzy-design/svelte';
```

### 基本使用

通过 `visible` 设置是否显示。默认反馈展示内容是 emoji 形式。可通过 `onValueChange` 获取当前选择的内容。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 文字类型

设置 `type` 为 `text` 可获得多行输入框形式的 feedback，可通过 `textAreaProps` 设置多行输入框的参数。

<DemoBox code={textSrc}><Text /></DemoBox>

### 单选反馈

设置 `type` 为 `radio` 可获得单选形式的 feedback，可通过 `radioGroupProps` 设置单选的参数。

<DemoBox code={radioSrc}><RadioDemo /></DemoBox>

### 多选反馈

设置 `type` 为 `checkbox` 可获得多选形式的 feedback，可通过 `checkboxGroupProps` 设置多选的参数。

<DemoBox code={checkboxSrc}><CheckboxDemo /></DemoBox>

### 自定义反馈内容

设置 `type` 为 `custom` 可获得自定义形式的 feedback，通过 `children` 设置反馈的内容（Semi 用 `renderContent`，本库另提供 `renderContent` snippet 用于包裹默认内容）。使用自定义反馈时候，需自行控制提交按钮的禁用与否状态，用户可通过 `okButtonProps` 设置。

<DemoBox code={customSrc}><Custom /></DemoBox>

### 模态对话框形式

可通过 `mode` 设置反馈的形式，默认是 `popup`，设置为 `modal` 可获得模态对话框形式的展示。

<DemoBox code={modalSrc}><ModalDemo /></DemoBox>

### 反馈完成提示

反馈完成后，可以切换展示信息提示用户本次反馈已经完成。

<DemoBox code={thanksSrc}><Thanks /></DemoBox>

## API 参考

### FeedbackProps

除去下面参数列表所列参数外，当 `mode` 为 `modal` 时，FeedbackProps 还支持 [ModalProps](/components/modal#modal) 中的参数；
当 `mode` 为 `popup` 时，FeedbackProps 还支持 [SideSheetProps](/components/sidesheet#api-参考) 中的参数。

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| afterClose | 关闭后的回调 | `() => void` | - |
| cancelButtonProps | 设置取消按钮的参数 | [ButtonProps](/components/button#api-参考) | - |
| checkboxGroupProps | 设置多选的参数 | [CheckboxGroupProps](/components/checkbox#checkboxgroup) | - |
| children | `type` 为 custom 时的自定义反馈内容 | Snippet | - |
| class | 类名 | string | - |
| footer | 自定义底部；非空时替换默认双按钮 | `Snippet \| null` | - |
| mode | 展示模式，支持 `popup`、`modal` | string | `popup` |
| okButtonProps | 设置提交按钮的参数，比如当设置 type 为 custom、用户自定义反馈内容时，通过设置 okButtonProps 中的 disabled 设置是否禁用提交 | [ButtonProps](/components/button#api-参考) | - |
| onCancel | 取消回调，返回 Promise 时 resolve 后自动关闭 | `(e: MouseEvent) => void \| Promise<unknown>` | - |
| onOk | 点击确定回调，返回 Promise 时 resolve 后自动关闭 | `(e: MouseEvent) => void \| Promise<unknown>` | - |
| onValueChange | 在反馈内容变化时候的回调 | `(value: string \| string[] \| object) => void` | - |
| radioGroupProps | 设置单选的参数 | [RadioGroupProps](/components/radio#radiogroup) | - |
| renderContent | 自定义反馈内容展示（接收已渲染的默认内容 snippet） | `Snippet<[Snippet]>` | - |
| textAreaProps | 设置多行输入框的参数 | [TextAreaProps](/components/input#textarea) | - |
| type | 反馈内容的类型，支持 `text`、`emoji`、`radio`、`checkbox`、`custom` | string | `emoji` |
