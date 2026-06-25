# SPEC · Grid
> 分类：basic · 阶段：M1
> 对标 Semi：Grid（Row / Col）

## 1. 概述

Grid 是基于 24 等分的响应式栅格布局系统，由 `Row`（行容器）与 `Col`（列单元）两个组件组成。它通过 Flexbox 实现，提供横向间距（gutter）、纵向对齐、子项排序、偏移、响应式断点等能力，是页面骨架与表单/卡片等区域的基础布局原语。

适用场景：
- 多列等宽/不等宽内容分栏（如仪表盘卡片、商品列表）。
- 表单标签与控件的对齐布局。
- 随视口变化自动改变列宽/换行的响应式页面。

不适用场景：复杂二维布局（建议直接用 CSS Grid 或后续的 `Space`/`Layout` 组件）；瀑布流（用专门的 Masonry 组件）。

边界：
- 默认按 24 栅格切分；`span=0` 视为 `display:none`（隐藏该列）。
- `Col` 必须是 `Row` 的直接子元素，否则 gutter 与对齐失效。
- 纯展示组件，无交互/键盘/焦点逻辑，因此**不需要 `@chenzy-design/core` 的 headless 层**（详见第 3 节）。

## 2. 设计语义

- **栅格数**：固定 24 列，便于 2/3/4/6/8/12 等多种均分。
- **gutter（间距）**：支持 `number`（仅水平）、`[number, number]`（水平+垂直）、以及响应式对象 `{ xs, sm, md, lg, xl, xxl }`。水平间距以 `margin` 负值 + `padding` 实现，避免首尾留白；垂直间距以 `row-gap` 实现。
- **断点语义**（与 Token 同源，移动优先，min-width 升序生效）：

  | 断点 | 含义 | min-width |
  |------|------|-----------|
  | xs | 手机竖屏 | 0 |
  | sm | 手机横屏/小平板 | 576px |
  | md | 平板 | 768px |
  | lg | 桌面 | 992px |
  | xl | 大桌面 | 1200px |
  | xxl | 超大屏 | 1600px |

- **对齐语义**：`align` 映射 `align-items`（顶/中/底/基线/拉伸），`justify` 映射 `justify-content`（起/末/中/间隔多种）。
- **方向/RTL**：使用逻辑书写映射，`offset/push/pull` 在 RTL 下自动镜像（用 `inset-inline` 而非 `left/right`）。
- 视觉无独立外观（无边框/背景/阴影），仅负责空间分配；不消费颜色 Token，只消费断点与间距 Token。

## 3. 分层实现

本组件为**纯布局展示组件，无交互、无键盘、无焦点、无 a11y 状态机**，因此**省略 `@chenzy-design/core` 的 `createGrid`**，全部实现放在 `@chenzy-design/svelte`。

- `@chenzy-design/svelte`
  - `Row.svelte`：渲染 `<div class="cd-row">`，计算 gutter 对应的负 margin / row-gap，通过 Svelte `setContext('cd-row-gutter', store)` 把水平 gutter 的一半下传给子 `Col`。
  - `Col.svelte`：渲染 `<div class="cd-col">`，`getContext` 读取 gutter store 设置自身水平 `padding`；解析 `span/offset/order/push/pull` 与响应式断点对象生成类名/内联 `--cd-col-*` 变量。
- **复用的唯一 core 原语**：`useId`（仅当使用方需要给 Row 生成稳定 id 时，可选；默认不生成）。`useFocusTrap/useRovingTabindex/useDismiss/useScrollLock/useLiveAnnouncer` **均不涉及**。
- **响应式实现策略**：优先用纯 CSS（媒体查询 + 预生成的 `cd-col--{bp}-{n}` 类）实现断点，**不依赖 JS `matchMedia`**，保证 SSR 一致且零运行时监听开销。仅当传入函数式 gutter（极少）时才在客户端订阅 `matchMedia`。
- **SSR**：无浏览器 API 依赖，首屏直出；`setContext/getContext` 在 SSR 与 CSR 行为一致。

## 4. API

