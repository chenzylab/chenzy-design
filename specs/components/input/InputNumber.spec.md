# SPEC · InputNumber
> 分类：input · 阶段：M2
> 对标 Semi：InputNumber

## 1. 概述

InputNumber 是受约束的数值输入控件，在原生 `<input>` 之上增加：步进按钮（+/−）、键盘步进（↑/↓、PageUp/PageDown）、精度控制（小数位 round/截断）、范围约束（min/max 软/硬限制）、千分位/货币等格式化与解析、以及鼠标滚轮微调。它解决纯文本输入无法保证「输出始终是合法数值」的问题：组件内部维护「显示字符串」与「数值」两套状态，在 `blur`/`Enter`/step 时归一化（parse → clamp → round → format），输入过程中保持宽松（允许中间态如 `-`、`1.`、`1e`）。

适用场景：表单数量、价格、百分比、坐标、配额设置等。与 Slider 常配合使用（数值精调 + 拖拽粗调）。

边界与非目标：
- 仅处理有限实数；超大整数（超过 `Number.MAX_SAFE_INTEGER`）走可选 `BigInt`/字符串运算模式（M3+，本期仅给出预留 prop，默认 number）。
- 不内置单位换算/表达式求值（如输入 `2+3`）；可由使用方在 `parser` 中扩展。
- 不是货币组件：货币展示通过 `formatter` + `Intl.NumberFormat` 由使用方配置，组件不内建货币元数据。

关键交互不变量：失焦后展示值一定是经过 `clamp(round(value))` 且通过 `formatter` 渲染的合法值（或为空 / null）。

## 2. 设计语义

- **结构**：外层 `cd-input-number`（行内块容器，承载 border/状态/尺寸），内部依次为可选前缀 `prefix`、`<input>`、步进控制 `cd-input-number__actions`（上下两枚按钮 stacked，或 `controlsPosition="sides"` 时左右排布）。`innerButtons` 模式下按钮悬浮于输入区右内侧（hover/focus 显形）。
- **尺寸**：`small`(28px) / `default`(32px) / `large`(40px)，高度、内边距、字号、步进按钮宽度均由 token 派生，与 Input 完全对齐保证表单同行视觉一致。
- **状态语义**：default / warning / error 对应 `--cd-color-border` / `--cd-color-warning` / `--cd-color-danger`；hover 加深边框，focus 显示 `--cd-color-primary` 边框 + focus ring；disabled 降透明度并禁用全部交互；readonly 保留选中复制但禁步进。
- **步进按钮态**：当 `value` 达到 `max` 时「+」按钮 disabled，达到 `min` 时「−」disabled，提供到边界的明确反馈。长按按钮触发加速重复步进（首次延迟 → 加速间隔）。
- **数值语义**：`precision` 决定小数位与 round 策略；`step` 默认 1，`shiftStep`（按住 Shift 时）默认 10；越界采用 `clamp`（默认）或 `strict`（拒绝写入并回滚）。空值区分 `''`（未输入）与归一化后的 `null`。
- **动效**：按钮按下/hover 背景过渡 120ms；步进时数字本身不做动画（避免读屏与视觉抖动）。所有过渡在 `prefers-reduced-motion: reduce` 下置 0。
- **RTL**：`sides` 布局下 +/− 视觉位置随方向镜像；数字与负号方向遵循内容方向，金额格式由 `Intl` locale 决定。

## 3. 分层实现

属于「有交互/键盘/a11y 逻辑」组件，采用 core + svelte 分层。

**@chenzy-design/core · `createInputNumber(config)`（headless，框架无关）**
- 维护状态机：`{ value: number|null, displayValue: string, focused, disabled, readonly, status, atMin, atMax }`。
- 纯函数原语（可单测、零 DOM）：`parse(text, opts)`、`clamp(n, min, max, mode)`、`round(n, precision)`、`format(n, formatter)`、`getStepValue(current, step, dir)`（处理浮点误差，内部用整数缩放或 `toFixed` 规避 `0.1+0.2`）。
- 行为方法：`stepUp(multiplier)` / `stepDown(multiplier)` / `setValue` / `commit()`（blur/Enter 归一化）/ `handleKeydown` / `startSpin(dir)` / `stopSpin()`（长按加速：首延迟 400ms，重复间隔从 120ms 递减到 40ms）。
- 复用原语：`useId`（input 与 label 关联）、`useLiveAnnouncer`（可选播报当前值或越界提示）。无需 FocusTrap/ScrollLock/Dismiss（非浮层）。RovingTabindex 不需要（步进按钮通常 `tabindex=-1`，靠输入框键盘步进）。
- 输出 prop-getters：`getInputProps()`、`getIncrementButtonProps()`、`getDecrementButtonProps()`，封装 aria 与事件，供任意框架适配。

