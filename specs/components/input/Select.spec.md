# SPEC · Select
> 分类：input · 阶段：M2
> 对标 Semi：Select

## 1. 概述

Select 是从一组预定义选项中进行选择的下拉表单控件，是 chenzy-design 表单体系中复杂度最高的 input 类组件之一。它在收起态显示当前选中值（或占位符），展开后呈现一个 ARIA listbox 浮层供用户选择。

核心能力：
- **单选 / 多选**：`multiple` 切换；多选以 Tag 形式回显，支持 `maxTagCount` 折叠为 `+N`。
- **可搜索（filter）**：内置过滤或受控 `onSearch` 远程检索；支持 `remote` 模式（输入触发请求、loading 态、防抖）。
- **虚拟化**：选项超阈值（默认 > 100）自动启用虚拟滚动，仅渲染可视区，保证万级选项流畅。
- **创建项（allowCreate / tags 模式）**：搜索无匹配时允许把输入文本作为新选项创建。
- **分组（OptGroup）/ 禁用项 / 自定义渲染 / 前后缀 / 清除 / 校验态**。

适用场景：表单字段选择、筛选器、标签编辑、远程联想搜索。不适用场景：选项极少且需常驻可见时用 Radio/Checkbox；树形层级数据用 TreeSelect；纯命令面板用 Cascader/AutoComplete。

它属于"复合控件"，键盘与 a11y 逻辑（listbox 焦点环、roving、type-ahead、dismiss）较重，因此 headless 逻辑下沉至 `@chenzy-design/core` 的 `createSelect`。

## 2. 设计语义

- **触发器（trigger / selector）**：默认呈现为与 Input 一致的边框盒，保证表单内视觉对齐。高度由 `size` 决定（small 24 / default 32 / large 40）。右侧常驻箭头图标，展开时旋转 180°（受 reduced-motion 约束）。
- **校验态映射**：`status` 直接驱动边框/聚焦环颜色——default→`--cd-color-border`，warning→`--cd-color-warning`，error→`--cd-color-danger`。
- **浮层（popover/listbox）**：宽度默认跟随触发器（`dropdownMatchSelectWidth`），通过共享 popover 定位原语贴合触发器，避免视口溢出（自动翻转）。z-index 走全局浮层层级 token。
- **选中语义**：单选——选中项高亮 + 勾选/底色；多选——勾选框 + Tag 回显。hover/active/selected/disabled 四态分明，selected 用 `--cd-color-primary` 弱化底色保证文字对比度。
- **空态与加载态**：无匹配时显示 `emptyContent`；远程加载显示 spinner，二者语义清晰区分（"无数据" vs "加载中"）。
- **密度**：选项行高随 `size` 变化，多选 Tag 与行高协调。
- 设计语言对标 Semi，但所有颜色/圆角/间距均消费 Alias 与 Component token，组件内禁止写死色值与像素。

## 3. 分层实现

本组件含重交互/键盘/a11y，采用 headless + 渲染分层。

**`@chenzy-design/core` — `createSelect`（headless）**
职责：维护展开状态、活动项（aria-activedescendant 指针）、选中集合、搜索关键字与过滤结果、虚拟化窗口计算、type-ahead 缓冲、创建项判定。输出状态快照 + 事件 handler + a11y 属性 getter（getTriggerProps / getListboxProps / getOptionProps / getSearchInputProps），与框架无关。
复用 core 原语：
- `useDismiss`：点击外部 / Esc 关闭浮层。
- `useRovingTabindex` + `aria-activedescendant` 混合模型：焦点保留在触发器/搜索框，活动项通过 activedescendant 指示（listbox 推荐模式）。
- `useScrollLock`：可选，移动端全屏选择时锁定 body 滚动。
- `useLiveAnnouncer`：播报"已选 N 项""无匹配结果""已加载 M 个选项"。
- `useId`：生成 listbox / option / 关联 label 的稳定 id。
- `useFocusTrap`：仅在 `mobileFullscreen` 浮层中启用。
虚拟化：core 暴露 `getVirtualItems()`（基于固定/估算行高的窗口算法），渲染层据此只渲染可视 option，与 List/Table 共用同一虚拟化原语。

