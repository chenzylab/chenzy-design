# SPEC · Menu
> 分类：navigation · 阶段：M3
> 对标 Semi：Menu

## 1. 概述

Menu 是导航场景的核心容器组件，用于在应用中组织一组可选的命令或导航目标。支持三种模式（mode）：`horizontal`（顶部水平导航栏）、`vertical`（侧边垂直导航）、`inline`（内嵌折叠式，子菜单在原位展开而非浮层弹出）。支持任意层级的多级嵌套（SubMenu）、分组（ItemGroup）、分隔线（Divider）。

典型用途：

- 后台管理系统侧边栏导航（vertical / inline）
- 顶部产品导航栏（horizontal，子菜单浮层下拉）
- 长列表的分组组织（ItemGroup）

设计重点是**无障碍**：Menu 是 WAI-ARIA APG 中规则最严格的复合控件之一，本组件区分两种语义角色——作为页面导航时使用 `nav` 包裹的链接列表语义，作为应用命令菜单时使用 `menu/menubar` + roving tabindex 语义。两套语义不可混用，由 `purpose` prop 显式声明。

不在本组件范围：右键上下文菜单（见 Dropdown/ContextMenu）、下拉选择（见 Select）、命令面板（见 Command）。

## 2. 设计语义

- **层级与缩进**：inline 模式每下沉一级，Item 左侧 padding 增加一个步进（`--cd-menu-inline-indent`，默认 24px），形成视觉层级。horizontal/vertical 的子菜单以浮层呈现，浮层自身重置缩进。
- **选中态 vs 高亮态**：`selectedKeys` 表达持久的「当前所在位置」（导航语义，左/下边框高亮 + 文字 primary 色）；hover/focus 是临时高亮（bg-1 底色）。二者视觉必须可区分。
- **开合语义**：SubMenu 的展开用 `openKeys` 控制，遵循 `open + on:openChange` 约定的复数形态。horizontal 默认 hover 触发浮层、inline 默认 click 触发原位展开，由 `triggerSubMenuAction` 配置。
- **尺寸**：small | default | large，影响 Item 高度（28/36/44）、字号与图标间距，映射到 Component Token。
- **状态优先级**：disabled > selected > active(open) > hover > normal。disabled 项不可聚焦（导航语义）或可聚焦但 `aria-disabled`（菜单语义，APG 要求 disabled 项仍在 Tab 序内可被发现）。
- **密度与省略**：horizontal 模式溢出时折叠为「更多」SubMenu（overflow collapse）；文字过长单行省略 + title 兜底。
- **方向性**：RTL 下缩进方向、子菜单展开方向、箭头图标整体镜像。

## 3. 分层实现

有键盘/焦点/a11y 逻辑，采用 headless 分层。

**@chenzy-design/core — `createMenu`**

- 维护 roving tabindex 焦点模型（菜单语义下整组只有一个 tabindex=0）。
- 复用原语：
  - `useRovingTabindex`：管理 Item 间方向键焦点移动（horizontal 用 Left/Right，vertical/inline 用 Up/Down）。
  - `useDismiss`：浮层子菜单的 Esc / 点击外部关闭。
  - `useId`：生成 Item/SubMenu 与 `aria-controls`/`aria-labelledby` 的关联 id。
  - `useLiveAnnouncer`：展开/折叠 SubMenu 时按需播报（可选）。
  - 浮层定位委托 `createPositioner`（Popper 抽象），floating 子菜单复用。
- 暴露 state machine：`selectedKeys`、`openKeys`、`activeKey`（当前 roving 焦点）、按键解析（typeahead 首字母跳转、Home/End、Left 收起、Right 展开）。
- 与框架无关，输出 getter props（`getMenuProps`/`getItemProps`/`getSubMenuTriggerProps`）。

**@chenzy-design/svelte — 渲染层**

- 组件：`Menu`、`Menu.Item`、`Menu.SubMenu`、`Menu.ItemGroup`、`Menu.Divider`。通过 context 下发 `createMenu` 实例与层级深度。
- 负责 DOM 渲染、过渡动画（inline 高度展开、浮层 fade/scale）、Token 应用、slot 投影。
- `destroyOnHide` 控制浮层子菜单卸载策略。

## 4. API

### Props（Menu）

