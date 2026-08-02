# SPEC · Nav

> 分类：navigation · 阶段：M3
> 对标 Semi Navigation。**实现策略**：独立公开组件，对外字段对齐 Semi（itemKey/text/icon/items），
> 内部委托本库 Menu（purpose=navigation）渲染导航体，复用其选中/展开/折叠/键盘/a11y 逻辑。

## 1. 概述
站点导航菜单：垂直（侧边）或水平（顶部），支持子导航、logo 头部、折叠收起按钮。
通常与 Layout 配合：`<Layout.Sider><Nav mode="vertical"/></Layout.Sider>` 或 `<Layout.Header><Nav mode="horizontal"/></Layout.Header>`。

## 2. 设计语义
为页面和功能提供导航。强调当前位置（选中态 aria-current=page）。侧边导航可折叠为图标轨以节省空间。

## 3. 分层实现
- **headless**：复用 Menu 既有逻辑（无独立 core）；Nav 仅管理折叠态（受控/非受控）与 Header/Footer 容器。
- **渲染**：`Nav.svelte`（根 + Menu 委托）、`NavHeader.svelte`、`NavFooter.svelte`。
- **映射**：`navItemsToMenuItems`（types.ts）把 Semi 字段递归映射为 MenuItemDef（itemKey→key、text→label、items→children、link→href）。
- **mode 映射**：horizontal→Menu horizontal；vertical 展开→Menu inline；vertical 折叠→Menu inline + inlineCollapsed。

## 4. API
### 4.1 Nav Props

> 本表由 `packages/svelte/src/nav/meta.ts` 真源生成（2026-07-30 重校）。此前本表列的 prop 多为 Semi 对齐前的旧名或已删除项（如 `value`→`activeKey`、`change`→`onChange`），改 prop 时请同步 meta.ts，勿手写「规划中」的 prop。

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| items | `NavItemInput[]` | `[]` | 导航项列表，字段对齐 Semi：itemKey/text/icon/items（含 items 即子导航）。string 项取值作 text 与 itemKey |
| mode | `'vertical'\|'horizontal'` | `'vertical'` | 导航方向：侧边/顶部 |
| selectedKeys | `NavKey[]` | `undefined` | 受控选中项 key 数组 |
| defaultSelectedKeys | `NavKey[]` | `undefined` | 默认选中项 key 数组 |
| openKeys | `NavKey[]` | `undefined` | 受控展开子导航 key（vertical 且未折叠有效） |
| defaultOpenKeys | `NavKey[]` | `undefined` | 默认展开子导航 key |
| multiple | `boolean` | `false` | 多选模式（叠加选中，配合 onDeselect） |
| isCollapsed | `boolean` | `undefined` | 受控折叠态（仅 vertical 有效） |
| defaultIsCollapsed | `boolean` | `false` | 默认折叠态（仅 vertical 有效） |
| header | `{ logo?: Snippet; text?: string }` | `undefined` | 头部配置（logo + 文案） |
| footer | `{ collapseButton?: boolean }` | `undefined` | 底部配置（收起按钮，仅 vertical） |
| limitIndent | `boolean` | `true` | 仅一级缩进；false 时逐级缩进（依赖 level+indent） |
| toggleIconPosition | `'left'\|'right'` | `'right'` | 子导航展开箭头位置 |
| expandIcon | `Snippet` | `undefined` | 自定义展开箭头图标 |
| subNavMotion | `boolean` | `true` | 子导航展开动画开关 |
| subNavOpenDelay | `number` | `0` | 浮层子导航展开延迟 ms（透传 Dropdown mouseEnterDelay） |
| subNavCloseDelay | `number` | `100` | 浮层子导航关闭延迟 ms（透传 Dropdown mouseLeaveDelay） |
| subDropdownProps | `NavDropdownProps` | `undefined` | Nav 级：透传给所有子导航浮层 Dropdown 的默认属性 |
| tooltipShowDelay | `number` | `undefined` | 折叠态 tooltip 显示延迟 ms |
| tooltipHideDelay | `number` | `undefined` | 折叠态 tooltip 隐藏延迟 ms |
| getPopupContainer | `() => HTMLElement` | `undefined` | 浮层挂载容器 |
| renderWrapper | `Snippet` | `undefined` | 自定义导航项外层包裹 |
| renderIcon | `Snippet<[NavItemDef]>` | `undefined` | 数据驱动的项图标渲染钩子（本库扩展，Semi 无）：项未自带 icon 时按 item 渲染前置图标，用于 items 大量、图标随 item 变化的场景（如站点侧边栏按组件名取图标）。项自带 icon 优先 |
| class | `string` | `undefined` | 根元素自定义类名 |
| style | `string` | `undefined` | 根元素自定义内联样式 |
| bodyStyle | `string` | `undefined` | 导航项列表容器样式（对齐 Semi bodyStyle） |