**`@chenzy-design/svelte` — `Select.svelte` / `Option.svelte` / `OptGroup.svelte`**
职责：消费 `createSelect` 状态，渲染 trigger、Tag、浮层、虚拟列表、空/加载态；接入 popover 定位、Transition（受 reduced-motion 约束）；桥接 `value`/`open` 双向绑定与事件派发。`destroyOnClose` 控制浮层 DOM 是否随关闭销毁。

## 4. API

### 4.1 Props

| 名称 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| value | string \| number \| Array<string\|number> | — | 受控选中值；多选为数组。配合 `on:change`。 |
| defaultValue | 同上 | — | 非受控初始值。 |
| options | Array<OptionData \| GroupData> | [] | 数据驱动选项；亦可用 `<Option>` 子节点声明式。 |
| multiple | boolean | false | 多选模式。 |
| filter | boolean \| (input, option) => boolean | false | 是否可搜索 / 自定义过滤函数。 |
| remote | boolean | false | 远程搜索模式，过滤交由 `on:search`，内部不再本地过滤。 |
| loading | boolean | false | 显示加载态（远程请求中）。 |
| open | boolean | — | 受控浮层显隐，配合 `on:openChange`。 |
| defaultOpen | boolean | false | 非受控初始展开。 |
| size | 'small' \| 'default' \| 'large' | 'default' | 尺寸。 |
| status | 'default' \| 'warning' \| 'error' | 'default' | 校验态。 |
| placeholder | string | i18n `Select.placeholder` | 占位符。 |
| disabled | boolean | false | 禁用整个控件。 |
| clearable | boolean | false | 显示清除按钮。 |
| allowCreate | boolean | false | 搜索无匹配时允许创建新项（tags 场景）。 |
| maxTagCount | number | — | 多选 Tag 折叠阈值，超出显示 `+N`。 |
| maxTagTextLength | number | — | 单个 Tag 文本最大长度，超出省略。 |
| virtualize | boolean \| { itemHeight: number } | 'auto' | 虚拟化；auto = 选项数超阈值自动开启。 |
| dropdownMatchSelectWidth | boolean | true | 浮层宽度是否跟随触发器。 |
| destroyOnClose | boolean | false | 关闭时销毁浮层 DOM。 |
| getPopupContainer | () => HTMLElement | body | 浮层挂载容器。 |
| emptyContent | string \| Snippet | i18n `Select.empty` | 无数据内容。 |
| optionLabelProp | string | 'label' | 用作回显的字段名。 |
| debounce | number | 300 | 远程搜索防抖毫秒。 |
| autoFocus | boolean | false | 挂载自动聚焦。 |
| id | string | auto(useId) | 关联外部 `<label for>`。 |

### 4.2 Events

| 事件 | payload | 说明 |
|---|---|---|
| on:change | `{ value, option, options }` | 选中值变化（单/多选）。 |
| on:openChange | `{ open: boolean }` | 浮层显隐变化。 |
| on:search | `{ input: string }` | 搜索输入变化（remote 据此请求；已防抖）。 |
| on:select | `{ value, option }` | 选中某一项（含取消多选项时同源派发）。 |
| on:deselect | `{ value, option }` | 多选取消某项。 |
| on:clear | `void` | 点击清除。 |
| on:create | `{ input: string }` | allowCreate 触发创建新项。 |
| on:focus | `FocusEvent` | 触发器获焦。 |
| on:blur | `FocusEvent` | 触发器失焦。 |
| on:scrollToBottom | `void` | 浮层滚动触底（远程分页加载用）。 |

### 4.3 Slots / Snippets

