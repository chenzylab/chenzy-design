# SPEC · Descriptions
> 分类：show · 阶段：M4
> 对标 Semi：Descriptions

## 1. 概述

Descriptions（描述列表）用于成组地展示只读的「字段—值」键值对，常见于详情页、信息卡片、订单/用户/资源详情等场景。它把多条 `label: value` 数据以规整的网格排布，支持横向（label 与 value 同行）与纵向（label 在 value 上方）两种行内布局，并可通过 `column` 控制每行展示的字段数，自动换行。

定位：纯展示型、信息密度优先的语义容器。不承担编辑能力（编辑场景应组合 Form），不承担可交互筛选（应组合 Table/Tag）。

与相邻组件的边界：
- 与 **Table** 区别：Descriptions 是「单个实体的多字段」，Table 是「多个实体的同结构行」。
- 与 **List** 区别：List 是同构条目流，Descriptions 是异构命名字段。
- 与 **Form** 区别：Form 可写、含校验；Descriptions 只读、无 status 语义。

典型用法：通过 `data` 数组声明式传入，或通过 `Descriptions.Item` 子组件式声明。两种写法等价，渲染走同一套布局引擎。

## 2. 设计语义

- **结构语义**：一个 Descriptions = 标题区（可选）+ 网格区。网格区由若干「项」构成，每项是 `term`（label）+ `detail`（value）的语义对。HTML 语义层面优先映射到 `<dl>/<dt>/<dd>`，使描述列表语义对辅助技术天然可读。
- **布局模型**：
  - `row` 模式：每项渲染为带边框的表格行（类似 Semi `bordered`/table 风格），label 与 value 在水平方向对齐成列，整组共享列宽，强调对齐与可扫读。
  - `inline`（默认）模式：项在主轴方向流式排布，按 `column` 折行，label 与 value 紧凑相邻，强调密度。
  - `align`：`left | center | right | justify`，控制 label 与 value 的相对对齐（plain 列对齐）。
- **尺寸**：`small | default | large` 影响行高、字号、内边距与（row 模式下）单元格 padding。
- **视觉语义**：label 用次要文本色 `--cd-color-text-2`，value 用主文本色 `--cd-color-text-0`，分隔符（`:`）由 token 控制可隐藏；row 模式边框用 `--cd-color-border`。
- **空值占位**：value 为 `null/undefined/''` 时渲染占位符（默认 `-`），避免布局塌陷，占位符文案可 i18n。
- **响应式**：`column` 支持响应式对象（`{ xs, sm, md, lg, xl, xxl }`），随容器/视口断点变更每行字段数。

## 3. 分层实现

Descriptions 以展示为主，**无键盘交互、无焦点管理、无浮层**，因此 core 层极薄甚至可省。采用「core 仅做布局规约 + 纯函数」，渲染全在 svelte。

- **@chenzy-design/core · createDescriptions（可选薄层）**
  - 不持有交互状态。仅导出纯函数与类型：
    - `normalizeItems(data | slottedItems): NormalizedItem[]`：统一 `data` 写法与 `Descriptions.Item` 写法。
    - `resolveColumn(column, breakpoint): number`：解析响应式 `column`。
    - `chunkRows(items, column): NormalizedItem[][]`：按列数切分成行（供 row/inline 计算 span）。
    - `resolvePlaceholder(value, emptyText)`：空值归一。
  - 复用原语：仅 `useId`（为 `<dl>` 与 aria 关联生成稳定 id）。**不**使用 useFocusTrap/useRovingTabindex/useDismiss/useScrollLock/useLiveAnnouncer（无交互、无浮层、无动态播报需求）。
- **@chenzy-design/svelte · Descriptions / Descriptions.Item**
  - `Descriptions.svelte`：消费 context（title/size/align/column/layout/colon/emptyText/bordered），用 ResizeObserver（仅当 `column` 为响应式对象时惰性启用）解析断点，渲染 `<dl>` 网格。
  - `Descriptions.Item.svelte`：通过 `setContext/getContext` 向父注册自身（label/span/className），不自行渲染外层结构，由父统一布局以保证列对齐。
  - 断点监听用 `matchMedia`（媒体查询）优先，回退 ResizeObserver；静态 `column` 时零监听开销。

## 4. API

