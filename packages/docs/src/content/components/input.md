---
title: Input 输入框
name: input
category: input
brief: 输入框是最基本的接收用户文本输入的组件。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';
  import Notice from '$lib/components/Notice.svelte';

  import Basic from '../../demos/input/01-basic.svelte';
  import basicSrc from '../../demos/input/01-basic.svelte?raw';
  import Size from '../../demos/input/02-size.svelte';
  import sizeSrc from '../../demos/input/02-size.svelte?raw';
  import Disabled from '../../demos/input/03-disabled.svelte';
  import disabledSrc from '../../demos/input/03-disabled.svelte?raw';
  import PrefixSuffix from '../../demos/input/04-prefix-suffix.svelte';
  import prefixSuffixSrc from '../../demos/input/04-prefix-suffix.svelte?raw';
  import Addon from '../../demos/input/05-addon.svelte';
  import addonSrc from '../../demos/input/05-addon.svelte?raw';
  import Clear from '../../demos/input/06-clear.svelte';
  import clearSrc from '../../demos/input/06-clear.svelte?raw';
  import Password from '../../demos/input/07-password.svelte';
  import passwordSrc from '../../demos/input/07-password.svelte?raw';
  import Status from '../../demos/input/08-status.svelte';
  import statusSrc from '../../demos/input/08-status.svelte?raw';
  import Controlled from '../../demos/input/09-controlled.svelte';
  import controlledSrc from '../../demos/input/09-controlled.svelte?raw';
  import Group from '../../demos/input/10-group.svelte';
  import groupSrc from '../../demos/input/10-group.svelte?raw';
  import GroupTreeSelect from '../../demos/input/11-group-treeselect.svelte';
  import groupTreeSelectSrc from '../../demos/input/11-group-treeselect.svelte?raw';
  import Textarea from '../../demos/input/12-textarea.svelte';
  import textareaSrc from '../../demos/input/12-textarea.svelte?raw';
  import TextareaHeight from '../../demos/input/13-textarea-height.svelte';
  import textareaHeightSrc from '../../demos/input/13-textarea-height.svelte?raw';
  import TextareaLineNumber from '../../demos/input/14-textarea-linenumber.svelte';
  import textareaLineNumberSrc from '../../demos/input/14-textarea-linenumber.svelte?raw';
  import TextareaShiftEnter from '../../demos/input/15-textarea-shift-enter.svelte';
  import textareaShiftEnterSrc from '../../demos/input/15-textarea-shift-enter.svelte?raw';
  import TextareaAutosize from '../../demos/input/16-textarea-autosize.svelte';
  import textareaAutosizeSrc from '../../demos/input/16-textarea-autosize.svelte?raw';
  import ValueLength from '../../demos/input/17-value-length.svelte';
  import valueLengthSrc from '../../demos/input/17-value-length.svelte?raw';
  import Composition from '../../demos/input/18-composition.svelte';
  import compositionSrc from '../../demos/input/18-composition.svelte?raw';
</script>

输入框是最基本的接收用户文本输入的组件。

## 代码演示

### 如何引入

```jsx
import { Input, TextArea, InputGroup } from '@chenzy-design/svelte';
```

### 基本

基本使用

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 三种大小

默认定义了三种尺寸：大、默认、小

<DemoBox code={sizeSrc}><Size /></DemoBox>

### 不可用

设定 `disabled` 属性为 `true`

<DemoBox code={disabledSrc}><Disabled /></DemoBox>

### 前缀/后缀

在输入框上增加前缀、后缀图标，可以是任意节点。

当 prefix、suffix 传入的内容为文本或者图标时，会自动带上左右间隔，若为自定义节点，则左右间隔为 0。

<DemoBox code={prefixSuffixSrc}><PrefixSuffix /></DemoBox>

### 前置/后置标签

在输入框上增加前置/后置标签

当 addonBefore、addonAfter 传入的内容为文本或者图标时，会自动带上左右间隔，若为自定义节点，则左右间隔为 0。

<DemoBox code={addonSrc}><Addon /></DemoBox>

### 带移除图标

点击图标删除所有内容

<DemoBox code={clearSrc}><Clear /></DemoBox>

### 密码模式

隐藏输入的具体内容

<DemoBox code={passwordSrc}><Password /></DemoBox>

### 校验状态