| 名称 | 参数 | 说明 |
|---|---|---|
| default | — | 声明式 `<Option>` / `<OptGroup>` 子节点。 |
| option | `{ option, selected, active }` | 自定义单项渲染。 |
| label | `{ option }` | 自定义触发器内选中值/Tag 渲染。 |
| prefix | — | 触发器左侧前缀（图标/文本）。 |
| suffix | — | 触发器右侧后缀（覆盖默认箭头）。 |
| empty | — | 自定义空态（等价 `emptyContent`）。 |
| loading | — | 自定义加载态。 |
| dropdownHeader | — | 浮层顶部固定区。 |
| dropdownFooter | — | 浮层底部固定区（如"加载更多"）。 |

## 5. 主题 / Token 表

仅消费 Alias / Component token，禁止写死。

| Component Token | 回退 Alias | 用途 |
|---|---|---|
| --cd-select-bg | --cd-color-bg-0 | 触发器背景 |
| --cd-select-color-text | --cd-color-text-0 | 选中值文本 |
| --cd-select-color-placeholder | --cd-color-text-2 | 占位符文本 |
| --cd-select-border-color | --cd-color-border | 默认边框 |
| --cd-select-border-color-hover | --cd-color-primary | hover 边框 |
| --cd-select-border-color-active | --cd-color-primary | 聚焦/展开边框 |
| --cd-select-border-color-warning | --cd-color-warning | warning 态边框 |
| --cd-select-border-color-error | --cd-color-danger | error 态边框 |
| --cd-select-radius | --cd-radius-md | 圆角 |
| --cd-select-height-small | --cd-size-height-small | small 高度 |
| --cd-select-height-default | --cd-size-height-default | default 高度 |
| --cd-select-height-large | --cd-size-height-large | large 高度 |
| --cd-select-dropdown-bg | --cd-color-bg-0 | 浮层背景 |
| --cd-select-dropdown-shadow | --cd-shadow-2 | 浮层阴影 |
| --cd-select-dropdown-radius | --cd-radius-md | 浮层圆角 |
| --cd-select-option-color-hover | --cd-color-fill-0 | 选项 hover/active 底色 |
| --cd-select-option-color-selected | --cd-color-primary-light | 选中项底色 |
| --cd-select-option-color-text-selected | --cd-color-primary | 选中项文本 |
| --cd-select-option-color-disabled | --cd-color-text-3 | 禁用项文本 |
| --cd-select-tag-bg | --cd-color-fill-0 | 多选 Tag 背景 |
| --cd-select-clear-color | --cd-color-text-2 | 清除图标颜色 |

暗色模式经由 Alias 层切换，组件无需单独适配。

## 6. 无障碍（WCAG 2.1 AA / WAI-ARIA APG: Combobox + Listbox）

**结构与 role**：
- 触发器为 `role="combobox"`，`aria-haspopup="listbox"`，`aria-expanded`，`aria-controls=<listbox id>`，`aria-activedescendant=<active option id>`（无 DOM 焦点移动）。
- 可搜索模式下触发器内为 `<input role="combobox">`；不可搜索时触发器为可聚焦 `div`/`button`（`tabindex=0`）。
- 浮层 `role="listbox"`，多选时 `aria-multiselectable="true"`。
- 选项 `role="option"` + `aria-selected`；禁用项 `aria-disabled="true"`。
- 分组 `role="group"` + `aria-label`（OptGroup 标题）。
- 关联标签：`aria-labelledby` 指向外部 label；`status=error` 时 `aria-invalid="true"` 并 `aria-describedby` 指向错误文本。

**键盘交互**（采用 activedescendant 模型）：
- `Enter` / `Space`（不可搜索时）/ `Alt+ArrowDown`：打开浮层。
- `ArrowDown / ArrowUp`：移动活动项（循环可配），跳过禁用项。
- `Home / End`：首/末项。
- `Enter`：选中活动项；单选后关闭，多选保持展开。
- `Esc`：关闭浮层（保留焦点于触发器）。
- `Backspace`（多选且搜索框为空）：删除最后一个 Tag。
- type-ahead：不可搜索模式下连续字符跳转匹配项。
- `Tab`：关闭浮层并移交焦点（不吞 Tab）。

