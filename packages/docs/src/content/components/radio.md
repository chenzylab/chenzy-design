---
title: Radio 单选框
name: radio
category: input
brief: 用户使用单选框来从少量的选项集合中选择单个选项。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';
  import Notice from '$lib/components/Notice.svelte';

  import Basic from '../../demos/radio/01-basic.svelte';
  import basicSrc from '../../demos/radio/01-basic.svelte?raw';
  import Extra from '../../demos/radio/02-extra.svelte';
  import extraSrc from '../../demos/radio/02-extra.svelte?raw';
  import Disabled from '../../demos/radio/03-disabled.svelte';
  import disabledSrc from '../../demos/radio/03-disabled.svelte?raw';
  import Advanced from '../../demos/radio/04-advanced.svelte';
  import advancedSrc from '../../demos/radio/04-advanced.svelte?raw';
  import Group from '../../demos/radio/05-group.svelte';
  import groupSrc from '../../demos/radio/05-group.svelte?raw';
  import Direction from '../../demos/radio/06-direction.svelte';
  import directionSrc from '../../demos/radio/06-direction.svelte?raw';
  import ButtonStyle from '../../demos/radio/07-button.svelte';
  import buttonStyleSrc from '../../demos/radio/07-button.svelte?raw';
  import Card from '../../demos/radio/08-card.svelte';
  import cardSrc from '../../demos/radio/08-card.svelte?raw';
  import PureCard from '../../demos/radio/09-pure-card.svelte';
  import pureCardSrc from '../../demos/radio/09-pure-card.svelte?raw';
  import Options from '../../demos/radio/10-options.svelte';
  import optionsSrc from '../../demos/radio/10-options.svelte?raw';
</script>

单选框(Radio)也叫单选按钮，它允许用户在一组选项中选择其中一个。当选项很多时，单选下拉菜单（Select）可能比较适合，因为它所占用的画面空间比单选按钮来得要少。

## 代码演示

### 如何引入

```jsx
import { Radio, RadioGroup } from '@chenzy-design/svelte';
```

### 基本用法

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 带辅助文本

通过 `extra` 设置辅助文本，可以是任意类型的内容。

<DemoBox code={extraSrc}><Extra /></DemoBox>

### 禁用

Radio 不可用。

<DemoBox code={disabledSrc}><Disabled /></DemoBox>

### 高级模式

高级模式（mode='advanced'）checked 可以通过点击转换为 unchecked。

<DemoBox code={advancedSrc}><Advanced /></DemoBox>

### 单选组合

一组互斥的 Radio 配合使用。

<DemoBox code={groupSrc}><Group /></DemoBox>

### 垂直排列

可通过给 RadioGroup 设置 `direction` 属性来决定组内的 radio 元素水平排列或者垂直排列。

<DemoBox code={directionSrc}><Direction /></DemoBox>

### 按钮样式

可以利用 `type='button'` 来设置 button 样式类型的单选器，并且，button 类型单选器支持三种尺寸大小。

需要注意的是：button 类型的单选器暂不支持辅助文本（`extra`）和垂直排列（`direction='vertical'`）。

<DemoBox code={buttonStyleSrc}><ButtonStyle /></DemoBox>

### 卡片样式

可以给 `RadioGroup` 设置 `type='card'` 实现带有背景的卡片样式。

<DemoBox code={cardSrc}><Card /></DemoBox>

### 无 radio 的纯卡片样式

可以给 `RadioGroup` 设置 `type='pureCard'` 实现带有背景且无 radio 的纯卡片样式。

<DemoBox code={pureCardSrc}><PureCard /></DemoBox>

### 配置 options

通过配置 options 参数来渲染单选框。

<DemoBox code={optionsSrc}><Options /></DemoBox>

## API 参考

