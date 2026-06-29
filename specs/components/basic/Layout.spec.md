# SPEC · Layout
> 分类：basic · 阶段：M1
> 对标 Semi：Layout

## 1. 概述

Layout 是页面级骨架容器，用于快速搭建「页头 / 侧边栏 / 主体 / 页脚」的标准后台布局。它由 5 个协作组件构成：

- `Layout`（根容器，承载整体方向与背景）
- `Layout.Header`（页头，通常固定高度，可吸顶 sticky）
- `Layout.Sider`（侧边栏，可折叠 collapsible，支持响应式断点自动收起）
- `Layout.Content`（主体内容区，自动撑满剩余空间）
- `Layout.Footer`（页脚）

核心解决两个排版问题：

1. **方向自动推断**：`Layout` 默认 `flex-direction: column`；当其直接子节点中存在 `Layout.Sider` 时，自动切换为 `row`，无需用户手动指定 `hasSider`（同时保留 `hasSider` 显式逃生口以规避 SSR 首帧无法读取 slot 内容的问题）。
2. **侧边栏折叠**：`Sider` 提供受控/非受控折叠、宽度过渡动画、断点响应、自定义触发器。

非目标：不负责导航逻辑（交给 `Nav`/`Menu`）、不负责栅格（交给 `Grid`/`Row`/`Col`）、不负责响应式断点之外的复杂自适应。

典型场景：管理后台 Dashboard、文档站、设置页。

## 2. 设计语义

- **结构层级**：`Layout` 是布局原语，`Sider` 是其中唯一带交互（折叠）的成员。整体视觉上无边框、无阴影，仅由背景色（`--cd-color-bg-*`）区分层次。
- **方向**：纵向（Header→Content→Footer）为默认信息流；含 Sider 时为「侧栏 + 纵向主体」的复合 row 结构。
- **吸附**：Header/Footer 支持 `sticky`，Sider 支持 `sticky` 固定（高度跟随视口）。
- **折叠收起**：Sider 折叠为「宽度从 `width` 收窄到 `collapsedWidth`」的连续动画（默认 200ms），而非整体抽屉移出，保持上下文连续性。
- **响应式**：`breakpoint` 命中时 Sider 自动折叠/收起，参照 `--cd-breakpoint-*` 断点令牌。
- **空间**：Layout 不内置内边距（避免与业务样式冲突）；Content 提供可选 `padding`，由 Component Token 控制。
- **运动**：折叠动画走 `--cd-motion-duration-mid` + `--cd-motion-ease-standard`；`prefers-reduced-motion` 时归零。

## 3. 分层实现

分层判断：Layout/Header/Content/Footer 为**纯展示组件**（仅决定 flex 方向与背景），不进入 core。**Sider 含折叠交互、断点监听、触发器键盘语义**，其 headless 逻辑下沉到 core。

- **@chenzy-design/core · `createSider`**
  - 状态：`collapsed`（受控/非受控）、`belowBreakpoint`。
  - 行为：`toggle()`、`setCollapsed()`、断点 `matchMedia` 监听（命中触发 `onBreakpoint` + 自动 collapse）。
  - 复用原语：
    - `useId`：生成 Sider 区域 id，供触发器 `aria-controls` 引用。
    - 不需要 `useFocusTrap`/`useScrollLock`/`useDismiss`（非浮层）；不需要 `useRovingTabindex`（触发器为单一控件）。
    - 可选 `useLiveAnnouncer`：折叠态变化时朗读「侧边栏已展开/已收起」。
  - 输出纯函数 + store，框架无关；不含 DOM 渲染。
- **@chenzy-design/svelte**
  - `Layout.svelte`：通过 context 注册子 Sider，判定方向（`hasSider ?? 检测到 Sider 子项`）。
  - `Sider.svelte`：消费 `createSider`，渲染宽度过渡、默认触发器（折叠箭头按钮）、断点 SSR 兜底（首帧用 `defaultCollapsed`，hydration 后接管 matchMedia）。
  - SSR 安全：`matchMedia` 仅在 `onMount` 后访问；首屏依据 `defaultCollapsed`/`hasSider` 渲染，避免 hydration 抖动。

## 4. API

### 4.1 Layout（根 / Content / Header / Footer 共享基类，差异见说明）

#### Props

