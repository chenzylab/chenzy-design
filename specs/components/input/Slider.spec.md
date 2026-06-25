# SPEC · Slider
> 分类：input · 阶段：M2
> 对标 Semi：Slider

## 1. 概述

Slider 是用于在连续或离散区间内选择数值的输入控件。用户通过拖拽滑块手柄、点击轨道或键盘操作来选择一个值（单滑块）或一段范围（双滑块）。典型场景包括音量/亮度调节、价格区间筛选、图片裁剪比例、表单中的数值范围输入等。

核心能力：
- **单/双滑块**：`range=false` 返回单值 `number`；`range=true` 返回 `[number, number]` 区间，两个手柄可交叉时自动钳制顺序。
- **离散与连续**：`step` 控制步长；`step=null` 配合 `marks` 实现仅能停靠在刻度点上的非等距离散模式。
- **刻度与标记**：`marks` 渲染刻度点与文案标签；`dots` 在每个 step 处渲染圆点。
- **方向**：水平（默认）与垂直 `vertical`，垂直时高度由 `height` 控制。
- **数值提示**：拖拽/聚焦时通过 Tooltip 显示当前值，支持 `tipFormatter` 自定义、`alwaysShowTip` 常驻。
- **交互辅助**：`included`（高亮区段是否填充）、`disabled`、`marks` 点击跳转、轨道点击定位。
- **键盘可达**：方向键步进、PageUp/PageDown 大步进、Home/End 跳到端点，完全无障碍。

它与 InputNumber 互补：Slider 适合粗调与可视化区间，常与 InputNumber 联动做精确输入。

## 2. 设计语义

- **轨道 (rail)**：底色为 `--cd-color-fill-0`（中性填充），表示完整可选区间，高度/宽度为 `--cd-slider-rail-size`（默认 4px）。
- **已选轨道 (track)**：从起点到当前值的填充段，色值 `--cd-color-primary`，语义上表达「已达到的量」。`included=false` 时不渲染，仅显示手柄（用于多独立标记场景）。
- **手柄 (handle)**：圆形可拖拽元素，直径 `--cd-slider-handle-size`（默认 14px），白底 + `--cd-color-primary` 边框；hover 放大并加投影；聚焦时显示 `--cd-focus-ring`；active（拖拽中）边框加粗。
- **刻度点 (dot)**：轨道上的小圆点，位于激活段内为实心（primary），段外为虚色（border）。
- **刻度标签 (mark)**：刻度下方/侧方文案，色值 `--cd-color-text-2`，命中区间内可加重为 `--cd-color-text-0`。
- **状态层级**：default → hover（手柄放大 + tooltip）→ active（拖拽）→ focus（focus ring）→ disabled（整体 60% 透明 + cursor not-allowed + 灰阶轨道）。
- **尺寸**：small / default / large 影响 rail 厚度与 handle 直径，保持触控目标 ≥ 24×24px（AA 命中区扩展）。
- **方向语义**：水平向右递增、垂直向上递增（符合直觉），RTL 下水平反转为向左递增。

## 3. 分层实现

**@chenzy-design/core — `createSlider`**（headless，承载全部交互/键盘/a11y 状态）：
- 输入：`value`、`min`、`max`、`step`、`marks`、`range`、`vertical`、`disabled`、`rtl`、回调 `onChange`/`onChangeComplete`。
- 输出：派生几何（`valueToPercent`/`percentToValue`）、手柄属性 getter（`getHandleProps(index)` 注入 role/aria/tabindex/事件）、轨道属性 getter（`getTrackProps`/`getRailProps`）、拖拽控制器（pointer 捕获、`pointermove` 节流 via rAF、step 吸附、范围钳制与交叉处理）、键盘 reducer（方向/Page/Home/End）。
- 复用原语：`useId`（生成手柄与 tooltip 关联 id）、`useLiveAnnouncer`（拖拽时播报当前值，节流）。不需要 `useFocusTrap`/`useScrollLock`/`useDismiss`（无浮层捕获，Tooltip 显隐由 Tooltip 组件负责）。Roving tabindex 不适用——双滑块两个 handle 均应可 Tab 聚焦，各自 `tabindex=0`。
- 数值精度：内部以整数 step 索引计算后再映射回值，规避浮点误差（如 0.1 累加）。

**@chenzy-design/svelte — `Slider.svelte`**（渲染）：
- 消费 core store，渲染 rail / track / handles / dots / marks；集成 `Tooltip` 组件显示 `tipFormatter(value)`。
- 处理 SSR（百分比布局，无需测量即可首屏渲染）；`ResizeObserver` 仅在垂直或容器尺寸变化时用于 pointer 命中换算。
- 透传 `class`/`style`，暴露 `--cd-slider-*` 自定义属性钩子。

