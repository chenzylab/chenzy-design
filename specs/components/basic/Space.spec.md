# SPEC · Space
> 分类：basic · 阶段：M1
> 对标 Semi：Space

## 1. 概述

Space 是一个**间距布局容器**，用于在一组相邻子元素之间施加统一、可控的间隔，避免在业务代码中散落 `margin`/`gap` 等魔法值。它是 Button 组、Tag 组、表单内联控件、卡片操作区等场景的首选编排原语。

核心能力：
- 方向 `vertical`：水平横排或垂直竖排排列子元素。
- 间距 `spacing`：预设档位（`loose` / `medium` / `tight`）或自定义数值，支持横纵双值 `[h, v]`。
- 对齐 `align`：交叉轴对齐（start/end/center/baseline）。
- 自动换行 `wrap`：横向排布超出容器宽度时换行，并保证换行后行间距与列间距一致。

边界与非目标：Space 只负责**一维线性排布 + 间距**，不承担二维网格（用 Grid/Row-Col）、不承担弹性比例分配（用业务自行 flex），不承担滚动容器职责。它是纯展示组件（无交互/无键盘/无焦点逻辑），因此**不引入 `@chenzy-design/core` 的 headless 层**。

## 2. 设计语义

- **间距语义化**：`spacing` 默认提供三档语义值，映射到全局间距 Token，保证全站间距节奏一致（对齐 Semi）：
  - `tight` → `--cd-spacing-space-tight`（紧凑，密集信息区，8px，组件默认值）
  - `medium` → `--cd-spacing-space-medium`（中等，16px）
  - `loose` → `--cd-spacing-space-loose`（宽松，分区/卡片操作区，24px）
- **class 驱动 gap/align（对齐 Semi）**：档位 gap 与 align 均由 class 驱动（如 `cd-space-tight-horizontal` / `cd-space-align-center`），不写 inline style；仅 `number` / 数组中的 `number` 元素走 inline `column-gap` / `row-gap`。`gap` 同时作用于主轴与换行后的交叉轴，天然解决换行行距问题，避免负 margin hack。
- **方向与对齐解耦**：`vertical` 决定主轴方向（横向 row / 竖向 column），`align` 控制交叉轴（`align-items`），不暴露主轴对齐（`justify-content`），主轴分布交由业务用普通容器处理，保持组件职责单一。
- **零包裹副作用**：Space 恒 `inline-flex`（对齐 Semi），随内容收缩；根元素恒 `<div>`，子元素不被强制包裹额外 DOM。
- **响应密度**：通过 `--cd-spacing-space-*` Token 可被密度主题（紧凑模式）整体下调，无需逐组件改 props。

## 3. 分层实现

| 层 | 职责 | 说明 |
| --- | --- | --- |
| `@chenzy-design/core` | 无 | Space 是纯展示组件，无交互/键盘/a11y 状态逻辑，**不提供 `createSpace`**，不复用任何 core 原语（useFocusTrap/useRovingTabindex 等均不需要）。 |
| `@chenzy-design/svelte` | 全部 | `Space.svelte` 负责：把 `spacing`/`align`/`vertical`/`wrap` 解析为 class（档位）+ inline gap（number），拼装 flex 样式，透传根节点属性（`class`/`style`/`...rest`）。 |

实现要点：
- 间距解析（对齐 Semi index.tsx）：`spacing` 为字符串档位 → 命中 `cd-space-{tight|medium|loose}-horizontal/-vertical` class（gap 值消费 `--cd-spacing-space-*` Token）；为 `number` → inline `column-gap`/`row-gap` = `${n}px`；为 `[h, v]` → 元素为档位走 class、为 number 走对应 inline gap。`isWrap = wrap && vertical ? false : wrap`。
- SSR 安全：无 `window`/`document` 访问，可直接服务端渲染。

## 4. API

### Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `vertical` | `boolean` | `false` | 是否竖向排列（对齐 Semi）。`false` 横向 row，`true` 竖向 column。 |
| `spacing` | `'tight' \| 'medium' \| 'loose' \| number \| [SpacingItem, SpacingItem]` | `'tight'` | 间距档位或自定义值；数组为 `[水平, 垂直]`，`spacing[0]` 控制 `column-gap`、`spacing[1]` 控制 `row-gap`。 |
| `align` | `'start' \| 'end' \| 'center' \| 'baseline'` | `'center'` | 交叉轴对齐，映射 `align-items`。 |
| `wrap` | `boolean` | `false` | 横向自动换行（`vertical` 时强制不换行）。 |
| `class` | `string` | `''` | 透传到根节点的自定义类名（对齐 Semi `className`）。 |
| `style` | `string` | `''` | 透传到根节点的内联样式。 |
| `...rest` | — | — | 其余原生属性（`data-*` / `aria-*` / `on*`）透传到根 `<div>`（对齐 Semi `getDataAttr`）。 |

> 说明：Space 是纯布局容器，无受控输入、无浮层，故不涉及 `value/open/status/size` 等一致性 API；`size` 概念由 `spacing` 表达。

### Events

| 名称 | payload | 说明 |
| --- | --- | --- |
| —（无组件自有事件） | — | Space 不产生语义事件。原生 DOM 事件（如 `on:click`）通过 `...$$restProps` 透传到根节点。 |

### Slots

| 名称 | props | 说明 |
| --- | --- | --- |
| `default` / `children` | — | 需要被施加间距的一组子元素。 |

## 5. 主题 / Token

仅消费 Alias / Component 级 Token，禁止写死像素值（数值型 `spacing` 由用户显式传入，属用户输入而非组件硬编码）。

| Component Token | 取值（引用 Alias/Global） | 用途 |
| --- | --- | --- |
| `--cd-spacing-space-tight` | `var(--cd-spacing-tight)` = 8px（对齐 Semi） | `tight` 档位间距（默认档） |
| `--cd-spacing-space-medium` | `var(--cd-spacing-base)` = 16px（对齐 Semi） | `medium` 档位间距 |
| `--cd-spacing-space-loose` | `var(--cd-spacing-loose)` = 24px（对齐 Semi） | `loose` 档位间距 |

> 仅这 3 个 token（对齐 Semi variables.scss，无中间层）。`number` / 数组数值间距由用户显式传入，走 inline `column-gap`/`row-gap`，不经 token。

紧凑密度主题下，可统一重定义 `--cd-spacing-space-tight/medium/loose` 实现全站间距收缩，组件无需改动。

## 6. 无障碍（WCAG 2.1 AA）

Space 是**视觉布局容器**，本身不引入交互语义，但需保证不破坏可访问性：

- **role**：根 `div` 不带 role（纯展示，`role="none"` 隐含）。对齐 Semi，组件不提供 `tag`/`role` prop；当语义上是一组导航或列表时，由业务在外层包裹语义容器，或经 `...rest` 透传 `role`/`aria-label` 到根节点。
- **键盘交互**：无（容器不可聚焦，`tabindex` 不设置）。子元素自身的 Tab 顺序由 DOM 源顺序决定——Space **不重排 DOM**（仅用 flex 视觉排列），故视觉顺序 = DOM 顺序 = 阅读/Tab 顺序，避免焦点错乱。
- **焦点管理**：不接管焦点，无焦点陷阱。
- **对比度**：容器自身无内置视觉描边/背景，不引入非文本对比要求；子内容对比度由业务保证。
- **reduced-motion**：组件无动画，天然满足 `prefers-reduced-motion`。
- **RTL**：使用逻辑属性 `column-gap`/`row-gap` 与 flex（受 `direction: rtl` 影响自动镜像），主轴方向随文档方向翻转，无需额外处理；不使用物理 `margin-left/right`。

## 7. 国际化

- Space 无任何用户可见文案（间距/对齐为视觉属性），**无 i18n key**。
- 子内容由业务提供，其文案的 i18n 由调用方负责，Space 不介入。
- 不涉及日期/数字格式化，故无 `Intl` 使用。

## 8. 文案

- 组件自身无内置文案。
- **危险操作文案**：不适用（Space 不触发任何操作，无危险动作）。
- 约束建议（content-guidelines）：当 Space 用于编排操作按钮组时，按钮文案需遵循动词优先、简短一致原则，主操作居左/右由业务约定——此为使用建议，非组件文案。

## 9. 性能（Perf Budget）

