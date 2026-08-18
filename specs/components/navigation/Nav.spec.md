# SPEC · Nav

> 分类：navigation · 阶段：M3
> 对标 Semi Navigation。**实现策略**：独立公开组件，字段/回调对齐 Semi（itemKey/text/icon/items），
> **不委托 Menu 渲染**——自成一套递归渲染 + 选中/展开/折叠状态机，文件拆分对齐 Semi
> （`index.tsx`/`Item.tsx`/`SubNav.tsx`/`Header.tsx`/`Footer.tsx`/`CollapseButton.tsx`）。

## 1. 概述
站点导航菜单：垂直（侧边）或水平（顶部），支持子导航（内联展开 / 浮层）、logo 头部、折叠收起按钮。
通常与 Layout 配合：`<Layout.Sider><Nav mode="vertical"/></Layout.Sider>` 或 `<Layout.Header><Nav mode="horizontal"/></Layout.Header>`。

## 2. 设计语义
为页面和功能提供导航。选中态靠 `-selected` class 标识背景/文字/图标色（**非 `aria-current`**，对齐 Semi 无该属性）。
侧边导航可折叠为图标轨以节省空间；折叠态顶层叶子项与禁用态子导航标题悬浮显示 Tooltip 提示文案。

## 3. 分层实现
- **headless**：无独立 core class（对齐 Semi `NavigationFoundation` 但纯函数化，非类实例）。
  `nav-foundation.ts` 承载 items 归一化（`normalizeNavItems`）、祖先 key 收集（`collectAncestorKeys`，
  受控 `selectedKeys` 变化时联动展开父级子导航）、`hasSubNav` 判定。
- **渲染**：文件拆分严格对齐 Semi（一一对应，非合并）：
  - `Nav.svelte`（对应 Semi `index.tsx`）：根容器 + 状态管理（受控/非受控选中/展开/折叠）+ `NAV_CONTEXT_KEY` 下发。
  - `Item.svelte`（对应 Semi `Item.tsx`）：声明式叶子项 `<Nav.Item>`，仅注册描述符到收集器，不直接产 DOM。
  - `SubNav.svelte`（对应 Semi `SubNav.tsx`）：声明式子导航 `<Nav.Sub>`，同上注册模式，向 children 下发新收集器。
  - `Header.svelte` / `Footer.svelte` / `CollapseButton.svelte`：一一对应 Semi 同名文件。
  - `NavItemRender.svelte`：递归渲染核心（Semi 侧此逻辑分散在 `Item.tsx`/`SubNav.tsx` 的 `render()` 方法里；
    Svelte 用统一递归组件处理内联态两种节点类型，属必要的框架差异，非合并简化）。
  - `NavSubPopup.svelte` / `NavPopupNode.svelte`：浮层子导航（对应 Semi `SubNav.tsx` 的 `wrapDropdown()` +
    `Item.tsx` 的 `Dropdown.Item` 分支），拆成独立文件承载浮层内递归，避免 `NavItemRender.svelte` 分支过重。
- **状态收集**：`context.ts` 分三个 context：
  - `NAV_CONTEXT_KEY`：渲染态与行为（选中/展开/折叠/模式/回调/浮层配置），供递归组件读取。
  - `NAV_COLLECTOR_KEY`：声明式子项收集（`Nav.Item`/`Nav.Sub` 作为 `<Nav>` children 时），普通数组树，
    init 期同步 push、挂载后异步 bump 触发一次 Nav 重建（避免 effect 自循环，见记忆
    `svelte5-child-register-state-array-loop`）。
  - `NAV_SLOT_KEY`：声明式 `<Nav.Header>`/`<Nav.Footer>` 作为 `<Nav>` children 时的单例注册（非数组）。
- **映射**：`items` 支持 `string | NavItemDef`（string 项取值同时作 `text`/`itemKey`，对齐 Semi）；
  声明式 `<Nav.Item>`/`<Nav.Sub>` 与 `items` 二选一，`items` 优先（对齐 Semi）。
- **mode 语义**：`horizontal` 恒浮层子导航；`vertical` 展开态内联子导航（`<ul>` 展开动画）；
  `vertical` 折叠态浮层子导航（图标轨 + Dropdown，对齐 Semi `isCollapsed || mode===horizontal` 判据）。

## 4. API
### 4.1 Nav Props