### Props — Row

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| gutter | `number \| [number, number] \| Partial<Record<Breakpoint, number>> \| [Partial<Record<Breakpoint, number>>, Partial<Record<Breakpoint, number>>]` | `0` | 列间距，单值=水平，数组=`[水平,垂直]`，对象=响应式 |
| align | `'top' \| 'middle' \| 'bottom' \| 'baseline' \| 'stretch'` | `'top'` | 垂直对齐（align-items） |
| justify | `'start' \| 'end' \| 'center' \| 'space-between' \| 'space-around' \| 'space-evenly'` | `'start'` | 水平排布（justify-content） |
| wrap | `boolean` | `true` | 是否允许子项换行 |
| tag | `string` | `'div'` | 渲染的 HTML 标签 |
| class | `string` | `''` | 透传自定义类名 |
| style | `string` | `''` | 透传内联样式 |

### Props — Col

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| span | `number` | `undefined` | 占据栅格数 0–24，`0` 即隐藏 |
| offset | `number` | `0` | 左侧（逻辑起始侧）偏移格数 |
| order | `number` | `0` | flex order 排序 |
| push | `number` | `0` | 向逻辑末尾方向移动格数 |
| pull | `number` | `0` | 向逻辑起始方向移动格数 |
| flex | `string \| number` | `undefined` | 直接设置 flex 属性（如 `'1'`、`'0 0 200px'`、`'auto'`） |
| xs | `number \| ColConfig` | `undefined` | <576px 响应式配置 |
| sm | `number \| ColConfig` | `undefined` | ≥576px 响应式配置 |
| md | `number \| ColConfig` | `undefined` | ≥768px 响应式配置 |
| lg | `number \| ColConfig` | `undefined` | ≥992px 响应式配置 |
| xl | `number \| ColConfig` | `undefined` | ≥1200px 响应式配置 |
| xxl | `number \| ColConfig` | `undefined` | ≥1600px 响应式配置 |
| tag | `string` | `'div'` | 渲染的 HTML 标签 |
| class | `string` | `''` | 透传自定义类名 |
| style | `string` | `''` | 透传内联样式 |

> `ColConfig = { span?: number; offset?: number; order?: number; push?: number; pull?: number }`，断点 prop 传 `number` 等价于 `{ span }`。

### Events

| 组件 | Event | payload | 说明 |
|------|-------|---------|------|
| Row | `on:breakpoint` | `{ breakpoint: Breakpoint }` | （可选）当激活断点变化时触发，仅在使用函数式/对象 gutter 且开启监听时派发 |

> Grid 为布局组件，**无 `value/on:change`、无 `open/on:openChange`** 等受控/浮层 API。除上面可选的断点事件外不派发交互事件，符合一致性约定中“纯展示组件可省交互事件”。

### Slots

| 组件 | Slot | props | 说明 |
|------|------|-------|------|
| Row | default | — | 放置 `Col` 子元素（应为直接子节点） |
| Col | default | — | 列内任意内容 |

## 5. 主题 / Token 表

Grid 仅消费断点与间距类 Alias/Component Token，不写死像素值；断点为构建期常量（用于生成媒体查询）。

| Token | 层级 | 默认值 | 用途 |
|-------|------|--------|------|
| `--cd-breakpoint-sm` | Alias | `576px` | sm 断点（构建期常量，媒体查询用） |
| `--cd-breakpoint-md` | Alias | `768px` | md 断点 |
| `--cd-breakpoint-lg` | Alias | `992px` | lg 断点 |
| `--cd-breakpoint-xl` | Alias | `1200px` | xl 断点 |
| `--cd-breakpoint-xxl` | Alias | `1600px` | xxl 断点 |
| `--cd-grid-columns` | Component | `24` | 栅格总列数 |
| `--cd-grid-gutter-x` | Component | `0px` | 当前 Row 的水平 gutter（运行时由 Row 注入） |
| `--cd-grid-gutter-y` | Component | `0px` | 当前 Row 的垂直 gutter（运行时由 Row 注入） |
| `--cd-col-span` | Component | `auto` | 当前 Col 的 flex-basis 百分比基数（运行时注入） |

