# SPEC · Collapse
> 分类：show · 阶段：M4
> 对标 Semi：Collapse

## 1. 概述

Collapse（折叠面板）用于把一组内容区域分组收纳，通过点击标题在「展开 / 收起」之间切换，节省垂直空间并组织信息层级。适用于设置页分组、FAQ、详情折叠、表单分段等场景。

核心能力：
- 多面板独立展开（默认）与手风琴模式（accordion，同一时刻至多一个面板展开）。
- 受控 / 非受控两种用法：`activeKey` + `on:change`（受控）或 `defaultActiveKey`（非受控）。
- 标题区域支持自定义额外内容（`extra`）、自定义展开图标、左/右图标位置。
- 支持禁用单个面板、隐藏箭头、内容惰性渲染（`lazyRender`）与收起销毁（`destroyOnHide`）。
- 完整键盘导航与 WAI-ARIA Accordion 语义。

边界与非目标：
- 不负责嵌套树形展开（用 Tree）、不负责单条目展开行（用 Table 展开行）、不负责浮层（用 Popover/Dropdown）。Collapse 是同级分组的就地展开。

## 2. 设计语义

- **层级关系**：Collapse 是容器，Collapse.Panel 是子项。每个 Panel = 一个可点击的 Header（控制器）+ 一个可折叠的 Content（区域）。
- **触发与反馈**：整个 Header 可点击（命中区域 ≥ 44px 高），点击切换 expanded 状态；箭头图标随状态旋转 0deg → 90deg（或 90 → 180，取决于位置），提供方向性反馈。
- **手风琴语义**：`accordion=true` 时是单选语义（互斥），等价于一组 radio 行为；默认是多选语义（每个 Panel 独立 toggle）。
- **动效**：展开/收起使用高度过渡（max-height 或 measured height transition），时长走 token，遵循 reduced-motion 直接切换无动画。
- **状态视觉**：default / hover / active(展开) / disabled。disabled Header 降低不透明度且不可聚焦触发。
- **密度**：尺寸 small | default | large 影响 Header 内边距、字号、箭头大小与 Content 内边距。
- **边框模式**：默认带分隔线（borderless 可去除），可选 `bordered` 整体描边卡片化。

## 3. 分层实现

属于有键盘 / 焦点 / a11y 逻辑的复合控件，按 headless + 渲染分层：

- **@chenzy-design/core — `createCollapse(config)`**
  - 管理 `activeKey` 状态机（受控/非受控归一化）、accordion 互斥逻辑、`toggle(key)` / `expand(key)` / `collapse(key)` 动作。
  - 复用原语：
    - `useRovingTabindex`：在多个 Header 间用 ↑/↓/Home/End 移动焦点（roving tabindex，仅当前 Header `tabindex=0`）。
    - `useId`：为每个 Panel 生成 Header `id` 与 Content `id`，建立 `aria-controls` / `aria-labelledby` 关联。
  - 产出 `getRootProps` / `getHeaderProps(key)` / `getContentProps(key)` 属性 getter，含全部 aria/事件绑定，框架无关。
  - 不引入 `useFocusTrap`/`useScrollLock`/`useDismiss`（非浮层、非模态）。`useLiveAnnouncer` 可选：默认不播报（视觉箭头已足够），暴露开关。
- **@chenzy-design/svelte — `<Collapse>` / `<Collapse.Panel>`**
  - 消费 core 的 getter，负责 DOM 渲染、高度过渡动画（Svelte transition / measured height）、slot 投影、token 化样式。
  - 通过 Svelte context 在 `<Collapse>` 与 `<Collapse.Panel>` 间传递 store 与 config，Panel 自动从 context 注册自身 key。
  - 实现 `lazyRender`（首次展开才渲染 Content）与 `destroyOnHide`（收起即卸载）。

## 4. API