**@chenzy-design/svelte · `<InputNumber>`**
- 绑定 core 返回的 store 到 DOM，渲染容器/input/按钮/前后缀 slot。
- 处理 Svelte 特有：`value` 双向语义（受控 `value` + `on:change`，可选 `bind:value`）、`use:` action 挂载 wheel/长按监听、SSR 安全（locale 格式化在 mount 后校正避免 hydration mismatch）。
- 仅做渲染与事件转发，数值逻辑全部委托 core，保证逻辑可移植与可测。

## 4. API

### Props

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `value` | `number \| null` | `null` | 受控值。配合 `on:change`。 |
| `defaultValue` | `number \| null` | `null` | 非受控初始值。 |
| `min` | `number` | `-Infinity` | 最小值（含）。 |
| `max` | `number` | `Infinity` | 最大值（含）。 |
| `step` | `number` | `1` | 步进基数，支持小数（如 `0.1`）。 |
| `shiftStep` | `number` | `step * 10` | 按住 Shift 步进时的步长。 |
| `precision` | `number` | `undefined` | 保留小数位数；定义后失焦自动 round。 |
| `boundaryMode` | `'clamp' \| 'strict'` | `'clamp'` | 越界处理：钳制 or 拒绝回滚。 |
| `formatter` | `(value: number) => string` | `undefined` | 数值→显示串（千分位/货币/百分比）。 |
| `parser` | `(text: string) => number` | `undefined` | 显示串→数值，须与 formatter 逆向对应。 |
| `keyboard` | `boolean` | `true` | 是否启用 ↑↓/PageUp/Down 步进。 |
| `mouseWheel` | `boolean` | `false` | 聚焦时滚轮是否步进。 |
| `controls` | `boolean` | `true` | 是否显示步进按钮。 |
| `controlsPosition` | `'sides' \| 'right'` | `'right'` | 步进按钮布局（右侧 stacked / 两侧）。 |
| `innerButtons` | `boolean` | `false` | 按钮内嵌悬浮（hover/focus 显形）。 |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | 尺寸。 |
| `status` | `'default' \| 'warning' \| 'error'` | `'default'` | 校验态。 |
| `disabled` | `boolean` | `false` | 禁用。 |
| `readonly` | `boolean` | `false` | 只读（可复制，禁步进）。 |
| `prefix` | `string \| Snippet` | — | 输入框前置内容（如 `$`、单位）。 |
| `suffix` | `string \| Snippet` | — | 输入框后置内容（如 `%`）。 |
| `placeholder` | `string` | — | 占位提示。 |
| `id` | `string` | 自动生成 | input 元素 id，关联外部 label。 |
| `name` | `string` | — | 表单字段名。 |
| `ariaLabel` | `string` | — | 无可见 label 时的可访问名。 |
| `autofocus` | `boolean` | `false` | 挂载自动聚焦。 |
| `selectOnFocus` | `boolean` | `false` | 聚焦时全选文本。 |
| `locale` | `string` | 继承 ConfigProvider | 格式化 locale，传给内部 `Intl`。 |

### Events

| Event | payload | 触发时机 |
|---|---|---|
| `change` | `{ value: number \| null }` | 归一化后值变化（step/commit/setValue）。受控核心事件。 |
| `input` | `{ value: number \| null, displayValue: string }` | 每次键入（中间态可能 value 为旧值）。 |
| `step` | `{ value: number, direction: 'up' \| 'down', source: 'button' \| 'keyboard' \| 'wheel' }` | 任一步进动作完成。 |
| `blur` | `FocusEvent` | 失焦（已完成 commit 归一化）。 |
| `focus` | `FocusEvent` | 聚焦。 |
| `boundaryHit` | `{ boundary: 'min' \| 'max', value: number }` | 触达/试图越过边界。 |
| `keydown` | `KeyboardEvent` | 透传原生（便于使用方扩展，如 Enter 提交表单）。 |