| 维度 | 预算 | 说明 |
| --- | --- | --- |
| gzip 体积 | ≤ 1.2 KB | 纯展示组件，无 core 依赖，仅样式 + 轻量 props 解析。 |
| 运行时 | O(1) | 走 `gap` 快路径，不遍历子节点，零额外 DOM 包裹。 |
| 重排成本 | 低 | 仅 flex 布局，`spacing` 变更只改 CSS 变量，不触发组件重渲染逻辑。 |

- **虚拟化**：不需要（Space 不管理大列表数据；超长列表请用 List/虚拟列表组件，勿用 Space 堆叠数百节点）。
- **惰性渲染 / destroyOnClose**：不适用（无显隐状态）。
- **优化项**：不对子节点做任何 JS 遍历，纯 CSS `gap` 实现，确保零运行时开销。

## 10. AI 元数据

提供 `component.meta.ts`，内容包含：

- `name: 'Space'`，`category: 'basic'`，`stage: 'M1'`，`semiEquivalent: 'Space'`。
- `tags: ['layout', 'spacing', 'flex', 'container', 'inline', 'stack']`。
- `whenToUse`：一组相邻元素需统一间距时（按钮组、标签组、内联表单控件、卡片操作区）。
- `whenNotToUse`：二维网格布局（用 Grid）、需要比例分配（用 flex/Grid）、超长列表（用虚拟列表）。
- `propsSchema`：映射第 4 节 Props 的类型与默认值，供 AI 生成正确用法。
- `examples`：横向按钮组、竖向表单（`vertical`）、`wrap` 标签云。

## 11. 测试

- **单元测试（Vitest）**：
  - `spacing` 各档位（tight/medium/loose）正确命中 `cd-space-{档位}-horizontal/-vertical` class。
  - `spacing` 为 `number` / `[number, number]` 时分别写入 inline `column-gap`/`row-gap`；数组中档位元素走 class、number 元素走 inline。
  - `vertical` 切换正确命中 `cd-space-horizontal`/`cd-space-vertical`（`flex-direction`）。
  - `align` 命中 `cd-space-align-{align}`（映射 `align-items`）。
  - `wrap` 命中 `cd-space-wrap`（`vertical` 时强制不换行）。
  - 根恒 `<div>`，不产生额外包裹 DOM（纯 `gap` 快路径）。
  - `class`/`style`/`...rest`（`data-*`/`aria-*`）正确透传到根节点。
- **可访问性测试（axe）**：默认渲染无 a11y 违规；DOM 顺序与视觉顺序一致性断言。
- **视觉回归（Storybook + 截图）**：横向/竖向、三档间距、wrap 换行行距一致、RTL 镜像。
- **SSR 测试**：服务端渲染输出稳定、无 `window` 访问报错。

## 12. 验收标准 checklist

- [ ] 档位间距全部来自 `--cd-spacing-space-*` Token，组件源码无写死像素（数值型仅来自用户输入）。
- [ ] 类名对齐 Semi：`cd-space`、`cd-space-vertical` / `cd-space-horizontal` / `cd-space-wrap` / `cd-space-align-{align}` / `cd-space-{档位}-horizontal|-vertical`。
- [ ] `vertical` / `spacing` / `align` / `wrap` 行为符合第 4 节定义；根恒 `<div>`，无 `block`/`tag` 超集。
- [ ] `spacing` 支持档位、单数值、`[h, v]` 双值三种形态，且 wrap 时行列间距正确。
- [ ] 走纯 `gap` 快路径，零额外 DOM 包裹。
- [ ] DOM 源顺序 = 视觉顺序 = Tab 顺序，组件不重排 DOM。
- [ ] RTL 下主轴方向与间距自动镜像（使用逻辑/flex 方案，无物理 margin）。
- [ ] 无 a11y 违规（axe 通过）。
- [ ] SSR 安全，无浏览器 API 访问。
- [ ] gzip 体积 ≤ 1.2 KB，无 `@chenzy-design/core` 依赖。
- [ ] 提供 `component.meta.ts`，字段完整（name/category/stage/tags/whenToUse/propsSchema/examples）。
- [ ] 无 i18n key（确认无用户可见硬编码文案）。
- [ ] 单元 / a11y / 视觉回归 / SSR 测试全部通过。