### Props — Collapse

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `activeKey` | `string \| string[]` | — | 受控展开项 key。accordion 模式建议传 string，多选传 string[] |
| `defaultActiveKey` | `string \| string[]` | — | 非受控初始展开项 |
| `accordion` | `boolean` | `false` | 手风琴模式，至多展开一个面板 |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | 尺寸 |
| `expandIconPosition` | `'left' \| 'right'` | `'right'` | 展开箭头位置 |
| `bordered` | `boolean` | `true` | 是否显示分隔线/外边框 |
| `keepDOM` | `boolean` | `true` | 收起时是否保留 Content DOM（false 等价 destroyOnHide） |
| `lazyRender` | `boolean` | `false` | 首次展开前不渲染 Content |
| `motion` | `boolean` | `true` | 是否启用展开/收起动画 |
| `disabled` | `boolean` | `false` | 整体禁用所有面板 |
| `class` / `style` | `string` | — | 透传根节点 |

### Props — Collapse.Panel

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `itemKey` | `string` | 必填 | 面板唯一标识 |
| `header` | `string \| Snippet` | — | 标题，也可用 `header` slot |
| `extra` | `string \| Snippet` | — | 标题右侧额外内容（点击默认不触发 toggle，需 stopPropagation） |
| `showArrow` | `boolean` | `true` | 是否显示展开箭头 |
| `disabled` | `boolean` | `false` | 禁用此面板 |
| `reCalcKey` | `string \| number` | — | 变更时强制重新测量 Content 高度 |
| `class` / `style` | `string` | — | 透传 Panel 节点 |

### Events

| 事件 | 载荷（detail） | 触发时机 |
|---|---|---|
| `on:change` | `{ activeKey: string \| string[], key: string, expanded: boolean }` | 任一面板展开/收起后（受控同步源） |
| `on:expand` | `{ key: string }` | 某面板被展开 |
| `on:collapse` | `{ key: string }` | 某面板被收起 |
| `on:headerClick` | `{ key: string, event: MouseEvent }` | Header 被点击（含 disabled 拦截前，可用于埋点） |

### Slots / Snippets

| 名称 | 作用域参数 | 说明 |
|---|---|---|
| `default`（Collapse） | — | 放置一组 `<Collapse.Panel>` |
| `default`（Panel） | — | 面板内容主体 |
| `header`（Panel） | `{ expanded, disabled }` | 自定义标题区 |
| `extra`（Panel） | `{ expanded }` | 标题右侧额外操作（如开关、按钮） |
| `expandIcon`（Panel/Collapse） | `{ expanded, disabled }` | 自定义展开图标，覆盖默认旋转箭头 |

## 5. 主题 / Token 表

仅消费 Alias / Component 级 token，组件级前缀 `--cd-collapse-*`，禁止写死值。

| Component Token | 回退（Alias） | 用途 |
|---|---|---|
| `--cd-collapse-color-text` | `--cd-color-text-0` | Header 标题文字 |
| `--cd-collapse-color-text-disabled` | `--cd-color-text-2` | 禁用面板文字 |
| `--cd-collapse-color-bg` | `--cd-color-bg-0` | 面板背景 |
| `--cd-collapse-color-bg-hover` | `--cd-color-fill-0` | Header hover 背景 |
| `--cd-collapse-color-border` | `--cd-color-border` | 面板分隔线/边框 |
| `--cd-collapse-color-arrow` | `--cd-color-text-2` | 箭头图标颜色 |
| `--cd-collapse-color-focus` | `--cd-color-primary` | Header 聚焦环颜色 |
| `--cd-collapse-header-padding-y` | `--cd-spacing-base` | Header 垂直内边距（随 size 变体覆盖） |
| `--cd-collapse-header-padding-x` | `--cd-spacing-base` | Header 水平内边距 |
| `--cd-collapse-header-font-size` | `--cd-font-size-regular` | Header 字号 |
| `--cd-collapse-content-padding` | `--cd-spacing-base` | Content 内边距 |
| `--cd-collapse-radius` | `--cd-radius-medium` | bordered 模式圆角 |
| `--cd-collapse-motion-duration` | `--cd-motion-duration-mid` | 展开/收起时长 |
| `--cd-collapse-motion-easing` | `--cd-motion-easing-standard` | 展开/收起缓动 |

