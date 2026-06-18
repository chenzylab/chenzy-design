# SPEC · Breadcrumb
> 分类：navigation · 阶段：M3
> 对标 Semi：Breadcrumb

## 1. 概述

Breadcrumb（面包屑）用于展示当前页面在系统层级结构中的位置，并提供逐级回退的导航能力。它是一种次级导航控件，典型场景是多层级页面（如「首页 / 商品管理 / 商品详情」），帮助用户理解"我在哪里"以及"如何返回上层"。

核心能力：
- **声明式 / 数据驱动双模式**：既支持以 `Breadcrumb.Item` 子组件逐项声明，也支持通过 `routes` 数据数组渲染。
- **自定义分隔符**：默认 `/`，可通过 `separator` 全局替换或单项级 `separator` 覆盖（支持图标）。
- **中间省略（折叠）**：当层级过深时，将中间项折叠为 `...`，悬浮/点击展开为下拉菜单，保留首尾若干项（`maxItemCount` / `renderMore`）。
- **单项下拉**：某一层级可附带 `Dropdown`（`menu`/`renderItem`），用于在同级页面间切换。
- **文本溢出省略**：单项文本过长时按 `noTooltip`/`shouldRenderInOverlay` 截断并附 Tooltip。

非目标：Breadcrumb 不负责路由跳转本身（仅产出 `href`/`on:click` 事件，由宿主路由消费）；不承担页面级标题（那是 PageHeader 的职责）。

## 2. 设计语义

- **结构语义**：一条水平有序序列，最后一项为"当前页"（current page），不可点击、视觉降权但文本对比度仍达标；非末项为可点击链接，呈现 `--cd-color-text-2` 常态、`--cd-color-primary` hover。
- **分隔符语义**：分隔符是装饰性内容，不承载信息，须对辅助技术隐藏（`aria-hidden`），仅作视觉分组。
- **折叠语义**：`...` 折叠节点表达"此处存在被隐藏的中间层级"，是一个可展开的菜单触发器，而非链接。
- **尺寸**：`small | default | large`，影响字号（12/14/16）、行高与分隔符间距（`--cd-breadcrumb-gap`）；默认 `default`。
- **状态**：link（常态/hover/active/focus-visible）、current（末项）、disabled（不可点击且降权）、collapsed（折叠态）。
- **密度与换行**：默认单行不换行，溢出由省略策略处理；提供 `wrap` 允许多行换行（移动端友好）。
- **方向**：RTL 下整体序列与分隔符方向镜像（`/` 视觉保持，箭头类分隔符需镜像）。

## 3. 分层实现

Breadcrumb 含折叠下拉、单项下拉的键盘与焦点逻辑，故采用 core + svelte 分层。

**@chenzy-design/core — `createBreadcrumb`**
- 职责：纯逻辑、无 DOM。规范化 items（合并 `routes` 与声明式子项），计算折叠策略（依据 `maxItemCount`、首尾保留数）产出 `visibleItems` + `collapsedItems`，维护折叠下拉/单项下拉的 `open` 状态机。
- 复用原语：
  - `useId`：为 `nav`、折叠菜单、各下拉生成稳定 id（SSR 一致）。
  - `useDismiss`：折叠/单项下拉的外点击、`Esc`、滚动/失焦关闭。
  - `useRovingTabindex`：下拉菜单内 `↑/↓` 焦点移动（菜单项 roving）。
  - `useFocusTrap`（仅折叠菜单为 popover overlay 时）：限制焦点在浮层内。
  - `useLiveAnnouncer`：折叠展开时播报"已展开 N 个隐藏层级"。
- 输出：`getNavProps()`、`getListProps()`、`getItemProps(index)`、`getSeparatorProps()`、`getCollapseTriggerProps()`、`getCollapseMenuProps()`、`getDropdownProps(index)`，以及 `state: { open, openIndex }` 与 `actions: { toggleCollapse, openDropdown, close }`。

**@chenzy-design/svelte — `Breadcrumb` / `Breadcrumb.Item`**
- 渲染 `<nav><ol><li>` 语义结构，绑定 core 返回的 props；分隔符插入 `aria-hidden` 节点。
- 末项渲染为 `<span aria-current="page">`，其余渲染 `<a>` 或 `<button>`（无 href 时）。
- 折叠节点渲染为带 `Dropdown` 的触发器；单项下拉复用 `Dropdown` 组件。
- 溢出 Tooltip 复用 `Tooltip` 组件（`noTooltip` 关闭）。
- 纯展示路径（无折叠、无下拉、全部纯文本/链接）可不挂载 core，直接静态渲染以节省体积。

