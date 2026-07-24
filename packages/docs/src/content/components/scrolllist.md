---
title: ScrollList 滚动列表
name: scrolllist
category: show
brief: 滚动列表。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/scroll-list/01-basic.svelte';
  import basicSrc from '../../demos/scroll-list/01-basic.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { ScrollList, ScrollItem } from '@chenzy-design/svelte';
```

### 基本使用

滚动列表提供了一个类似于 iOS 操作系统的滚动选择模式，同时支持滚动至指定窗口位置选择与点击选择。

<DemoBox code={basicSrc}><Basic /></DemoBox>

## API 参考

### ScrollList

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| bodyHeight | body 高度 | string \| number | - |
| class | 样式类名 | string | - |
| footer | 底部 addon | string \| Snippet | - |
| header | 头部 addon | string \| Snippet | - |
| style | 内联样式 | string | - |

### ScrollItem

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| ariaLabel | 该列的无障碍标签 | string | - |
| class | 样式类名 | string | - |
| cycled | 是否为无限循环，仅在 mode 为 `wheel` 时生效 | boolean | false |
| list | 列表内容 | ItemData[] | [] |
| mode | 模式选择 | `normal` \| `wheel` | `wheel` |
| motion | 是否开启滚动动画 | boolean | true |
| onSelect | 选中回调 | (data: ItemData) => void | - |
| selectedIndex | 选中项的索引 | number | 0 |
| style | 内联样式 | string | - |
| transform | 对选中项的变换，返回值会作为文案进行显示 | (value: any, text: string) => string | v => v |

#### ItemData

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| disabled | 该项是否被禁止选择 | boolean | - |
| text | 每一项的文案 | string | - |
| transform | 该项处于选中状态时的变换，返回值会作为文案进行显示；ScrollItem 组件如果同时传入会优先选择 ItemData 中的 transform 方法 | (value: any, text: string) => string | v => v |
| value | 每一项的值 | any | - |

## Accessibility

### ARIA

- `ScrollItem` 支持传入 `ariaLabel`，指定该列标签
- `ScrollItem` 使用 `aria-disabled` 表示该项目是否被禁用
- `ScrollItem` 使用 `aria-selected` 表示该项目是否被选中