| 名称 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| hasSider | `boolean` | `undefined` | 是否含侧栏（控制 flex 方向）。缺省时自动检测子节点；SSR 场景建议显式传入。仅 `Layout` 根有效 |
| tagName | `'div' \| 'section' \| 'main' \| 'header' \| 'footer' \| 'aside'` | 见说明 | 渲染标签。Header→`header`、Footer→`footer`、Content→`main`、Sider→`aside`、Layout→`section` |
| class | `string` | `''` | 透传类名 |
| style | `string` | `''` | 透传内联样式（叠加在派生样式之后，可覆盖） |
| ariaLabel | `string` | `undefined` | 可访问性标签（透传根元素 aria-label，对齐 Semi ≥2.3.0） |
| role | `string` | `undefined` | 可访问性 role（透传根元素，覆盖默认语义） |

#### Header / Footer 额外 Props

| 名称 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| sticky | `boolean` | `false` | 是否吸顶（Header）/吸底（Footer） |
| height | `string \| number` | Header `60`，Footer `auto` | 高度，number 视为 px |

#### Content 额外 Props

| 名称 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| padding | `string \| number \| boolean` | `false` | 内边距，`true` 使用默认 token 值 |

### 4.2 Layout.Sider

#### Props

| 名称 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| collapsed | `boolean` | `undefined` | 受控折叠态。配合 `on:change` 使用 |
| defaultCollapsed | `boolean` | `false` | 非受控初始折叠态 |
| collapsible | `boolean` | `false` | 是否显示默认折叠触发器 |
| width | `string \| number` | `200` | 展开宽度，number 视为 px |
| collapsedWidth | `string \| number` | `60` | 折叠后宽度，`0` 表示完全收起（隐藏触发器外形需自定义） |
| breakpoint | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| 'xxl'` | `undefined` | 命中断点时自动折叠 |
| reverseArrow | `boolean` | `false` | 触发器箭头方向反转（用于右置 Sider） |
| sticky | `boolean` | `false` | 固定侧栏，高度随视口 |
| placement | `'left' \| 'right'` | `'left'` | 侧栏位置，影响触发器箭头与边框侧 |
| style | `string` | `undefined` | 透传内联样式（叠加在宽度样式之后，可覆盖） |
| ariaLabel | `string` | `undefined` | 可访问性标签，描述该 Sider 作用（透传 aside aria-label） |
| role | `string` | `undefined` | 可访问性 role（透传根元素） |
| trigger | `Slot \| null` | 默认箭头 | 自定义触发器；`null` 隐藏触发器 |

#### Events

| 事件 | 载荷 (`event.detail`) | 触发时机 |
|---|---|---|
| change | `{ collapsed: boolean; trigger: 'click' \| 'breakpoint' }` | 折叠态变化（统一受控事件） |
| breakpoint | `{ matched: boolean; breakpoint: string }` | 断点匹配状态变化 |

> 命名遵循一致性约定：折叠态视为受控值，使用 `collapsed` + `on:change`（语义等价于 value+on:change）。

#### Slots

| Slot | props | 说明 |
|---|---|---|
| default | — | Sider 内容（通常放 Nav/Menu） |
| trigger | `{ collapsed: boolean; toggle: () => void }` | 自定义折叠触发器 |

### 4.3 Layout / Header / Content / Footer Slots

| Slot | props | 说明 |
|---|---|---|
| default | — | 子内容 |

### 4.4 Events（Layout/Header/Content/Footer）

纯展示，无组件级事件（原生事件经 `$$restProps`/`on:` 透传到根标签）。

## 5. 主题 / Token

组件仅消费 Alias 与 Component Token，不写死值。

| Component Token | 取值（引用 Alias/Global） | 用途 |
|---|---|---|
| `--cd-layout-bg` | `var(--cd-color-bg-0)` | Layout 根背景 |
| `--cd-layout-header-bg` | `var(--cd-color-bg-1)` | Header 背景 |
| `--cd-layout-header-height` | `var(--cd-size-height-header, 60px)` | Header 默认高度 |
| `--cd-layout-header-z` | `var(--cd-z-sticky)` | 吸顶层级 |
| `--cd-layout-footer-bg` | `var(--cd-color-bg-1)` | Footer 背景 |
| `--cd-layout-footer-color` | `var(--cd-color-text-2)` | Footer 文本色 |
| `--cd-layout-content-bg` | `var(--cd-color-bg-0)` | Content 背景 |
| `--cd-layout-content-padding` | `var(--cd-spacing-lg)` | Content `padding=true` 时的内边距 |
| `--cd-layout-sider-bg` | `var(--cd-color-bg-1)` | Sider 背景 |
| `--cd-layout-sider-width` | `200px` | Sider 展开宽度（可被 prop 覆写为内联 var） |
| `--cd-layout-sider-collapsed-width` | `60px` | Sider 折叠宽度 |
| `--cd-layout-sider-border` | `var(--cd-color-border)` | Sider 与主体分隔线 |
| `--cd-layout-sider-trigger-bg` | `var(--cd-color-bg-2)` | 折叠触发器背景 |
| `--cd-layout-sider-trigger-color` | `var(--cd-color-text-1)` | 触发器图标色 |
| `--cd-layout-sider-trigger-hover-bg` | `var(--cd-color-fill-1)` | 触发器悬停背景 |
| `--cd-layout-motion-duration` | `var(--cd-motion-duration-mid)` | 折叠过渡时长 |
| `--cd-layout-motion-ease` | `var(--cd-motion-ease-standard)` | 折叠过渡缓动 |

暗色主题通过 Alias 层切换（`--cd-color-bg-*` 自动适配），组件无需额外覆写。

## 6. 无障碍（WCAG 2.1 AA）

- **语义标签**：默认使用 landmark 标签——Header→`<header>`(role banner，仅顶层时)、Content→`<main>`、Footer→`<footer>`(role contentinfo)、Sider→`<aside>`(role complementary)。多 Sider 时应通过 `aria-label` 区分。
- **Sider 折叠触发器**：
  - 元素为 `<button>`，`aria-expanded={!collapsed}`，`aria-controls={siderId}`，`aria-label` 取 i18n（展开/收起态不同文案）。
  - 键盘：`Enter` / `Space` 触发 toggle；触发器在自然 Tab 顺序中，无需 roving。
  - 折叠态变化通过 `useLiveAnnouncer`（`aria-live=polite`）朗读结果。
- **焦点管理**：折叠不抢占焦点；`collapsedWidth=0` 时被隐藏内容应使用 `display:none`/`visibility:hidden` + `inert`（或 `hidden`），避免焦点落入不可见区域。
- **对比度**：Footer 次要文本（`--cd-color-text-2`）需对背景满足 ≥ 4.5:1；触发器图标 ≥ 3:1（图形对比）。
- **reduced-motion**：`@media (prefers-reduced-motion: reduce)` 下宽度过渡设为 `0ms`。
- **RTL**：`placement='left'` 在 RTL 下逻辑镜像；样式使用 `inset-inline-start`/`border-inline-end` 等逻辑属性，触发器箭头方向随 `dir` 翻转。
- **APG 参照**：触发器遵循 Disclosure(Show/Hide) 模式（`aria-expanded` + `aria-controls`）。

## 7. 国际化

用户可见文案仅存在于 Sider 默认触发器（图标按钮的无障碍标签）。零硬编码，i18n key：

| key | 默认（zh-CN） | 默认（en-US） | 用途 |
|---|---|---|---|
| `Sider.expand` | 展开侧边栏 | Expand sidebar | 折叠态触发器 `aria-label` |
| `Sider.collapse` | 收起侧边栏 | Collapse sidebar | 展开态触发器 `aria-label` |
| `Sider.expanded` | 侧边栏已展开 | Sidebar expanded | live region 播报 |
| `Sider.collapsed` | 侧边栏已收起 | Sidebar collapsed | live region 播报 |

- 无日期/数字渲染，故不涉及 `Intl`；若未来 Footer 内置版权年份示例，应使用 `Intl.DateTimeFormat` 而非拼接。
- RTL 由 i18n locale 的 `dir` 驱动，与文案解耦。

## 8. 文案

遵循 content-guidelines：

- 触发器标签使用「动词 + 对象」：展开侧边栏 / 收起侧边栏（句中态，不带句号）。
- live region 播报使用「对象 + 状态」结果式短句：侧边栏已收起。
- 大小写：en-US 句首大写，sidebar 小写。
- **危险操作文案**：本组件无任何危险/破坏性操作（折叠为可逆、无数据丢失），故无危险文案。

## 9. 性能

| 指标 | Budget | 说明 |
|---|---|---|
| svelte 包 gzip（Layout 全家桶） | ≤ 3.1 KB | 5 个轻组件 + Sider 逻辑 |
| core `createSider` gzip | ≤ 0.8 KB | 折叠状态机 + matchMedia |
| 折叠动画帧 | 60fps | 仅动画 `width`（可选 `transform` 优化），避免布局抖动 |
| 首屏渲染 | 无 hydration 抖动 | SSR 用 `defaultCollapsed`/`hasSider`，client 接管 |
| matchMedia 监听 | 单监听器/Sider | `onMount` 注册，`onDestroy` 解绑 |

- **虚拟化**：不需要（布局容器本身无长列表，长内容由使用方负责）。
- **惰性渲染 / destroyOnClose**：不适用（Sider 折叠仅收窄宽度，内容保留在 DOM 以维持状态；`collapsedWidth=0` 时用 `hidden`/`inert` 而非卸载，避免内部组件状态丢失）。
- **过渡优化**：折叠仅 transition `width`/`flex-basis`，必要时叠加 `will-change: width` 并在动画结束移除。

## 10. AI 元数据

提供 `component.meta.ts`，内容覆盖：

- `name: 'Layout'`，`category: 'basic'`，`stage: 'M1'`，`subComponents: ['Header','Sider','Content','Footer']`。
- `props`/`events`/`slots` 结构化描述（类型、默认值、枚举值、是否受控）。
- `a11y`: landmark 标签映射、Disclosure 模式标注。
- `tokens`: 第 5 节 Component Token 清单（供主题工具消费）。
- `examples`: 「标准后台布局」「带折叠侧栏」「响应式断点收起」「右置 Sider」最小代码片段。
- `relations`: 常与 `Nav`/`Menu`（置于 Sider）、`Grid`（置于 Content）组合，互斥能力说明。
- `aiHints`: 「方向由是否含 Sider 自动决定，勿手动设 flex」「折叠用 collapsed+on:change」「SSR 显式传 hasSider」。

## 11. 测试

- **单元（core `createSider`）**：受控/非受控折叠切换、`toggle()`、断点匹配触发 `onBreakpoint`+自动 collapse、受控模式下不自改状态、事件 `trigger` 字段正确（click vs breakpoint）。
- **组件（svelte）**：
  - 方向检测：含 Sider 子项时根容器为 row；`hasSider` 显式覆盖。
  - 宽度过渡：collapsed 切换后宽度等于 `collapsedWidth`。
  - 触发器：`null` 隐藏、自定义 slot 透传 `collapsed/toggle`。
  - SSR 快照：`defaultCollapsed` 决定首帧，hydration 后无 mismatch。
- **a11y（axe / 键盘）**：landmark 唯一性、触发器 `aria-expanded`/`aria-controls` 正确、Enter/Space 可操作、`collapsedWidth=0` 时隐藏内容不可聚焦。
- **视觉回归**：展开/折叠/右置/sticky/暗色 五态截图。
- **i18n**：切 locale 后触发器 `aria-label` 与 live 文案更新；RTL 镜像快照。
- **reduced-motion**：媒体查询下过渡时长为 0。

## 12. 验收标准 Checklist

- [ ] 5 子组件（Layout/Header/Sider/Content/Footer）均可用，标签语义正确（main/header/footer/aside）。
- [ ] 含 Sider 自动 row 方向；`hasSider` 可显式覆盖且 SSR 无抖动。
- [ ] Sider 支持受控（`collapsed`+`on:change`）与非受控（`defaultCollapsed`）。
- [ ] `collapsible` 显示默认触发器；`trigger` slot 可自定义、`null` 可隐藏。
- [ ] `breakpoint` 命中自动折叠并派发 `breakpoint` 事件，`change.trigger` 区分 click/breakpoint。
- [ ] 折叠为宽度连续动画，`collapsedWidth=0` 用 `hidden`/`inert` 隐藏且内容不可聚焦。
- [ ] 仅消费 `--cd-` Alias/Component Token，无写死颜色/尺寸；暗色随 Alias 自适配。
- [ ] 触发器 `aria-expanded`/`aria-controls`/`aria-label` 正确，键盘 Enter/Space 可操作，折叠态 live 播报。
- [ ] 所有可见文案走 i18n（`Sider.*` 四个 key），无硬编码。
- [ ] `prefers-reduced-motion` 关闭过渡；RTL 逻辑属性镜像且箭头翻转。
- [ ] core `createSider` 框架无关、复用 `useId`（及可选 `useLiveAnnouncer`），不引入多余原语。
- [ ] 提供 `component.meta.ts`，含 props/events/slots/tokens/examples/aiHints。
- [ ] Perf Budget 达标：svelte ≤ 3.1KB、core ≤ 0.8KB gzip，折叠 60fps。
- [ ] 单元 / 组件 / a11y / 视觉 / i18n / reduced-motion 测试全部通过。