### Slots（Snippets）

| Slot | 参数 | 说明 |
|---|---|---|
| `prefix` | — | 自定义前置区，覆盖 `prefix` prop。 |
| `suffix` | — | 自定义后置区，覆盖 `suffix` prop。 |
| `incrementIcon` | `{ disabled: boolean }` | 自定义「+」图标。 |
| `decrementIcon` | `{ disabled: boolean }` | 自定义「−」图标。 |

## 5. 主题 / Token

组件仅消费 Alias，并暴露 Component 级 token（`--cd-input-number-*`）供局部覆盖，禁止写死值。

| Component Token | 引用 Alias / 默认 | 用途 |
|---|---|---|
| `--cd-input-number-height-small` | `28px` | small 高度 |
| `--cd-input-number-height-default` | `32px` | default 高度 |
| `--cd-input-number-height-large` | `40px` | large 高度 |
| `--cd-input-number-padding-x` | `--cd-spacing-3` | 输入区水平内边距 |
| `--cd-input-number-color-text` | `--cd-color-text-0` | 数值文本色 |
| `--cd-input-number-color-placeholder` | `--cd-color-text-2` | 占位色 |
| `--cd-input-number-color-bg` | `--cd-color-bg-0` | 背景 |
| `--cd-input-number-color-bg-disabled` | `--cd-color-bg-1` | 禁用背景 |
| `--cd-input-number-color-border` | `--cd-color-border` | 默认边框 |
| `--cd-input-number-color-border-hover` | `--cd-color-primary-hover` | hover 边框 |
| `--cd-input-number-color-border-active` | `--cd-color-primary` | focus 边框 |
| `--cd-input-number-color-border-warning` | `--cd-color-warning` | warning 边框 |
| `--cd-input-number-color-border-error` | `--cd-color-danger` | error 边框 |
| `--cd-input-number-focus-ring` | `0 0 0 2px var(--cd-color-primary-light)` | focus ring |
| `--cd-input-number-radius` | `--cd-radius-default` | 圆角 |
| `--cd-input-number-action-width` | `--cd-spacing-5` | 步进按钮宽度 |
| `--cd-input-number-action-color` | `--cd-color-text-2` | 步进图标色 |
| `--cd-input-number-action-color-hover` | `--cd-color-primary` | 步进图标 hover |
| `--cd-input-number-action-bg-hover` | `--cd-color-fill-1` | 步进按钮 hover 背景 |
| `--cd-input-number-action-divider` | `--cd-color-border` | 步进区分隔线 |
| `--cd-input-number-transition` | `120ms ease` | 过渡（reduced-motion 下 0） |

对比度：默认文本/背景 ≥ 7:1（AAA 文本），placeholder 与 disabled 文本 ≥ 4.5:1（AA）；步进图标 hover 态对比度 ≥ 3:1（非文本图形）。error/warning 边框与背景对比 ≥ 3:1，且不单独依赖颜色（配合 status 图标/aria 提示）。

## 6. 无障碍

遵循 WAI-ARIA APG「Spinbutton」模式。

