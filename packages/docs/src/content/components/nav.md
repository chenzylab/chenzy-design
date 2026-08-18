---
title: Nav 导航
name: nav
category: navigation
brief: 为网页和应用提供导航的菜单列表，支持垂直、水平两种布局。
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/nav/01-basic.svelte';
  import basicSrc from '../../demos/nav/01-basic.svelte?raw';
  import Style from '../../demos/nav/02-style.svelte';
  import styleSrc from '../../demos/nav/02-style.svelte?raw';
  import Declarative from '../../demos/nav/03-declarative.svelte';
  import declarativeSrc from '../../demos/nav/03-declarative.svelte?raw';
  import Router from '../../demos/nav/04-router.svelte';
  import routerSrc from '../../demos/nav/04-router.svelte?raw';
  import Vertical from '../../demos/nav/05-vertical.svelte';
  import verticalSrc from '../../demos/nav/05-vertical.svelte?raw';
  import Horizontal from '../../demos/nav/06-horizontal.svelte';
  import horizontalSrc from '../../demos/nav/06-horizontal.svelte?raw';
  import MixedLayout from '../../demos/nav/11-mixed-layout.svelte';
  import mixedLayoutSrc from '../../demos/nav/11-mixed-layout.svelte?raw';
  import ToggleIcon from '../../demos/nav/07-toggle-icon.svelte';
  import toggleIconSrc from '../../demos/nav/07-toggle-icon.svelte?raw';
  import Indent from '../../demos/nav/08-indent.svelte';
  import indentSrc from '../../demos/nav/08-indent.svelte?raw';
  import Uncontrolled from '../../demos/nav/09-uncontrolled.svelte';
  import uncontrolledSrc from '../../demos/nav/09-uncontrolled.svelte?raw';
  import Controlled from '../../demos/nav/10-controlled.svelte';
  import controlledSrc from '../../demos/nav/10-controlled.svelte?raw';
  import Disabled from '../../demos/nav/12-disabled.svelte';
  import disabledSrc from '../../demos/nav/12-disabled.svelte?raw';
  import ItemsChange from '../../demos/nav/13-items-change.svelte';
  import itemsChangeSrc from '../../demos/nav/13-items-change.svelte?raw';
  import MountUnmount from '../../demos/nav/14-mount-unmount.svelte';
  import mountUnmountSrc from '../../demos/nav/14-mount-unmount.svelte?raw';
  import NumberItemKey from '../../demos/nav/15-number-item-key.svelte';
  import numberItemKeySrc from '../../demos/nav/15-number-item-key.svelte?raw';
  import AutoOpen from '../../demos/nav/16-auto-open.svelte';
  import autoOpenSrc from '../../demos/nav/16-auto-open.svelte?raw';
  import LinkNav from '../../demos/nav/17-link-nav.svelte';
  import linkNavSrc from '../../demos/nav/17-link-nav.svelte?raw';
  import PopupContainer from '../../demos/nav/18-popup-container.svelte';
  import popupContainerSrc from '../../demos/nav/18-popup-container.svelte?raw';
  import CustomExpand from '../../demos/nav/19-custom-expand.svelte';
  import customExpandSrc from '../../demos/nav/19-custom-expand.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { Nav } from '@chenzy-design/svelte';
