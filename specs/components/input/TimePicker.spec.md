# SPEC · TimePicker
> 分类：input · 阶段：M2
> 对标 Semi：TimePicker

## 1. 概述

TimePicker 是时间选择控件，用于在表单中精确选取时、分、秒（可选毫秒）。触发器为只读文本输入框，点击后弹出浮层，浮层内呈现可滚动的「时 / 分 / 秒 / 上下午」列。

核心能力：
- 12 小时制（`use12Hours`，附带 AM/PM 列）与 24 小时制切换。
- 步进控制：`hourStep`/`minuteStep`/`secondStep`，过滤不可选项。
- 精度控制：通过 `format`（如 `HH:mm`、`HH:mm:ss`、`hh:mm a`）决定显示哪些列。
- 受控/非受控值，`disabledHours`/`disabledMinutes`/`disabledSeconds` 禁用项。
- 「此刻」快捷按钮、清除按钮、范围选择（`type="timeRange"`）。
- 与 Form/DatePicker 复用同一交互范式（`value`+`on:change`、`open`+`on:openChange`）。

不在范围内：日期选择（由 DatePicker 负责）、倒计时/计时（由 Statistic.Timer 负责）。

## 2. 设计语义

- **角色定位**：组合控件 = 文本触发器（input）+ 浮层（popover）+ 多列滚动选择器（listbox 组）。
- **尺寸**：`small`(28px) / `default`(32px) / `large`(40px)，影响触发器高度、字号与列项行高。
- **校验态**：`status: default|warning|error`，复用 `--cd-color-warning`/`--cd-color-danger` 描边与图标。
- **状态**：默认 / hover / focus（聚焦环）/ active（浮层打开）/ disabled / readonly / 清除按钮 hover。
- **列项状态**：普通 / hover / selected（高亮 + 主色）/ disabled（降透明度 + 禁止指针）。
- **滚动语义**：每列为独立滚动容器，选中项滚动至顶部（或居中，由 `scrollItemProps` 控制），选中时带平滑滚动（reduced-motion 下降级为瞬时）。
- **空值表达**：占位符灰显，清除后回到占位态。
- **浮层定位**：默认 `bottomLeft`，空间不足时翻转到 `top`，宽度自适应列数。

## 3. 分层实现

- **@chenzy-design/core · `createTimePicker`**（headless）：
  - 维护内部时间模型 `{ hour, minute, second, meridiem }` 与 `format` 解析/格式化（`parseFormat(format)` → 列定义）。
  - 生成各列可选项并应用 `step` 与 `disabledXxx` 过滤。
  - 复用原语：`useDismiss`（点击外部 / Esc 关闭浮层）、`useId`（input 与 listbox 关联）、`useRovingTabindex`（每列 option 上下导航 + 跨列 Tab）、`useLiveAnnouncer`（选中时播报当前时间）、`useScrollLock` 仅在 `position` 为全屏移动端弹层时启用。
  - 暴露 `getTriggerProps` / `getPanelProps` / `getColumnProps(col)` / `getOptionProps(col, value)` / `setNow()` / `clear()`。
- **@chenzy-design/svelte · `TimePicker.svelte`**：消费 core store，渲染触发器、浮层、列与脚注（此刻/确认/清除）；处理滚动定位与列项虚拟化策略。
- **复用关系**：DatePicker 在含时间模式（`showTime`）时内嵌 `createTimePicker` 的列逻辑，保证步进/禁用规则一致。

## 4. API

