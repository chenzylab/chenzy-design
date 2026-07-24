---
title: InputNumber 数字输入框
name: inputnumber
category: input
brief: 通过鼠标或键盘，输入范围内的数值，与 Input 不同的是它带有针对数字场景的步进器操作区，配合 Parser 使用可以展示更复杂的内容格式。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';
  import Notice from '$lib/components/Notice.svelte';

  import Basic1 from '../../demos/input-number/01-basic.svelte';
  import basic1Src from '../../demos/input-number/01-basic.svelte?raw';
  import Basic2 from '../../demos/input-number/02-basic-2.svelte';
  import basic2Src from '../../demos/input-number/02-basic-2.svelte?raw';
  import InnerButtons from '../../demos/input-number/03-inner-buttons.svelte';
  import innerButtonsSrc from '../../demos/input-number/03-inner-buttons.svelte?raw';
  import HideButtons from '../../demos/input-number/04-hide-buttons.svelte';
  import hideButtonsSrc from '../../demos/input-number/04-hide-buttons.svelte?raw';
  import Size from '../../demos/input-number/05-size.svelte';
  import sizeSrc from '../../demos/input-number/05-size.svelte?raw';
  import Format from '../../demos/input-number/06-format.svelte';
  import formatSrc from '../../demos/input-number/06-format.svelte?raw';
  import PureNumber from '../../demos/input-number/07-pure-number.svelte';
  import pureNumberSrc from '../../demos/input-number/07-pure-number.svelte?raw';
  import CurrencyLocale from '../../demos/input-number/08-currency-locale.svelte';
  import currencyLocaleSrc from '../../demos/input-number/08-currency-locale.svelte?raw';
  import CurrencyDisplay from '../../demos/input-number/09-currency-display.svelte';
  import currencyDisplaySrc from '../../demos/input-number/09-currency-display.svelte?raw';
  import CurrencySymbol from '../../demos/input-number/10-currency-symbol.svelte';
  import currencySymbolSrc from '../../demos/input-number/10-currency-symbol.svelte?raw';
  import Scientific from '../../demos/input-number/11-scientific.svelte';
  import scientificSrc from '../../demos/input-number/11-scientific.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { InputNumber } from '@chenzy-design/svelte';
