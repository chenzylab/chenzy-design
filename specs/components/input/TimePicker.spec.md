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

> 本表由 `packages/svelte/src/time-picker/meta.ts` 真源生成（2026-07-30 重校）。此前本表列的 prop 多为 Semi 对齐前的旧名或已删除项（如 `value`→`activeKey`、`change`→`onChange`），改 prop 时请同步 meta.ts，勿手写「规划中」的 prop。

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| value | `Date \| string \| [Date\|string\|null, Date\|string\|null] \| null` | `undefined` |  |
| defaultValue | `Date \| string \| [Date\|string\|null, Date\|string\|null] \| null` | `null` |  |
| type | `'time'\|'timeRange'` | `'time'` |  |
| format | `string` | `'HH:mm:ss'` | 格式串，决定显示列与 12h（含 ss 显示秒列） |
| open | `boolean` | `undefined` |  |
| defaultOpen | `boolean` | `false` |  |
| placeholder | `string` | `'请选择时间'` |  |
| size | `'small'\|'default'\|'large'` | `'default'` |  |
| validateStatus | `'default'\|'warning'\|'error'` | `'default'` |  |
| disabled | `boolean` | `false` |  |
| hourStep | `number` | `1` |  |
| minuteStep | `number` | `1` |  |
| secondStep | `number` | `1` |  |
| use12Hours | `boolean` | `false` |  |
| timeZone | `string \| number` | `undefined` | 时区（数字偏移 / GMT±HH:mm / IANA） |
| disabledHours | `() => number[]` | `undefined` |  |
| disabledMinutes | `(hour: number) => number[]` | `undefined` |  |
| disabledSeconds | `(hour: number, minute: number) => number[]` | `undefined` |  |
| hideDisabledOptions | `boolean` | `false` |  |
| locale | `string` | `'zh-CN'` |  |
| onChange | `(v: (Date\|null) \| [Date\|null, Date\|null]) => void` | `undefined` |  |
| onOpenChange | `(open: boolean) => void` | `undefined` |  |
| autoAdjustOverflow | `boolean` | `true` | 浮层溢出自动调整 |
| autoFocus | `boolean` | `false` | 挂载时自动聚焦触发器 |
| clearIcon | `Snippet` | `undefined` | 自定义清除按钮图标 |
| showClear | `boolean` | `true` | 是否显示清除按钮 |
| clearText | `string` | `'clear'` | 清除按钮 aria/title 文案 |
| popupClassName | `string` | `undefined` | 浮层 className |
| dropdownMargin | `number \| { x?: number; y?: number }` | `undefined` | 浮层溢出冗余 |
| popupStyle | `string \| Record<string, string>` | `undefined` | 浮层内联样式 |
| focusOnOpen | `boolean` | `false` | 打开面板时自动聚焦触发器 |
| getPopupContainer | `() => HTMLElement` | `undefined` | 浮层挂载容器 |
| motion | `boolean` | `true` | 面板展开动画 |
| panelHeader | `string \| Snippet` | `undefined` | 面板顶部自定义内容 |
| panelFooter | `string \| Snippet` | `undefined` | 面板底部自定义内容 |
| position | `string` | `'bottomLeft'` | 浮层弹出位置 |
| rangeSeparator | `string` | `' ~ '` | 范围模式分隔符 |
| scrollItemProps | `Record<string, unknown>` | `undefined` | 滚动列 item 属性透传 |
| stopPropagation | `boolean` | `true` | 阻止浮层点击事件冒泡 |
| zIndex | `number` | `1030` | 浮层 z-index（对齐 Semi popoverNumbers.DEFAULT_Z_INDEX） |
| onBlur | `(e: FocusEvent) => void` | `undefined` | 触发器失焦 |
| onFocus | `(e: FocusEvent) => void` | `undefined` | 触发器聚焦 |
| onChangeWithDateFirst | `boolean` | `true` | onChange 参数 dateFirst 模式 |
| disabledTime | `(date: Date \| null, panelType?: 'left'\|'right') => { disabledHours?; disabledMinutes?; disabledSeconds? } \| undefined` | `undefined` | 按已选时间返回禁用规则，覆盖顶层 disabledHours/Minutes/Seconds |
| inputStyle | `string \| Record<string, string>` | `undefined` | 输入框样式（透传到 Input） |
| inputReadOnly | `boolean` | `false` | 输入框 readonly（仅允许通过面板选择） |
| insetLabel | `Snippet \| string` | `undefined` | 内嵌标签（透传给 Input） |
| insetLabelId | `string` | `undefined` | 内嵌标签容器 id（透传给 Input） |
| triggerRender | `Snippet<[{ value: Date \| null; placeholder: string; open: boolean; disabled: boolean }]>` | `undefined` | 完全自定义触发器渲染 |
| borderless | `boolean` | `false` | 无边框模式 |
| preventScroll | `boolean` | `false` | focus 时阻止滚动 |
| class | `string` | `undefined` | 根节点类名 |
| style | `string` | `undefined` | 根节点内联样式 |
| id | `string` | `undefined` | 根节点 id |
| ariaLabelledby | `string` | `undefined` | aria-labelledby 透传 |
| ariaDescribedby | `string` | `undefined` | aria-describedby 透传 |
| ariaErrormessage | `string` | `undefined` | aria-errormessage 透传 |
| ariaInvalid | `boolean` | `undefined` | aria-invalid 透传 |
| ariaRequired | `boolean` | `undefined` | aria-required 透传 |

### Events

> 本组件无事件回调 prop（meta.events 为空）。此前本表列的回调均未实现，已删。

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

> 本表由 `packages/locale/src/zh_CN.ts` 真源生成（2026-07-30 重校）。键名与键值都是 Semi 契约，勿手写「规划中」的键——历史上本表列过大量从未实现的键名，见 [[locale-dangling-keys-render-raw-key]]。

| i18n key | 默认（zh-CN） |
| --- | --- |
| `TimePicker.placeholder.time` | 请选择时间 |
| `TimePicker.placeholder.timeRange` | 请选择时间范围 |
| `TimePicker.triggerLabel` | 选择时间 |
| `TimePicker.hour` | 时 |
| `TimePicker.minute` | 分 |
| `TimePicker.second` | 秒 |
| `TimePicker.hourLabel` | 小时 |
| `TimePicker.minuteLabel` | 分钟 |
| `TimePicker.secondLabel` | 秒 |
| `TimePicker.AM` | 上午 |
| `TimePicker.PM` | 下午 |
| `TimePicker.begin` | 开始时间 |
| `TimePicker.end` | 结束时间 |

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
- [ ] 所有类名 `cd-time-picker` BEM-like，无写死样式值，仅消费 Alias/Component Token。
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
