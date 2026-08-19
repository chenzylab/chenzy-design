---
title: Tabs 标签页
name: tabs
category: navigation
brief: 选项卡切换组件，用于让用户在不同的视图中进行切换。
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/tabs/01-basic.svelte';
  import basicSrc from '../../demos/tabs/01-basic.svelte?raw';
  import Type from '../../demos/tabs/02-type.svelte';
  import typeSrc from '../../demos/tabs/02-type.svelte?raw';
  import ButtonType from '../../demos/tabs/03-button.svelte';
  import buttonTypeSrc from '../../demos/tabs/03-button.svelte?raw';
  import TabList from '../../demos/tabs/17-tablist.svelte';
  import tabListSrc from '../../demos/tabs/17-tablist.svelte?raw';
  import SlashTabList from '../../demos/tabs/18-slash-tablist.svelte';
  import slashTabListSrc from '../../demos/tabs/18-slash-tablist.svelte?raw';
  import Icon from '../../demos/tabs/04-icon.svelte';
  import iconSrc from '../../demos/tabs/04-icon.svelte?raw';
  import More from '../../demos/tabs/05-more.svelte';
  import moreSrc from '../../demos/tabs/05-more.svelte?raw';
  import MoreAdvanced from '../../demos/tabs/06-more-advanced.svelte';
  import moreAdvancedSrc from '../../demos/tabs/06-more-advanced.svelte?raw';
  import Vertical from '../../demos/tabs/07-vertical.svelte';
  import verticalSrc from '../../demos/tabs/07-vertical.svelte?raw';
  import Collapsible from '../../demos/tabs/08-collapsible.svelte';
  import collapsibleSrc from '../../demos/tabs/08-collapsible.svelte?raw';
  import RenderArrow from '../../demos/tabs/09-render-arrow.svelte';
  import renderArrowSrc from '../../demos/tabs/09-render-arrow.svelte?raw';
  import ArrowPosition from '../../demos/tabs/10-arrow-position.svelte';
  import arrowPositionSrc from '../../demos/tabs/10-arrow-position.svelte?raw';
  import CollapsibleAuto from '../../demos/tabs/11-collapsible-auto.svelte';
  import collapsibleAutoSrc from '../../demos/tabs/11-collapsible-auto.svelte?raw';
  import Disabled from '../../demos/tabs/12-disabled.svelte';
  import disabledSrc from '../../demos/tabs/12-disabled.svelte?raw';
  import Extra from '../../demos/tabs/13-extra.svelte';
  import extraSrc from '../../demos/tabs/13-extra.svelte?raw';
  import RenderTabBar from '../../demos/tabs/14-render-tabbar.svelte';
  import renderTabBarSrc from '../../demos/tabs/14-render-tabbar.svelte?raw';
  import DragSort from '../../demos/tabs/19-drag-sort.svelte';
  import dragSortSrc from '../../demos/tabs/19-drag-sort.svelte?raw';
  import Dynamic from '../../demos/tabs/15-dynamic.svelte';
  import dynamicSrc from '../../demos/tabs/15-dynamic.svelte?raw';
  import Closable from '../../demos/tabs/16-closable.svelte';
  import closableSrc from '../../demos/tabs/16-closable.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { Tabs, TabPane } from '@chenzy-design/svelte';
