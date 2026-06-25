# SPEC · Divider
> 分类：basic · 阶段：M1
> 对标 Semi：Divider

## 1. 概述

Divider（分割线）用于在内容之间建立视觉与语义上的分隔，是页面排版与信息分组的基础原子组件。它本身不承载交互逻辑，属于纯展示组件。

核心能力：
- **方向**：水平（`horizontal`，默认，块级占满宽度）/ 垂直（`vertical`，行内占满父级行高，常用于按钮组、文字操作区之间）。
- **带文字**：水平分割线支持嵌入文字/图标内容，并控制文字位置（左/中/右）。
- **样式变体**：实线 / 虚线（dashed）。
- **留白**：可控制分隔线两侧的外边距间距（`margin`）。

典型场景：卡片内段落分组、列表项之间的细线、表单分区、`a` 操作 `b` 操作 之间的竖向分隔、带「更多」标题的区块分隔。

非目标：不处理折叠/展开、不承载点击交互（如需可点击分组请用其他组件）。

## 2. 设计语义

- **层级关系**：Divider 表达「同级内容的弱分隔」。它比留白更强、比卡片边框更弱，用于在不引入容器的前提下切分信息流。
- **视觉规范**：
  - 线宽默认 1px（消费 `--cd-divider-thickness`），颜色使用 Alias `--cd-color-border`，保持与表单/卡片边框一致的语义。
  - 带文字时，文字使用次级文本色 `--cd-color-text-2`，两侧线条自动收缩为文字让位。
  - 虚线样式用于「临时/可选分隔」语义，实线用于「稳定结构分隔」。
- **方向语义**：
  - 水平：`display:flex`（带文字时）或 `block`（border-top 实现纯线），高度为线宽，宽度撑满。
  - 垂直：`display:inline-block`，宽度为线宽，高度继承父级 line-height（默认 `1em`），通过 `vertical-align:middle` 与文字对齐。
- **间距语义**：水平方向 margin 作用于 `margin-block`，垂直方向作用于 `margin-inline`，由 `--cd-divider-spacing` 统一控制。
- **暗色模式**：仅依赖 `--cd-color-border` / `--cd-color-text-2` 的 Alias 翻转，组件无需额外逻辑。

## 3. 分层实现

Divider 为**纯展示组件，省略 core**：无键盘交互、无焦点管理、无浮层、无状态机，不需要 `create<Name>` headless 逻辑。

- **@chenzy-design/core**：不提供 `createDivider`。唯一可选复用原语为 `useId`——当 `Divider` 带文字且需要被其它元素 `aria-describedby` 引用时，可由 svelte 层按需调用生成稳定 id；默认不引入。
- **@chenzy-design/svelte**：`Divider.svelte` 仅负责：
  - 根据 `layout` 选择渲染结构（纯线 vs flex 三段式 `线 / 文字 / 线`）。
  - 计算 BEM class 与 CSS 变量映射。
  - 当 `layout="horizontal"` 且存在 `children`/`slot` 时渲染文字段，按 `align` 控制两侧 flex 比例。
  - 透传 `class`/`style`/`...$$restProps` 至根元素，便于消费者覆盖间距。
- **渲染选型**：默认根元素为 `<div role="separator">`；当作为列表项分隔时建议消费者用 `<li role="separator">`（通过文档说明，不在组件内分支）。无运行时副作用，SSR 安全。

## 4. API

### Props

| 名称 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `layout` | `'horizontal' \| 'vertical'` | `'horizontal'` | 分割线方向。垂直仅用于行内场景，不支持带文字。 |
| `dashed` | `boolean` | `false` | 是否为虚线样式。 |
| `align` | `'left' \| 'center' \| 'right'` | `'center'` | 文字/插槽内容的对齐位置，仅 `horizontal` 且有内容时生效。 |
| `margin` | `string \| number` | `undefined` | 自定义分隔线主轴外边距。number 视为 px；string 原样作为 CSS 长度。覆盖 `--cd-divider-spacing`。 |
| `thickness` | `number` | `1` | 线宽（px），映射到 `--cd-divider-thickness`。 |
| `plain` | `boolean` | `true` | 文字是否为「普通」字重（非加粗）。`false` 时文字加粗，用于标题型分隔。 |
| `class` | `string` | `''` | 透传到根元素的附加类名。 |
| `style` | `string` | `''` | 透传到根元素的内联样式。 |

> 一致性说明：Divider 无受控输入、无浮层，故不涉及 `value/on:change`、`open/on:openChange`；不提供 `size`（用 `thickness`/`margin` 表达密度）；无校验态 `status`（纯展示，无输入语义）。

### Events