可设置不同校验状态，展示不同样式

<DemoBox code={statusSrc}><Status /></DemoBox>

### 受控组件

`Input` 值完全取决于传入的 `value` 值，配合 `onChange` 回调函数使用

<DemoBox code={controlledSrc}><Controlled /></DemoBox>

### 输入框组合

可以将多个输入框放入 InputGroup 的容器中，通过设置 `size`、`disabled` 可统一设置组合中的输入框属性，支持输入框类型包括：`Input`、`InputNumber`、`Select`、`AutoComplete`、`TreeSelect`、`Cascader`、`DatePicker`。

<Notice type="primary" title="注意事项">
  <div>InputGroup 不推荐插入非支持元素，Form.InputGroup 会对支持的元素进行错误聚合，而不会对自定义元素进行处理。</div>
</Notice>

<DemoBox code={groupSrc}><Group /></DemoBox>

<DemoBox code={groupTreeSelectSrc}><GroupTreeSelect /></DemoBox>

### 多行输入框

用于多行输入。通过设置 `maxCount` 属性可以进行字数限制并显示字数统计。支持 `showClear`。

<DemoBox code={textareaSrc}><Textarea /></DemoBox>

### 设置 TextArea 高度

通过 `textareaStyle` 可以设置内部 textarea 元素的样式，如高度、背景色等。

<DemoBox code={textareaHeightSrc}><TextareaHeight /></DemoBox>

### 行号

通过设置 `showLineNumber` 展示行号。可用 `lineNumberStart` 设置起始行号，或通过 `lineNumberStyle`/`lineNumberClassName` 自定义行号区样式。

<DemoBox code={textareaLineNumberSrc}><TextareaLineNumber /></DemoBox>

### 使用 Shift + Enter 换行的多行输入框

TextArea 默认情况下 Enter 回车与 Shift + Enter 均可实现换行。通过设置 `disabledEnterStartNewLine`，可以禁用 Enter 换行，仅 Shift + Enter 才能换行。

<DemoBox code={textareaShiftEnterSrc}><TextareaShiftEnter /></DemoBox>

### 自动扩展的多行输入框

通过设置 `autosize` 属性可设置只有高度自动随内容增加而变化。

<DemoBox code={textareaAutosizeSrc}><TextareaAutosize /></DemoBox>

### 自定义计算字符串长度

通过设置 `getValueLength` 属性可以自定义计算字符串长度。搭配 maxLength 和 minLength 可以支持 emoji 长度按照可见长度计算。

传入 getValueLength 时，内部做了什么：

- maxLength：不直接透传 maxLength 给原生 input。如果输入长度超出最大限制，则使用上一次输入的合法长度字符。
- minLength：动态切换 minLength 的长度，emoji 按照一个长度计算。
- maxCount：使用 getValueLength 获取的值与 maxCount 进行比较。

<DemoBox code={valueLengthSrc}><ValueLength /></DemoBox>

<Notice type="primary" title="说明">
  <div>此处使用浏览器原生 <code>Intl.Segmenter</code> 按可见字符（grapheme）计数，emoji（含组合 emoji）算 1，无需引入第三方分词包。</div>
</Notice>

### 输入法模式

通过设置 `composition` 属性为 `true`，可以开启输入法模式。在该模式下，使用输入法（如中文拼音）输入时，`onChange` 不会在输入法未确认（如拼音过程中）触发，而是在输入法确认后触发一次。适用于实时搜索等场景，避免在拼音输入过程中触发不必要的请求。

Input 和 TextArea 均支持该属性。

<DemoBox code={compositionSrc}><Composition /></DemoBox>

## API 参考

### Input