> 本表由 `packages/svelte/src/nav/meta.ts` 真源生成（2026-08-18 全量对齐重校）。

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
| expandIcon | `Snippet` | `undefined` | 自定义展开箭头图标（Nav 级默认，可被 Sub 级 expandIcon 覆盖） |
| subNavMotion | `boolean` | `true` | 子导航展开动画开关 |
| subNavOpenDelay | `number` | `0` | 浮层子导航展开延迟 ms（透传 Dropdown mouseEnterDelay） |
| subNavCloseDelay | `number` | `100` | 浮层子导航关闭延迟 ms（透传 Dropdown mouseLeaveDelay） |
| subDropdownProps | `NavDropdownProps` | `undefined` | Nav 级：透传给所有子导航浮层 Dropdown 的默认属性 |
| tooltipShowDelay | `number` | `0` | 折叠态 tooltip 显示延迟 ms（对齐 Semi DEFAULT_TOOLTIP_SHOW_DELAY） |
| tooltipHideDelay | `number` | `100` | 折叠态 tooltip 隐藏延迟 ms（对齐 Semi DEFAULT_TOOLTIP_HIDE_DELAY） |
| getPopupContainer | `() => HTMLElement` | `undefined` | 浮层挂载容器 |
| renderWrapper | `Snippet` | `undefined` | 自定义导航项外层包裹（payload `{item,isSubNav,isInSubNav,props,children}`，`children` 为待渲染节点 Snippet） |
| renderIcon | `Snippet<[NavItemDef]>` | `undefined` | 数据驱动的项图标渲染钩子（本库扩展，Semi 无）：项未自带 icon 时按 item 渲染前置图标，用于 items 大量、图标随 item 变化的场景（如站点侧边栏按组件名取图标）。项自带 icon 优先 |
| class | `string` | `undefined` | 根元素自定义类名 |
| style | `string` | `undefined` | 根元素自定义内联样式 |
| bodyStyle | `string` | `undefined` | 导航项列表容器样式（对齐 Semi bodyStyle） |

**刻意不迁移**：`prefixCls`（架构性舍弃，scoped 样式下改前缀=样式全丢，见记忆
`prefixcls-blocked-by-scoped-global-style-arch`）；`collapseIcon`（Semi 自身声明于 propTypes 但
`NavProps` interface 与实现均未接线，是 Semi 自己的死 prop，不迁移死能力）。

**事件**（回调 prop 形式，对齐 Semi）：

| 事件 | 说明 |
| --- | --- |
| `onSelect` | 选中导航项时触发（{itemKey,selectedKeys,selectedItems,domEvent,isOpen}） |
| `onDeselect` | 多选下取消选中时触发 |
| `onClick` | 点击任意导航项时触发（{itemKey,domEvent,isOpen}） |
| `onOpenChange` | 展开/收起子导航时触发（{itemKey,openKeys,domEvent,isOpen}） |
| `onCollapseChange` | 折叠态变化时触发 |

**子组件**：`Nav.Header`、`Nav.Footer`、`Nav.Item`、`Nav.Sub`

### 4.2 Nav.Header / Nav.Footer
- **Nav.Header**：`logo?: Snippet`、`text?: string`、`link?`、`linkOptions?`、`class`、`style`。折叠时隐藏文案仅留 logo。
- **Nav.Footer**：`collapseButton?: boolean | Snippet`（仅 vertical 生效，点击 toggle 折叠）、`collapseText?`、`class`、`style`、`onClick`。

### 4.3 Nav.Item（声明式叶子项）
| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| itemKey | `NavKey` | — | 唯一标识（必填） |
| text | `string \| Snippet` | — | 文案 |
| icon | `Snippet` | `undefined` | 前置图标 |
| disabled | `boolean` | `false` | 是否禁用 |
| indent | `boolean` | `undefined` | 保留左侧图标占位（对齐 Semi indent） |
| level | `number` | `undefined` | 嵌套层级（limitIndent=false 时自定义缩进） |
| link | `string` | `undefined` | 链接地址（渲染原生 `<a>`） |
| linkOptions | `Record<string,string>` | `undefined` | 透传给 `<a>` 的属性（target/rel/download） |
| tabIndex | `number` | `0` | 外部覆盖 tabIndex（对齐 Semi Item tabIndex） |
| toggleIcon | `Snippet` | `undefined` | 自定义 toggle 位装饰图标（对齐 Semi Item toggleIcon，非展开语义，边角能力） |
| tooltipShowDelay | `number` | `undefined` | 折叠态 tooltip 显示延迟 ms（覆盖 Nav 级） |
| tooltipHideDelay | `number` | `undefined` | 折叠态 tooltip 隐藏延迟 ms（覆盖 Nav 级） |
| onClick | `(data: NavClickData) => void` | `undefined` | 项级点击回调 |
| onMouseEnter / onMouseLeave | `(e: MouseEvent) => void` | `undefined` | 鼠标移入/移出 |