### Props（Descriptions）

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `data` | `Array<{ key?: string; label: Snippet \| string; value: Snippet \| unknown; span?: number; className?: string }>` | `[]` | 声明式数据源；与 `Descriptions.Item` 子组件二选一或合并 |
| `layout` | `'inline' \| 'row'` | `'inline'` | 行布局：inline 流式紧凑，row 表格化对齐 |
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | 单项内 label 与 value 的方向（vertical 即 label 在上） |
| `column` | `number \| Partial<Record<'xs'\|'sm'\|'md'\|'lg'\|'xl'\|'xxl', number>>` | `3` | 每行字段数，支持响应式断点对象 |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | 尺寸，影响行高/字号/内边距 |
| `align` | `'left' \| 'center' \| 'right' \| 'justify'` | `'left'` | label/value 对齐方式 |
| `bordered` | `boolean` | `false` | 是否显示边框（row 模式常配合使用） |
| `colon` | `boolean` | `true` | label 后是否显示分隔符 `:`（inline/horizontal 生效） |
| `title` | `Snippet \| string` | `undefined` | 整组标题 |
| `emptyText` | `string` | i18n `Descriptions.empty` (`-`) | 空值占位文案 |
| `class` | `string` | `undefined` | 根节点自定义类名 |
| `style` | `string` | `undefined` | 根节点行内样式 |

### Props（Descriptions.Item）

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `label` | `Snippet \| string` | `undefined` | 该项的 term/label |
| `span` | `number` | `1` | 跨列数（受当前行剩余列数约束，超出自动截断换行） |
| `key` | `string` | 自动生成 | 列表 key |
| `class` | `string` | `undefined` | 该项自定义类名 |

### Events

| Event | Payload | 触发时机 | 说明 |
|---|---|---|---|
| `on:breakpointChange` | `{ breakpoint: 'xs'\|...\|'xxl'; column: number }` | 响应式 `column` 解析出的断点变化时 | 仅当 `column` 为响应式对象时触发；用于消费方联动布局 |

> 说明：Descriptions 为只读展示组件，无 `value/on:change`、无 `open/on:openChange`、无 `status` 校验态——不强加无意义的一致性 API。

### Slots / Snippets

| Slot / Snippet | 参数 | 说明 |
|---|---|---|
| `default` | — | 放置 `Descriptions.Item` 子组件（子组件式写法） |
| `title` | — | 自定义标题区，优先级高于 `title` prop |
| `item.label`（Item 内 `label`） | — | 自定义单项 label |
| `item.default`（Item 内 `default`） | — | 单项 value 内容 |

## 5. 主题 / Token 表

仅消费 Alias，并暴露 Component 级 `--cd-descriptions-*`（默认值引用 Alias，不写死原子值）。

| Component Token | 引用 Alias | 用途 |
|---|---|---|
| `--cd-descriptions-color-label` | `--cd-color-text-2` | label 文本色 |
| `--cd-descriptions-color-value` | `--cd-color-text-0` | value 文本色 |
| `--cd-descriptions-color-title` | `--cd-color-text-0` | 标题文本色 |
| `--cd-descriptions-color-border` | `--cd-color-border` | row/bordered 边框与分隔线 |
| `--cd-descriptions-bg-label` | `--cd-color-bg-1` | row 模式 label 单元格底色 |
| `--cd-descriptions-bg-value` | `--cd-color-bg-0` | row 模式 value 单元格底色 |
| `--cd-descriptions-font-size` | `--cd-font-size-1`（default） | 字号（small/large 切换映射） |
| `--cd-descriptions-line-height` | `--cd-line-height-1` | 行高 |
| `--cd-descriptions-gap-row` | `--cd-spacing-3` | inline 模式行间距 |
| `--cd-descriptions-gap-col` | `--cd-spacing-5` | inline 模式列间距 |
| `--cd-descriptions-padding-cell` | `--cd-spacing-2`（default） | row 模式单元格内边距 |
| `--cd-descriptions-colon-margin` | `--cd-spacing-1` | 分隔符与 label 间距 |
| `--cd-descriptions-empty-color` | `--cd-color-text-3` | 空值占位符颜色 |

尺寸映射：`small` 用 `--cd-font-size-0` / `--cd-spacing-1`，`large` 用 `--cd-font-size-2` / `--cd-spacing-3`，均经 Component token 间接引用，禁止硬编码。

## 6. 无障碍（WCAG 2.1 AA）