说明：
- 列宽百分比 = `span / var(--cd-grid-columns) * 100%`，构建期生成 `cd-col--{1..24}` 与 `cd-col--{bp}-{1..24}` 类。
- gutter 运行时通过内联 `style="--cd-grid-gutter-x:…"` 注入到 `.cd-row`，子 `.cd-col` 用 `padding-inline: calc(var(--cd-grid-gutter-x)/2)` 消费。
- 媒体查询断点因 CSS 限制无法直接用 `var()`，由设计 Token 在构建期注入为 SCSS/JS 常量，保证与 `--cd-breakpoint-*` 同源。

## 6. 无障碍 (a11y)

WCAG 2.1 AA。Grid 是**布局容器，本身不具语义**，遵循“布局不抢语义”原则：

- **role**：默认不设置任何 `role`，`.cd-row`/`.cd-col` 为透明 `<div>`，对辅助技术等同于无语义包裹层，由内部内容承担语义。
- **DOM 顺序 vs 视觉顺序**：`order/push/pull/offset` 只改变视觉位置，不改变 DOM/Tab 顺序。**注意点**：若用 `order` 大幅重排视觉顺序，会造成阅读/Tab 顺序与视觉不一致（违反 WCAG 1.3.2 Meaningful Sequence、2.4.3 Focus Order）。文档需警示：重排时应优先调整源码顺序，仅在视觉微调时使用 `order`。
- **键盘/焦点**：组件不接管焦点、不渲染可聚焦元素、不创建焦点陷阱；Tab 顺序完全由子内容决定。
- **隐藏列**：`span=0` 使用 `display:none`，对辅助技术与视觉同时移除，语义一致（不会出现“看不见但可读屏”的错配）。
- **对比度**：自身无文字/颜色，不涉及对比度；不得用 gutter 制造视觉分隔承担信息。
- **reduced-motion**：Grid 无动画/过渡，断点切换为瞬时布局变化，天然满足 `prefers-reduced-motion`，不添加任何 transition。
- **RTL**：使用 `padding-inline`、`margin-inline`、`inset-inline-start/end` 等逻辑属性；`offset/push/pull` 自动随 `dir="rtl"` 镜像，无需额外配置。
- APG：无对应复合控件模式（布局组件），故不适用某一具体 pattern。

## 7. 国际化 (i18n)

- Grid 不渲染任何用户可见文案，**无 i18n key**（payload 仅为断点枚举等非文案值）。
- 方向性由全局 `dir`（`ltr`/`rtl`）驱动，组件用逻辑属性自动适配，无需 i18n 文案参与。
- 不涉及日期/数字格式化，因此不使用 `Intl`。
- i18n key 清单：**无**（如未来加入开发期 warning，仅用于 dev 控制台，不进入 i18n 资源）。

## 8. 文案

- 用户可见文案：**无**。
- 开发期（DEV 构建）告警文案（仅控制台，英文固定，不计入 i18n）：
  - `Col` 不在 `Row` 内：`[cd-grid] <Col> should be a direct child of <Row>; gutter and alignment may not apply.`
  - `span` 越界：`[cd-grid] Col "span" expects 0–24, received {n}; value clamped.`
  - 同时使用 `flex` 与 `span`：`[cd-grid] Col "flex" overrides "span"; remove one to avoid ambiguity.`
- 危险操作文案：**无**（Grid 不涉及删除/不可逆等危险操作）。

## 9. 性能 (Perf Budget)

| 维度 | 预算 | 说明 |
|------|------|------|
| JS gzip（Row+Col 合计） | ≤ 2.25 KB | 纯类名/样式计算，无 core、无依赖 |
| CSS gzip（含 24×6 断点类） | ≤ 2.5 KB | 预生成栅格类，建议可按需 tree-shake 未用断点 |
| 首次渲染（100 个 Col） | < 4 ms | 仅类名拼接 + context 读取 |
| gutter 更新重渲染 | < 1 ms/行 | 仅更新 Row 上 2 个 CSS 变量，子项靠 `var()` 自动生效，不重算子节点 |
| 运行时监听 | 0（默认） | 默认纯 CSS 断点，无 `matchMedia`；仅函数式 gutter 时每视口最多 6 个 listener |

策略：
- **不需要虚拟化**（布局组件，列数由业务决定；大量列由业务侧 List/虚拟列表处理）。
- **不需要 destroyOnClose / 惰性渲染**（无浮层、无显隐生命周期）。
- gutter 变更走 CSS 变量而非重排子树，避免 N 次子组件 diff。
- 响应式默认零 JS，SSR/CSR 一致，避免 hydration 抖动。