- **角色与属性**：`<input>` 使用 `role="spinbutton"`（或保留 `type="text"` + `inputmode="decimal"` 以兼容 `formatter` 含非数字字符；纯数字模式可用 `type="number"`，但因其格式化与 locale 限制，组件默认 `type=text` + spinbutton role）。设置 `aria-valuenow`（当前数值）、`aria-valuemin`、`aria-valuemax`、`aria-valuetext`（当有 formatter 时给出可读文本，如「1,234 元」）。
- **可访问名**：优先外部 `<label for>`；否则 `aria-label`（`ariaLabel` prop）。前后缀（单位）通过 `aria-describedby` 关联说明而非混入 valuetext。
- **状态关联**：`status=error/warning` 时 `aria-invalid="true"`，错误描述通过外部 FormField 的 `aria-describedby` 关联（组件本身不渲染错误文案）。`disabled`→ `disabled` 属性；`readonly`→ `aria-readonly` + 原生 readonly。
- **键盘交互**：↑/↓ = ±step；PageUp/PageDown = ±shiftStep（或 Shift+↑/↓）；Home = min（有限时）；End = max（有限时）；Enter = commit 归一化（不阻止表单提交）；Esc = 撤销本次未提交编辑回到上次值。步进按钮 `tabindex="-1"`、`aria-hidden` 可选（功能由输入框键盘覆盖，避免重复 tab 停留）；按钮含 `aria-label`（i18n）供屏幕阅读器指针用户。
- **焦点管理**：点击步进按钮不夺取输入框焦点（按钮 `mousedown.preventDefault`），步进后输入框保持聚焦。`selectOnFocus` 可选全选。
- **越界播报**：触达 min/max 时通过 `useLiveAnnouncer`（`aria-live="polite"`）播报「已达最大值」等（i18n，可关闭以免聒噪）。
- **reduced-motion**：禁用按钮过渡/长按视觉抖动。**RTL**：`dir` 由文档继承，sides 布局镜像，valuetext 由 locale 决定。**对比度**：见第 5 节。

## 7. 国际化

- 用户可见文案零硬编码，全部走 i18n。数字格式化用 `Intl.NumberFormat(locale, options)`，默认 `formatter`（启用千分位时）经其生成；`parser` 默认按 locale 的分组符/小数点解析（如 `1.234,56` vs `1,234.56`），避免硬编码 `,`/`.`。
- locale 来源优先级：`locale` prop > ConfigProvider > 文档 `lang` > `'en'`。

| i18n key | 默认（en） | 用途 |
|---|---|---|
| `InputNumber.increment` | "Increase value" | 「+」按钮 aria-label |
| `InputNumber.decrement` | "Decrease value" | 「−」按钮 aria-label |
| `InputNumber.atMax` | "Maximum value reached" | 触达 max 播报 |
| `InputNumber.atMin` | "Minimum value reached" | 触达 min 播报 |
| `InputNumber.invalid` | "Invalid number" | 解析失败提示（可选） |
| `InputNumber.valueText` | "{value}" | valuetext 模板（带单位时 "{value} {unit}"） |

## 8. 文案

- 遵循 content-guidelines：按钮 aria-label 用动词短语（"Increase value"），简洁、句首大写、无句末标点。播报文案陈述结果（"Maximum value reached"）而非命令。
- placeholder 提示期望格式（如 "0.00"、"Enter amount"），不承担校验文案职责（错误由 FormField 表达）。
- 单位用 `suffix`/`prefix`，不写入 placeholder。

**危险操作文案**：InputNumber 本身无破坏性操作。需单列的边界提醒：当用于「会触发不可逆后果的数量」（如批量删除条数、扣费金额）时，使用方应在 `boundaryHit`/`change` 后于外部展示确认，而非在组件内静默 clamp 导致用户误以为已设较大值——推荐 `boundaryMode="strict"` 并显式提示「最多 {max} 项」。该提示文案归使用方，组件提供 `boundaryHit` 事件钩子。

## 9. 性能

| 指标 | 预算 | 说明 |
|---|---|---|
| svelte 组件 gzip | ≤ 3.5 KB | 含模板、样式、action |
| core `createInputNumber` gzip | ≤ 2 KB | 纯逻辑，可独立 tree-shake |
| `Intl.NumberFormat` | 懒加载 + 缓存 | 仅启用 formatter 时实例化，按 (locale,options) 缓存，避免每次渲染 new |
| 键入响应 | < 4ms/次 | input 仅更新 displayValue，commit 才 parse/format |
| 长按步进帧 | ≤ 1 次状态更新/帧 | rAF 节流，加速间隔不低于 40ms |
| 滚轮步进 | passive=false + 节流 | 仅聚焦时绑定，blur 解绑 |