```

### 基本用法

标签栏支持四种样式的显示：线条式（line）、按钮式（button）、卡片式（card）、斜线式（slash）。默认选中第一项。标签页支持两种传入方式：

- 通过 `tabList` 传入标签页对象的数组，当使用 `tabList` 时每次只渲染当前传入的节点；
- 或使用 `<TabPane>` 逐项显式传入，默认会渲染所有面板，可以通过设置 `keepDOM={false}` 只渲染当前面板。

<DemoBox code={basicSrc}><Basic /></DemoBox>

四种类型：

<DemoBox code={typeSrc}><Type /></DemoBox>

button 类型：

<DemoBox code={buttonTypeSrc}><ButtonType /></DemoBox>

`tabList` 数据驱动方式（card 类型）：

<DemoBox code={tabListSrc}><TabList /></DemoBox>

`tabList` 数据驱动方式（slash 类型）：

<DemoBox code={slashTabListSrc}><SlashTabList /></DemoBox>

### 带图标的

有图标的标签栏。

<DemoBox code={iconSrc}><Icon /></DemoBox>

### 更多选项收入 More 展示

支持将多余 Tab 合并为「更多」下拉菜单，`more` 传入数字即可，数字表示收入下拉菜单的 Tab 数量。

<DemoBox code={moreSrc}><More /></DemoBox>

也支持高级配置，向 `more` 传入对象，内可传入 `count`（收入下拉菜单的 Tab 数量）、`render`（自定义 Trigger 渲染函数）、`dropdownProps`（透传到下拉菜单的 Dropdown Props）。

<DemoBox code={moreAdvancedSrc}><MoreAdvanced /></DemoBox>

### 垂直的标签栏

`type` 为 `line`、`card`、`button` 支持水平和垂直两种模式，`tabPosition='left|top'`，默认为 `top`。`type` 为 `slash` 仅支持水平模式，无需设置。

<DemoBox code={verticalSrc}><Vertical /></DemoBox>

### 滚动折叠

通过设置 `collapsible` 可以支持滚动折叠，目前只支持 horizontal 模式。

<DemoBox code={collapsibleSrc}><Collapsible /></DemoBox>

**自定义滚动箭头渲染**：通过 `renderArrow` 修改滚动折叠模式下左右切换箭头的渲染，入参为 `{ type, items, onClick, defaultNode }`——`type` 前/后、`items` 该端溢出的标签列表、`onClick` 默认点击行为（滚动到相邻标签）、`defaultNode` 内置默认箭头渲染（可在自定义内容基础上叠加）。

<DemoBox code={renderArrowSrc}><RenderArrow /></DemoBox>

**修改切换箭头的渲染位置**：通过 `arrowPosition` 设置切换箭头的渲染位置，可选 `start`、`end`、`both`。

<DemoBox code={arrowPositionSrc}><ArrowPosition /></DemoBox>

### 自动溢出检测

通过设置 `collapsible="auto"` 可以自动检测是否溢出，仅在溢出时折叠。

<DemoBox code={collapsibleAutoSrc}><CollapsibleAuto /></DemoBox>

### 禁用

禁用标签栏中的某一个标签页。

<DemoBox code={disabledSrc}><Disabled /></DemoBox>

### 标签栏内容扩展

通过 `tabBarExtraContent` 扩展标签栏的内容。

<DemoBox code={extraSrc}><Extra /></DemoBox>

### 标签栏二次封装

传入 `renderTabBar` 函数可对标签栏进行二次封装。

> 本库 `renderTabBar` 签名为 `Snippet<[list, activeKey, setActive]>`（传标签列表 + 激活 key + 切换回调），与 Semi 的 `(tabBarProps, DefaultTabBar) => ReactNode` 不同——本库不提供 `DefaultTabBar`，二次封装通过自绘标签栏实现。

<DemoBox code={renderTabBarSrc}><RenderTabBar /></DemoBox>

### 拖拽排序

通过 `renderTabBar` 自绘标签栏结合拖拽能力可以实现标签栏的拖拽排序。

> Semi 结合第三方库 [@dnd-kit](https://docs.dndkit.com/) 实现；本库无对应依赖，改用 `renderTabBar` + 自建的 `sortable` action（零依赖复刻 dnd-kit 的指针拖拽 + 几何位移思路：拖拽经过 activation distance 后开始，逐帧计算目标位置并对其余标签施加 transform 位移，松手时才一次性提交新顺序）。

<DemoBox code={dragSortSrc}><DragSort /></DemoBox>

### 动态更新

通过绑定事件，可以使标签栏动态更新。

<DemoBox code={dynamicSrc}><Dynamic /></DemoBox>

### 关闭

关闭标签栏中的某一个标签页。只有卡片样式的页签支持关闭选项，使用 `closable={true}` 来开启。

<DemoBox code={closableSrc}><Closable /></DemoBox>

## API 参考

### Tabs

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| activeKey | 当前激活的 tab 页的 itemKey 值 | string | - |
| arrowPosition | 折叠模式下，左右切换箭头渲染位置 | `"start" \| "end" \| "both"` | - |
| class | 类名 | string | - |
| collapsible | 折叠的 Tabs，支持 `auto` 自动判断是否溢出 | `boolean \| 'auto'` | false |
| dropdownProps | 折叠模式下透传参数到下拉菜单的 Dropdown 组件 | `{ start: DropdownProps, end: DropdownProps }` | - |
| visibleTabsStyle | 整体滚动区域 Style | string | - |
| contentStyle | 内容区域外层样式对象 | string | - |
| defaultActiveKey | 初始化选中的 tab 页的 key 值 | string | 首个标签 |
| keepDOM | 使用 TabPane 写法时是否渲染隐藏面板的 DOM 结构 | boolean | true |
| lazyRender | 懒渲染，仅当面板激活过才被渲染在 DOM 树中 | boolean | false |
| more | 将一部分 Tab 渲染到下拉菜单中 | `number \| { count, render, dropdownProps }` | - |
| renderTabBar | 用于二次封装标签栏，可配合拖拽实现标签排序 | `Snippet<[list, activeKey, setActive]>` | - |
| renderArrow | 折叠滚动模式下，自定义左右切换箭头如何渲染 | `Snippet<[{ type, items, onClick, defaultNode }]>` | - |
| preventScroll | 指示浏览器是否应滚动文档以显示新聚焦的元素 | boolean | - |
| showRestInDropdown | 是否将收起的 Tab 展示在下拉菜单中（仅 collapsible 为 true 时生效） | boolean | true |
| size | 大小，提供 `large`、`medium`、`small` | string | `large` |
| style | 样式对象 | string | - |
| tabBarExtraContent | 用于扩展标签栏的内容 | Snippet | - |
| tabList | 标签页对象组成的数组（支持 itemKey、tab、icon） | `PlainTab[]` | - |
| tabPaneMotion | 是否使用动画切换 tabs | boolean | true |
| tabPosition | tab 的位置，支持 `top`（水平）、`left`（垂直） | string | `top` |
| type | 标签栏的样式，可选 `line`、`card`、`button`、`slash` | string | `line` |
| onChange | 切换 tab 页时的回调函数 | `(activeKey: string) => void` | - |
| onTabClick | 单击事件 | `(key: string, e: Event) => void` | - |
| onTabClose | 关闭 tab 页时的回调函数 | `(tabKey: string) => void` | - |
| onVisibleTabsChange | 折叠滚动模式下，溢出项切换变化回调 | function | - |

### TabPane

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| class | 类名 | string | - |
| disabled | 标签页栏是否禁用 | boolean | - |
| icon | 标签页栏 icon | string \| Snippet | - |
| itemKey | 对应 `activeKey` | string | - |
| style | 样式对象 | string | - |
| tab | 标签页栏显示文字 | string \| Snippet | - |
| closable | 允许关闭 tab | boolean | false |

### TabItem

独立导出的标签渲染组件（对齐 Semi `Tabs.TabItem`），供 `renderTabBar` 自定义标签栏或结合第三方拖拽库（如拖拽排序示例）复用官方标签外观。

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| itemKey | 标签 key | string \| number | 必填 |
| tab | 标签文字 | string | - |
| icon | 标签前置图标 | Snippet | - |
| size | 尺寸档，与所属 Tabs 一致 | `'small' \| 'medium' \| 'large'` | 必填 |
| type | 视觉风格，与所属 Tabs 一致 | `'line' \| 'card' \| 'button' \| 'slash'` | 必填 |
| tabPosition | 标签栏位置，与所属 Tabs 一致 | `'top' \| 'left'` | 必填 |
| selected | 是否为激活态 | boolean | 必填 |
| closable | 是否显示关闭叉 | boolean | false |
| disabled | 是否禁用 | boolean | false |
| class / style | 根节点透传（供拖拽库注入 transform） | string | - |
| ref | 根节点 DOM 引用（bindable，供 dnd-kit 等库的 setNodeRef 使用） | HTMLDivElement \| null | null |
| onClick / onTabKeyDown / deleteTabItem | 事件回调；独立使用时可选，由内置 Tabs 消费时必传 | function | - |

## 无障碍

### ARIA

- 标签栏容器 `role="tablist"`，每个标签 `role="tab"`，内容面板 `role="tabpanel"`。
- `aria-orientation` 表明标签栏方向：`tabPosition="left"` 时为 `vertical`，`tabPosition="top"` 时为 `horizontal`。
- `aria-disabled`：标签禁用时对应 `true`。
- `aria-selected`：表明标签是否被选中。
- `aria-controls`：指向该标签所控制的面板。
- `aria-labelledby`：指向设置该面板标签的元素。

### 键盘和焦点

WAI-ARIA: https://www.w3.org/WAI/ARIA/apg/patterns/tabpanel/

- 标签可以被获取到焦点，但禁用的标签除外（roving tabindex：仅激活标签 `tabindex=0`，其余 `-1`）。
- 键盘用户可以使用 `Tab` 键，将焦点移动到已被选中的标签元素对应的面板上。
- 当焦点位于水平标签列表中的标签元素上时，使用 `左右箭头` 切换焦点（不改变激活态）。
- 当焦点位于垂直标签列表中的标签元素上时，使用 `上下箭头` 切换焦点（不改变激活态）。
- 当焦点位于未被激活的标签元素上时，使用 `Space` 或 `Enter` 键激活该标签。
- `Home` / `End` 跳到首个 / 末个标签（仅移动焦点，不激活）：
  - Mac 用户可用 `fn` + `左箭头` 跳到首个标签、`fn` + `右箭头` 跳到末个标签；
  - Windows 用户直接用 `Home` / `End`。
- 当标签允许被关闭（`closable`）时：
  - 聚焦标签后按 `Backspace` 或 `Delete` 键关闭该标签；
  - 关闭后焦点转移到被关闭标签的后一个标签；若被关闭的是末项，则转移到前一个标签。

## 文案规范

- 标签文字应简洁明确，反映其面板内容主题。
- 使用句子大小写书写，避免过长导致截断。

## FAQ

- **为什么在 Tabs 中使用 Typography 的省略 ellipsis 失效？**

  因为 Tabs 渲染 TabPane 时，默认会全部挂载并用 `display: none` 隐藏未激活面板，此时这些子组件无法获取到正确的宽度或高度值。建议开启 `lazyRender`，或将 `keepDOM` 设为 `false`。

- **为什么在 Tabs 中使用依赖布局测量的组件（如 Collapse/Resizable Table）时高度或宽度值不对？**

  原因同上；另外如果动画不是必需的，也可以设置 `tabPaneMotion={false}` 关闭切换动画。
