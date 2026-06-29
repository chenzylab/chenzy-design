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
| 名称 | 类型 | 默认 | 说明 |
|---|---|---|---|
| items | `NavItemDef[]` | `[]` | 导航项（itemKey/text/icon/items；含 items 即子导航）|
| mode | `'vertical'\|'horizontal'` | `'vertical'` | 方向：侧边/顶部 |
| selectedKeys | `NavKey[]` | — | 受控选中项 |
| defaultSelectedKeys | `NavKey[]` | — | 默认选中项 |
| openKeys | `NavKey[]` | — | 受控展开子导航（vertical 且未折叠）|
| defaultOpenKeys | `NavKey[]` | — | 默认展开子导航 |
| isCollapsed | `boolean` | — | 受控折叠态（仅 vertical）|
| defaultIsCollapsed | `boolean` | `false` | 默认折叠态（仅 vertical）|
| header | `{ logo?: Snippet; text?: string }` | — | 头部（logo + 文案）|
| footer | `{ collapseButton?: boolean }` | — | 底部（收起按钮，仅 vertical）|
| disabled | `boolean` | `false` | 整体禁用 |
| inlineIndent | `number` | `24` | 子级缩进像素（透传 Menu）|
| limitIndent | `boolean` | `true` | 仅一级缩进；false 时逐级缩进 |
| toggleIconPosition | `'left'\|'right'` | `'right'` | 子导航展开箭头位置 |
| expandIcon | `Snippet` | — | 自定义展开箭头图标 |
| subNavMotion | `boolean` | `true` | 子导航展开动画开关 |
| subNavOpenDelay / subNavCloseDelay | `number` | — | 浮层子导航展开/关闭延迟 ms |
| getPopupContainer | `() => HTMLElement` | — | 浮层挂载容器 |
| renderWrapper | `Snippet` | — | 自定义导航项外层包裹 |
| class / style / bodyStyle / ariaLabel | `string` | — | 透传 |

### 4.2 Events
| 事件 | 载荷 | 说明 |
|---|---|---|
| onSelect | `NavKey` | 选中导航项 |
| onClick | `NavKey` | 点击任意导航项 |
| onOpenChange | `NavKey[]` | 展开/收起子导航 |
| onCollapseChange | `boolean` | 折叠态变化 |

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