### Props

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| value | `Date \| string \| (Date\|string)[]` | — | 受控值；range 时为二元数组 |
| defaultValue | `Date \| string \| ...` | — | 非受控初始值 |
| open | `boolean` | — | 受控浮层显隐 |
| defaultOpen | `boolean` | `false` | 非受控初始显隐 |
| type | `'time' \| 'timeRange'` | `'time'` | 单选或时间区间 |
| format | `string` | `'HH:mm:ss'` | 显示/解析格式，决定列 |
| use12Hours | `boolean` | `false` | 启用 12 小时制（AM/PM 列） |
| hourStep | `number` | `1` | 小时步进 |
| minuteStep | `number` | `1` | 分钟步进 |
| secondStep | `number` | `1` | 秒步进 |
| disabledHours | `() => number[]` | — | 返回禁用的小时 |
| disabledMinutes | `(h: number) => number[]` | — | 按小时返回禁用分钟 |
| disabledSeconds | `(h, m) => number[]` | — | 按时分返回禁用秒 |
| disabledTime | `(date: Date) => { disabledHours?, disabledMinutes?, disabledSeconds? }` | — | 按当前已选时间返回禁用规则；返回的字段覆盖顶层 `disabledHours`/`disabledMinutes`/`disabledSeconds`，未返回的回退顶层 |
| hideDisabledOptions | `boolean` | `false` | 隐藏（而非置灰）禁用项 |
| size | `'small' \| 'default' \| 'large'` | `'default'` | 尺寸 |
| status | `'default' \| 'warning' \| 'error'` | `'default'` | 校验态 |
| disabled | `boolean` | `false` | 整体禁用 |
| readonly | `boolean` | `false` | 只读不可改 |
| clearable | `boolean` | `true` | 显示清除按钮 |
| placeholder | `string \| [string, string]` | i18n 默认 | 占位符 |
| showNow | `boolean` | `true` | 显示「此刻」按钮 |
| inputReadOnly | `boolean` | `false` | 禁止键盘直接输入文本 |
| position | `Placement` | `'bottomLeft'` | 浮层定位 |
| getPopupContainer | `() => HTMLElement` | `body` | 浮层挂载容器 |
| destroyOnClose | `boolean` | `true` | 关闭时卸载浮层 DOM（内存/无障碍更干净）；`false` 则首次打开后保留 DOM（关闭仅 `hidden`） |
| zIndex | `number` | `1030` | 浮层层级 |
| panelHeader / panelFooter | `Snippet` | — | 自定义浮层头/尾 |

### Events

| Event | payload | 说明 |
|---|---|---|
| on:change | `{ value: Date \| Date[], dateString: string \| string[] }` | 值变更（确认/列选中触发） |
| on:openChange | `{ open: boolean }` | 浮层显隐变化 |
| on:focus | `FocusEvent` | 触发器获焦 |
| on:blur | `FocusEvent` | 触发器失焦 |
| on:clear | `void` | 点击清除 |
| on:panelChange | `{ value, panel: 'hour'\|'minute'\|'second'\|'meridiem' }` | 浮层内某列变更（未确认） |

### Methods

组件实例方法（Svelte 5 `export function`，经 `bind:this` 获取实例后调用）。

| 名称 | 说明 |
|---|---|
| `focus()` | 命令式聚焦触发器（尊重 `preventScroll`，对齐 Semi）。 |
| `blur()` | 命令式移除焦点（对齐 Semi）。 |

### Slots

| Slot/Snippet | 参数 | 说明 |
|---|---|---|
| trigger | `{ value, open, dateString }` | 完全自定义触发器渲染 |
| prefix | — | 触发器前缀图标/文本 |
| suffix | — | 替换默认时钟图标 |
| panelHeader | `{ value }` | 浮层头部 |
| panelFooter | `{ confirm, clear, setNow }` | 浮层底部操作区 |
| clearIcon | — | 自定义清除图标 |

## 5. 主题 / Token 表

| Component Token | 引用 Alias | 用途 |
|---|---|---|
| --cd-timepicker-height-small | --cd-height-small (28px) | small 触发器高度 |
| --cd-timepicker-height-default | --cd-height-default (32px) | default 高度 |
| --cd-timepicker-height-large | --cd-height-large (40px) | large 高度 |
| --cd-timepicker-color-text | --cd-color-text-0 | 输入文本色 |
| --cd-timepicker-color-placeholder | --cd-color-text-2 | 占位符色 |
| --cd-timepicker-color-bg | --cd-color-bg-0 | 触发器/浮层背景 |
| --cd-timepicker-color-border | --cd-color-border | 默认描边 |
| --cd-timepicker-color-border-hover | --cd-color-primary-hover | hover 描边 |
| --cd-timepicker-color-border-active | --cd-color-primary | 聚焦/打开描边 |
| --cd-timepicker-color-border-warning | --cd-color-warning | warning 态描边 |
| --cd-timepicker-color-border-error | --cd-color-danger | error 态描边 |
| --cd-timepicker-focus-ring | --cd-color-primary-light | 聚焦环 |
| --cd-timepicker-option-color-selected | --cd-color-primary | 选中项文本 |
| --cd-timepicker-option-bg-selected | --cd-color-primary-light | 选中项背景 |
| --cd-timepicker-option-bg-hover | --cd-color-fill-0 | 列项 hover 背景 |
| --cd-timepicker-option-height | --cd-spacing-7 (28px) | 列项行高 |
| --cd-timepicker-panel-radius | --cd-radius-medium | 浮层圆角 |
| --cd-timepicker-panel-shadow | --cd-shadow-elevated | 浮层阴影 |
| --cd-timepicker-divider-color | --cd-color-border | 列分隔线 |