**焦点管理**：焦点常驻触发器/搜索框，活动项靠 activedescendant 指示，活动项自动滚入可视区；关闭后焦点回到触发器；`mobileFullscreen` 时启用 `useFocusTrap`。

**其他**：
- 对比度：选中项文本/底色、占位符均满足 AA（≥4.5:1，占位符按非必读豁免仍尽量达标）。
- reduced-motion：箭头旋转、浮层展开过渡降级为即时。
- RTL：箭头/清除位置、Tag 排列、type-ahead 文本方向镜像。
- 屏幕阅读器：经 `useLiveAnnouncer` 播报选中数量、无匹配、加载完成（assertive/polite 视情况）。

## 7. 国际化

用户可见文案零硬编码，全部走 i18n key：

| key | 默认（zh-CN） | 说明 |
|---|---|---|
| Select.placeholder | 请选择 | 占位符 |
| Select.searchPlaceholder | 搜索 | 搜索框占位 |
| Select.empty | 无匹配选项 | 空态 |
| Select.loading | 加载中 | 加载态 |
| Select.clear | 清除 | 清除按钮 aria-label |
| Select.create | 创建 "{input}" | allowCreate 提示 |
| Select.maxTagCount | +{count} | Tag 折叠计数 |
| Select.selectedCount | 已选 {count} 项 | 多选播报 |
| Select.announceExpanded | 展开，共 {count} 个选项 | 展开播报 |
| Select.announceLoaded | 已加载 {count} 个选项 | 远程播报 |

- 计数（`{count}`）通过 `Intl.NumberFormat` 格式化以适配千分位/本地化数字。
- 含选项类（如日期型选项标签）的展示交由调用方用 `Intl.DateTimeFormat` 预格式化。
- 文案支持复数规则（经 i18n 运行时 plural 选择）。

## 8. 文案

遵循 content-guidelines：
- 占位符用动词短语"请选择"，避免"选择一个选项…"冗余。
- 空态用"无匹配选项"而非"没有数据"，区分"未搜索到"与"列表为空"两种语境（可由 `emptyContent` 定制）。
- 创建项文案保留引号高亮用户输入：`创建 "xxx"`。
- 计数文案简洁："已选 3 项"，不写"您已经选择了 3 个选项"。

**危险操作文案（单列）**：
- 清除全部（多选 clearable）：清除动作不可撤销地移除当前所有选中值。aria-label 用 `Select.clear`（"清除"）；若业务侧需二次确认，应在外层包裹确认弹窗，组件本身不弹确认（保持轻量），但文档须提示："清除将移除全部已选项且不可撤销。"

## 9. 性能（Perf Budget）

| 维度 | 预算 / 策略 |
|---|---|
| gzip 体积（svelte 渲染层） | ≤ 9 KB |
| gzip 体积（core createSelect） | ≤ 4 KB |
| 共用原语（popover/虚拟化，摊销） | 不计入单组件，按需 tree-shake |
| 首次打开浮层（100 项） | < 16ms 渲染（一帧内） |
| 虚拟化阈值 | 选项 > 100 自动启用，DOM 节点恒定（窗口 + overscan ≈ 可视行数 +10） |
| 万级选项滚动 | 60fps，仅渲染可视窗口，行高估算缓存 |
| 远程搜索 | `debounce` 默认 300ms，竞态请求按序号丢弃过期响应 |
| 浮层 DOM | `destroyOnClose=false` 默认（保留以加速复开）；高频长列表场景建议开启 destroyOnClose 释放内存 |
| 惰性渲染 | 浮层内容仅在首次 open 时挂载；选项渲染惰性（虚拟化） |
| 过滤计算 | 本地过滤 O(n) 单遍 + 记忆化，输入未变不重算 |