**事件**（回调 prop 形式，对齐 Semi）：

| 事件 | 说明 |
| --- | --- |
| `onSelect` | 选中导航项时触发（{itemKey,selectedKeys,selectedItems,domEvent,isOpen}） |
| `onDeselect` | 多选下取消选中时触发 |
| `onClick` | 点击任意导航项时触发（{itemKey,domEvent,isOpen}） |
| `onOpenChange` | 展开/收起子导航时触发（{itemKey,openKeys,domEvent,isOpen}） |
| `onCollapseChange` | 折叠态变化时触发 |

**子组件**：`Nav.Header`、`Nav.Footer`、`Nav.Item`、`Nav.Sub`

### 4.2 Events
| 事件 | 说明 |
| --- | --- |
| `onSelect` | 选中导航项时触发（{itemKey,selectedKeys,selectedItems,domEvent,isOpen}） |
| `onDeselect` | 多选下取消选中时触发 |
| `onClick` | 点击任意导航项时触发（{itemKey,domEvent,isOpen}） |
| `onOpenChange` | 展开/收起子导航时触发（{itemKey,openKeys,domEvent,isOpen}） |
| `onCollapseChange` | 折叠态变化时触发 |

### 4.3 Nav.Header / Nav.Footer
- **Nav.Header**：`logo?: Snippet`、`text?: string`、`class`、`style`。折叠时隐藏文案仅留 logo。
- **Nav.Footer**：`collapseButton?: boolean`（仅 vertical 生效，点击 toggle 折叠）、`class`、`style`。

### 4.4 Nav.Item / Nav.Sub（声明式写法）
JSX 式子组件，作为 Nav 的 children（与 `items` 二选一，items 优先）：
- **Nav.Item**：`{ itemKey, text, icon?, disabled?, link?, target?, rel?, onClick?, onMouseEnter?, onMouseLeave? }`。叶子导航项。
- **Nav.Sub**：`{ itemKey, text, icon?, disabled?, children }`。可展开子导航，children 内嵌 Nav.Item/Nav.Sub。

> 实现：子组件经 context 注册描述符进【普通数组】（非 $state），挂载后【异步】bump 单个 $state revision
> 触发一次 Nav 重建（见记忆 svelte5-child-register-state-array-loop，避免 effect 自循环）。

### 4.5 NavItemDef
`{ itemKey, text, icon?, disabled?, link?, target?, rel?, onClick?, onMouseEnter?, onMouseLeave?, items? }`

> 范围：全部 Semi 对齐项已实现（含 onClick/expandIcon/subNavMotion + 项级 onClick/hover）。
> 未实现（刻意舍弃，最边角）：Nav.Sub 的 `dropdownProps`/`dropdownStyle`/`maxHeight`（Menu 不支持 per-Sub 浮层配置，
> 用 Nav 级 `getPopupContainer`/`subNavOpen|CloseDelay` 替代）；Nav.Item 的 `indent`/`level`（自定义缩进用 `limitIndent`+`inlineIndent`）。

## 5. 主题 / Token
| Token | 默认 | 用途 |
|---|---|---|
| --cd-nav-bg | var(--cd-color-bg-1) | 背景 |
| --cd-nav-horizontal-height | 60px | 水平导航高 |
| --cd-nav-header-height | 60px | 头部高 |
| --cd-nav-collapse-btn-* | — | 折叠按钮配色/尺寸 |

## 6. 无障碍
- 委托 Menu purpose=navigation：渲染 `<nav>` landmark；含 link 的叶子渲染原生 `<a>`，走浏览器链接 + Tab 导航。
- 选中项 `aria-current="page"`。
- 折叠按钮：原生 `<button>` + `aria-expanded` + `aria-label`（locale Sider.expand/collapse）。

## 7. 国际化
折叠按钮 aria-label 复用 locale 包 `Sider.expand` / `Sider.collapse`。

## 8. 测试
- 单测：items→Menu 映射、受控/非受控 isCollapsed、onCollapseChange 转发、header/footer 渲染。
- a11y：nav landmark、折叠按钮 aria、axe 0 violations。
