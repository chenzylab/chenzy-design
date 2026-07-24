---
title: PinCode 验证码输入框
name: pincode
category: input
brief: 用于便捷直观地输入验证码。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/pincode/01-basic.svelte';
  import basicSrc from '../../demos/pincode/01-basic.svelte?raw';
  import Controlled from '../../demos/pincode/02-controlled.svelte';
  import controlledSrc from '../../demos/pincode/02-controlled.svelte?raw';
  import Count from '../../demos/pincode/03-count.svelte';
  import countSrc from '../../demos/pincode/03-count.svelte?raw';
  import Format from '../../demos/pincode/04-format.svelte';
  import formatSrc from '../../demos/pincode/04-format.svelte?raw';
  import Focus from '../../demos/pincode/05-focus.svelte';
  import focusSrc from '../../demos/pincode/05-focus.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { PinCode } from '@chenzy-design/svelte';
```

### 基本使用

`size` 支持 `small`、`default`、`large` 三种尺寸。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 受控

使用 `value` 传入验证码字符串，配合 `onChange` 受控使用。

<DemoBox code={controlledSrc}><Controlled /></DemoBox>

### 限制验证码格式

#### 设置位数

通过 `count` 设置位数，默认 6 位，下方 Demo 设置为 4 位。

<DemoBox code={countSrc}><Count /></DemoBox>

#### 设置字符范围

使用 `format` 控制可输入的字符范围：

- 传入 `"number"` 只允许输入数字；
- 传入 `"mixed"` 允许数字和字母；
- 传入正则表达式，只允许输入可通过正则判定的字符；
- 传入函数，验证码会在输入时以字符为单位依次作为参数单独传入校验，返回 `true` 时允许该字符被输入进 PinCode。

<DemoBox code={formatSrc}><Format /></DemoBox>

### 手动聚焦失焦

通过 `bind:this` 拿到组件实例后，命令式调用 `focus` 与 `blur`，入参为对应 Input 的序号。

<DemoBox code={focusSrc}><Focus /></DemoBox>

## API 参考

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| autoFocus | 是否自动聚焦到第一个元素 | boolean | true |
| class | 类名 | string | - |
| count | 验证码位数 | number | 6 |
| defaultValue | 输入框内容默认值 | string | - |
| disabled | 禁用 | boolean | false |
| format | 验证码单个字符格式限制 | `'number' \| 'mixed' \| RegExp \| ((char: string) => boolean)` | 'number' |
| size | 输入框大小，`large`、`default`、`small` | string | 'default' |
| style | 样式 | string | - |
| value | 输入框内容 | string | - |
| onChange | 输入回调 | `(value: string) => void` | - |
| onComplete | 验证码所有位数输入完毕回调 | `(value: string) => void` | - |

## Methods

绑定在组件实例上的方法，可通过 `bind:this` 拿到实例后调用：

| 属性 | 说明 |
| --- | --- |
| focus | 聚焦，入参为验证码第几位 |
| blur | 移出焦点，入参为验证码第几位 |