## 4. API

### Props

| 名称 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `routes` | `BreadcrumbRoute[]` | `[]` | 数据驱动模式的层级数组，与声明式 `Breadcrumb.Item` 二选一 |
| `separator` | `string \| Snippet` | `'/'` | 全局分隔符，支持字符串或图标渲染片段 |
| `maxItemCount` | `number` | `0` | 超过该数量时中间折叠为 `...`；`0` 表示不折叠 |
| `compact` | `boolean` | `true` | 紧凑分隔间距；`false` 时使用宽松间距 |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | 尺寸 |
| `wrap` | `boolean` | `false` | 允许多行换行；否则单行省略 |
| `showTooltip` | `boolean \| TooltipProps` | `true` | 文本溢出时是否展示 Tooltip 及其配置 |
| `moreType` | `'default' \| 'popover'` | `'default'` | 折叠节点展开为内联菜单或 Popover 浮层 |
| `renderItem` | `(route: BreadcrumbRoute, index: number) => Snippet` | — | 自定义单项渲染 |
| `renderMore` | `(collapsed: BreadcrumbRoute[]) => Snippet` | — | 自定义折叠节点/菜单渲染 |
| `class` | `string` | — | 根节点自定义类名 |
| `style` | `string` | — | 根节点自定义内联样式 |

`BreadcrumbRoute`：`{ name?: string; href?: string; icon?: Snippet; separator?: string \| Snippet; disabled?: boolean; menu?: BreadcrumbMenuItem[]; key?: string }`

`Breadcrumb.Item` Props：`href?: string`、`icon?: Snippet`、`separator?: string | Snippet`、`disabled?: boolean`、`noLink?: boolean`、`active?: boolean`（强制标记当前项）、`menu?: BreadcrumbMenuItem[]`。

### Events

| 名称 | payload | 说明 |
|---|---|---|
| `on:click` | `{ route: BreadcrumbRoute; index: number; event: MouseEvent }` | 点击任一可点击项（末项默认不触发，除非显式可点） |
| `on:openChange` | `{ open: boolean; type: 'collapse' \| 'dropdown'; index?: number }` | 折叠菜单或单项下拉显隐变化（受控浮层约定） |
| `on:select` | `{ item: BreadcrumbMenuItem; index: number }` | 折叠菜单 / 单项下拉中选择某条目 |

> 一致性：浮层显隐遵循 `open` + `on:openChange`；下拉本身不持有 `value`（属导航触发，非表单输入），故不暴露 `value`/`on:change`。

### Slots / Snippets

| 名称 | 参数 | 说明 |
|---|---|---|
| `default` | — | 放置 `Breadcrumb.Item` 子项（声明式模式） |
| `separator` | — | 自定义全局分隔符（等价 `separator` prop） |
| `more` | `{ collapsed }` | 自定义折叠节点外观 |
| `item`（在 `Breadcrumb.Item` 内） | — | 单项内容；可嵌入图标 + 文本 |

## 5. 主题 / Token 表

组件级 Token 全部回退到 Alias，禁止写死值。

| Component Token | 回退（Alias） | 用途 |
|---|---|---|
| `--cd-breadcrumb-color-link` | `--cd-color-text-2` | 链接项常态文本色 |
| `--cd-breadcrumb-color-link-hover` | `--cd-color-primary` | 链接 hover 文本色 |
| `--cd-breadcrumb-color-link-active` | `--cd-color-primary-active` | 链接 active 文本色 |
| `--cd-breadcrumb-color-current` | `--cd-color-text-0` | 当前项（末项）文本色 |
| `--cd-breadcrumb-color-disabled` | `--cd-color-text-3` | 禁用项文本色 |
| `--cd-breadcrumb-color-separator` | `--cd-color-text-3` | 分隔符颜色 |
| `--cd-breadcrumb-color-icon` | `--cd-color-text-2` | 单项前置图标色 |
| `--cd-breadcrumb-bg-hover` | `--cd-color-fill-0` | 折叠节点/单项 hover 背景 |
| `--cd-breadcrumb-font-size` | `--cd-font-size-regular` | 默认字号（small/large 覆盖为 small/large alias） |
| `--cd-breadcrumb-gap` | `--cd-spacing-tight` | 项与分隔符间距 |
| `--cd-breadcrumb-item-radius` | `--cd-border-radius-small` | 可交互项 hover 圆角 |
| `--cd-breadcrumb-focus-ring` | `--cd-color-focus-border` | focus-visible 焦点环 |