> 其他属性与 html input 标签保持一致

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| addonAfter | 后置标签 | Snippet \| string | - |
| addonBefore | 前置标签 | Snippet \| string | - |
| ariaDescribedby | 关联说明 / 错误文本节点 id | string | - |
| ariaErrormessage | 设置 aria-errormessage 属性 | string | - |
| ariaLabel | 设置 aria-label 属性 | string | - |
| ariaLabelledby | 设置 aria-labelledby 属性 | string | - |
| ariaRequired | 必填语义（Form.Field required 透传），输出 aria-required | boolean | - |
| autoFocus | 挂载时自动聚焦 | boolean | false |
| borderless | 无边框模式 | boolean | false |
| class | 根容器自定义类名 | string | - |
| clearIcon | 自定义清除按钮图标，showClear 为 true 且有值时生效 | Snippet | - |
| composition | 是否开启输入法模式，开启后输入法未确认期间不触发 onChange，输入法确认后触发一次 onChange | boolean | false |
| defaultValue | 输入框内容默认值 | string | `''` |
| disabled | 是否禁用 | boolean | false |
| getValueLength | 自定义计算字符串长度（存在时接管 maxLength 校验，原生 maxlength 不下发） | `(value: string) => number` | - |
| hideSuffix | 清除按钮与后缀标签并存时隐藏后缀标签，默认两者并列 | boolean | false |
| insetLabel | 内嵌标签（渲染在输入框内左侧，与 prefix 同槽） | Snippet \| string | - |
| insetLabelId | 内嵌标签容器 id（关联 aria） | string | - |
| inputStyle | input 元素内联样式 | string | - |
| maxLength | 原生 maxlength | number | - |
| mode | 输入框的模式，可选值 `password` | string | - |
| prefix | 前缀标签 | Snippet | - |
| preventScroll | 调用 focus() 时是否阻止滚动文档以显示新聚焦的元素 | boolean | false |
| readonly | 是否只读 | boolean | false |
| showClear | 输入框有内容且 hover 或 focus 时展示清除按钮 | boolean | false |
| size | 输入框大小，`large`、`default`、`small` | string | 'default' |
| style | 根容器内联样式 | string | - |
| suffix | 后缀标签 | Snippet | - |
| type | 声明 input 类型，同原生 input 标签的 type 属性 | string | 'text' |
| validateStatus | 校验状态，可选值 `default`、`error`、`warning`、`success`，仅影响展示样式 | string | 'default' |
| value | 输入框内容（受控） | string | - |
| onBlur | 输入框失去焦点时的回调 | `(e: FocusEvent) => void` | - |
| onChange | 输入框内容变化时的回调 | `(value: string, e: Event) => void` | - |
| onClear | 点击清除按钮时的回调 | `(e: MouseEvent) => void` | - |
| onEnterPress | 按回车时回调（composition 中不触发） | `(e: KeyboardEvent) => void` | - |
| onFocus | 输入框 focus 时的回调 | `(e: FocusEvent) => void` | - |
| onInput | 原生 input 事件回调 | `(value: string, e: Event) => void` | - |
| onKeyDown | keydown 回调 | `(e: KeyboardEvent) => void` | - |
| onKeyPress | keypress 回调 | `(e: KeyboardEvent) => void` | - |
| onKeyUp | keyup 回调 | `(e: KeyboardEvent) => void` | - |
| onCompositionStart | compositionstart 回调 | `(e: CompositionEvent) => void` | - |
| onCompositionEnd | compositionend 回调 | `(e: CompositionEvent) => void` | - |
| onCompositionUpdate | compositionupdate 回调 | `(e: CompositionEvent) => void` | - |

### TextArea

