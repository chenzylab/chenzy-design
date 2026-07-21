---
title: Checkbox 复选框
name: checkbox
category: input
brief: 复选框允许用户选中多个选项。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';
  import Notice from '$lib/components/Notice.svelte';

  import Basic from '../../demos/checkbox/01-basic.svelte';
  import basicSrc from '../../demos/checkbox/01-basic.svelte?raw';
  import BasicChecked from '../../demos/checkbox/02-basic-checked.svelte';
  import basicCheckedSrc from '../../demos/checkbox/02-basic-checked.svelte?raw';
  import BasicExtra from '../../demos/checkbox/03-basic-extra.svelte';
  import basicExtraSrc from '../../demos/checkbox/03-basic-extra.svelte?raw';
  import Disabled from '../../demos/checkbox/04-disabled.svelte';
  import disabledSrc from '../../demos/checkbox/04-disabled.svelte?raw';
  import JsxGroup from '../../demos/checkbox/05-jsx-group.svelte';
  import jsxGroupSrc from '../../demos/checkbox/05-jsx-group.svelte?raw';
  import Options from '../../demos/checkbox/06-options.svelte';
  import optionsSrc from '../../demos/checkbox/06-options.svelte?raw';
  import Direction from '../../demos/checkbox/07-direction.svelte';
  import directionSrc from '../../demos/checkbox/07-direction.svelte?raw';
  import Controlled from '../../demos/checkbox/08-controlled.svelte';
  import controlledSrc from '../../demos/checkbox/08-controlled.svelte?raw';
  import CheckAll from '../../demos/checkbox/09-check-all.svelte';
  import checkAllSrc from '../../demos/checkbox/09-check-all.svelte?raw';
  import Card from '../../demos/checkbox/10-card.svelte';
  import cardSrc from '../../demos/checkbox/10-card.svelte?raw';
  import PureCard from '../../demos/checkbox/11-pure-card.svelte';
  import pureCardSrc from '../../demos/checkbox/11-pure-card.svelte?raw';
  import Grid from '../../demos/checkbox/12-grid.svelte';
  import gridSrc from '../../demos/checkbox/12-grid.svelte?raw';
  import ContentDemo from '../../demos/checkbox/13-content-demo.svelte';
</script>

- 勾选框可以让用户在两种相反的状态、行为或取值之间选择；
- 适用于在列表中选择单个或多个选项，开启或关闭某个选项。

## 代码演示

### 如何引入

```jsx
import { Checkbox, CheckboxGroup } from '@chenzy-design/svelte';
```

### 基本用法

Checkbox 单个使用，可以通过 `defaultChecked`、`checked` 属性控制是否勾选。当传入 `checked` 时，为受控使用。

<DemoBox code={basicSrc}><Basic /></DemoBox>

<DemoBox code={basicCheckedSrc}><BasicChecked /></DemoBox>

带辅助文本的 checkbox。通过 `extra` 传入辅助文本。辅助文本会更长一些，甚至还可能换行。

<DemoBox code={basicExtraSrc}><BasicExtra /></DemoBox>

### 禁用

通过设置 `disabled` 属性，禁用 Checkbox。

<DemoBox code={disabledSrc}><Disabled /></DemoBox>

### JSX 方式声明 Checkbox 组

通过在 CheckboxGroup 内部放置 Checkbox 元素，可以声明 Checkbox 组。使用 Checkbox 组，你可以更便捷地通过 CheckboxGroup 的 `defaultValue`、`value` 属性去控制一组 Checkbox 的选中与否，此时 Checkbox 不需要再声明 `defaultChecked`、`checked` 属性。

<DemoBox code={jsxGroupSrc}><JsxGroup /></DemoBox>

### 数组方式声明 Checkbox 组

也可以将数组通过 `options` 属性直接传入 CheckboxGroup，直接生成 Checkbox 组。

<DemoBox code={optionsSrc}><Options /></DemoBox>

### 水平排列

通过设置 `direction` 为 `horizontal` 或者 `vertical` 可以调整 CheckboxGroup 内的布局。

<DemoBox code={directionSrc}><Direction /></DemoBox>

### 受控

联动 checkbox。

<DemoBox code={controlledSrc}><Controlled /></DemoBox>

### 全选

在实现全选效果时，你可能会用到 `indeterminate` 属性。