**刻意不迁移**：`forwardRef`（React ref 语义，Svelte 无需对齐）。

### 4.4 Nav.Sub（声明式子导航）
| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| itemKey | `NavKey` | — | 唯一标识（必填） |
| text | `string \| Snippet` | — | 标题文案 |
| icon | `Snippet` | `undefined` | 标题前置图标 |
| disabled | `boolean` | `false` | 是否禁用 |
| indent | `boolean` | `undefined` | 保留左侧图标占位 |
| level | `number` | `0` | 嵌套层级 |
| maxHeight | `number` | `999` | 内联展开动画最大高度 |
| isOpen | `boolean` | `undefined` | 子导航是否展开（非受控展开配合） |
| expandIcon | `Snippet` | `undefined` | 单项自定义展开箭头（覆盖 Nav 级 expandIcon） |
| dropdownProps | `NavDropdownProps` | `undefined` | 透传给该子导航浮层 Dropdown 的属性 |
| dropdownStyle | `string` | `undefined` | 透传给该子导航浮层 Dropdown 的内联样式 |
| onMouseEnter / onMouseLeave | `(e: MouseEvent) => void` | `undefined` | 标题鼠标移入/移出 |
| children | `Snippet` | `undefined` | 内嵌 Nav.Item / Nav.Sub |

**刻意不迁移**：`isCollapsed`——Semi `SubNavProps.isCollapsed` 虽声明在类型/propTypes/defaultProps，
但组件内全部实际读取的是 context 里的 `isCollapsed`（`this.context.isCollapsed`），从未消费
`this.props.isCollapsed`；是 Semi 自己的死 prop（第 371 行把 context 值而非 prop 值传给内部 NavItem）。
照抄一个不生效的 prop 会误导用户，故不迁移；折叠态由 Nav 级 `isCollapsed`/`defaultIsCollapsed` 统一控制。

### 4.5 NavItemDef（`items` 数组项，编程式）
`{ itemKey, text, icon?, disabled?, link?, linkOptions?, level?, indent?, tabIndex?, toggleIcon?,
tooltipShowDelay?, tooltipHideDelay?, onClick?, onMouseEnter?, onMouseLeave?, items?, maxHeight?,
isOpen?, expandIcon?, dropdownProps?, dropdownStyle? }`（叶子字段与子导航字段合并为一个联合结构，
由 `items` 是否存在区分两种语义，对齐 Semi `NavItemPropsWithItems | SubNavPropsWithItems` 联合）。

> 范围：Semi Item/Sub 全部功能性 prop 已实现（含 Item 级 tooltipShowDelay/tooltipHideDelay/toggleIcon/
> tabIndex、Sub 级 expandIcon）。未实现（刻意舍弃，均为边角能力，Nav 级替代方案已覆盖同等场景）：
> Nav.Sub 的 `dropdownProps`/`dropdownStyle`/`maxHeight` 的 per-Sub 差异化仍支持，但更细粒度的
> 浮层容器定制用 Nav 级 `getPopupContainer`/`subNavOpen|CloseDelay` 替代。

**已知架构限制：`icon` 未指定 size 时渲染 16px，非 Semi 的 20px**。Semi `Item.tsx renderIcon()` 用
`React.cloneElement(icon, { size: icon.props.size || 'large' })` 在组件内部给未显式指定 size 的
图标自动注入 `size='large'`（20px；toggle 箭头位注入 `'default'`=16px）。Svelte 的 `icon` prop 是
`Snippet`（不透明渲染函数），Nav 无法像 `cloneElement` 那样读取/改写其内部渲染的图标组件的 props——
`<IconAvatar />` 内部 `size` 默认值 `'default'`（16px）是它自身 `<Icon>` span 的显式声明，任何祖先
`font-size` 的 CSS 继承都无法覆盖这个显式值，只有调用处自己传 `size="large"` 才能改变。已实测确认
与 docs 站点 `font-size` 设置无关。因 Semi demo/story 源码本身也不显式传 size（自动注入对使用方
透明），本库 demo 遵循 1:1 对齐、同样不写 size，代价是折叠态等场景图标视觉比 Semi 小 4px；调用方
若要精确复现 Semi 视觉，可自行在 icon snippet 里传 `size="large"`。