纯几何与拖拽逻辑下沉 core 便于跨框架复用；Svelte 层只做声明式渲染与事件绑定。

## 4. API

### Props

| 名称 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `value` | `number \| [number, number]` | — | 受控值；`range` 时为二元组。配合 `on:change` 使用 |
| `defaultValue` | `number \| [number, number]` | `min` / `[min,min]` | 非受控初始值 |
| `min` | `number` | `0` | 最小值 |
| `max` | `number` | `100` | 最大值 |
| `step` | `number \| null` | `1` | 步长；为 `null` 时仅可停靠在 `marks` 点 |
| `range` | `boolean` | `false` | 双滑块区间模式 |
| `marks` | `Record<number, string \| { label, style }>` | — | 刻度标记，键为数值，值为标签 |
| `dots` | `boolean` | `false` | 是否在每个 step 处显示圆点 |
| `included` | `boolean` | `true` | 是否填充已选轨道段（`false` 仅显示手柄） |
| `vertical` | `boolean` | `false` | 垂直方向 |
| `height` | `number` | `200` | 垂直模式下的高度（px） |
| `disabled` | `boolean` | `false` | 禁用 |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | 尺寸 |
| `tooltipVisible` | `boolean \| undefined` | `undefined` | 强制控制 Tooltip 显隐（受控） |
| `alwaysShowTip` | `boolean` | `false` | 始终显示数值 Tooltip |
| `tipFormatter` | `(value: number) => string \| null` | `String` | 自定义提示文案；返回 `null` 隐藏 |
| `getAriaValueText` | `(value: number, index: number) => string` | — | 自定义 `aria-valuetext`（如带单位） |
| `marks` 点击 | `clickable` `boolean` | `true` | 是否允许点击 marks/轨道跳转 |
| `verticalReverse` | `boolean` | `false` | 垂直时反向（顶部为 min） |
| `railStyle` / `handleStyle` | `string` | — | 透传内联样式 |
| `id` | `string` | 自动生成 | 根 id，关联表单 label |
| `status` | `'default' \| 'warning' \| 'error'` | `'default'` | 校验态（轨道色调提示，用于表单集成） |

### Events

| 事件 | Payload | 说明 |
|---|---|---|
| `on:change` | `number \| [number, number]` | 拖拽/键盘/点击导致值变化时（实时，每步触发） |
| `on:changeComplete` | `number \| [number, number]` | 拖拽结束（pointerup）或键盘操作落定时触发，适合做请求节流 |
| `on:input` | `number \| [number, number]` | 与 change 同步的低级输入信号（表单绑定用） |
| `on:focus` | `{ index: number }` | 手柄获得焦点，附带手柄索引（0/1） |
| `on:blur` | `{ index: number }` | 手柄失焦 |

### Slots

| Slot | 作用域 props | 说明 |
|---|---|---|
| `mark` | `{ value, label, active }` | 自定义单个刻度标签渲染 |
| `handle` | `{ value, index, dragging, focused }` | 自定义手柄内容（如带数字徽标） |
| `tooltip` | `{ value, index }` | 自定义 Tooltip 内部内容 |

## 5. 主题 / Token 表

| Component Token | 取值来源 (Alias) | 说明 |
|---|---|---|
| `--cd-slider-rail-size` | `4px`（small `3px` / large `6px`） | 轨道厚度 |
| `--cd-slider-rail-color` | `--cd-color-fill-0` | 未选轨道底色 |
| `--cd-slider-track-color` | `--cd-color-primary` | 已选轨道色 |
| `--cd-slider-track-color-hover` | `--cd-color-primary-hover` | hover 已选轨道 |
| `--cd-slider-handle-size` | `14px`（small `12px` / large `16px`） | 手柄直径 |
| `--cd-slider-handle-bg` | `--cd-color-bg-0` | 手柄底色 |
| `--cd-slider-handle-border` | `--cd-color-primary` | 手柄边框色 |
| `--cd-slider-handle-border-width` | `2px` | 手柄边框宽度 |
| `--cd-slider-handle-shadow-hover` | `--cd-shadow-1` | hover 投影 |
| `--cd-slider-handle-focus-ring` | `--cd-focus-ring` | 聚焦环 |
| `--cd-slider-dot-color` | `--cd-color-border` | 段外刻度点色 |
| `--cd-slider-dot-color-active` | `--cd-color-primary` | 段内刻度点色 |
| `--cd-slider-mark-color` | `--cd-color-text-2` | 刻度标签色 |
| `--cd-slider-mark-color-active` | `--cd-color-text-0` | 命中刻度标签色 |
| `--cd-slider-disabled-track-color` | `--cd-color-text-3` | 禁用态已选轨道 |
| `--cd-slider-radius` | `--cd-radius-full` | 轨道与手柄圆角 |
| `--cd-slider-status-warning` | `--cd-color-warning` | 校验 warning 态轨道 |
| `--cd-slider-status-error` | `--cd-color-danger` | 校验 error 态轨道 |