## 10. AI 元数据

提供 `component.meta.ts`，内容覆盖：

- `name: 'Grid'`，`exports: ['Row', 'Col']`，`category: 'basic'`，`stage: 'M1'`，`semiEquivalent: 'Grid'`。
- `props`：Row/Col 全部 Props 的名称、类型、默认值、枚举值、可响应式标记（`responsive: true` for span/offset/order/push/pull）。
- `slots`：`Row.default`、`Col.default`。
- `events`：`Row.breakpoint`（payload schema）。
- `tokens`：第 5 节全部 Token 引用清单。
- `a11y`：`{ hasRole: false, focusable: false, notes: 'layout-only; order may break reading order' }`。
- `examples`：常见用法片段（等宽三列、响应式 `xs/md/lg`、gutter 数组、offset）。
- `constraints`：`['Col must be direct child of Row', 'span range 0-24', 'flex overrides span']`。
- `relatedComponents: ['Space', 'Layout']`。

## 11. 测试

- **单元测试（Vitest + @testing-library/svelte）**
  - `span=N` 生成正确百分比类/变量；`span=0` 渲染 `display:none`。
  - `offset/order/push/pull` 生成对应类与逻辑属性，且在 `dir="rtl"` 下镜像。
  - gutter：number / `[x,y]` / 响应式对象 三种形态分别注入正确 `--cd-grid-gutter-x/y` 与 Col padding。
  - `align`/`justify`/`wrap` 映射到正确 flex 样式。
  - context：`Col` 正确读取 `Row` 下发的 gutter；脱离 `Row` 时 DEV 告警触发。
  - `flex` 与 `span` 同设时 `flex` 优先并告警。
- **响应式测试**：模拟各断点（媒体查询匹配/jsdom matchMedia mock），断言激活的列宽类与 `on:breakpoint` 派发。
- **SSR 测试**：`render` 到字符串，断言无 `matchMedia` 调用、类名与 CSR 一致（hydration 无 mismatch）。
- **视觉回归（Playwright/Chromatic）**：24 栅格基准、各断点切换、RTL 镜像、gutter 负 margin 不溢出容器。
- **a11y 测试（axe）**：布局容器不引入冗余 role/landmark；`order` 重排场景给出阅读顺序告警快照（文档级断言）。
- **类型测试（tsd/svelte-check）**：`ColConfig`、响应式 gutter 联合类型、断点 prop 重载校验。

## 12. 验收标准 checklist

- [ ] Row/Col 实现 24 栅格，`span/offset/order/push/pull/flex` 全部生效且边界（0、24、越界 clamp）正确。
- [ ] gutter 支持 number、`[x,y]`、响应式对象三种形态，水平负 margin 不导致容器横向溢出。
- [ ] 六个断点（xs–xxl）按 min-width 移动优先级联，纯 CSS 实现，SSR/CSR 输出一致、无 hydration mismatch。
- [ ] `align`/`justify`/`wrap` 正确映射 flex 行为。
- [ ] 全部尺寸/间距/列宽来自 `--cd-*` Token 与构建期断点常量，**无硬编码像素值**。
- [ ] 类名遵循 `cd-row` / `cd-col` / `cd-col--{n}` / `cd-col--{bp}-{n}` 等 BEM-like 约定。
- [ ] RTL 下 `offset/push/pull` 与 padding/margin 使用逻辑属性正确镜像。
- [ ] a11y：无冗余 role，焦点/Tab 顺序不被布局接管；文档警示 `order` 对阅读顺序的影响；满足 reduced-motion（无动画）。
- [ ] i18n：确认无用户可见文案；DEV 告警仅输出到控制台、不进入 i18n 资源。
- [ ] 提供 `component.meta.ts` 且字段（props/slots/events/tokens/a11y/examples/constraints）完整。
- [ ] Perf：JS ≤2.25KB、CSS ≤2.5KB（gzip），默认零运行时监听；gutter 更新仅改 CSS 变量不触发子树重渲染。
- [ ] 单元 / 响应式 / SSR / 视觉回归 / a11y / 类型 测试全部通过。
