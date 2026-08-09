# SPEC · InputNumber
> 分类：input · 阶段：M2
> 对标 Semi：InputNumber

## 1. 概述

InputNumber 是受约束的数值输入控件，在原生 `<input>` 之上增加：步进按钮（+/−）、键盘步进（↑/↓、PageUp/PageDown）、精度控制（小数位 round）、范围约束（min/max clamp）、千分位/货币等格式化与解析（对齐 Semi，不含滚轮微调——Semi 无此交互）。它解决纯文本输入无法保证「输出始终是合法数值」的问题：组件内部维护「显示字符串」与「数值」两套状态，在 `blur`/`Enter`/step 时归一化（parse → clamp → round → format），输入过程中保持宽松（允许中间态如 `-`、`1.`、`1e`）。

适用场景：表单数量、价格、百分比、坐标、配额设置等。与 Slider 常配合使用（数值精调 + 拖拽粗调）。

边界与非目标：
- 仅处理有限实数；超大整数（超过 `Number.MAX_SAFE_INTEGER`）走可选 `BigInt`/字符串运算模式（M3+，本期仅给出预留 prop，默认 number）。
- 不内置单位换算/表达式求值（如输入 `2+3`）；可由使用方在 `parser` 中扩展。
- 不是货币组件：货币展示通过 `formatter` + `Intl.NumberFormat` 由使用方配置，组件不内建货币元数据。

关键交互不变量：失焦后展示值一定是经过 `clamp(round(value))` 且通过 `formatter` 渲染的合法值（或为空 / null）。

## 2. 设计语义

- **结构**：外层 `cd-input-number`（行内块容器，承载 border/状态/尺寸），内部依次为可选前缀 `prefix`、`<input>`、步进控制 `cd-input-number-suffix-btns`（上下两枚按钮 stacked，或 `controlsPosition="sides"` 时左右排布）。`innerButtons` 模式下按钮悬浮于输入区右内侧（hover/focus 显形）。
- **尺寸**：`small`(28px) / `default`(32px) / `large`(40px)，高度、内边距、字号、步进按钮宽度均由 token 派生，与 Input 完全对齐保证表单同行视觉一致。
- **状态语义**：default / warning / error 对应 `--cd-color-border` / `--cd-color-warning` / `--cd-color-danger`；hover 加深边框，focus 显示 `--cd-color-primary` 边框 + focus ring；disabled 降透明度并禁用全部交互；readonly 保留选中复制但禁步进。
- **步进按钮态**：当 `value` 达到 `max` 时「+」按钮 disabled，达到 `min` 时「−」disabled，提供到边界的明确反馈。长按按钮触发加速重复步进（首次延迟 → 加速间隔）。
- **数值语义**：`precision` 决定小数位与 round 策略；`step` 默认 1，`shiftStep`（按住 Shift 时）默认 10；越界恒 `clamp`（对齐 Semi，无 strict 模式）。空值区分 `''`（未输入）与归一化后的 `null`。
- **动效**：按钮按下/hover 背景无内置过渡（对齐 Semi `--semi-transition_duration-none` 恒 0ms，动效接口预留但默认关闭）；步进时数字本身不做动画（避免读屏与视觉抖动）。
- **RTL**：`sides` 布局下 +/− 视觉位置随方向镜像；数字与负号方向遵循内容方向，金额格式由 `Intl` locale 决定。

## 3. 分层实现

属于「有交互/键盘/a11y 逻辑」组件，采用 core + svelte 分层。

**@chenzy-design/core**（headless 纯函数，框架无关，可单测、零 DOM）
- `roundToPrecision(n, precision)`：失焦四舍五入到 `precision` 位小数。
- `addStep(base, delta)`：浮点安全的步进加法（整数缩放规避 `0.1+0.2` 误差）。
- `decimalsOf(n)`：数字默认字符串形式的小数位数（供 `addStep` 内部换算缩放因子）。
- `formatWithLocale(n, locale, options)`：基于 `Intl.NumberFormat` 的默认格式化，按 `(locale, options)` 缓存实例。
- 复用原语：`useId`（input 与 label 关联）。无需 FocusTrap/ScrollLock/Dismiss（非浮层）。RovingTabindex 不需要（步进按钮通常 `tabindex=-1`，靠输入框键盘步进）。

