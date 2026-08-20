---
title: Collapse 折叠面板
name: collapse
category: show
brief: 可以展开或折叠展示内容区域。
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/collapse/01-basic.svelte';
  import basicSrc from '../../demos/collapse/01-basic.svelte?raw';
  import Accordion from '../../demos/collapse/02-accordion.svelte';
  import accordionSrc from '../../demos/collapse/02-accordion.svelte?raw';
  import Disabled from '../../demos/collapse/03-disabled.svelte';
  import disabledSrc from '../../demos/collapse/03-disabled.svelte?raw';
  import NoArrow from '../../demos/collapse/04-no-arrow.svelte';
  import noArrowSrc from '../../demos/collapse/04-no-arrow.svelte?raw';
  import CustomIcon from '../../demos/collapse/05-custom-icon.svelte';
  import customIconSrc from '../../demos/collapse/05-custom-icon.svelte?raw';
  import Extra from '../../demos/collapse/06-extra.svelte';
  import extraSrc from '../../demos/collapse/06-extra.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { Collapse } from '@chenzy-design/svelte';
```

### 基本用法

可以同时展开多个面板，可以通过 `defaultActiveKey` 设置默认展开的面板。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 手风琴效果

可以通过设置 `accordion` 使每次只允许展开一个面板。

<DemoBox code={accordionSrc}><Accordion /></DemoBox>

### 禁用面板

可以通过设置 `disabled` 禁用面板。

<DemoBox code={disabledSrc}><Disabled /></DemoBox>

### 隐藏面板展开/收起图标

可以通过设置 `showArrow` 隐藏面板展开/收起图标。

<DemoBox code={noArrowSrc}><NoArrow /></DemoBox>

### 自定义展开图标

可以通过 `expandIcon` 设置展开图标，`collapseIcon` 设置折叠图标。

<DemoBox code={customIconSrc}><CustomIcon /></DemoBox>

### 自定义右上角辅助区域内容

通过 `extra` 设置右上角辅助区域内容。

**仅在 header 为 string 时生效，如果 header 为自定义节点会包含 extra 所在的区域，可以自行渲染。**

<DemoBox code={extraSrc}><Extra /></DemoBox>

## API 参考

### Collapse

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| accordion | 手风琴模式 | boolean | `false` |
| activeKey | 受控属性，当前展开的面板的 key | string \| string[] | - |
| class | 样式类名 | string | - |
| clickHeaderToExpand | 点击 Header 展开收起，否则只响应点击箭头 | boolean | true |
| collapseIcon | 自定义折叠图标 | Snippet | `<IconChevronDown />` |
| defaultActiveKey | 初始化选中面板的 key | string \| string[] | - |
| expandIcon | 自定义展开图标 | Snippet | `<IconChevronUp />` |
| expandIconPosition | 展开图标位置，可选 `left`、`right` | string | `right` |
| keepDOM | 是否保留隐藏的面板 DOM 树，默认销毁 | boolean | `false` |
| motion | 是否开启动画 | boolean | `true` |
| lazyRender | 配合 keepDOM 使用，为 true 时挂载时不会渲染组件 | boolean | `false` |
| style | 内联 CSS 样式 | string | - |
| onChange | 切换面板的回调 | (activeKey: string \| string[], e: Event) => void | - |

### Collapse.Panel

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| class | 样式类名 | string | - |
| disabled | 面板是否被禁用 | boolean | false |
| extra | 自定义渲染每个面板右上角的辅助内容（仅当 header 为 string 时生效） | string \| Snippet | - |
| head | 面板头富内容插槽（对应 Semi header 传 ReactNode 的用法，优先于 header；此时 extra 不单独渲染） | Snippet | - |
| header | 面板头文本内容 | string | - |
| itemKey | 必填且唯一，选中状态匹配 `activeKey`、`defaultActiveKey` | string | - |
| onMotionEnd | 动画结束的回调 | () => void | - |
| reCalcKey | 当 reCalcKey 改变时，将重新计算子节点的高度，用于优化动态渲染时的计算 | string \| number | - |
| showArrow | 是否展示箭头 | boolean | true |
| style | 内联 CSS 样式 | string | - |

## Accessibility

### ARIA

- 面板 header 右侧按钮设置了 `aria-hidden=true`
- 面板 header 可交互部分设置了 `aria-owns` 值为对应面板内容
- 面板内容设置了 `aria-hidden`，随面板内容展现隐藏其值在 true 和 false 之间自动切换
- 面板 `aria-disabled` 与 `disabled` 属性同步，表示面板禁用

## 文案规范

折叠面板本质是卡片容器增加了收起和展开的功能，所以折叠面板的文案规范需要和卡片文案规范保持一致。

## FAQ

- ##### Collapse 内嵌表单收起后表单数据会清空？

  Collapse 收起之后，默认会销毁相应的 DOM。所以相应的 field 被卸载了，数据也被清空。可以通过给 collapse 增加 `keepDOM={true}`，保留对应的 DOM 节点。

- ##### Collapse 中 Typography 截断逻辑失效？

  如果开启了 `keepDOM` 会导致面板样式 `display: none`，此时会影响截断长度的计算。

- ##### Collapse.Header 整体作为折叠、展开的点击热区，如果在 Header 中放置了自定义元素（例如 Input），点击时候会导致 Collapse 收起/展开。如何避免？

  可以在自定义元素的 onclick 事件回调中，阻止事件冒泡至 Collapse.Header 即可。若自定义元素未提供 event 对象，再包裹一层 div，于 div onclick 中阻止冒泡亦可。

```svelte
<script lang="ts">
  import { Collapse, Input } from '@chenzy-design/svelte';
</script>

<Collapse>
  <Collapse.Panel itemKey="1">
    {#snippet head()}
      <div style="display: inline-flex;" onclick={(e) => e.stopPropagation()}>
        <span>Panel header</span>
        <Input />
      </div>
    {/snippet}
    <p>Hi, bytedance dance dance. This is the docsite of Semi UI. </p>
  </Collapse.Panel>
</Collapse>
```