<DemoBox code={checkAllSrc}><CheckAll /></DemoBox>

### 卡片样式

可以给 CheckboxGroup 设置 `type='card'`，实现带有背景的卡片样式。

<DemoBox code={cardSrc}><Card /></DemoBox>

### 无 checkbox 的纯卡片样式

可以给 CheckboxGroup 设置 `type='pureCard'`，实现带有背景且无 checkbox 的纯卡片样式。

<DemoBox code={pureCardSrc}><PureCard /></DemoBox>

### 配合 grid 布局

CheckboxGroup 内嵌 Checkbox 并与 Grid 组件（Row / Col）一起使用，可以实现灵活的布局。

<DemoBox code={gridSrc}><Grid /></DemoBox>

## API 参考

### Checkbox

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| addonId | addon 节点 id，aria-labelledby 指向这个 id，若无设置会随机生成一个 id | string | - |
| ariaLabel | 定义 Checkbox 的作用 | string | - |
| checked | 指定当前 Checkbox 是否选中（在 Group 中使用时无效） | boolean | false |
| defaultChecked | 初始是否选中（在 Group 中使用时无效） | boolean | false |
| disabled | 失效状态 | boolean | false |
| extra | 副文本 | Snippet \| string | - |
| extraId | 副文本的 id，aria-describedby 指向这个 id，若无设置会随机生成一个 id | string | - |
| indeterminate | 设置 indeterminate 状态，只负责样式控制 | boolean | false |
| preventScroll | 指示浏览器是否应滚动文档以显示新聚焦的元素，作用于组件内的 focus 方法 | boolean | - |
| type | 设置 checkbox 的样式类型，可选值为：`default`、`card`、`pureCard` | string | 'default' |
| value | 该 checkbox 在 CheckboxGroup 中代表的 value | string \| number | - |
| onChange | 变化时回调函数 | `(e: CheckboxEvent) => void` | - |

### CheckboxGroup

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| ariaLabel | 无可见标题时的可访问名称 | string | - |
| class | 样式类名 | string | - |
| defaultValue | 组内默认选中的选项，会与 Checkbox 的 value 值做匹配 | Array | `[]` |
| direction | 组内 checkbox 布局，可选水平 `horizontal` 或 `vertical` | string | 'vertical' |
| disabled | 整组失效 | boolean | false |
| name | CheckboxGroup 下所有 `input[type="checkbox"]` 的 name 属性 | string | - |
| options | 指定可选项 | Array | `[]` |
| style | 内联样式 | string | - |
| type | 设置所有 checkbox 的样式类型，可选值为：`default`、`card`、`pureCard` | string | 'default' |
| value | 指定选中的选项 | Array | `[]` |
| onChange | 变化时回调函数 | `(checkedValue: Array) => void` | - |

### 方法

#### Checkbox

| 名称 | 描述 |
| --- | --- |
| blur() | 移除焦点 |
| focus() | 获取焦点 |

## 无障碍

### ARIA

- Checkbox 的 role 为 `checkbox`，CheckboxGroup 的 role 为 `list`，它的直接子元素为 `listitem`。
- `ariaLabel`：单独使用 Checkbox 时，如果 children 没有文本，建议传入 `ariaLabel`，用一句话描述 Checkbox 的作用。
- `aria-labelledby` 指向 `addon` 节点，用于解释当前 Checkbox 的作用。
- `aria-describedby` 指向 `extra` 节点，用于补充解释当前 Checkbox 的作用。
- `aria-disabled` 表示当前的禁用状态，与 `disabled` 保持一致。
- `aria-checked` 表示当前的选中状态。

### 键盘和焦点

- Checkbox 可被获取焦点，键盘用户可以使用 Tab 及 Shift + Tab 切换焦点。
- 当前获取的焦点为 Checkbox 时，可以通过 Space 切换选中和未选状态。
- Checkbox 的点击区域大于框本身，包含了框后的文案；带辅助文本的 checkbox，辅助文本也包含在点击区域内。
- 禁用的 Checkbox 不可获取焦点。

## 文案规范

<ContentDemo />

- 首字母大写
- 不使用标点符号

| ✅ 推荐用法 | ❌ 不推荐用法 |
| --- | --- |
| Call | call |
| Call | Call; |