**@chenzy-design/svelte · `<InputNumber>`**
- 复用已对齐的 `<Input>` 承载 DOM 与聚焦/校验态样式（对齐 Semi `InputNumber extends InputProps` 且渲染层内部 `<Input role="spinbutton">`）。
- 组件内维护「显示文本 `editingText`」与「数值 `current`」两套 `$state`：编辑态仅缓存原始文本，parse → round → clamp（`normalize`）延后到失焦/Enter/step 时刻才提交（`commitValue`），避免输入过程中跳光标。
- 受控 `value`（提供即受控，只回调不回写）/ 非受控 `defaultValue`；`onChange`/`onNumberChange` 双回调，货币/formatter 模式 `onChange` 回显示字符串。
- 长按连续步进、货币/科学计数法格式化、locale 解析均在组件内实现，委托 core 处理浮点与精度原语，保证数值逻辑可单测。

## 4. API

### Props

> 本表由 `packages/svelte/src/input-number/meta.ts` 真源生成（2026-07-30 重校）。此前本表列的 prop 多为 Semi 对齐前的旧名或已删除项（如 `value`→`activeKey`、`change`→`onChange`），改 prop 时请同步 meta.ts，勿手写「规划中」的 prop。

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| value | `number \| null` | `undefined` | 受控值；提供则为受控 |
| defaultValue | `number \| null` | `null` | 非受控初始值 |
| min | `number` | `-Infinity` |  |
| max | `number` | `Infinity` |  |
| step | `number` | `1` |  |
| shiftStep | `number` | `10` | Shift+↑↓ / PageUp·Down 步长（对齐 Semi 恒 10） |
| precision | `number` | `undefined` | 失焦四舍五入保留小数位 |
| formatter | `(n: number) => string` | `undefined` | 自定义显示格式化（仅非编辑态） |
| parser | `(s: string) => number` | `undefined` | 自定义解析 |
| size | `'small'\|'default'\|'large'` | `default` |  |
| disabled | `boolean` | `false` |  |
| readonly | `boolean` | `false` |  |
| validateStatus | `'default'\|'error'\|'warning'\|'success'` | `default` | 校验状态（对齐 Semi InputProps validateStatus） |
| innerButtons | `boolean` | `false` | 步进按钮内嵌悬浮（hover/focus 显形） |
| hideButtons | `boolean` | `false` | 彻底隐藏步进按钮 |
| placeholder | `string` | `undefined` |  |
| prefix | `string \| Snippet` | `undefined` | 输入框前置内容（如货币符号、单位） |
| insetLabel | `string \| Snippet` | `undefined` | 内嵌标签（与 prefix 同槽，对齐 Semi insetLabel） |
| insetLabelId | `string` | `undefined` | 内嵌标签容器 id（对齐 Semi insetLabelId） |
| suffix | `string \| Snippet` | `undefined` | 输入框后置内容（如单位 %、kg） |
| name | `string` | `undefined` |  |
| id | `string` | `自动生成` | input 元素 id，关联外部 label |
| aria-label | `string` | `undefined` |  |
| autofocus | `boolean` | `false` | 挂载自动聚焦 |
| locale | `string` | `undefined` | 数字格式化 locale（仅未提供 formatter 时生效） |
| borderless | `boolean` | `false` | 无边框模式 |
| showClear | `boolean` | `false` | 显示清除按钮（有值时出现 ×） |
| clearIcon | `Snippet` | `undefined` | 自定义清除图标 |
| keepFocus | `boolean` | `false` | 点击 +/- 按钮后保持输入框聚焦 |
| onChange | `(value: number \| string \| null, e?: Event) => void` | `undefined` | 值变化：货币/formatter 模式回字符串，其余回 number，空回 null（对齐 Semi） |
| onNumberChange | `(value: number \| null, e?: Event) => void` | `undefined` | 携带 number 类型的变化回调（对齐 Semi） |
| onUpClick | `(value: number \| null, e: MouseEvent) => void` | `undefined` | 点击「+」按钮回调（对齐 Semi） |
| onDownClick | `(value: number \| null, e: MouseEvent) => void` | `undefined` | 点击「-」按钮回调（对齐 Semi） |
| onFocus | `(e: FocusEvent) => void` | `undefined` | 聚焦 |
| onBlur | `(e: FocusEvent) => void` | `undefined` | 失焦（已完成 commit 归一化） |
| onKeyDown | `(e: KeyboardEvent) => void` | `undefined` | 透传原生 keydown（对齐 Semi onKeyDown） |
| preventScroll | `boolean` | `false` | 命令式 focus() 时是否阻止滚动文档（对齐 Semi） |
| pressTimeout | `number` | `250` | 长按后延迟多久开始连续步进（ms，对齐 Semi） |
| pressInterval | `number` | `250` | 长按连续步进的间隔（ms，对齐 Semi） |
| scientificNotation | `boolean \| { threshold?: number }` | `false` | 失焦时超阈值（默认 15 位）显示科学计数法，聚焦显示完整数字；仅影响显示（对齐 Semi） |
| currency | `boolean \| string` | `false` | 货币展示：true 按 localeCode 推断币种，字符串指定 ISO 4217 币种码；仅显示层（对齐 Semi） |
| currencyDisplay | `'symbol'\|'code'\|'name'` | `'symbol'` | 货币展示方式：符号 ￥ / 代码 CNY / 名称 人民币（对齐 Semi） |
| localeCode | `string` | `undefined` | 货币格式化 BCP-47 locale；回退 locale 再回退 zh-CN（对齐 Semi） |
| showCurrencySymbol | `boolean` | `true` | false 时隐藏内置货币符号/代码/名称（用 decimal 千分位）（对齐 Semi） |
| class | `string` | `undefined` | 根节点自定义类名（对齐 Semi className） |
| style | `string` | `undefined` | 根节点自定义内联样式（对齐 Semi style） |