| 名称 | 载荷类型 | 说明 |
|---|---|---|
| — | — | Divider 为纯展示组件，**不派发任何事件**。如需可点击分隔，请组合其他组件。原生事件可通过 `...$$restProps` 透传（如 `on:click`），但非推荐用法。 |

### Slots

| 名称 | 作用域参数 | 说明 |
|---|---|---|
| `default` | — | 水平分割线中央/侧边的内容（文字、图标）。仅 `layout="horizontal"` 时渲染；`vertical` 时忽略。无内容时渲染为纯线。 |

## 5. 主题 / Token 表

仅消费 Alias / Component 级 Token，禁止写死值。

| Component Token | 回退（Alias / Global） | 用途 |
|---|---|---|
| `--cd-divider-color` | `--cd-color-border` | 线条颜色（实线/虚线通用）。 |
| `--cd-divider-thickness` | `1px`（Global 原子，经 `thickness` prop 覆盖） | 线宽（水平=高度，垂直=宽度）。 |
| `--cd-divider-text-color` | `--cd-color-text-2` | 带文字时文字颜色。 |
| `--cd-divider-text-font-size` | `--cd-font-size-2`（Alias） | 带文字时字号。 |
| `--cd-divider-text-padding` | `--cd-spacing-3`（Alias） | 文字与两侧线条的间距。 |
| `--cd-divider-spacing` | 水平 `--cd-spacing-4`（block）/ 垂直 `--cd-spacing-2`（inline） | 分隔线主轴外边距，可被 `margin` prop 覆盖。 |
| `--cd-divider-dash-pattern` | `4px 2px`（Global） | 虚线 dash 长度/间隙（映射 `border-style:dashed` 或 `background` repeating-gradient）。 |

类名约定：
- 根：`cd-divider`
- 修饰：`cd-divider--horizontal` / `cd-divider--vertical` / `cd-divider--dashed` / `cd-divider--with-text` / `cd-divider--align-left|center|right` / `cd-divider--bold`（`plain=false`）
- 元素：`cd-divider__text`（文字容器）

## 6. 无障碍（WCAG 2.1 AA）

- **role**：根元素 `role="separator"`。垂直分隔线额外设置 `aria-orientation="vertical"`（水平为默认 `horizontal`，可省略但建议显式）。
- **带文字时的语义**：当 `separator` 含可见文字，文字作为分隔的可访问名称随元素读出；为确保读屏正确朗读，文字容器不额外加 `aria-hidden`。若文字纯装饰（如仅图标），消费者应自行提供 `aria-label`。
- **键盘交互**：无。Divider 不可聚焦（无 `tabindex`），不参与 Tab 序列，符合非交互分隔元素规范。
- **焦点管理**：不涉及（无可聚焦子元素）。若插槽内放入交互元素（不推荐），其语义由该元素自身负责。
- **对比度**：线条颜色 `--cd-color-border` 属于非文本图形元素，需对相邻背景满足 **≥ 3:1**（WCAG 1.4.11 Non-text Contrast）。文字 `--cd-color-text-2` 对背景需满足 **≥ 4.5:1**（正文）。Token 体系须保证两者达标。
- **reduced-motion**：组件无动画，天然满足 `prefers-reduced-motion`，无需额外处理。
- **RTL**：使用逻辑属性（`margin-block`/`margin-inline`/`padding-inline`）。`align="left|right"` 在 RTL 下随书写方向自动镜像（内部映射为 `inline-start`/`inline-end`）；`center` 不受影响。

## 7. 国际化

- 组件**自身无内置可见文案**——所有文字均由使用者通过 `default` slot 提供，因此组件层零硬编码。
- 提供的 i18n key（供消费者在常见场景复用，及组件 demo / 文档使用）：

| i18n key | 默认（en） | 说明 |
|---|---|---|
| `Divider.more` | `More` | 「更多/展开」型标题分隔示例文案。 |
| `Divider.or` | `OR` | 表单「或」分隔（如第三方登录之间）常用文案。 |

- **日期/数字**：Divider 不渲染日期或数字，无 `Intl` 需求。若消费者在 slot 中放入数字/日期，应自行使用 `Intl.NumberFormat` / `Intl.DateTimeFormat`。

## 8. 文案

- 遵循 content-guidelines：分隔文字应**简短**（建议 ≤ 12 字符 / 1–2 词），多为名词或连接词（`OR`、`更多`、章节名）。
- 大小写：连接词类（`OR`）可全大写以示弱化；标题类按句首大写。
- 避免在分隔线文字中放整句或带标点的描述。
- **危险操作文案**：Divider 不涉及任何危险/破坏性操作，无此类文案。（本节按约定保留，标注为空。）

## 9. 性能（Perf Budget）