尺寸变体（small/large）通过覆盖 `--cd-collapse-header-padding-*`、`--cd-collapse-header-font-size`、`--cd-collapse-content-padding` 实现。对比度：文字与背景满足 ≥ 4.5:1，箭头作为图标 ≥ 3:1。

## 6. 无障碍（WCAG 2.1 AA · WAI-ARIA APG Accordion）

- **结构 role**：
  - Header 触发器渲染为 `<button>`（原生可聚焦/回车），外层包裹元素带 `role="heading"` + `aria-level`（默认 3，可由 `headingLevel` 配置）。
  - Header `button` 设 `aria-expanded={expanded}`、`aria-controls={contentId}`、`aria-disabled`（disabled 时）。
  - Content 容器 `role="region"`、`aria-labelledby={headerId}`、收起态 `hidden`（keepDOM 时用 hidden 而非仅视觉隐藏）。
- **键盘交互**（APG）：
  - `Enter` / `Space`：切换当前 Header 的展开态。
  - `↓` / `↑`：在 Header 间移动焦点（roving tabindex）。
  - `Home` / `End`：聚焦第一个 / 最后一个 Header。
  - `Tab`：从 Header 进入展开的 Content 内可聚焦元素，再 Tab 离开组件，符合自然 DOM 顺序。
- **焦点管理**：roving tabindex，仅活动 Header `tabindex=0`，其余 `-1`；展开/收起不抢焦点。焦点环用 `:focus-visible` + `--cd-collapse-color-focus`，对比度 ≥ 3:1。
- **手风琴注意**：accordion 模式下不应禁止收起最后一个展开项（APG 允许全部收起；若业务需保持至少一个展开，由 `accordion` 配合校验，默认允许全收起）。
- **reduced-motion**：`@media (prefers-reduced-motion: reduce)` 时禁用高度过渡与箭头旋转动画，直接切换。
- **RTL**：`expandIconPosition` 与 padding 使用逻辑属性（`padding-inline`），箭头旋转方向在 RTL 下镜像；`dir` 由根继承。
- **disabled**：disabled Header `aria-disabled=true` 且不进入 roving 焦点序列，鼠标点击无效。

## 7. 国际化

- 组件本身视觉文案极少；用户可见文案均由使用方通过 `header`/`extra` slot 提供，零硬编码。
- 内部仅 a11y 辅助文案需要 i18n（用于可选 `useLiveAnnouncer` 与图标 `aria-label`）：

| i18n key | 默认（en） | 说明 |
|---|---|---|
| `Collapse.expand` | `Expand` | 箭头按钮无文字时的 aria-label（折叠态） |
| `Collapse.collapse` | `Collapse` | 箭头按钮 aria-label（展开态） |
| `Collapse.expandedAnnounce` | `{title} expanded` | 可选 live 播报 |
| `Collapse.collapsedAnnounce` | `{title} collapsed` | 可选 live 播报 |

- 日期/数字：组件不渲染日期/数字；若使用方在 header 放置计数等，自行用 `Intl`。

## 8. 文案

- 遵循 content-guidelines：Header 标题用名词短语，简洁、句首大写（en）/ 无句末标点。
- 箭头方向语义统一：折叠态箭头指向「可展开」方向（→ 或 ↓），展开态旋转表示「已打开」。
- **危险操作文案（单列）**：Collapse 内 `extra` 区可能放置删除/移除等危险操作。此类按钮文案须明确对象（如「删除该分组」而非「删除」），并由 `extra` 内组件自行 `stopPropagation`，避免误触发展开/收起。危险按钮使用 `--cd-color-danger`，并建议二次确认（Popconfirm），点击不应连带切换面板状态。

## 9. 性能（Perf Budget）

| 指标 | 预算 | 说明 |
|---|---|---|
| core `createCollapse` gzip | ≤ 1.2 KB | 仅状态机 + getter，复用 roving/useId |
| svelte `<Collapse>+<Panel>` gzip | ≤ 3.5 KB | 含动画与样式 |
| 首屏渲染（20 面板，全收起） | ≤ 8 ms | Header-only，Content 视 lazyRender 跳过 |
| 单次 toggle 交互延迟 | ≤ 16 ms（1 帧） | 高度过渡用 transform/height，避免布局抖动 |
| 100+ 面板场景 | 建议外层分页/虚拟化 | 组件本身不内建虚拟化 |