**事件**（回调 prop 形式，对齐 Semi）：

| 事件 | 说明 |
| --- | --- |
| `change` | 归一化后值变化（受控核心事件） |
| `numberChange` | 携带 number 类型的变化回调 |
| `upClick` | 点击「+」按钮 |
| `downClick` | 点击「-」按钮 |
| `focus` | 聚焦 |
| `blur` | 失焦（已完成 commit 归一化） |
| `keyDown` | 透传原生 keydown |

### Events

| 事件 | 说明 |
| --- | --- |
| `change` | 归一化后值变化（受控核心事件） |
| `numberChange` | 携带 number 类型的变化回调 |
| `upClick` | 点击「+」按钮 |
| `downClick` | 点击「-」按钮 |
| `focus` | 聚焦 |
| `blur` | 失焦（已完成 commit 归一化） |
| `keyDown` | 透传原生 keydown |

### Slots（Snippets）

| Slot | 参数 | 说明 |
|---|---|---|
| `prefix` | — | 自定义前置区，覆盖 `prefix` prop。 |
| `suffix` | — | 自定义后置区，覆盖 `suffix` prop。 |
| `incrementIcon` | `{ disabled: boolean }` | 自定义「+」图标。 |
| `decrementIcon` | `{ disabled: boolean }` | 自定义「−」图标。 |

### Methods

通过组件实例（`bind:this`）调用（对齐 Semi）：

| 方法 | 说明 |
|---|---|
| `focus()` | 命令式聚焦输入框（尊重 preventScroll）。 |
| `blur()` | 命令式移除焦点。 |

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