```

### 基本使用

通过传递 `items` 参数，你能够快速得到一个导航栏。每个导航项目包括：

- `itemKey`：导航项目的唯一标识（必须）
- `text`：导航文案
- `icon`：导航图标

开发者可以通过传入 `header` 或 `footer` 快速定义导航头部和底部。对于 `footer`，额外封装了一个收起功能按钮，可通过传递 `collapseButton = true` 开启，仅在 `mode = "vertical"`（垂直导航）生效。

> 图标逐一对齐 Semi 原 demo/story 选用：文档正文示例（基本使用/导航样式定义/JSX 写法/垂直水平布局/展开箭头位置/导航缩进/非受控/受控属性）用 `@chenzy-design/icons-lab`（如 IconBadge/IconBanner/IconForm/IconTree），`_story` 场景 demo（禁用/链接/浮层容器等）用 `@chenzy-design/icons`（如 IconUser/IconStar/IconSetting）；Logo 使用 `IconSemiLogo`。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 导航样式定义

Navigation 提供了 `style` 和 `bodyStyle` 两个参数用于定义导航样式：`style` 定义导航组件最外层的样式，`bodyStyle` 定义导航列表的样式。例如中间列表可滚动、头部和底部固定的导航组件：

<DemoBox code={styleSrc}><Style /></DemoBox>

### JSX 写法

可以使用 JSX（声明式）写法定义导航头部、导航项以及导航底部。在 Nav 的 children 层级，除了 `Nav.Header`、`Nav.Item`、`Nav.Sub`、`Nav.Footer` 外，也可以置入其他自定义元素。

<DemoBox code={declarativeSrc}><Declarative /></DemoBox>

### 配合路由组件

通过 `renderWrapper` 可以自定义导航项的外层组件，从而与路由库（如 react-router）配合。

> 本库 `renderWrapper` 为 Snippet，签名为 `{ item, isSubNav, children }`，与 Semi 的函数 `({ itemElement, isSubNav, isInSubNav, props }) => ReactNode` 字段不同（`itemElement`→`children`、`props`→`item`）。

<DemoBox code={routerSrc}><Router /></DemoBox>

### 垂直与水平布局

`mode` 为 `vertical`（默认）时为侧边导航，为 `horizontal` 时为顶部导航。

#### 垂直布局

<DemoBox code={verticalSrc}><Vertical /></DemoBox>

#### 水平布局

<DemoBox code={horizontalSrc}><Horizontal /></DemoBox>

#### 水平加垂直

一般的平台设计会采取水平加垂直导航的模式，这里有一个比较常见的例子：水平 Nav 作为顶部导航，垂直 Nav 作为侧边栏，配合 `Layout`、`Dropdown`、`Avatar`、`Breadcrumb`、`Skeleton` 组合出完整页面结构。

<DemoBox code={mixedLayoutSrc}><MixedLayout /></DemoBox>

### 自定义展开箭头

通过 `expandIcon` 自定义 Nav 级默认展开箭头，单个 `Nav.Sub` 可传自己的 `expandIcon` 覆盖 Nav 级设置；
`subDropdownProps` 用于统一定制所有浮层子导航（折叠 / 水平模式）的 Dropdown 参数，如浮层间距 `spacing`。

<DemoBox code={customExpandSrc}><CustomExpand /></DemoBox>

### 展开收起箭头位置

可通过 `toggleIconPosition` 改变 Nav.Sub 展开收起箭头的位置，默认为 `'right'` 右侧展示，可改为 `'left'`。

<DemoBox code={toggleIconSrc}><ToggleIcon /></DemoBox>

### 导航缩进

默认导航缩进仅对第一级导航有效果。若希望对多级导航按层级缩进，请先将 `limitIndent` 设置为 `false`（仅竖直方向生效）；以 JSX 方式用 `Nav.Item` 传入时，需手动给 `Nav.Item` 传入 `level` prop。

<DemoBox code={indentSrc}><Indent /></DemoBox>

### 非受控属性

通过 `defaultSelectedKeys`、`defaultOpenKeys`、`defaultIsCollapsed` 设置初始状态，之后由组件内部维护。

<DemoBox code={uncontrolledSrc}><Uncontrolled /></DemoBox>

### 受控属性

通过 `selectedKeys`、`openKeys`、`isCollapsed` 配合 `onSelect`、`onOpenChange`、`onCollapseChange` 回调完全控制导航状态。

<DemoBox code={controlledSrc}><Controlled /></DemoBox>

### 自动展开父级子导航

未显式传入 `openKeys`/`defaultOpenKeys` 时，`vertical` 模式下若 `selectedKeys`/`defaultSelectedKeys` 命中了嵌套较深的子项，其所有祖先子导航会自动展开。下例默认选中「人员管理」（嵌套在「审批管理 → 运营管理」两级之下），两级子导航均自动展开。

<DemoBox code={autoOpenSrc}><AutoOpen /></DemoBox>

### 禁用导航项

`disabled` 可加在叶子项、子导航标题、子导航内的子项上，逐级独立生效；水平模式同样支持。

<DemoBox code={disabledSrc}><Disabled /></DemoBox>

### 链接导航项

`link` 传入时，叶子项整体包裹一个原生 `<a href>`，可通过 `linkOptions` 透传 `target`/`rel`/`download` 等属性。`header` 同样支持 `link`/`linkOptions`。

<DemoBox code={linkNavSrc}><LinkNav /></DemoBox>

### 浮层挂载容器

通过 `getPopupContainer` 指定折叠态 / 水平模式下子导航浮层的挂载容器，默认挂载到 `document.body`。

<DemoBox code={popupContainerSrc}><PopupContainer /></DemoBox>

### 动态更改 items

`items` 支持运行时增删；切换后 Nav 会重新计算渲染树与选中/展开状态。

<DemoBox code={itemsChangeSrc}><ItemsChange /></DemoBox>

### 挂载与卸载

Nav 可安全地反复挂载/卸载，受控状态（如 `selectedKeys`）不会因组件卸载重建而丢失或错乱。

<DemoBox code={mountUnmountSrc}><MountUnmount /></DemoBox>

### itemKey 为 number 类型

`itemKey` 类型为 `string | number`，`selectedKeys`/`openKeys` 数组元素可同为 number。

<DemoBox code={numberItemKeySrc}><NumberItemKey /></DemoBox>

## API 参考

### Nav

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| bodyStyle | 导航项列表的自定义样式 | string | - |
| class | 最外层元素的样式名 | string | - |
| defaultIsCollapsed | 默认是否处于收起状态，仅 `mode="vertical"` 时有效 | boolean | false |
| defaultOpenKeys | 初始打开的子导航 itemKey 数组 | `string[]` | [] |
| defaultSelectedKeys | 初始选中的导航项 itemKey 数组 | `string[]` | [] |
| expandIcon | 默认下拉箭头图标 | Snippet | - |
| footer | 底部区域配置对象或元素，详见 Nav.Footer | object \| Snippet | - |
| getPopupContainer | 折叠或水平模式下 Dropdown 的父级容器 | `() => HTMLElement` | - |
| header | 头部区域配置对象或元素，详见 Nav.Header | object \| Snippet | - |
| isCollapsed | 是否处于收起状态（受控），仅 `mode="vertical"` 时有效 | boolean | - |
| items | 导航项目列表，每项可继续带 items；string 数组时取每项作 text 和 itemKey | `Array<Item \| Sub \| string>` | - |
| limitIndent | 解除缩进限制，可用 level 自定义缩进；水平模式只能为 true | boolean | true |
| mode | 导航类型，可选 `vertical` 或 `horizontal` | string | `vertical` |
| openKeys | 受控的打开的子导航 itemKey 数组，配合 onOpenChange | `string[]` | - |
| renderWrapper | 自定义导航项外层组件（本库为 Snippet，签名与 Semi 不同） | Snippet | - |
| selectedKeys | 受控的导航项 itemKey 数组，配合 onSelect | `string[]` | - |
| style | 最外层元素的自定义样式 | string | - |
| subDropdownProps | 透传给所有子导航浮层 Dropdown 的默认属性 | object | - |
| subNavCloseDelay | 子导航浮层关闭延迟（ms） | number | 100 |
| subNavMotion | 子导航折叠动画 | boolean | true |
| subNavOpenDelay | 子导航浮层显示延迟（ms） | number | 0 |
| toggleIconPosition | 带子导航项的父级导航项箭头位置，可选 `left` 或 `right` | string | `right` |
| tooltipShowDelay | 折叠态 tooltip 显示延迟（ms） | number | 0 |
| tooltipHideDelay | 折叠态 tooltip 隐藏延迟（ms） | number | 100 |
| onClick | 点击任意导航项时触发 | `({ itemKey, domEvent, isOpen }) => void` | - |
| onCollapseChange | 收起状态变化时的回调 | `(isCollapsed: boolean) => void` | - |
| onOpenChange | 切换子导航显隐状态时触发 | `({ itemKey, openKeys, domEvent, isOpen }) => void` | - |
| onSelect | 选中某个可选中导航项时触发 | `({ itemKey, selectedKeys, selectedItems, domEvent, isOpen }) => void` | - |

### Nav.Item

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| disabled | 是否禁用 | boolean | false |
| icon | 导航项目图标 | Snippet | - |
| indent | icon 为空时是否保留占位（仅一级导航生效） | boolean | false |
| itemKey | 导航项目唯一 key | string | "" |
| level | 当前项所在嵌套层级（limitIndent 为 true 时用于自定义缩进） | number | - |
| link | 导航项 href 链接，传入时导航项整体包裹 a 标签 | string | - |
| linkOptions | 透传给 a 标签的参数 | object | - |
| tabIndex | 外部覆盖 tabIndex | number | 0 |
| text | 导航项目文案或元素 | string \| Snippet | "" |
| toggleIcon | 自定义 toggle 位装饰图标（非展开语义，边角能力） | Snippet | - |
| tooltipShowDelay | 折叠态 tooltip 显示延迟（ms），覆盖 Nav 级 | number | - |
| tooltipHideDelay | 折叠态 tooltip 隐藏延迟（ms），覆盖 Nav 级 | number | - |
| onClick | 点击时触发 | `({ itemKey, domEvent, isOpen }) => void` | - |
| onMouseEnter | mouse enter 时触发 | `(e) => void` | - |
| onMouseLeave | mouse leave 时触发 | `(e) => void` | - |

### Nav.Sub

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| disabled | 是否禁用 | boolean | false |
| dropdownProps | 弹出层 dropdown 参数配置 | object | - |
| dropdownStyle | 弹出层的 style | string | - |
| expandIcon | 单项自定义展开箭头（覆盖 Nav 级 expandIcon） | Snippet | - |
| icon | 导航项目图标 | Snippet | - |
| indent | icon 为空时是否保留占位（仅一级导航生效） | boolean | false |
| isOpen | 是否打开 | boolean | false |
| itemKey | 导航项目唯一 key | string | - |
| level | 当前项所在嵌套层级 | number | 0 |
| maxHeight | 最大高度 | number | 999 |
| text | 导航项目文案或组件 | string \| Snippet | "" |

### Nav.Header

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| logo | Logo | Snippet | - |
| text | Logo 文案 | string \| Snippet | - |
| link | 导航项 href 链接 | string | - |
| linkOptions | 透传给 a 标签的参数 | object | - |
| class | 最外层样式名 | string | - |
| style | 最外层样式 | string | - |

### Nav.Footer

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| collapseButton | 是否展示底部「收起侧边栏」按钮（mode="vertical" 且 children 为空才有效） | boolean \| Snippet | false |
| collapseText | 「收起」按钮的文案 | `(collapsed: boolean) => string` | - |
| class | 最外层样式名 | string | - |
| style | 最外层样式 | string | - |
| onClick | 点击事件回调 | `(event) => void` | - |

## 无障碍

- 每个可点击 item 都可被聚焦，相互间使用 `Tab` / `Shift + Tab` 切换焦点，通过 `Enter` 键激活。
- 当某个 item 可打开弹层时（hover 触发），该 item 聚焦时弹层打开；键盘用户可用下箭头将焦点移到弹层上，`Esc` 键将焦点返回到 item 上。
- 折叠态下顶层叶子项、以及折叠态下的禁用子导航标题，悬浮会显示 Tooltip 提示完整文案。

## 文案规范

- 导航栏菜单使用句子大小写格式。
- 尽量精简，避免换行。

| ✅ 推荐用法 | ❌ 不推荐用法 |
| --- | --- |
| Appeal center | Appeal Center |

## FAQ

- **为什么 items 变化时导航动画/状态看起来不对？**

  `items` 建议在组件外稳定引用（如模块级常量或 `$derived`/`useMemo` 缓存），避免每次渲染都创建新数组触发不必要的重建。

- **子导航超过 999px 高度会怎样？**

  内联展开动画依赖 `maxHeight`（默认 999），子导航实际内容高度超过该值时会被裁切；可显式传更大的 `maxHeight`（如超长列表场景，见上方"自动展开父级子导航"章节的用法）。