约束：组件样式仅消费上表 Component/Alias Token，禁止写死颜色、间距、阴影字面量。

## 6. 无障碍

- 遵循 WAI-ARIA APG「Combobox（grid/listbox popup）」+ 多列 listbox 复合模式。
- **触发器**：`role="combobox"` `aria-haspopup="listbox"` `aria-expanded` `aria-controls=<panelId>` `aria-label`/`aria-labelledby`（Form 关联）；`status=error` 时 `aria-invalid="true"` 并 `aria-describedby` 指向错误文案。
- **浮层**：`role="dialog"` 包裹，内部每列 `role="listbox"` 带 `aria-label`（如 "小时"/"分钟"），列项 `role="option"` `aria-selected` `aria-disabled`。
- **键盘**：
  - `Enter`/`Space`/`ArrowDown`：打开浮层并聚焦当前小时列。
  - `Esc`：关闭浮层，焦点回触发器（`useDismiss`）。
  - 列内 `↑/↓`：上下移动选项（`useRovingTabindex`，循环）；`Home/End` 跳首尾。
  - `Tab`/`Shift+Tab`：在列间移动；最后一列 Tab 移至底部操作按钮。
  - 直接键入数字（`inputReadOnly=false`）解析为时间。
- **焦点管理**：浮层为非模态，不强制 focus trap；点击外部经 `useDismiss` 关闭。
- **播报**：`useLiveAnnouncer` 在列选中时 `aria-live="polite"` 播报已格式化的完整时间。
- **对比度**：选中项文本/背景、占位符均满足 4.5:1；聚焦环 3:1。
- **reduced-motion**：列滚动定位与浮层进出动画降级为无动画。
- **RTL**：列顺序与触发器图标镜像；时间数字本身保持 LTR 数字方向。

## 7. 国际化

- 用户可见文案零硬编码，全部走 i18n key：

| i18n key | 默认（zh-CN） |
|---|---|
| TimePicker.placeholder | 请选择时间 |
| TimePicker.placeholderStart | 开始时间 |
| TimePicker.placeholderEnd | 结束时间 |
| TimePicker.now | 此刻 |
| TimePicker.confirm | 确定 |
| TimePicker.clear | 清除 |
| TimePicker.am | 上午 |
| TimePicker.pm | 下午 |
| TimePicker.hour | 时 |
| TimePicker.minute | 分 |
| TimePicker.second | 秒 |
| TimePicker.columnHourLabel | 小时 |
| TimePicker.columnMinuteLabel | 分钟 |
| TimePicker.columnSecondLabel | 秒钟 |

- 时间格式化使用 `Intl.DateTimeFormat`（结合 locale 的 hourCycle `h11/h12/h23/h24`），`use12Hours` 与 AM/PM 文案由 locale 决定，不写死 "AM/PM"。
- `format` 字符串语义保持稳定（开发面向），展示层 locale 化。

## 8. 文案

- 遵循 content-guidelines：列标签使用最短可辨识词（时/分/秒）；按钮用动词（此刻、确定、清除）。
- 占位符以「请选择…」开头，range 区分开始/结束。
- 屏幕播报用完整可读时间（如「已选择 下午 02:30」），而非裸数字。
- **危险操作文案（单列）**：本组件无破坏性操作；「清除」仅清空当前未提交选择，不触发数据删除，因此不需二次确认，文案保持「清除」即可，不使用「删除/移除」等强语义词。

## 9. 性能（Perf Budget）