约束：组件内禁止写死颜色/尺寸，全部经由上述 Component Token 间接引用 Alias；主题切换（暗色/紧凑）只需覆盖 Alias 层。

## 6. 无障碍 (WCAG 2.1 AA · APG: Slider / Slider Multi-Thumb)

- **role 与结构**：每个手柄为 `role="slider"`，`tabindex="0"`；根容器 `role="group"` 并通过 `aria-labelledby` 关联外部 label；垂直时手柄加 `aria-orientation="vertical"`。
- **aria 属性**（每个手柄）：`aria-valuemin`、`aria-valuemax`、`aria-valuenow`、`aria-valuetext`（优先用 `getAriaValueText`/`tipFormatter` 输出可读文案，如「¥1,200」）；双滑块下两个手柄的 `aria-valuemin/max` 动态钳制为对方当前值（防交叉的可达性表达）；`disabled` 时加 `aria-disabled="true"`。
- **键盘交互**：
  - `←/↓` 减一步，`→/↑` 加一步（垂直/RTL 方向语义对应翻转）。
  - `PageUp/PageDown` 大步进（默认 step×10，可配 `bigStep`）。
  - `Home` / `End` 跳到 min / max。
  - 双滑块：Tab 在两手柄间移动，各自独立操作；交叉时自动钳制不允许越过对方。
- **焦点管理**：点击轨道跳转后焦点落到被移动的手柄；拖拽结束焦点保留在手柄上；focus ring 必须可见（`:focus-visible`），对比度 ≥ 3:1。
- **对比度**：track 对 rail、handle 边框对背景均 ≥ 3:1（非文本图形）；mark 标签文本 ≥ 4.5:1。
- **reduced-motion**：`prefers-reduced-motion: reduce` 时关闭手柄缩放/位移过渡动画，仅保留即时位置更新。
- **RTL**：`dir="rtl"` 下水平方向递增方向与方向键映射整体镜像，百分比定位自动反向。
- **实时播报**：拖拽过程通过 `useLiveAnnouncer`（polite，rAF 节流）播报当前值，避免每像素刷屏。

## 7. 国际化

- 用户可见硬编码文案为零；数值与提示通过 `tipFormatter` / `getAriaValueText` 注入，库本身不内置语言文案。
- 数字格式化统一用 `Intl.NumberFormat`（千分位、货币、百分比由调用方配置 locale 传入 formatter）。
- 内部仅以下 a11y 兜底文案走 i18n（当未提供自定义 formatter 时用于 `aria-valuetext` 的可选包装）：

| i18n key | 默认（en） | 说明 |
|---|---|---|
| `Slider.ariaLabel` | `"Slider"` | 无外部 label 时的兜底 `aria-label` |
| `Slider.minHandleLabel` | `"Minimum"` | 双滑块起始手柄 `aria-label` |
| `Slider.maxHandleLabel` | `"Maximum"` | 双滑块结束手柄 `aria-label` |
| `Slider.valueText` | `"{value}"` | `aria-valuetext` 模板（locale 数字） |

- RTL locale（ar/he）自动启用方向镜像（见 §6）。

## 8. 文案

- 遵循 content-guidelines：标签用名词短语、句式简洁（如「价格区间」而非「请选择您的价格区间」）。
- 数值提示尽量带单位/语境（通过 `tipFormatter`：`v => `${v}%``、`v => `¥${v}``），帮助用户理解量纲。
- 刻度标签控制在 1–4 字/词，避免与相邻标签重叠（必要时旋转或仅显示首尾）。
- **危险操作文案**：Slider 本身不触发破坏性动作；若用于「调整将立即生效且不可撤销」的场景（如音量上限、配额削减），应在外层加二次确认，提示文案如「调低配额将立即终止超额任务，是否继续？」——不在组件内默认提供，由业务侧显式接入。

## 9. 性能

| 维度 | Budget | 说明 |
|---|---|---|
| gzip 体积（svelte 层） | ≤ 4.75 KB | 含 marks/dots 渲染逻辑 |
| gzip 体积（core `createSlider`） | ≤ 2.5 KB | 几何 + 键盘 + 拖拽 reducer |
| 拖拽帧率 | 60fps（≤ 16ms/帧） | `pointermove` 经 rAF 合批，DOM 仅更新 transform/百分比 |
| 单步键盘响应 | ≤ 4ms | 纯计算，无重排（用 transform 定位手柄） |
| marks 数量上限 | ~50 个无降级 | 超过建议改用稀疏标签 |
| 首屏 | 无 JS 测量依赖 | 百分比布局，SSR 直出，hydration 零跳变 |