```

### 基本输入框

<DemoBox code={basic1Src}><Basic1 /></DemoBox>

<DemoBox code={basic2Src}><Basic2 /></DemoBox>

### 隐藏步进器

通过 `innerButtons`，你可以将右侧的步进器隐藏进内部，仅 hover 时才会显示。

<DemoBox code={innerButtonsSrc}><InnerButtons /></DemoBox>

`hideButtons` 设为 `true`，彻底隐藏步进器。

<DemoBox code={hideButtonsSrc}><HideButtons /></DemoBox>

### 尺寸

<DemoBox code={sizeSrc}><Size /></DemoBox>

### 自定义显示格式与解析方式

> `formatter` 和 `parser` 一对方法，一般需要同时设置，否则无法正确解析值。

<Notice type="primary" title="2.95.0 行为调整">

- **2.94.0 及之前**：当 InputNumber 处于**受控模式**（传入 `value`）且 `value` 为 **number** 时，首次渲染阶段输入框的展示值可能不会先经过 `formatter` 处理，组件会在 mount 后（或后续更新）再应用 `formatter/parser`，从而出现首帧展示与后续不一致的现象。
- **2.95.0 及之后**：受控模式下当 `value` 为 **number** 时，首次渲染也会应用 `formatter`（并与 `parser` 配合得到内部数值），保证首帧展示与后续一致。例如百分比场景：`value=1` 且 `formatter/parser` 使展示乘以 100 时，首帧将直接展示 `100`。

</Notice>

<DemoBox code={formatSrc}><Format /></DemoBox>

### 纯数字输入框

搭配 `formatter` 和 `onNumberChange` 可以实现纯数字输入框。

<DemoBox code={pureNumberSrc}><PureNumber /></DemoBox>

### 货币展示

通过 `currency` 开启货币展示，国际化模式下通过 `currency={true}` 开启，组件会自动根据 `localeCode` 展示对应货币种类。也可以通过手动传 `localeCode` 和 `currency` 指定展示的货币种类。

<DemoBox code={currencyLocaleSrc}><CurrencyLocale /></DemoBox>

支持 symbol、code、name 三种展示方式，通过 `currencyDisplay` 属性控制，默认以货币符号展示。`showCurrencySymbol` 设置为 `false` 隐藏货币符号/代码/名称的展示。

<DemoBox code={currencyDisplaySrc}><CurrencyDisplay /></DemoBox>

隐藏货币符号、代码或名称的展示，通过前后缀展示货币符号。

<DemoBox code={currencySymbolSrc}><CurrencySymbol /></DemoBox>

### 科学计数法显示

当数字较长时，可以通过 `scientificNotation` 属性启用科学计数法显示。失去焦点时显示科学计数法，获得焦点时显示完整数字。

<DemoBox code={scientificSrc}><Scientific /></DemoBox>

<Notice type="primary">

科学计数法仅影响显示格式，`onChange` 和 `onNumberChange` 回调中的值仍为完整数字。该功能不支持货币模式（`currency`）。

</Notice>

## API 参考

| 属性 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| autofocus | 自动获取焦点 | boolean | false | |
| class | 类名 | string | - | |
| clearIcon | 可用于自定义清除按钮，`showClear` 为 true 时有效 | Snippet | - | |
| currency | 货币种类，国际化模式下通过 `currency={true}` 开启，组件会自动根据 locale 展示对应货币种类；也可以手动传入 `localeCode` 和 `currency` 指定展示的货币种类，`currency` 的可选值有 `CNY`、`EUR`、`USD` 等 | `boolean \| string` | false | |
| currencyDisplay | 货币展示方式，可选值：symbol、code、name | string | symbol | |
| defaultValue | 默认值 | number | - | |
| disabled | 禁用 | boolean | false | |
| formatter | 指定输入框展示值的格式 | `(n: number) => string` | - | |
| hideButtons | 为 `true` 时隐藏「上/下」按钮 | boolean | false | |
| innerButtons | 为 `true` 时「上/下」按钮显示在输入框内部 | boolean | false | |
| keepFocus | 点击按钮时保持输入框聚焦 | boolean | false | |
| localeCode | 货币模式下用于指定国家地区代码，可选值有 `zh-CN`、`en-US`、`en-GB`、`ja-JP`、`ko-KR`、`ar`、`vi-VN` 等 | string | - | |
| max | 限定最大值 | number | Infinity | |
| min | 限定最小值 | number | -Infinity | |
| parser | 指定从 `formatter` 里转换回数字的方式，和 `formatter` 搭配使用 | `(s: string) => number` | - | |
| precision | 数值精度 | number | - | |
| prefix | 前缀内容 | `string \| Snippet` | - | |
| pressInterval | 长按按钮时，多久触发一次点击事件，单位毫秒 | number | 250 | |
| pressTimeout | 长按按钮时，延迟多久后触发点击事件，单位毫秒 | number | 250 | |
| preventScroll | 指示浏览器是否应滚动文档以显示新聚焦的元素，作用于组件内的 focus 方法 | boolean | false | |
| readonly | 只读 | boolean | false | |
| scientificNotation | 启用科学计数法显示，失去焦点时显示科学计数法，获得焦点时显示完整数字。可传入对象配置阈值 `threshold`，默认为 15 位有效数字。不支持货币模式 | `boolean \| { threshold?: number }` | false | |
| shiftStep | 按住 shift 键每次改变步数，可以为小数 | number | 10 | |
| showClear | 是否显示清除按钮 | boolean | false | |
| showCurrencySymbol | 是否显示货币符号/代码/名称，仅货币模式下生效 | boolean | true | |
| size | 输入框大小，可选值：`default`、`small`、`large` | string | default | |
| step | 每次改变步数，可以为小数 | number | 1 | |
| style | 样式 | string | - | |
| suffix | 自定义后缀 | `string \| Snippet` | - | |
| value | 当前值 | number | - | |
| onBlur | 失去焦点时的回调 | `(e: FocusEvent) => void` | - | |
| onChange | 变化回调 | `(value: number \| string \| null, e?: Event) => void` | - | |
| onDownClick | 点击「-」按钮回调 | `(value: number \| null, e: MouseEvent) => void` | - | |
| onFocus | 获得焦点时的回调 | `(e: FocusEvent) => void` | - | |
| onNumberChange | 数字变化回调 | `(value: number \| null, e?: Event) => void` | - | |
| onUpClick | 点击「+」按钮回调 | `(value: number \| null, e: MouseEvent) => void` | - | |

## Methods

绑定在组件实例上的方法，可以通过 `bind:this` 拿到实例后调用：

| 名称 | 描述 |
| --- | --- |
| blur() | 移出焦点 |
| focus() | 获取焦点 |

## Accessibility

参考标准：[WAI-ARIA Spinbutton](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/)

### ARIA

- 数字输入框具有 `spinbutton` role。
- spinbutton 使用 `aria-valuenow` 表示当前值，`aria-valuemax` 表示可以接受的最大值，`aria-valuemin` 表示可以接受的最小值。
- 当 InputNumber 在 Form 中使用时，输入框的 `aria-labelledby` 指向 Field label。

### 键盘和焦点

- InputNumber 可被获取焦点，键盘用户可以使用 Tab 及 Shift + Tab 切换焦点（增加/减少按钮不可以被键盘聚焦）。
- 键盘用户可以按上键 ⬆️ 或下键 ⬇️，输入值将增加或减少 `step`（默认值为 1）。
- 按住 Shift + 上键 ⬆️ 或下键 ⬇️，输入值将增加或减少 `shiftStep`（默认值为 10）。