策略：
- `lazyRender`：长内容/重组件面板首次展开前不挂载，降首屏成本。
- `keepDOM=false`（destroyOnHide）：收起即卸载 Content，适合内容含表单/媒体的重面板，牺牲再次展开的重建成本。
- 高度过渡优先 measured-height 一次性测量，避免每帧 reflow；`motion=false` 完全跳过动画。
- 不内建虚拟化；超大列表交由父层分页或与 List 虚拟化组合。

## 10. AI 元数据

提供 `component.meta.ts`，包含：
- `name: 'Collapse'`、`category: 'show'`、`stage: 'M4'`、`semiEquivalent: 'Collapse'`。
- `subComponents: ['Collapse.Panel']`。
- `props` / `events` / `slots` 的机器可读 schema（类型、默认值、枚举、是否受控、required）。
- `a11y`: `{ pattern: 'accordion', apg: true, rolesProvided: ['heading','button','region'] }`。
- `tokens`: 上述 `--cd-collapse-*` 列表及 Alias 回退映射。
- `recipes`: 常见用法片段（基础、手风琴、自定义图标、extra 操作、lazyRender）。
- `antiPatterns`: 如「用 Collapse 实现导航菜单」「在 extra 不 stopPropagation 导致误触发」。

## 11. 测试

- **单元（core）**：受控/非受控 activeKey 归一化；accordion 互斥（展开 B 自动收起 A）；toggle/expand/collapse 动作；disabled 不响应；getter 输出 aria 关联正确（id 匹配）。
- **组件（svelte）**：点击 Header toggle；extra 点击不触发 toggle；lazyRender 首次展开才挂载；keepDOM=false 收起卸载；size/expandIconPosition 类名正确。
- **键盘**：Enter/Space 切换、↑↓ 移动焦点、Home/End、roving tabindex（仅一个 tabindex=0）。
- **a11y**：axe 无违规；`aria-expanded`/`aria-controls`/`aria-labelledby`/`role=region`/`hidden` 断言；prefers-reduced-motion 下无动画。
- **视觉回归**：四态（default/hover/active/disabled）× 三尺寸 × LTR/RTL × bordered/borderless 快照。
- **i18n**：切换 locale 后箭头 aria-label 更新。

## 12. 验收标准 checklist

- [ ] core `createCollapse` 与 svelte 渲染分层，复用 `useRovingTabindex`/`useId`，无浮层原语误引入。
- [ ] 受控（`activeKey`+`on:change`）与非受控（`defaultActiveKey`）均工作，事件 detail 含 key/expanded。
- [ ] accordion 模式互斥正确，允许全部收起。
- [ ] 键盘交互完整：Enter/Space/↑/↓/Home/End，roving tabindex 仅活动项 `tabindex=0`。
- [ ] ARIA 完整：`role=heading`+`aria-level`、button `aria-expanded`/`aria-controls`、region `aria-labelledby`、收起态 `hidden`。
- [ ] disabled 面板不可聚焦触发，`aria-disabled` 正确。
- [ ] reduced-motion 关闭动画；RTL 下箭头与内边距镜像（逻辑属性）。
- [ ] 仅消费 Alias/Component token，全部 `--cd-collapse-*` 有 Alias 回退，无写死值。
- [ ] 对比度：文字 ≥ 4.5:1，箭头/焦点环 ≥ 3:1。
- [ ] `lazyRender` 与 `keepDOM=false`（destroyOnHide）行为正确。
- [ ] 用户可见文案零硬编码；a11y 文案走 i18n key（`Collapse.*`）。
- [ ] extra 区危险操作文案明确并 stopPropagation，不连带切换面板。
- [ ] Perf Budget 达标（core ≤ 1.2KB、svelte ≤ 3.5KB gzip，toggle ≤ 1 帧）。
- [ ] 提供 `component.meta.ts`，schema/tokens/recipes/antiPatterns 完整。
- [ ] 测试覆盖单元/组件/键盘/a11y(axe)/视觉回归/i18n，CI 通过。