- **语义结构**：根节点渲染为 `<dl class="cd-descriptions__list">`；每项 label 为 `<dt>`，value 为 `<dd>`，天然表达「描述列表」语义，无需额外 ARIA。
- **row 模式**：若以 table 视觉呈现，DOM 仍保持 `<dl>` 为主；若确需 `<table>` 排版，则补 `role="presentation"`（纯布局表格）或为真表格补 `<th scope="row">`——默认实现采用 CSS Grid + `<dl>`，避免 layout table 的可访问性陷阱。
- **标题关联**：`title` 渲染为带 `id` 的元素，`<dl>` 通过 `aria-labelledby` 指向它（`useId` 生成 id）。
- **分隔符**：`:` 由 CSS `::after` 注入，不进入可访问性树，避免读屏冗余朗读。
- **空值占位**：占位符 `-` 应使其语义可懂——为 `<dd>` 提供视觉占位但保持文本可读（不使用纯图标）。
- **对比度**：label 用 `--cd-color-text-2` 须满足正文 AA（≥4.5:1）；空值占位 `--cd-color-text-3` 仅装饰性，确保不传达关键信息，否则提升对比度。
- **键盘/焦点**：组件不可交互，无 tab 序参与，不抢占焦点。若 value 内嵌链接/按钮，其可达性由内容自身保证。
- **reduced-motion**：组件无动效；响应式列数变化为瞬时重排，不加过渡动画，天然满足 `prefers-reduced-motion`。
- **RTL**：依赖逻辑属性（`margin-inline-start`、`text-align: start`）；分隔符与 label/value 顺序随 `dir="rtl"` 自动镜像；`align` 的 left/right 映射为 start/end。

## 7. 国际化

- 用户可见文案零硬编码，统一走 i18n provider。
- i18n key：

| Key | 默认（en / zh） | 用途 |
|---|---|---|
| `Descriptions.empty` | `-` / `-` | 空值占位符 |
| `Descriptions.colon` | `:` / `：` | 分隔符（中文用全角冒号，由 locale 决定） |

- **冒号本地化**：中文 locale 默认全角 `：`，西文为半角 `:`，由 `Descriptions.colon` 按 locale 提供，避免硬编码标点。
- **日期/数字**：组件不格式化业务值，但文档与示例约定 value 中的日期用 `Intl.DateTimeFormat`、数字/货币用 `Intl.NumberFormat` 由调用方格式化后传入；提供 recipe 片段。
- **RTL**：随 i18n 方向切换，见第 6 节。

## 8. 文案

遵循 content-guidelines：
- **label**：名词短语，简洁、句首大写（英文 Title/Sentence case 按规范统一），不带结尾标点（分隔符由组件加）。如 `Created at`、`Owner`、`Status`。
- **value**：完整、可读；长文本不截断由布局换行处理（如需省略由调用方加 Tooltip）。
- **空值**：统一占位符 `-`，不要用 `N/A`/`无`/空白混用，保证可扫读一致性。
- **标题**：概括实体，名词短语，如 `User profile`。
- **危险操作文案**：Descriptions 为只读展示组件，**不包含任何危险/破坏性操作**，故无破坏性文案。若调用方在 value 槽内嵌入删除等操作按钮，相关危险文案应遵循该按钮组件的 content-guidelines，不在本组件范畴。

## 9. 性能（Perf Budget）

| 指标 | 预算 | 说明 |
|---|---|---|
| svelte 组件 gzip | ≤ 2.8 KB | Descriptions + Item，纯布局，无重逻辑 |
| core gzip（可选层） | ≤ 0.6 KB | normalizeItems/resolveColumn/chunkRows 纯函数 |
| 首次渲染（50 项） | < 4 ms | 单次同步渲染，无异步 |
| 大数据（500 项） | < 25 ms | 线性 DOM；建议调用方分组/折叠超大数据 |
| 响应式重排（断点切换） | < 2 ms | 仅重算 column 与 grid-template，无逐项重建 |
| 监听开销（静态 column） | 0 | 不挂 matchMedia/ResizeObserver |

策略：
- **无需虚拟化**：Descriptions 面向「单实体有限字段」（通常 < 50），不引入虚拟滚动；超大字段集应由业务分段。
- **惰性监听**：仅 `column` 为响应式对象时注册 `matchMedia` 监听，组件销毁时清理。
- **无 destroyOnClose**：组件无显隐态，不涉及该选项。
- **Snippet 渲染**：label/value Snippet 惰性求值，避免不可见内容计算。