| 名称 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| mode | `'horizontal' \| 'vertical' \| 'inline'` | `'vertical'` | 布局模式 |
| purpose | `'navigation' \| 'commands'` | `'navigation'` | 语义角色：导航(nav+links) 或 命令菜单(menubar+roving) |
| selectedKeys | `string[]` | `[]` | 受控选中项 key（遵循 value 语义的导航态） |
| defaultSelectedKeys | `string[]` | `[]` | 非受控初始选中 |
| openKeys | `string[]` | `[]` | 受控展开的 SubMenu key（open 复数形态） |
| defaultOpenKeys | `string[]` | `[]` | 非受控初始展开 |
| multiple | `boolean` | `false` | 是否允许多选 |
| size | `'small' \| 'default' \| 'large'` | `'default'` | 尺寸 |
| inlineIndent | `number` | `24` | inline 每级缩进步进(px) |
| inlineCollapsed | `boolean` | `false` | inline/vertical 折叠为图标轨（仅图标） |
| triggerSubMenuAction | `'hover' \| 'click'` | mode 推导 | 浮层子菜单触发方式 |
| subMenuOpenDelay | `number` | `100` | hover 展开延迟(ms) |
| subMenuCloseDelay | `number` | `100` | hover 收起延迟(ms) |
| status | `'default' \| 'warning' \| 'error'` | `'default'` | 校验态（用于表单内菜单选择，少见） |
| destroyOnHide | `boolean` | `false` | 浮层子菜单隐藏时卸载内容 |
| disabled | `boolean` | `false` | 整体禁用 |
| getPopupContainer | `() => HTMLElement` | `body` | 浮层挂载容器 |

### Props（Menu.Item / Menu.SubMenu / Menu.ItemGroup）

| 名称 | 适用 | 类型 | 默认值 | 说明 |
|---|---|---|---|---|
| itemKey | Item/SubMenu | `string` | — | 唯一标识（必填） |
| disabled | Item/SubMenu | `boolean` | `false` | 禁用单项 |
| icon | Item/SubMenu | `Snippet` | — | 前置图标 |
| href | Item | `string` | — | 导航语义下渲染为 `<a>` |
| target | Item | `string` | — | 链接 target |
| title | SubMenu/ItemGroup | `string \| Snippet` | — | 触发器/分组标题 |
| level | 内部 | `number` | 自动 | 嵌套深度（context 注入） |

### Events

| 事件 | payload | 说明 |
|---|---|---|
| on:change | `{ selectedKeys: string[], itemKey: string, domEvent: Event }` | 选中项变化（受控 selectedKeys 来源） |
| on:openChange | `{ openKeys: string[], itemKey: string, open: boolean }` | SubMenu 展开/收起 |
| on:click | `{ itemKey: string, keyPath: string[], domEvent: MouseEvent }` | 点击叶子 Item |
| on:select | `{ selectedKeys, itemKey, keyPath }` | 选中（multiple 时与 deselect 配对） |
| on:deselect | `{ selectedKeys, itemKey, keyPath }` | 取消选中（multiple） |
| on:focus / on:blur | `FocusEvent` | 焦点进出 |

### Slots

| Slot | 作用域参数 | 说明 |
|---|---|---|
| default | — | 子项（Item/SubMenu/ItemGroup/Divider） |
| icon (Item/SubMenu) | — | 前置图标自定义 |
| title (SubMenu/ItemGroup) | `{ open }` | 标题区自定义 |
| expandIcon (SubMenu) | `{ open, level }` | 展开箭头自定义 |
| overflowedIndicator | — | horizontal 溢出「更多」指示器 |

## 5. 主题 / Token 表

组件仅消费 Alias / Component Token，不写死值。

| Component Token | 引用 Alias / 计算 | 用途 |
|---|---|---|
| --cd-menu-color-text | --cd-color-text-0 | 默认文字 |
| --cd-menu-color-text-secondary | --cd-color-text-1 | 次级/分组标题 |
| --cd-menu-color-text-disabled | --cd-color-text-2 | 禁用文字 |
| --cd-menu-color-text-selected | --cd-color-primary | 选中文字 |
| --cd-menu-bg | --cd-color-bg-0 | 菜单背景 |
| --cd-menu-item-bg-hover | --cd-color-bg-1 | hover/focus 底色 |
| --cd-menu-item-bg-selected | color-mix(--cd-color-primary 8%) | 选中底色 |
| --cd-menu-indicator-color | --cd-color-primary | 选中边框指示条 |
| --cd-menu-border | --cd-color-border | horizontal 底边/浮层边框 |
| --cd-menu-color-warning | --cd-color-warning | status=warning |
| --cd-menu-color-danger | --cd-color-danger | status=error / 危险项 |
| --cd-menu-item-height-sm/-default/-lg | 28 / 36 / 44px | 行高（size） |
| --cd-menu-inline-indent | 24px | 每级缩进 |
| --cd-menu-popup-shadow | --cd-shadow-elevated | 浮层阴影 |
| --cd-menu-radius | --cd-radius-default | 圆角 |
| --cd-menu-focus-ring | --cd-color-primary | 键盘焦点环 |