对比度：默认文本/背景 ≥ 7:1（AAA 文本），placeholder 与 disabled 文本 ≥ 4.5:1（AA）；步进图标 hover 态对比度 ≥ 3:1（非文本图形）。error/warning 边框与背景对比 ≥ 3:1，且不单独依赖颜色（配合 status 图标/aria 提示）。

## 6. 无障碍

遵循 WAI-ARIA APG「Spinbutton」模式。

- **角色与属性**：`<input>` 使用 `role="spinbutton"`（或保留 `type="text"` + `inputmode="decimal"` 以兼容 `formatter` 含非数字字符；纯数字模式可用 `type="number"`，但因其格式化与 locale 限制，组件默认 `type=text` + spinbutton role）。设置 `aria-valuenow`（当前数值）、`aria-valuemin`、`aria-valuemax`、`aria-valuetext`（当有 formatter 时给出可读文本，如「1,234 元」）。
- **可访问名**：优先外部 `<label for>`；否则 `aria-label`（`ariaLabel` prop）。前后缀（单位）通过 `aria-describedby` 关联说明而非混入 valuetext。
- **状态关联**：`status=error/warning` 时 `aria-invalid="true"`，错误描述通过外部 FormField 的 `aria-describedby` 关联（组件本身不渲染错误文案）。`disabled`→ `disabled` 属性；`readonly`→ `aria-readonly` + 原生 readonly。
- **键盘交互**（对齐 Semi，不含 Home/End/Esc/滚轮——Semi 无此类扩展）：↑/↓ = ±step；PageUp/PageDown 或 Shift+↑/↓ = ±shiftStep；Enter = commit 归一化（不阻止表单提交）。步进按钮 `tabindex="-1"`（功能由输入框键盘覆盖，避免重复 tab 停留）；按钮含 `aria-label`（i18n）供屏幕阅读器指针用户。
- **焦点管理**：点击步进按钮不夺取输入框焦点（按钮 `mousedown.preventDefault`），步进后输入框保持聚焦（`keepFocus` 时命令式 `.focus()`）。
**RTL**：`dir` 由文档继承，步进器随方向镜像（`margin-inline-start` 逻辑属性天然适配）。**对比度**：见第 5 节。

## 7. 国际化

- 用户可见文案零硬编码，全部走 i18n。数字格式化用 `Intl.NumberFormat(locale, options)`，默认 `formatter`（启用千分位时）经其生成；`parser` 默认按 locale 的分组符/小数点解析（如 `1.234,56` vs `1,234.56`），避免硬编码 `,`/`.`。
- locale 来源优先级：`locale` prop > ConfigProvider > 文档 `lang` > `'en'`。

> 本表由 `packages/locale/src/zh_CN.ts` 真源生成（2026-07-30 重校）。键名与键值都是 Semi 契约，勿手写「规划中」的键——历史上本表列过大量从未实现的键名，见 [[locale-dangling-keys-render-raw-key]]。

| i18n key | 默认（zh-CN） |
| --- | --- |
| `InputNumber.increase` | 增加 |
| `InputNumber.decrease` | 减少 |

## 8. 文案

- 遵循 content-guidelines：按钮 aria-label 用动词短语（"Increase value"），简洁、句首大写、无句末标点。
- placeholder 提示期望格式（如 "0.00"、"Enter amount"），不承担校验文案职责（错误由 FormField 表达）。
- 单位用 `suffix`/`prefix`，不写入 placeholder。

**危险操作文案**：InputNumber 本身无破坏性操作。需单列的边界提醒：当用于「会触发不可逆后果的数量」（如批量删除条数、扣费金额）时，使用方应在 `change` 后于外部展示确认，而非误以为组件会阻止越界输入——组件恒 clamp 到 `[min,max]`（对齐 Semi），越界提示文案（如「最多 {max} 项」）归使用方在 `onChange` 里判断后自行展示。

## 9. 性能