## 10. AI 元数据

提供 `component.meta.ts`，内容覆盖：
- `name: 'Descriptions'`，`category: 'show'`，`stage: 'M4'`，`semiEquivalent: 'Descriptions'`。
- `summary`：「成组展示只读字段—值键值对，支持 inline/row 布局与响应式列数」。
- `whenToUse` / `whenNotToUse`：单实体多字段详情用本组件；多实体用 Table；可编辑用 Form。
- `props` 元数据（类型、默认值、枚举、是否响应式标记），与第 4 节同源生成。
- `slots`/`subComponents`（`Descriptions.Item`）描述。
- `a11y`：`landmark: none`，`semantics: 'dl/dt/dd'`，`interactive: false`。
- `tokens`：导出 `--cd-descriptions-*` 列表供主题工具消费。
- `i18nKeys`：`['Descriptions.empty','Descriptions.colon']`。
- `examples`：声明式 `data` 写法、子组件写法、row+bordered、响应式 column 四个片段。
- `aiHints`：「value 中的日期/数字请预先用 Intl 格式化后传入」「空值交给组件占位，勿传 'N/A'」。

## 11. 测试

- **单元（core 纯函数）**：`normalizeItems` 合并两种写法、`resolveColumn` 各断点取值与回退、`chunkRows` 的 span 截断与换行、`resolvePlaceholder` 对 `null/undefined/''/0/false` 的判定（`0`/`false` 不应被当空）。
- **组件渲染（svelte testing-library）**：
  - 渲染出 `<dl>/<dt>/<dd>` 结构与正确数量。
  - `column` 数值控制每行项数；`span` 跨列正确。
  - inline / row、horizontal / vertical 四种组合的类名与结构。
  - `colon` 开关、`align`、`size` 类名生效。
  - 空 value 渲染占位符；`0`/`false` 不被占位。
  - `title` 与 `aria-labelledby` 关联正确。
- **响应式**：mock `matchMedia`，断点变化触发 `on:breakpointChange` 且 column 更新；静态 column 不注册监听（spy 校验）。
- **a11y（axe）**：默认与 bordered/row 模式 0 violations；`::after` 分隔符不被读屏纳入（快照断言无 `:` 文本节点）。
- **i18n**：切换 locale，占位符与冒号文案随之变化（zh 全角）。
- **RTL**：`dir="rtl"` 下逻辑属性与对齐镜像快照。
- **视觉回归**：四布局组合 × 三尺寸 × bordered 的 Chromatic/Playwright 截图基线。

## 12. 验收标准 Checklist

- [ ] 支持 `data` 声明式与 `Descriptions.Item` 子组件两种写法，渲染结果一致。
- [ ] `layout`（inline/row）、`direction`（horizontal/vertical）、`column`、`span`、`size`、`align`、`bordered`、`colon` 全部按 API 表生效。
- [ ] `column` 支持响应式断点对象，断点切换触发 `on:breakpointChange`；静态 column 零监听开销。
- [ ] DOM 语义为 `<dl>/<dt>/<dd>`；`title` 经 `aria-labelledby`（`useId`）关联；axe 0 violations。
- [ ] 分隔符由 CSS `::after` 注入，不进入可访问性树；空值占位 `-`，`0`/`false` 不被占位。
- [ ] 所有可见文案走 i18n（`Descriptions.empty`、`Descriptions.colon`），中文冒号为全角；无硬编码文案。
- [ ] 仅消费 Alias/Component token，暴露 `--cd-descriptions-*`，无写死颜色/尺寸值。
- [ ] RTL 下使用逻辑属性，布局与对齐正确镜像。
- [ ] 满足 Perf Budget：svelte gzip ≤ 2.8 KB、core ≤ 0.6 KB；50 项首渲 < 4 ms。
- [ ] 提供 `component.meta.ts`，字段与第 4 节 API 同源，含 examples 与 aiHints。
- [ ] core 仅含纯函数与 `useId`，无 focus/dismiss/scroll-lock/announcer 等无关原语依赖。
- [ ] 单元 / 组件 / 响应式 / a11y / i18n / RTL / 视觉回归测试全部通过。