性能策略：
- 拖拽用 `transform: translate(%)` 而非 `left/top`，避免重排；track 用 `scaleX/width %`。
- pointer 事件 rAF 节流，`onChange` 实时但 DOM 写入合批；`onChangeComplete` 仅 pointerup 触发，便于业务侧节流网络请求。
- 无虚拟化需求（marks 量级小）；无浮层故无 `destroyOnClose`，但 Tooltip 走惰性挂载（仅 hover/focus/拖拽时渲染，`alwaysShowTip` 例外）。
- 不依赖 ResizeObserver 做首屏布局，仅在容器尺寸变化时重算命中换算（节流）。

## 10. AI 元数据

提供 `component.meta.ts`，内容包含：
- `name: 'Slider'`、`category: 'input'`、`stage: 'M2'`、`semiEquivalent: 'Slider'`。
- `capabilities: ['single', 'range', 'marks', 'dots', 'vertical', 'keyboard', 'tooltip', 'discrete-step']`。
- `propsSchema`：各 prop 的类型、默认值、枚举、是否受控（`value`/`tooltipVisible` 标记 controlled，配对事件 `change`/无）。
- `events`：`change`/`changeComplete`/`input`/`focus`/`blur` 及 payload 类型。
- `slots`：`mark`/`handle`/`tooltip` 及作用域 props。
- `a11yRoles: ['slider', 'group']`、`apgPattern: 'slider-multithumb'`。
- `tokens`：导出本组件全部 `--cd-slider-*` 及其 Alias 映射，供主题工具与 AI 生成消费。
- `examples`：典型用法片段（基础、range、marks+step=null、vertical、带单位 tipFormatter），供 AI 检索式生成。

## 11. 测试

- **单元（core）**：`valueToPercent`/`percentToValue` 边界（min/max/越界钳制）；step 吸附与浮点精度（0.1 累加无漂移）；`step=null` 仅停靠 marks；range 交叉钳制；键盘 reducer 全键位（含 RTL/vertical 方向翻转、Page/Home/End）。
- **组件（svelte）**：受控 `value` + `on:change` 回路；`changeComplete` 仅在 pointerup 触发一次；marks/轨道点击跳转到最近合法值；disabled 不响应任何输入。
- **a11y**：axe 零违规；每手柄 `role/aria-valuenow/valuetext` 正确更新；双滑块动态 `aria-valuemin/max` 钳制；focus-visible 可见且对比度达标；reduced-motion 媒体查询生效。
- **交互（Playwright）**：鼠标拖拽落点精确、pointer capture 不丢失（拖出元素仍跟随）；键盘逐步与大步；触控（pointer touch）拖拽；RTL 与 vertical 视觉回归快照。
- **视觉回归**：small/default/large × 单/双 × 水平/垂直 × default/hover/active/focus/disabled/error 矩阵截图。
- **性能**：拖拽过程帧时长采样 ≤ 16ms；50 marks 渲染无明显掉帧。

## 12. 验收标准 Checklist

- [ ] 单滑块与双滑块均工作，受控 `value` + `on:change` 闭环正确，双滑块交叉自动钳制。
- [ ] `step`（含小数）吸附无浮点漂移；`step=null` + `marks` 仅停靠刻度。
- [ ] `marks` / `dots` / `included` / 轨道点击跳转 行为符合预期。
- [ ] 垂直 (`vertical` + `height` + `verticalReverse`) 方向与定位正确。
- [ ] 键盘全键位（方向/Page/Home/End）可达，RTL 与 vertical 方向语义正确翻转。
- [ ] 每手柄 `role="slider"` + 完整 aria-value* + `aria-valuetext`；axe 零违规；focus-visible 可见。
- [ ] `on:changeComplete` 仅在拖拽/键盘落定时触发，适配请求节流。
- [ ] reduced-motion 关闭过渡；RTL 镜像；触控拖拽与 pointer capture 稳定。
- [ ] 所有视觉样式经 `--cd-slider-*` Token，零写死值；暗色/紧凑主题仅覆盖 Alias 即生效。
- [ ] `status` 校验态色调正确，可集成 Form。
- [ ] 用户可见文案零硬编码，数字走 `Intl`；i18n key 齐备。
- [ ] core/svelte gzip 体积分别 ≤ 2.5KB / 4.75KB；拖拽 60fps。
- [ ] 提供 `component.meta.ts`，capabilities/props/events/tokens/examples 完整。
- [ ] headless 逻辑位于 `@chenzy-design/core` 的 `createSlider`，Svelte 层仅渲染。
