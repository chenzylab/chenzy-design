---
title: Switch 开关
name: switch
category: input
brief: 开关是用于切换两种互斥状态的交互形式。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';
  import Notice from '$lib/components/Notice.svelte';

  import Basic from '../../demos/switch/01-basic.svelte';
  import basicSrc from '../../demos/switch/01-basic.svelte?raw';
  import Size from '../../demos/switch/02-size.svelte';
  import sizeSrc from '../../demos/switch/02-size.svelte?raw';
  import Disabled from '../../demos/switch/03-disabled.svelte';
  import disabledSrc from '../../demos/switch/03-disabled.svelte?raw';
  import Text from '../../demos/switch/04-text.svelte';
  import textSrc from '../../demos/switch/04-text.svelte?raw';
  import TextOutside from '../../demos/switch/05-text-outside.svelte';
  import textOutsideSrc from '../../demos/switch/05-text-outside.svelte?raw';
  import Controlled from '../../demos/switch/06-controlled.svelte';
  import controlledSrc from '../../demos/switch/06-controlled.svelte?raw';
  import Loading from '../../demos/switch/07-loading.svelte';
  import loadingSrc from '../../demos/switch/07-loading.svelte?raw';
</script>

开关是用于切换两种互斥状态的交互形式。

## 代码演示

### 如何引入

```jsx
import { Switch } from '@chenzy-design/svelte';
```

### 基本

你可以通过 `onChange` 监听状态变化，通过 `defaultChecked` 或受控的 `checked` 指定选中状态。通过 `aria-label` 描述该 Switch 开关的具体作用。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 尺寸

你可以通过 `size` 指定尺寸。

<DemoBox code={sizeSrc}><Size /></DemoBox>

### 不可用

<DemoBox code={disabledSrc}><Disabled /></DemoBox>

### 带文本

可以通过 `checkedText` 与 `uncheckedText` 设置开关时的文本。注意：此项功能在最小的开关（即 size='small' 时）无效。

<DemoBox code={textSrc}><Text /></DemoBox>

相比于通过 checkedText 与 uncheckedText 设置内嵌的文本，我们更推荐将文本说明放置在 Switch 外部。

<DemoBox code={textOutsideSrc}><TextOutside /></DemoBox>

### 受控组件

组件是否选中完全取决于传入的 checked 值，配合 onChange 回调函数使用。

<DemoBox code={controlledSrc}><Controlled /></DemoBox>

### 加载中

可以通过设置 `loading` 开启加载中状态。

<DemoBox code={loadingSrc}><Loading /></DemoBox>

## API 参考

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| aria-label | 用来给当前元素加上标签描述，提升可访问性 | string | - |
| aria-labelledby | 表明某些元素的 id 是某一对象的标签，用来确定控件与标签之间的联系 | string | - |
| checked | 指示当前是否选中，配合 onChange 使用 | boolean | false |
| checkedText | 打开时展示的内容，size 为 small 时无效 | Snippet \| string | - |
| class | 类名 | string | - |
| defaultChecked | 初始是否选中 | boolean | false |
| disabled | 是否禁用 | boolean | false |
| loading | 设置加载状态 | boolean | false |
| size | 尺寸，可选值 `large`、`default`、`small` | string | 'default' |
| style | 内联样式 | string | - |
| uncheckedText | 关闭时展示的内容，size 为 small 时无效 | Snippet \| string | - |
| onChange | 变化时回调函数 | `(checked: boolean, e: Event) => void` | - |
| onMouseEnter | 鼠标移入时回调 | `(e: MouseEvent) => void` | - |
| onMouseLeave | 鼠标移出时回调 | `(e: MouseEvent) => void` | - |

## 无障碍

### ARIA

- Switch 具有 `switch` role，当 checked 为 true 时，`aria-checked` 将被自动设置为 true，反之亦然。
- 作为表单控件应该带有 Label，当你使用 Form.Switch 时会自动被带上。
- 如果你单独使用 Switch，建议使用 `aria-label` 描述当前标签作用。

### 键盘和焦点

- 键盘用户可以使用 `Tab` 及 `Shift + Tab` 切换焦点。
- 聚焦时可以通过 `Space` 键切换开启或关闭状态。

## 文案规范

- 开关描述：
  - 首字母大写，不需要标点符号。
  - 简洁明了地说明该设置的开启或关闭状态。
  - 如果需要，解释给用户开启和关闭状态所代表的情况。
