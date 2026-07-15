# SPEC · Progress
> 分类：feedback · 阶段：M5
> 对标 Semi：Progress（严格对齐，无自造能力）

## 1. 概述

Progress 是进度指示组件，用于展示用户操作的当前进度和状态，一般在操作耗时较长时使用，也可用来表示任务/对象的完成度。支持两种形态：

- **线形（line）**：条带，`direction` 可 `horizontal`（默认）或 `vertical`，适合表单提交、文件上传、页面加载等场景。
- **环形（circle）**：圆环，适合卡片、统计面板等需紧凑展示百分比的场景。

核心能力：
- 受控进度值 `percent`（0–100），自动钳制越界值。
- 自定义填充色 `stroke`：颜色字符串，或按 `percent` 区间取色的数组 `Array<{percent, color}>`（`color` 支持 Hex / Hsl(a) / Rgb(a) / Design Token），配合 `strokeGradient` 自动补齐区间生成渐变。
- 自定义轨道色 `orbitStroke`。
- 可选文本展示 `showInfo`，支持 `format(percent)` 自定义信息区/中心文本。
- 尺寸 `size`：`small`（仅 circle）/ `default` / `large`（仅 line）；环形额外支持 `width` 像素覆写、`strokeWidth` 笔触、`strokeLinecap` 端点。
- 数字滚动线性动画（percent 变化时）+ reduced-motion 降级。

非目标：不内置文件上传逻辑、不内置分步骤导航（Steps 为独立组件）。Progress 仅消费外部传入的 `percent`，受控不回写。

## 2. 分层实现

**@chenzy-design/core**
- `clampPercent(percent) → 0..100`。
- `getCirclePathProps({ width, strokeWidth, percent })` 返回 `radius / center / circumference / strokeDasharray / strokeDashoffset`（Semi 单环 dashoffset 模型：`dashoffset = (1 - percent/100) * circumference`）。
- `generateColor(strokeArr, percent, gradient)` 按 percent 落入区间取色，`gradient=true` 时在相邻锚点间插值（移植 Semi generates.ts 全套颜色转换）。
- `getRootAriaProps({ percent, label, labelledBy, valueText })` 输出 `role="progressbar"` + `aria-valuenow/min/max/valuetext/label/labelledby`。

**@chenzy-design/svelte — `<Progress>`**
- line：`div.cd-progress.cd-progress-horizontal/-vertical > div.cd-progress-track > div.cd-progress-track-inner`；信息区 `div.cd-progress-line-text`。
- circle：`div.cd-progress.cd-progress-circle > svg.cd-progress-circle-ring > circle.cd-progress-circle-ring-track / .cd-progress-circle-ring-inner`；中心文本 `span.cd-progress-circle-text`（小号不显示）。
- 数字滚动：percent 变化时用 rAF 线性插值（对齐 Semi Animation linear/300ms），`motion={false}` 或 reduced-motion 直接跳到目标值。

## 3. API（对齐 Semi Props）

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `percent` | `number` | `0` | 当前进度（0–100），越界自动钳制。受控值。 |
| `type` | `'line' \| 'circle'` | `'line'` | 形态。 |
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | 条状进度条方向。 |
| `size` | `'default' \| 'small' \| 'large'` | `'default'` | `small` 仅 circle 生效，`large` 仅 line 生效。 |
| `width` | `number` | circle default 72 / small 24 | 环形进度条直径像素。 |
| `strokeWidth` | `number` | `4` | type=circle 时进度条宽度。 |
| `strokeLinecap` | `'round' \| 'square'` | `'round'` | 仅 circle：端点样式。 |
| `showInfo` | `boolean` | `false` | 是否显示信息区/中心文本。 |
| `stroke` | `string \| Array<{percent:number; color:string}>` | `'var(--cd-color-success)'` | 填充色；数组按 percent 区间取色。 |
| `strokeGradient` | `boolean` | `false` | 自动补齐颜色区间生成渐变（需 stroke 为区间数组）。 |
| `orbitStroke` | `string` | `'var(--cd-color-fill-0)'` | 轨道填充色。 |
| `format` | `(percent: number) => string \| null` | `(p) => p + '%'` | 自定义信息区文本。 |
| `motion` | `boolean` | `true` | 数字滚动/过渡动画（被 reduced-motion 覆盖）。 |
| `class` / `style` / `id` | `string` | — | 根节点透传。 |
| `aria-label` / `aria-labelledby` / `aria-valuetext` | `string` | — | 无障碍属性。 |
| `formatSnippet` | `Snippet<[{ percent }]>` | — | 信息区自定义内容，优先于 `format`。 |

> Progress 无浮层、无 open、无 onChange/onComplete 事件（对齐 Semi，受控单向展示）。

## 4. 主题 / Token

严格镜像 Semi `semi-foundation/progress/variables.scss` 的 19 个变量（名与值一一对应），无自造中间 token。见 `packages/tokens/src/components/progress.ts`。

关键：`--cd-color-progress-default-bg`（轨道背景 → fill-0）、`--cd-color-progress-track-inner-bg`（填充 → success）、`--cd-color-progress-line-text-text` / `--cd-color-progress-circle-text`（文本）、`--cd-height-progress-horizontal(-large)`（条高 4/6px）、`--cd-width-progress-vertical(-large)`（垂直宽 4/6px）、`--cd-motion-progress-transition-duration/-timing-function`、`--cd-radius-progress-track(-inner)` 等。

## 5. 无障碍（WCAG 2.1 AA）

- 根节点 `role="progressbar"` + `aria-valuenow={percent}`、`aria-valuemin="0"`、`aria-valuemax="100"`。
- 支持 `aria-valuetext`（按 W3C 规范优先于 valuenow 被 AT 消费）。
- 通过 `aria-label` 说明含义，或 `aria-labelledby` 关联外部标题元素。
- Progress 不可聚焦，不设 tabindex，不进入 Tab 序列。
- `prefers-reduced-motion` 或 `motion={false}` 时禁用数字滚动与过渡动画。

## 6. 测试

- **core 单元**：`clampPercent` 越界钳制；`getCirclePathProps` dashoffset = (1 - percent/100)·circumference；`generateColor` 区间取色/渐变插值/多色格式；`getRootAriaProps` valuenow/valuetext/label/labelledby。
- **a11y（axe）**：line/circle 的 role + aria-valuenow；valuetext / labelledby 透传无 violations。
- **demo**：对齐 Semi 全部场景（标准/百分比文本/垂直/环形/环形 width/小号环形/动态改变/自定义中心文字/圆角方角/分段颜色/渐变）。

## 7. 验收 Checklist

- [x] 仅 line / circle 两形态（无 dashboard），percent 越界钳制。
- [x] `stroke` 支持字符串与分段颜色数组，`strokeGradient` 生成渐变；`orbitStroke` 自定义轨道。
- [x] `direction` 支持 vertical；`showInfo` 默认 false；`strokeWidth` 默认 4；`strokeLinecap` 仅 round/square。
- [x] DOM 结构与 class 名严格对齐 Semi；circle 用单环 stroke-dashoffset。
- [x] 19 个 token 名值镜像 Semi，无自造中间 token。
- [x] `role="progressbar"` + aria-valuenow/min/max，支持 valuetext/label/labelledby。
- [x] reduced-motion / motion=false 禁用动画；数字滚动线性插值。
- [x] core / a11y 测试通过；demo 覆盖 Semi 全部场景。