- 不需要虚拟化/惰性渲染（单一输入，无列表）。无浮层故无 `destroyOnClose`。
- `formatter`/`parser` 调用频率控制在 commit/step 时刻，输入过程不格式化（避免光标跳动与性能抖动）。
- 长按定时器与 wheel 监听在卸载/失焦时清理，杜绝泄漏。

## 10. AI 元数据

提供 `component.meta.ts`（供 AI 生成/检索）：
- `name: "InputNumber"`、`category: "input"`、`stage: "M2"`、`semiEquivalent: "InputNumber"`。
- `tags`: ["number","stepper","spinbutton","numeric","quantity","price"]。
- `props` schema（类型、默认、枚举、是否受控 `value`/`on:change`）、`events`、`slots` 全量映射。
- `a11yPattern: "spinbutton"`、`i18nKeys`（见第 7 节）、`tokens`（见第 5 节）。
- `usageExamples`: 数量选择、价格（formatter 货币）、百分比（suffix %）、Slider 联动、表单受控。
- `antiPatterns`: 用于非数值输入、用 placeholder 承载单位、未提供可访问名。
- `relatedComponents`: ["Input","Slider","FormField"]。

## 11. 测试

- **core 单测（vitest）**：`parse`/`round`/`clamp`/`getStepValue` 浮点边界（`0.1+0.2`、`0.3-0.1`、`precision` 截断/四舍五入）；`step`/`shiftStep`/min/max clamp 与 strict 回滚；空值 `''`↔`null`；中间态（`-`、`1.`、`1e3`、`.5`）不被过早归一化。
- **格式化往返**：`parser(formatter(n)) === n`（多 locale：en-US、de-DE、zh-CN）。
- **a11y**：axe 无违规；断言 `role=spinbutton`、`aria-valuenow/min/max/text`、`aria-invalid`、按钮 `aria-label`、`aria-readonly`。
- **键盘交互（@testing-library）**：↑↓/PageUp/Down/Home/End/Enter/Esc 行为；步进后焦点保留输入框；步进按钮不可 tab 进入。
- **长按加速**：fake timers 验证首延迟 400ms 与加速间隔曲线、卸载清理。
- **滚轮**：聚焦步进、失焦不响应、解绑。
- **受控/非受控**：`value` 受控不自更新、`on:change` 派发；`defaultValue` 路径。
- **SSR/hydration**：locale 格式化无 mismatch 警告。
- **视觉回归（Playwright/Chromatic）**：三尺寸 × 三状态 × 两按钮布局 × innerButtons × disabled/readonly × RTL × reduced-motion 快照。

## 12. 验收标准 checklist

- [ ] 受控 `value` + `on:change` 与非受控 `defaultValue` 均工作；空值正确区分 `''` 与 `null`。
- [ ] step/shiftStep/precision/min/max 全部生效；浮点步进无 `0.1+0.2` 误差。
- [ ] `boundaryMode` clamp 与 strict 行为正确，触边派发 `boundaryHit`，按钮在边界 disabled。
- [ ] formatter/parser 多 locale 往返一致，输入过程不格式化、不跳光标；失焦归一化。
- [ ] 键盘 ↑↓/PageUp·Down/Home/End/Enter/Esc 完整；步进按钮 `tabindex=-1` 不入 tab 序。
- [ ] 点击步进按钮不夺焦，步进后输入框保持聚焦。
- [ ] WCAG 2.1 AA：axe 通过；role/aria-value*/aria-invalid/aria-readonly/aria-label 正确；越界 polite 播报可开关。
- [ ] 对比度达标（文本 ≥7:1，placeholder/disabled ≥4.5:1，图标/边框 ≥3:1）；reduced-motion 与 RTL 正确。
- [ ] 所有可见文案走 i18n，数字/分组符由 `Intl` 按 locale 决定，无硬编码。
- [ ] 仅消费 Alias/Component token，无写死颜色/尺寸；`--cd-input-number-*` 可覆盖。
- [ ] core 逻辑零 DOM 依赖、可独立单测；svelte 仅渲染转发。
- [ ] Perf Budget 达标（svelte ≤3.5KB / core ≤2KB gzip）；定时器与 wheel 监听无泄漏。
- [ ] 提供 `component.meta.ts`，字段（props/events/slots/i18nKeys/tokens/a11yPattern）完整准确。