| 指标 | 预算 | 说明 |
|---|---|---|
| svelte 组件 gzip | ≤ 6.55 KB | 不含 core |
| core `createTimePicker` gzip | ≤ 2.5 KB | 含格式解析与原语引用 |
| 首次打开浮层 | ≤ 16ms | 列项 < 60×3，无需虚拟化 |
| 列滚动定位 | ≤ 8ms / 帧 | `scrollTo` + rAF 批处理 |
| 键入解析 | ≤ 4ms | 防抖 80ms |

策略：
- **不虚拟化**：单列最多 60 项（秒/分），DOM 量可控；不引入虚拟列表以省体积。
- **惰性渲染**：浮层内容首次打开才挂载；`destroyOnClose=true`（默认）关闭即卸载列 DOM（内存/无障碍更干净）；`destroyOnClose=false` 首次打开后保留 DOM，关闭仅 `hidden`（适合频繁开关、避免重复挂载开销的场景）。
- 列选项缓存：`step`/`disabledXxx` 不变时记忆化 option 数组。
- 滚动定位用 `scrollTop` 直接赋值（reduced-motion）或 `scroll-behavior: smooth`，避免 JS 逐帧。

## 10. AI 元数据

提供 `component.meta.ts`，包含：
- `name: 'TimePicker'`、`category: 'input'`、`stage: 'M2'`、`semiEquivalent: 'TimePicker'`。
- `props`/`events`/`slots` 结构化签名（类型、默认值、枚举值、是否受控）。
- `tokens`：第 5 节 Component Token 清单及其 Alias 映射。
- `a11y`：role/aria 摘要与键盘交互表。
- `i18nKeys`：第 7 节 key 列表。
- `examples`：基础、24h、12h+AM/PM、带秒+步进、timeRange、Form 集成、禁用项 等代码片段。
- `relations`：`{ embeddedBy: ['DatePicker'], sharesCoreWith: ['DatePicker'] }`。

## 11. 测试

- **单元（core）**：`parseFormat` 列解析；step 过滤；`disabledHours/Minutes/Seconds` 级联；12/24h 与 meridiem 互转；`setNow()`/`clear()`；边界（step 不整除 60、value 越界）。
- **组件**：受控/非受控同步；`open`+`on:openChange`；列选中触发 `panelChange`，确认触发 `change`；清除路径；占位符与 range 双输入。
- **a11y**：jest-axe 零违规；role/aria 快照；键盘全流程（开/导航/选/关/焦点回归）；live 播报断言；RTL 镜像。
- **视觉回归**：三尺寸 × 三 status × {空/选中/禁用项/12h}。
- **i18n**：切 locale 验证文案与 `Intl` 格式（hourCycle）、伪本地化溢出。
- **性能**：打开/滚动/解析的基准在预算内；`destroyOnClose` 卸载验证。

## 12. 验收标准 Checklist

- [ ] 包名 `@chenzy-design/core` / `@chenzy-design/svelte`；core 暴露 `createTimePicker`。
- [ ] 所有类名 `cd-timepicker` BEM-like，无写死样式值，仅消费 Alias/Component Token。
- [ ] API 遵循 `value`+`on:change`、`open`+`on:openChange`、`size`、`status` 约定。
- [ ] 12/24 小时制与 `use12Hours` AM/PM 列正确，hourCycle 由 locale 驱动。
- [ ] `hourStep/minuteStep/secondStep` 与 `disabledHours/Minutes/Seconds` 级联生效。
- [ ] `format` 决定显示列（时/分/秒可裁剪）。
- [ ] 复用 `useDismiss/useRovingTabindex/useLiveAnnouncer/useId`；按需 `useScrollLock`。
- [ ] WCAG 2.1 AA：role/aria、键盘全流程、焦点回归、对比度、reduced-motion、RTL 全部满足。
- [ ] 用户可见文案零硬编码，i18n key 齐备；日期/数字走 `Intl`。
- [ ] 危险操作文案单列说明（清除为非破坏性，无需二次确认）。
- [ ] Perf Budget 达标；惰性渲染 + `destroyOnClose` 支持；无不必要虚拟化。
- [ ] 提供 `component.meta.ts`，含 props/events/slots/tokens/a11y/i18nKeys/examples/relations。
- [ ] 与 DatePicker `showTime` 共享 core 列逻辑，步进/禁用规则一致。