暗色模式由 Alias 层切换自动继承，组件无需额外定义。

## 6. 无障碍（WCAG 2.1 AA / WAI-ARIA APG）

两套语义按 `purpose` 切换：

**purpose="navigation"（推荐用于路由导航）**

- 根节点 `<nav aria-label>`（i18n），内部 `<ul role="list">` + `<li>` + `<a>`。
- 当前项 `aria-current="page"`，不使用 menu roving，遵循自然 Tab 流。
- SubMenu 用 `<button aria-expanded aria-controls>` + disclosure 模式，子列表 `<ul>`。

**purpose="commands"（应用命令菜单，遵循 Menu/Menubar APG）**

- horizontal 根 `role="menubar"`，vertical/inline 根 `role="menu"`，均带 `aria-label`。
- Item `role="menuitem"`（多选 `menuitemcheckbox` + `aria-checked`）。
- SubMenu 触发器 `role="menuitem"` + `aria-haspopup="menu"` + `aria-expanded` + `aria-controls`，弹出子层 `role="menu" aria-labelledby`。
- roving tabindex：整组仅当前项 `tabindex=0`，其余 `-1`。

**键盘交互（commands 语义）**

| 按键 | 行为 |
|---|---|
| ↑ / ↓ | vertical/inline 上下移动焦点（环绕） |
| ← / → | menubar 顶层移动；vertical 中 → 展开/进入子菜单，← 收起/返回父级 |
| Enter / Space | 激活 Item / 切换 SubMenu |
| Esc | 关闭当前子菜单并将焦点返回触发器 |
| Home / End | 跳到首/末项 |
| A–Z | typeahead 按首字母聚焦匹配项 |
| Tab | 移出整个菜单组件 |

**其他**

- 焦点环：`:focus-visible` 显式 2px ring，对比度 ≥ 3:1。
- 对比度：文字/选中态/禁用态均满足 AA（正文 4.5:1，禁用文字豁免但保持可辨）。
- reduced-motion：`prefers-reduced-motion` 下禁用 inline 高度过渡与浮层缩放，仅保留瞬时显隐。
- RTL：`dir="rtl"` 下缩进、展开方向、箭头镜像；←/→ 语义随方向翻转。
- disabled 项在 commands 语义下保留焦点可达 + `aria-disabled="true"`（APG 要求），navigation 语义下移出 Tab 序。

## 7. 国际化

用户可见文案零硬编码，通过 i18n 注入：

| i18n key | 默认（en） | 用途 |
|---|---|---|
| Menu.navLabel | "Navigation" | nav aria-label 兜底 |
| Menu.menuLabel | "Menu" | menu/menubar aria-label 兜底 |
| Menu.expand | "Expand" | SubMenu 展开按钮 aria-label |
| Menu.collapse | "Collapse" | SubMenu 收起按钮 aria-label |
| Menu.more | "More" | horizontal 溢出指示器文案/标题 |
| Menu.submenuExpandedAnnounce | "{title} submenu expanded" | LiveAnnouncer 播报 |
| Menu.submenuCollapsedAnnounce | "{title} submenu collapsed" | LiveAnnouncer 播报 |

- 所有 `aria-label` 优先使用作者传入文本，缺省时回退到 i18n key。
- 无日期/数字格式化需求；若 Item 含 badge 计数，由调用方用 `Intl.NumberFormat` 预格式化后传入。

## 8. 文案