> 其他属性与 html textarea 标签保持一致

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| ariaDescribedby | 关联说明 / 错误文本节点 id | string | - |
| ariaErrormessage | 设置 aria-errormessage 属性 | string | - |
| ariaLabel | 设置 aria-label 属性 | string | - |
| ariaLabelledby | 设置 aria-labelledby 属性 | string | - |
| ariaRequired | 必填语义（Form.Field required 透传） | boolean | - |
| autoFocus | 挂载时自动聚焦 | boolean | false |
| autosize | 是否随内容自适应高度，可写成对象 `{ minRows?: number, maxRows?: number }` | boolean \| object | false |
| borderless | 无边框模式 | boolean | false |
| class | 根容器自定义类名 | string | `''` |
| clearIcon | 自定义清除按钮图标 | Snippet | - |
| cols | 默认列数 | number | - |
| composition | 是否开启输入法模式，开启后输入法未确认期间不触发 onChange，确认后触发一次 | boolean | false |
| count | 自定义计数器渲染（覆盖内建），作用域 `{ count, maxCount, overLimit }` | Snippet | - |
| defaultValue | 输入框内容默认值 | string | `''` |
| disabled | 禁用状态 | boolean | false |
| disabledEnterStartNewLine | 禁用 Enter 换行（Shift + Enter 才换行） | boolean | false |
| getValueLength | 自定义计算字符串长度 | `(value: string) => number` | - |
| lineNumberClassName | 行号区域 className | string | - |
| lineNumberStart | 行号起始值 | number | 1 |
| lineNumberStyle | 行号区域样式 | string | - |
| maxCount | 设置字数限制并显示字数统计（不截断） | number | - |
| maxLength | 原生 maxlength（截断输入） | number | - |
| placeholder | 占位文本 | string | - |
| readonly | 只读 | boolean | false |
| resize | 是否允许拖拽调整尺寸及方向，可选 `none` \| `both` \| `horizontal` \| `vertical` \| `block` \| `inline`。autosize 开启时忽略；仅显式传入时生效 | string | - |
| rows | 默认行数 | number | 4 |
| showClear | 支持清除 | boolean | false |
| showCount | 显示字数统计 | boolean | false |
| showLineNumber | 是否展示行号 | boolean | false |
| style | 外层容器样式 | string | - |
| textareaStyle | textarea 元素的样式，可用于设置高度等 | string | - |
| validateStatus | 校验状态，可选 `default`、`error`、`warning`、`success` | string | 'default' |
| value | 输入框内容（受控） | string | - |
| onBlur | 输入框失去焦点时的回调 | `(e: FocusEvent) => void` | - |
| onChange | 输入框内容变化时的回调 | `(value: string, e: Event) => void` | - |
| onClear | 点击清除按钮时的回调 | `(e: MouseEvent) => void` | - |
| onEnterPress | 按下回车的回调（composition 中不触发） | `(e: KeyboardEvent) => void` | - |
| onPressEnter | onEnterPress 别名 | `(e: KeyboardEvent) => void` | - |
| onFocus | 输入框 focus 时的回调 | `(e: FocusEvent) => void` | - |
| onInput | 原生 input 事件回调 | `(value: string, e: Event) => void` | - |
| onResize | autosize 高度变化，或 resize 拖拽时触发（含 width） | `(p: { height: number, width?: number }) => void` | - |
| onKeyDown | keydown 回调 | `(e: KeyboardEvent) => void` | - |
| onKeyPress | keypress 回调 | `(e: KeyboardEvent) => void` | - |
| onKeyUp | keyup 回调 | `(e: KeyboardEvent) => void` | - |
| onCompositionStart | compositionstart 回调 | `(e: CompositionEvent) => void` | - |
| onCompositionEnd | compositionend 回调 | `(e: CompositionEvent) => void` | - |
| onCompositionUpdate | compositionupdate 回调 | `(e: CompositionEvent) => void` | - |

### InputGroup

通用属性将设置到 InputGroup 的子级元素上，例如 disabled 等。如果你在子级设置了 disabled，会覆盖掉 InputGroup 对应属性值。

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| class | 组的类名 | string | - |
| disabled | 禁用（回退透传子控件，子控件显式 disabled 优先） | boolean | - |
| label | InputGroup 的 label 属性，`{ text?, name?, required?, width? }` | object | - |
| labelPosition | label 位置，可选 `top` 或 `left` | string | 'top' |
| size | 输入框大小，`large`、`default`、`small`（回退透传子控件） | string | - |
| style | 组的样式 | string | - |
| onBlur | 输入框失去焦点时的回调 | `(e: FocusEvent) => void` | - |
| onFocus | 输入框 focus 时的回调 | `(e: FocusEvent) => void` | - |

### Methods

绑定在组件实例上的方法（Input / TextArea），可以通过实例句柄调用实现某些特殊交互。

| 名称 | 描述 |
| --- | --- |
| blur() | 移出焦点 |
| focus() | 获取焦点（尊重 preventScroll） |

## 无障碍

### ARIA

- 当 validateStatus 为 error 时，输入框的 aria-invalid 为 true。
- 在 Form 中使用时，field label 是 Input 的 aria-label。
- 密码显隐切换按钮带 `aria-label`（走 i18n 文案），可键盘聚焦。
- 清除按钮走 i18n 文案 `aria-label`，可键盘聚焦。

### 键盘和焦点

- Input / TextArea 可被获取焦点，键盘用户可以使用 Tab 及 Shift + Tab 切换焦点。
- 密码按钮可以被聚焦，聚焦后使用 Enter 或者空格键激活。
- 正确处理 IME composition，组合期间不触发 change。