| 指标 | 预算 | 说明 |
|---|---|---|
| svelte 组件 gzip | ≤ 5 KB | 含模板、样式（`.size-limit.js` 门禁真源，实测 4.39 KB） |
| core input-number 原语 gzip | ≤ 2 KB | 纯逻辑，可独立 tree-shake |
| `Intl.NumberFormat` | 懒加载 + 缓存 | 仅 `locale`/`currency` 启用时实例化，按 (locale,options) 缓存，避免每次渲染 new |
| 键入响应 | < 4ms/次 | input 仅更新 `editingText`，commit 才 parse/format |
| 长按步进间隔 | `pressInterval`（默认 250ms） | 对齐 Semi，不做递增加速 |

- 不需要虚拟化/惰性渲染（单一输入，无列表）。无浮层故无 `destroyOnClose`。
- `formatter`/`parser`/货币/科学计数法格式化仅在 commit/step/失焦时刻调用，输入过程不格式化（避免光标跳动与性能抖动）。
- 长按定时器在按钮 mouseup/mouseleave/组件卸载时清理，杜绝泄漏。

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

- **core 单测（vitest）**：`roundToPrecision`/`addStep`/`decimalsOf` 浮点边界（`0.1+0.2`、`0.3-0.1`、`precision` 截断/四舍五入）；`formatWithLocale` 多 locale（en-US、de-DE、zh-CN）与缓存。
- **a11y**：axe 无违规；断言 `role=spinbutton`、`aria-valuenow/min/max/valuetext`、`aria-invalid`、按钮 `aria-label`、`aria-readonly`。
- **键盘交互（真机 browser project）**：Tab 聚焦、↑↓ ±step、PageUp/PageDown ±shiftStep、钳到 min/max；步进后焦点保留输入框；步进按钮不可 tab 进入。
- **长按加速**：`pressTimeout`/`pressInterval` 首延迟与重复间隔、卸载清理。
- **受控/非受控**：`value` 受控不自更新、`onChange` 派发；`defaultValue` 路径；空值 `''`↔`null`。
- **视觉/真机**：三尺寸 × 三状态 × innerButtons/hideButtons × disabled/readonly × borderless 悬浮显形。

## 12. 验收标准 checklist

- [ ] 受控 `value` + `on:change` 与非受控 `defaultValue` 均工作；空值正确区分 `''` 与 `null`。
- [ ] step/shiftStep/precision/min/max 全部生效；浮点步进无 `0.1+0.2` 误差。
- [ ] min/max clamp 行为正确（对齐 Semi 恒 clamp，无 strict 模式），按钮在边界 disabled。
- [ ] formatter/parser 多 locale 往返一致，输入过程不格式化、不跳光标；失焦归一化。
- [ ] 键盘 ↑↓/PageUp·Down/Enter 完整（对齐 Semi，无 Home/End/Esc/滚轮扩展）；步进按钮 `tabindex=-1` 不入 tab 序。
- [ ] 点击步进按钮不夺焦，步进后输入框保持聚焦。
- [ ] WCAG 2.1 AA：axe 通过；role/aria-value*/aria-invalid/aria-readonly/aria-label 正确。
- [ ] 对比度达标（文本 ≥7:1，placeholder/disabled ≥4.5:1，图标/边框 ≥3:1）；RTL 镜像正确。
- [ ] 所有可见文案走 i18n，数字/分组符由 `Intl` 按 locale 决定，无硬编码。
- [ ] 仅消费 Alias/Component token，无写死颜色/尺寸；`--cd-input-number-*` 可覆盖。
- [ ] core 逻辑零 DOM 依赖、可独立单测；svelte 负责 DOM/状态机与渲染转发。
- [ ] Perf Budget 达标（svelte ≤5KB / core ≤2KB gzip）；长按定时器无泄漏。
- [ ] 提供 `component.meta.ts`，字段（props/events/slots/i18nKeys/tokens/a11yPattern）完整准确。