- 遵循 content-guidelines：菜单项使用名词或动名词短语，简洁、首字母大写（句首式），避免句末标点。
- SubMenu 标题与其子项保持同一抽象层级，避免标题与子项重名。
- 折叠指示器统一文案「More」，不用「...」纯符号（需可读名称）。
- **危险操作（单列）**：若菜单含破坏性命令（如「Delete account」），该 Item 标记 `danger` 视觉（--cd-menu-color-danger），文案使用明确动词 + 对象（"Delete project" 而非 "Delete"），避免出现在 hover 即触发的浮层首位以防误操作；破坏性命令的实际执行须由二次确认承接，Menu 仅负责触发。

## 9. 性能（Perf Budget）

| 指标 | 预算 | 说明 |
|---|---|---|
| @chenzy-design/svelte Menu gzip | ≤ 6 KB | 含 Item/SubMenu/ItemGroup/Divider |
| @chenzy-design/core createMenu gzip | ≤ 3.5 KB | roving + dismiss + 定位适配 |
| 首次渲染 (100 项 inline) | < 16ms | 单帧内完成 |
| SubMenu 展开/收起 | < 100ms 感知 | 过渡动画与原位高度计算 |
| 浮层定位重算 | rAF 节流 | 滚动/resize 时 |

- **虚拟化**：默认不内置；超长菜单（>200 项）建议调用方分组或外接虚拟列表，文档给出 hook 入口。
- **惰性渲染**：浮层子菜单首次展开才渲染内容；`destroyOnHide=true` 时收起后卸载，降低长期 DOM 占用。
- **inline 折叠**：`inlineCollapsed` 切换时缓存 openKeys，避免重排抖动。

## 10. AI 元数据

提供 `component.meta.ts`，包含：

- `name`、`category: 'navigation'`、`stage: 'M3'`、`semiEquivalent: 'Menu'`。
- `purpose` 双语义说明与选择指引（导航 vs 命令菜单）。
- props/events/slots 结构化 schema（类型、默认值、枚举、是否必填）。
- `a11yProfile`：role 矩阵、键盘表、APG 引用链接。
- `usageHints`：mode 选择决策、何时用 inline vs 浮层、与 Dropdown/Select 的边界。
- `antiPatterns`：勿用 Menu 做下拉表单选择、勿混用两套语义、disabled 项处理差异。
- `tokens`：本组件 Component Token 清单（同第 5 节）。

## 11. 测试

- **单元（core）**：roving tabindex 焦点移动、←/→ 展开收起逻辑、typeahead 匹配、Home/End、multiple 选择/取消、openKeys 状态机、RTL 方向翻转。
- **组件（svelte）**：受控/非受控 selectedKeys & openKeys、三种 mode 渲染快照、inlineCollapsed 切换、destroyOnHide 卸载、溢出折叠为 More。
- **a11y**：jest-axe / axe-core 零 violation；两套语义的 role/aria 断言；焦点返回触发器；reduced-motion 媒体查询生效。
- **键盘 E2E（Playwright）**：menubar 顶层 ←/→、子菜单进入返回、Esc 关闭、Tab 移出整组、首字母跳转。
- **视觉回归**：选中/hover/disabled/focus-ring 各态、暗色、RTL 镜像。
- **性能**：100/200 项渲染基准断言不超 Perf Budget。

## 12. 验收标准 Checklist

- [ ] 三种 mode（horizontal/vertical/inline）均正确渲染并符合视觉规范
- [ ] purpose 双语义切换正确（nav+links / menubar+roving），无 role 混用
- [ ] selectedKeys 遵循 value + on:change；openKeys 遵循 open + on:openChange
- [ ] 多级嵌套、ItemGroup、Divider 工作正常，inline 缩进步进生效
- [ ] commands 语义下完整键盘交互（方向键/Enter/Space/Esc/Home/End/typeahead）通过 APG
- [ ] roving tabindex 仅一个 tabindex=0；焦点关闭后正确返回触发器
- [ ] disabled 项两套语义下的可达性差异符合 APG
- [ ] 所有可见文案走 i18n，aria-label 有兜底 key
- [ ] reduced-motion / RTL / 对比度 AA 全部满足
- [ ] 危险操作项有 danger 视觉与文案规范，执行须二次确认承接
- [ ] 仅消费 Alias/Component Token，无写死值；暗色自动继承
- [ ] 提供 component.meta.ts，schema 与本 SPEC 一致
- [ ] gzip 体积与运行时关键场景满足 Perf Budget
- [ ] jest-axe 零 violation；单元/组件/键盘 E2E/视觉回归测试齐备且通过