尺寸映射：`small → --cd-font-size-small`、`large → --cd-font-size-large`，并按尺寸调整 `--cd-breadcrumb-gap`。深浅色模式自动随 Alias 切换，无需组件特判。

## 6. 无障碍（WCAG 2.1 AA）

遵循 WAI-ARIA APG Breadcrumb 模式。

- **容器**：`<nav aria-label>`（文案来自 i18n `Breadcrumb.navLabel`，默认"面包屑"），内部 `<ol>` 有序列表，每项 `<li>`。
- **当前项**：末项使用 `aria-current="page"`，渲染为非链接 `<span>`。
- **链接项**：`<a href>`；无 `href` 时降级为 `<button type="button">` 以保证可聚焦可激活。
- **分隔符**：纯 CSS 伪元素或带 `aria-hidden="true"` 的节点，绝不进入无障碍树/Tab 序列。
- **折叠节点**：`<button aria-haspopup="menu" aria-expanded aria-controls={menuId}>`；展开后菜单 `role="menu"`，项 `role="menuitem"`。
- **单项下拉**：同上模式，触发器 `aria-haspopup="menu"`。
- **键盘交互**：
  - `Tab` 在各可聚焦项间移动（分隔符/折叠占位不获焦）。
  - 折叠/下拉触发器：`Enter`/`Space`/`↓` 打开菜单并聚焦首项；`Esc` 关闭并归还焦点到触发器。
  - 菜单内：`↑/↓`（roving）、`Home/End`、`Enter` 选择、`Tab` 关闭并继续。
- **焦点管理**：`popover` 模式用 `useFocusTrap`；关闭后焦点回到触发器（`useDismiss` 保障）。
- **对比度**：链接、当前项、禁用项文本对背景均 ≥ 4.5:1（禁用项亦保证，依赖 `--cd-color-text-3` 已达标）；focus-visible 焦点环 ≥ 3:1。
- **reduced-motion**：`prefers-reduced-motion` 时下拉展开过渡退化为无动画即时显示。
- **RTL**：`dir="rtl"` 下列表方向镜像，箭头类分隔符水平翻转，`/` 保持原样。
- **触达**：折叠/下拉触发器最小可点击区域 ≥ 24×24 CSS px。

## 7. 国际化

用户可见文案零硬编码，全部走 i18n key：

| Key | 默认（zh-CN） | 说明 |
|---|---|---|
| `Breadcrumb.navLabel` | 面包屑 | `nav` 的 `aria-label` |
| `Breadcrumb.moreLabel` | 显示更多 | 折叠触发器 `aria-label` |
| `Breadcrumb.collapsedAnnounce` | 已展开 {count} 个隐藏层级 | 折叠展开 live 播报（`useLiveAnnouncer`） |
| `Breadcrumb.expandTooltip` | 展开 | 折叠节点 hover Tooltip |

- `{count}` 用 `Intl.NumberFormat(locale)` 格式化。
- 折叠播报与 `aria-label` 随 locale 切换；分隔符为符号，不本地化（除非宿主自定义）。
- RTL locale（如 ar）自动配合第 6 节方向镜像。

## 8. 文案

遵循 content-guidelines：

- 项名称使用简洁名词短语，避免句子与句末标点。
- 折叠触发器无障碍名称用动作短语"显示更多"，而非"..."（视觉用 `…`，语义用文案）。
- Tooltip 文案与项名称一致，不重复添加"页面/链接"等冗余词。
- **危险操作**：Breadcrumb 为纯导航控件，不承载危险操作；若宿主在单项下拉中放入破坏性条目（如"删除分组"），破坏性文案应使用明确动词 + 对象（"删除当前分组"），并由宿主在条目上施加 `danger` 视觉态与二次确认——Breadcrumb 本身不提供也不鼓励内联危险操作。

## 9. 性能（Perf Budget）