| 维度 | 预算 / 目标 | 说明 |
|---|---|---|
| gzip 体积（svelte） | ≤ 1.55 KB | 单文件、无 core 依赖、无运行时库；逻辑仅 class 计算。 |
| core 依赖 | 0 KB | 纯展示组件，不引入 `@chenzy-design/core`。 |
| 首次渲染 | < 0.1 ms / 实例 | 单个 DOM 节点（纯线）或 3 节点（带文字 flex）。 |
| 大批量渲染 | 1000 条列表分隔无明显开销 | 无状态、无监听、无副作用；建议消费者将列表项与分隔合并由父组件 `{#each}` 渲染。 |
| 重渲染 | 仅 props 变化触发 class/style 重算 | 无内部 `$:` 派生副作用、无 store 订阅。 |

- **虚拟化**：组件自身不需要；若用于超长列表，由外层列表/虚拟滚动容器负责。
- **惰性渲染 / destroyOnClose**：不适用（无浮层、无显隐状态）。
- **优化点**：垂直分隔优先用 `border-inline` / `width` 实现而非额外伪元素，避免布局抖动。

## 10. AI 元数据

提供 `component.meta.ts`，内容覆盖：

- `name: 'Divider'`、`category: 'basic'`、`stage: 'M1'`、`semiEquivalent: 'Divider'`。
- `tags: ['divider', 'separator', '分割线', '分隔线', 'hr', 'vertical', 'horizontal']`，便于 AI 检索。
- `props` schema（类型、默认值、枚举值、是否必填）与本 SPEC 第 4 节同步。
- `slots: ['default']`、`events: []`。
- `a11y: { role: 'separator', focusable: false, ariaOrientation: 'horizontal|vertical' }`。
- `examples`：纯水平线、带文字（左/中/右）、虚线、垂直分隔（按钮组之间）、`OR` 表单分隔——每个含最小代码片段供 AI 复制。
- `antiPatterns`：垂直方向传 slot 文字、用 Divider 替代列表语义、写死颜色绕过 Token。
- `tokens`：导出第 5 节 Component Token 清单供主题工具消费。

## 11. 测试

- **单元 / 渲染（Vitest + @testing-library/svelte）**：
  - 默认渲染根元素含 `cd-divider cd-divider--horizontal` 且 `role="separator"`。
  - `layout="vertical"` 渲染 `--vertical` 修饰类且 `aria-orientation="vertical"`。
  - `dashed` 切换 `--dashed` 类。
  - 有 slot 内容时渲染 `cd-divider__text` 与 `--with-text`；无内容时不渲染文字节点。
  - `align` 三值分别映射 `--align-left|center|right`。
  - `plain=false` 渲染 `--bold`。
  - `margin`（number → px，string 原样）/`thickness` 正确写入内联 CSS 变量。
  - `class`/`style`/restProps 正确透传。
- **a11y（axe-core / vitest-axe）**：纯线、带文字、垂直三种形态均零违规；验证 `role="separator"` 与对比度断言（视觉回归辅助）。
- **视觉回归（Playwright / Storybook snapshot）**：水平/垂直 × 实线/虚线 × 三种 align × 明暗主题 × LTR/RTL 的快照矩阵。
- **SSR**：服务端渲染输出 HTML 与客户端 hydration 一致，无 mismatch 警告。

## 12. 验收标准 checklist

- [ ] 支持 `horizontal`（默认）与 `vertical` 两种方向，方向正确反映为 class 与 `aria-orientation`。
- [ ] 水平方向支持 `default` slot 文字，`align` 左/中/右生效；垂直方向忽略文字。
- [ ] 支持 `dashed` 虚线与 `plain` 字重切换。
- [ ] `margin` / `thickness` 通过 CSS 变量覆盖，且仅消费 Alias/Component Token，无任何写死颜色/尺寸。
- [ ] 根元素 `role="separator"`，不可聚焦、不入 Tab 序。
- [ ] 线条对比度 ≥ 3:1、文字对比度 ≥ 4.5:1，暗色模式经 Alias 自动适配。
- [ ] 使用逻辑属性，RTL 下 align 与间距自动镜像。
- [ ] 组件零硬编码可见文案；提供 `Divider.more` / `Divider.or` i18n key。
- [ ] 纯展示实现，不引入 `@chenzy-design/core`；gzip ≤ 1.55 KB。
- [ ] 提供 `component.meta.ts`，props/slots/events/tokens 与 SPEC 同步。
- [ ] 单元、a11y（axe 零违规）、视觉回归（明暗 + RTL 矩阵）、SSR hydration 测试全部通过。
- [ ] 类名遵循 `cd-divider` BEM-like 约定，CSS 变量遵循 `--cd-divider-*` 前缀。