## 10. AI 元数据

提供 `component.meta.ts`，内容包括：
- `name`: "Select"，`category`: "input"，`stage`: "M2"，`semiEquivalent`: "Select"。
- `capabilities`: ["single-select","multi-select","searchable","remote","virtualized","creatable","grouped","clearable"]。
- `props` / `events` / `slots` 的机器可读 schema（类型、默认值、枚举、是否受控、对应 i18n key）。
- `aPI consistency`: 标注 `value+on:change`、`open+on:openChange` 约定符合度。
- `a11yPattern`: "combobox+listbox (activedescendant)"。
- `tokens`: 列出消费的 Component/Alias token，供主题工具与 AI 生成校验。
- `examples`: 典型用法片段（单选 / 多选 / 远程搜索 / 虚拟化）供 AI 检索。
- `antiPatterns`: ["用 Select 做树形数据应改 TreeSelect","选项 <5 且需常驻应改 Radio"]。

## 11. 测试

- **单元（core createSelect）**：状态机——开关、活动项移动（含跳过禁用、循环边界）、type-ahead 缓冲、单/多选选中集合增删、过滤函数、创建项判定、虚拟窗口计算（getVirtualItems 边界与 overscan）、远程竞态丢弃。
- **组件（svelte）**：受控/非受控 value 与 open；事件派发载荷正确（change/select/deselect/clear/create/search/scrollToBottom）；Tag 折叠 maxTagCount/maxTagTextLength；清除；空态/加载态切换；destroyOnClose 行为。
- **a11y**：axe 零违规；role/aria-* 快照（combobox/listbox/option/activedescendant/expanded/multiselectable/invalid）；键盘全流程（打开/导航/选中/Esc/Backspace 删 Tag/Tab 不被吞）；焦点回归触发器；live region 播报断言。
- **视觉回归**：三尺寸 × 三 status × 单/多选 × 空/加载态 × 暗色 × RTL 截图。
- **性能**：万级选项虚拟化 DOM 节点数恒定断言；打开浮层一帧预算；防抖与竞态计时测试。
- **i18n**：切换语言后所有可见文案与 aria-label 更新；plural/Intl 数字格式断言。

## 12. 验收标准 Checklist

- [ ] 单选 / 多选 / 搜索 / 远程 / 虚拟化 / 创建项 / 分组 / 清除全部能力可用且符合对标 Semi 行为。
- [ ] headless 逻辑落在 `@chenzy-design/core` 的 `createSelect`，复用 useDismiss/useRovingTabindex/useLiveAnnouncer/useId/useScrollLock/useFocusTrap；渲染层在 `@chenzy-design/svelte`。
- [ ] API 遵守一致性约定：`value`+`on:change`、`open`+`on:openChange`、`size`(small|default|large)、`status`(default|warning|error)。
- [ ] 类名为 `cd-` BEM-like（cd-select / cd-select__trigger / cd-select__dropdown / cd-select__option / cd-select--multiple 等）。
- [ ] 仅消费 `--cd-` Alias/Component token，无写死颜色/尺寸；暗色经 Alias 自动适配。
- [ ] a11y 符合 WAI-ARIA APG combobox+listbox（activedescendant 模型），axe 零违规，键盘全流程通过，焦点正确回归。
- [ ] 对比度 AA、reduced-motion 降级、RTL 镜像均验证。
- [ ] 用户可见文案零硬编码，i18n key 齐全，计数走 Intl，支持 plural。
- [ ] 危险操作（清除全部）文档提示不可撤销，aria-label 完备。
- [ ] Perf Budget 达标：体积 ≤9KB(svelte)/≤4KB(core)，万级虚拟化 60fps、DOM 恒定，远程防抖+竞态处理。
- [ ] 提供 `component.meta.ts`（含 capabilities/props/events/slots/tokens/examples/antiPatterns）。
- [ ] 单元 / 组件 / a11y / 视觉回归 / 性能 / i18n 测试全部通过。