| 指标 | 预算 | 说明 |
|---|---|---|
| 纯展示路径 gzip | ≤ 2.5 KB | 无折叠/下拉时不引入 core 与 Dropdown/Tooltip |
| 含 core + 折叠 gzip | ≤ 6 KB | 含 `createBreadcrumb` 与 dismiss/roving 原语 |
| 首次渲染（20 项） | < 4 ms | 同步渲染，无折叠计算开销 |
| 折叠菜单首开 | < 16 ms（1 帧） | 浮层惰性挂载 |
| 折叠重算 | O(n)，n=项数 | 仅在 `routes`/`maxItemCount` 变更时重算 |

- **惰性渲染**：折叠菜单与单项下拉浮层 `destroyOnClose`（首次打开才挂载，关闭后默认销毁，可配 `keepMounted`）。
- **虚拟化**：不需要——面包屑层级天然有限（通常 < 30），且折叠策略已限制可见 DOM 数。
- **Tooltip 惰性**：仅在文本实际溢出（`scrollWidth > clientWidth`）时绑定，避免无谓监听。

## 10. AI 元数据

提供 `component.meta.ts`，导出：
- `name: 'Breadcrumb'`、`category: 'navigation'`、`stage: 'M3'`、`semiEquivalent: 'Breadcrumb'`。
- `props`/`events`/`slots` schema（含类型、默认值、枚举、是否必填），供生成器与文档站消费。
- `tokens`：第 5 节组件 Token 列表及回退链。
- `a11y`：role/aria 映射与键盘交互表。
- `i18nKeys`：第 7 节 key 列表。
- `examples`：典型用法片段（基础、自定义分隔符、折叠、单项下拉、数据驱动 `routes`）。
- `aiHints`：何时选用（"展示层级位置 + 逐级回退"）、何时不用（页面主标题用 PageHeader、Tab 切换用 Tabs）。

## 11. 测试

- **单元（core）**：items 规范化（`routes` 与声明式合并）、折叠策略（不同 `maxItemCount` 的 visible/collapsed 切分、首尾保留）、open 状态机、id 生成稳定性。
- **组件（svelte）**：
  - 渲染快照：基础、自定义分隔符、图标项、禁用项、折叠态、单项下拉、`routes` 模式。
  - 末项 `aria-current="page"` 且非链接；分隔符 `aria-hidden`。
- **交互（Testing Library）**：折叠触发器键盘开合、菜单 roving、`Esc` 归还焦点、外点击关闭、`on:click`/`on:select`/`on:openChange` 派发正确 payload。
- **a11y**：axe 无违规；焦点环可见；对比度断言。
- **i18n**：切换 locale 后 `aria-label`/播报文案更新；RTL 镜像快照。
- **视觉回归**：三尺寸 × 明暗 × RTL × 折叠态截图比对。
- **性能**：bundle-size 守卫（纯展示 ≤ 2.5KB / 含折叠 ≤ 6KB）；20 项渲染基准。

## 12. 验收标准 Checklist

- [ ] 支持声明式 `Breadcrumb.Item` 与数据驱动 `routes` 双模式，二者表现一致。
- [ ] 默认分隔符 `/`，支持全局 `separator` 与单项 `separator` 覆盖（含图标）。
- [ ] `maxItemCount` 折叠生效，中间项收为 `…`，展开为菜单，首尾保留正确。
- [ ] 单项 `menu` 下拉可用，键盘 + 鼠标皆可操作。
- [ ] 末项 `aria-current="page"` 且不可点击；其余项为 `<a>`/`<button>`。
- [ ] 分隔符对辅助技术隐藏（`aria-hidden`），不进入 Tab 序列。
- [ ] 浮层遵循 `open` + `on:openChange`；选择派发 `on:select`；点击派发 `on:click`，payload 含 route/index/event。
- [ ] 所有可见文案走 i18n key，无硬编码；`{count}` 经 `Intl` 格式化。
- [ ] 全部颜色消费 `--cd-breadcrumb-*` → Alias 回退，无写死值；明暗模式自动适配。
- [ ] 键盘交互、焦点归还、`Esc`/外点击关闭、roving 菜单符合 WAI-ARIA APG。
- [ ] 对比度 AA、focus-visible ≥ 3:1、reduced-motion、RTL 镜像均通过。
- [ ] 折叠/下拉浮层 `destroyOnClose` 惰性挂载；纯展示路径不引入 core。
- [ ] gzip 预算达标（纯展示 ≤ 2.5KB，含折叠 ≤ 6KB）。
- [ ] 提供 `component.meta.ts`，schema/tokens/a11y/i18n/examples 完整。
- [ ] axe 无障碍、视觉回归、bundle-size 守卫 CI 全绿。