## 5. 主题 / Token
Nav 直接消费 `navigation.ts` 主 token（命名镜像 Semi `navigation/variables.scss`，无中间层）。关键条目：

| Token | 默认 | 用途 |
|---|---|---|
| `--cd-color-navigation-bg-default` | `var(--cd-color-nav-bg)` | 背景 |
| `--cd-height-navigation-horizontal-header` | `60px` | 水平导航高 |
| `--cd-spacing-navigation-header-paddingtop/bottom` | `32px`/`36px` | 侧边 header 上下内边距 |
| `--cd-spacing-navigation-sub-title-marginbottom` | `0` | 子导航标题底外边距（独立于普通项 `item-marginbottom`） |
| `--cd-spacing-navigation-horizontal-item-not-last-marginright` | `var(--cd-spacing-tight)` | 顶部菜单项右外边距，仅非末位生效 |
| `--cd-width/height-navigation-header-logo` | `36px` | Logo 图片/图标尺寸约束 |

> footer 无顶部分割线：Semi `variables.scss` 里 `$width-navigation_footer_border` 定义了但从未被任何 CSS 规则实际引用（死变量），`.cd-nav-footer` 基础样式只有 padding，无 border-top；不迁移死变量对应的样式。

## 6. 物理属性 / RTL
CSS **全部使用物理属性**（`padding-left/right`、`margin-left/right`、`border-right` 等，对齐 Semi
`navigation.scss`），RTL 靠独立覆盖块镜像（对齐 Semi `navigation/rtl.scss`），非逻辑属性自动翻转：
- 容器边框：`border-right`↔`border-left` 互换。
- 图标 margin：`.cd-nav-item-icon:first-child`/`:last-child` 镜像；子导航内文字/图标缩进镜像。
- Header：logo margin、侧边 header 内边距（含折叠态）镜像。
- 顶部导航：容器内边距、header margin、非末项 margin、footer padding 镜像。

`.cd-rtl` 单一类名作用域（本库全局 RTL 约定，非 Semi 的 `.semi-rtl`/`.semi-portal-rtl` 双类名），
经 `check:rtl-scope` 闸门验证无 `:dir()`/`portal-rtl` 误用。

## 7. 无障碍
- 根为纯 `<div>`（无 `<nav>` landmark，对齐 Semi）；列表 `<ul role="menu" aria-orientation={mode}>`。
- 叶子/子导航标题均为 `role="menuitem"`；选中靠 `-selected` class（**无 `aria-current`**，对齐 Semi）。
- 含 `link` 的叶子内含原生 `<a>`；子导航标题 `aria-expanded` 反映展开态。
- 折叠态浮层子导航复用 Dropdown（`role="menu"` + `menuitem`）；折叠收起按钮为 icon-only Button +
  `aria-label`（Tooltip 提示，locale key `Navigation.expandText`/`Navigation.collapseText`，**非**
  `Sider.expand`/`Sider.collapse`）。
- 折叠态顶层叶子项、折叠态禁用子导航标题：悬浮 Tooltip 提示文案（对齐 Semi `Item.wrapTooltip`
  两个条件：`isCollapsed && !isInSubNav && !isSubNav` 与 `isCollapsed && isSubNav && disabled`）。

## 8. 国际化
折叠按钮 aria-label 复用 locale 包 `Navigation.expandText` / `Navigation.collapseText`。

## 9. 测试
- a11y：`Nav.a11y.test.ts`（nav 结构、折叠按钮 aria、axe 0 violations）、
  `Nav.props.a11y.test.ts`（受控/非受控 items/selectedKeys/openKeys/isCollapsed、声明式子组件、
  onCollapseChange 转发）。
- 待补：items→渲染树映射、多选+onDeselect、动态 items 变更边界单测。