### Radio

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| addonClassName | 包裹内容容器的样式类名 | string | - |
| addonId | addon 节点 id，aria-labelledby 指向这个 id，若无设置会随机生成一个 id | string | - |
| addonStyle | 包裹内容容器的内联样式 | string | - |
| ariaLabel | Radio 的 label | string | - |
| autoFocus | 自动获取焦点 | boolean | false |
| checked | 指定当前是否选中 | boolean | false |
| class | 样式类名 | string | - |
| defaultChecked | 初始是否选中 | boolean | false |
| disabled | 禁选单选框 | boolean | false |
| extra | 副文本，只对 type='default' 生效 | string | - |
| extraId | 副文本的 id，aria-describedby 指向这个 id，若无设置会随机生成一个 id | string | - |
| mode | 高级和普通模式，高级模式可以在 checked 时点击变成 unchecked，可选值 advanced | string | - |
| name | Radio 组件中 `input[type="radio"]` 的 name 属性，具有相同 name 的 Radio 属于同一个 RadioGroup | string | - |
| preventScroll | 指示浏览器是否应滚动文档以显示新聚焦的元素，作用于组件内的 focus 方法 | boolean | - |
| style | 内联样式 | string | - |
| type | 设置 radio 的样式类型，可选值为：`default`、`button`、`card`、`pureCard` | string | 'default' |
| value | 根据 value 进行比较，判断是否选中 | string \| number | - |
| onChange | 选项变化时的回调函数 | `(e: RadioChangeEvent) => void` | - |
| onMouseEnter | 鼠标移入选项时的回调函数 | `(e: MouseEvent) => void` | - |
| onMouseLeave | 鼠标移出选项时的回调函数 | `(e: MouseEvent) => void` | - |

### RadioGroup

单选框组合，用于包裹一组 `Radio`。

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| ariaLabel | RadioGroup 的 label | string | - |
| buttonSize | type='button' 的 radio 尺寸，可选值为：`small`、`middle`、`large` | string | 'middle' |
| class | 样式类名 | string | - |
| defaultValue | 默认选中的值 | string \| number | - |
| direction | radio 排列方向，只对 type='default' 生效，可选值 `horizontal`、`vertical` | string | 'horizontal' |
| disabled | 禁选所有子单选器 | boolean | false |
| mode | 高级和普通模式，可以在 checked 时点击变成 unchecked，可选值 advanced | string | - |
| name | RadioGroup 下所有 `input[type="radio"]` 的 name 属性 | string | - |
| options | 以配置形式设置子元素 | Array | - |
| style | 内联样式 | string | - |
| type | 设置所有 radio 的样式类型，可选值为：`default`、`button`、`card`、`pureCard` | string | 'default' |
| value | 用于设置当前选中的值 | string \| number | - |
| onChange | 选项变化时的回调函数 | `(e: RadioChangeEvent) => void` | - |

## Methods

### Radio

| 名称 | 描述 |
| --- | --- |
| blur() | 移除焦点 |
| focus() | 获取焦点 |

## 无障碍

### ARIA

- `ariaLabel`：用于解释 Radio 或 RadioGroup 的作用。
- `aria-labelledby` 默认指向 addon 节点，用于解释 Radio 的内容。
- `aria-describedby` 默认指向 extra 节点，用于补充解释 Radio 的内容。
- 全类型（default / button / card / pureCard）均用原生 `<input type="radio">`（`mode="advanced"` 时为 `<input type="checkbox">`）；button/card 型时 input 绝对定位盖满容器承接点击与键盘。

### 键盘和焦点

参考 [WAI-ARIA Radio Group Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radiobutton/)。

- RadioGroup 可以被获取焦点，初始焦点设置：
  - 当 RadioGroup 中没有被选择项时，初始焦点为第一个 Radio 项上。
  - 当 RadioGroup 中有选中项时，初始焦点为选中的 Radio 项上。
- 在同一个 radiogroup 内：
  - 可以通过 `右箭头` 或 `下箭头` 将焦点移动到下一个 Radio 项上，同时取消先前项的选中状态并选中当前聚焦项。
  - 可以通过 `左箭头` 或 `上箭头` 将焦点移动到上一个 Radio 项上，同时取消先前项的选中状态并选中当前聚焦项。
- 若 RadioGroup 中没有选中项，可以 `Space` 键选中初始焦点。

## 文案规范

- 首字母大写。
- 不使用标点符号。
