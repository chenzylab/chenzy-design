# SPEC · TagInput
> 分类：input · 阶段：M2
> 对标 Semi：TagInput

## 1. 概述

TagInput 用于在单个输入框内录入并管理一组离散的字符串标签。典型场景：邮件收件人、关键词/标签录入、过滤条件集合、Token 化的搜索词。

核心行为：
- 输入态：在末尾输入框中键入文本，按 Enter（或可配置的分隔符）将当前文本提交为一个标签。
- 标签态：已提交的标签以 Tag 形式排列在输入框内，每个标签可点击关闭按钮删除；当输入框为空时按 Backspace 删除最后一个标签。
- 集合态：value 是受控的 `string[]`，对外通过 `on:change` 同步。

与相邻组件的边界：
- 与 Select（multiple）的区别：TagInput 是自由输入（任意字符串），不依赖候选项列表；Select 是从枚举候选中多选。
- 与 Input 的区别：Input 输出单个字符串，TagInput 输出字符串数组并带标签渲染。
- 与 Cascader/AutoComplete 区别：TagInput 默认无下拉建议（可通过 `renderSuggestions` slot 选配），主体是“输入 → Token”的转换。

不解决的问题：富对象标签（带 value/label 映射的请用 Select multiple）、拖拽排序（后续 M3 增强）。

## 2. 设计语义

- 容器语义：视觉上是一个 Input 的延伸，沿用 `--cd-color-border` / `--cd-color-bg-0`，聚焦时边框升级为 `--cd-color-primary`，校验态映射到 `--cd-color-warning` / `--cd-color-danger`。
- 标签语义：内部 Tag 使用中性填充态（`--cd-color-fill-0`），与容器背景形成层级；删除按钮为弱化图标，hover 时增强。容器与标签之间是“包含”关系而非“并列”，因此标签内边距小于容器内边距。
- 状态语义：
  - default：中性边框。
  - hover：边框 `--cd-color-border-hover`。
  - focus（容器内任意焦点）：主色描边 + `--cd-taginput-shadow-focus`。
  - warning/error：对应语义色边框，配合 helper 文案。
  - disabled：降低不透明度，标签不可删除、输入禁用。
- 尺寸语义：small|default|large 决定容器最小高度、内边距、内部 Tag 尺寸与字号；多行换行时高度自适应增长。
- 计数/上限语义：达到 `max` 时输入框只读并提示，超长单标签按 `maxTagTextLength` 截断显示并加 `...`（完整值保留在 value 中，title 展示全文）。
- 动效语义：标签的增删用轻量 transform/opacity 过渡（≤120ms）；遵循 `prefers-reduced-motion` 时关闭过渡。

## 3. 分层实现

属于“有交互/键盘/a11y 逻辑”的组件，采用 headless + 渲染分层。

@chenzy-design/core —— `createTagInput`
- 职责：维护输入框文本、value 同步、分隔符解析、去重/上限/校验、键盘行为（Enter 提交、Backspace 退格删除、方向键在标签间移动焦点）、可访问性属性派生。
- 状态：`inputValue`、`activeTagIndex`（roving 焦点位置，-1 表示焦点在输入框）。
- 暴露：`getInputProps()`、`getTagProps(index)`、`getTagRemoveProps(index)`、`getContainerProps()`、`addTokens(text)`、`removeTagAt(index)`、`clear()`。
- 复用 core 原语：
  - `useRovingTabindex`：在“多个标签 + 输入框”之间用 ArrowLeft/ArrowRight 移动 roving 焦点。
  - `useId`：为容器/helper/计数生成稳定 id，串联 `aria-describedby`。
  - `useLiveAnnouncer`：标签增删时向 `aria-live` 区播报“已添加 X / 已删除 X / 已达上限”。
  - `useDismiss`：当配套建议浮层开启时，Esc / 外部点击关闭（仅 `renderSuggestions` 模式）。
- 不引入 `useFocusTrap`/`useScrollLock`（无模态浮层）。

@chenzy-design/svelte —— `TagInput.svelte`
- 职责：消费 `createTagInput` 返回的 props，渲染容器、Tag 列表（复用内部 `Tag` 组件）、末尾 input、前后缀 slot、清除按钮、计数。
- 透传 `class`/`style`/`data-*`，并把 `getContainerProps()` 等 spread 到对应元素。
- 受控/非受控：`value` 受控；非受控提供 `defaultValue`，内部缓存。

## 4. API

### Props

| 名称 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| value | `string[]` | — | 受控标签集合，配合 `on:change`。 |
| defaultValue | `string[]` | `[]` | 非受控初始值。 |
| inputValue | `string` | — | 受控的输入框文本，配合 `on:inputChange`。 |
| defaultInputValue | `string` | `''` | 非受控初始输入文本。 |
| placeholder | `string` | — | 输入框占位（i18n key 兜底，见第 7 节）。 |
| size | `'small' \| 'default' \| 'large'` | `'default'` | 尺寸。 |
| status | `'default' \| 'warning' \| 'error'` | `'default'` | 校验态。 |
| disabled | `boolean` | `false` | 禁用整个控件。 |
| readonly | `boolean` | `false` | 只读：可聚焦不可编辑/删除。 |
| max | `number` | — | 最大标签数量，达到后禁止新增。 |
| maxLength | `number` | — | 单个输入文本最大字符数。 |
| maxTagTextLength | `number` | — | 标签显示截断长度（不改变实际 value）。 |
| separator | `string \| string[]` | `['Enter']` | 触发成标签的分隔键/字符，如 `[',', ';', 'Enter']`。 |
| split | `(value: string, separator: string) => string[]` | — | 自定义分隔处理函数（优先于内置拆分，对齐 Semi）。 |
| maxTagCount | `number` | — | 标签最大展示数量，超出折叠为 `+N`。 |
| showRestTagsPopover | `boolean` | `true` | hover `+N` 时是否用 Popover 展示剩余标签。 |
| expandRestTagsOnClick | `boolean` | `true` | 点击 `+N` 是否展开剩余标签。 |
| addOnBlur | `boolean` | `false` | 失焦时把残留输入文本提交为标签。 |
| allowDuplicates | `boolean` | `false` | 是否允许重复标签。 |
| trimWhitespace | `boolean` | `true` | 提交前 trim，空白标签忽略。 |
| showClear | `boolean` | `false` | 显示一键清空按钮（hover/focus 时）。 |
| showContentTooltip | `boolean` | `true` | 截断标签 hover 显示全文 tooltip。 |
| validateTag | `(tag: string, current: string[]) => boolean \| string` | — | 自定义校验，返回 string 作为拒绝原因（播报+不入列）。 |
| prefix | `string \| Snippet` | — | 输入框前缀（string/图标自动带间隔，自定义 Snippet 间隔为 0）。 |
| suffix | `string \| Snippet` | — | 输入框后缀。 |
| ariaLabel | `string` | — | 无可见 label 时的可访问名。 |

### Events

| 名称 | 载荷 (`event.detail`) | 触发时机 |
|---|---|---|
| change | `{ value: string[] }` | 标签集合变化（增/删/清空）。 |
| inputChange | `{ value: string }` | 输入框文本变化。 |
| add | `{ tag: string, value: string[] }` | 单个标签被添加成功。 |
| remove | `{ tag: string, index: number, value: string[] }` | 单个标签被删除。 |
| exceed | `{ attempted: string, max: number }` | 因达到 `max` 而拒绝新增。 |
| invalid | `{ tag: string, reason: string }` | `validateTag`/去重/空白校验拒绝。 |
| focus | `FocusEvent` | 容器获得焦点。 |
| blur | `FocusEvent` | 容器失去焦点。 |
| keydown | `KeyboardEvent` | 透传原生键盘事件。 |

### Methods

组件实例方法（Svelte 5 `export function`，经 `bind:this` 获取实例后调用）。

| 名称 | 说明 |
|---|---|
| `focus()` | 命令式聚焦输入框（尊重 `preventScroll`，对齐 Semi）。 |
| `blur()` | 命令式移除焦点（对齐 Semi）。 |

### Slots

| 名称 | 作用域 props | 说明 |
|---|---|---|
| prefix | — | 容器最前的图标/文本区。 |
| suffix | — | 容器末尾（input 之后）的图标/文本区。 |
| renderTagItem | `{ value, index, onClose }` | 完全自定义单个标签渲染（覆盖默认 Tag，含内容与删除）。 |
| removeIcon | `{ index }` | 自定义默认标签的删除图标（不与 renderTagItem 同用）。 |
| clearIcon | — | 自定义清空按钮图标。 |
| renderSuggestions | `{ inputValue, add, close }` | 可选建议浮层（启用后走 `useDismiss`）。 |

## 5. 主题 / Token 表

组件仅消费 Alias / Component 级 Token，不写死任何值。

| Component Token | 取值（引用 Alias） | 用途 |
|---|---|---|
| `--cd-taginput-bg` | `var(--cd-color-bg-0)` | 容器背景。 |
| `--cd-taginput-border-color` | `var(--cd-color-border)` | 默认边框。 |
| `--cd-taginput-border-color-hover` | `var(--cd-color-border-hover)` | hover 边框。 |
| `--cd-taginput-border-color-active` | `var(--cd-color-primary)` | 聚焦边框。 |
| `--cd-taginput-border-color-warning` | `var(--cd-color-warning)` | warning 态边框。 |
| `--cd-taginput-border-color-error` | `var(--cd-color-danger)` | error 态边框。 |
| `--cd-taginput-radius` | `var(--cd-radius-default)` | 容器圆角。 |
| `--cd-taginput-text` | `var(--cd-color-text-0)` | 输入文本色。 |
| `--cd-taginput-placeholder` | `var(--cd-color-text-2)` | 占位色。 |
| `--cd-taginput-padding-x` | `var(--cd-spacing-2)` | 容器水平内边距。 |
| `--cd-taginput-padding-y` | `var(--cd-spacing-1)` | 容器垂直内边距（多行换行间距）。 |
| `--cd-taginput-gap` | `var(--cd-spacing-1)` | 标签之间间距。 |
| `--cd-taginput-min-height-sm` | `var(--cd-size-height-sm)` | small 最小高度。 |
| `--cd-taginput-min-height` | `var(--cd-size-height-md)` | default 最小高度。 |
| `--cd-taginput-min-height-lg` | `var(--cd-size-height-lg)` | large 最小高度。 |
| `--cd-taginput-shadow-focus` | `var(--cd-color-primary-light-shadow)` | 聚焦外发光。 |
| `--cd-taginput-tag-bg` | `var(--cd-color-fill-0)` | 内部标签背景。 |
| `--cd-taginput-tag-text` | `var(--cd-color-text-0)` | 标签文本色。 |
| `--cd-taginput-tag-close-color` | `var(--cd-color-text-2)` | 删除图标默认色。 |
| `--cd-taginput-tag-close-color-hover` | `var(--cd-color-text-0)` | 删除图标 hover 色。 |
| `--cd-taginput-disabled-opacity` | `var(--cd-opacity-disabled)` | 禁用透明度。 |

暗色模式由 Alias 层切换自动继承，组件无需额外定义。

## 6. 无障碍（WCAG 2.1 AA）

遵循 WAI-ARIA APG 的“分组输入 / roving tabindex”模式。

- 角色与结构：
  - 容器 `role="group"`，绑定 `aria-label`（来自 `ariaLabel` 或关联 `<label>`），`aria-describedby` 指向 helper/计数节点。
  - 标签列表项每个为 `role="listitem"` 隶属于 `role="list"`（视觉无序）；删除按钮为真实 `<button>`，`aria-label="删除标签 {tag}"`（i18n）。
  - 末尾输入框为原生 `<input role="textbox">`，`aria-invalid` 跟随 `status==='error'`，`aria-disabled`/`readonly` 同步。
- 键盘交互：
  - `Enter` / 配置的 `separator` 键：提交当前文本为标签。
  - `Backspace`（输入框为空时）：删除最后一个标签，焦点回到输入框。
  - `ArrowLeft` / `ArrowRight`：在标签与输入框之间移动 roving 焦点（roving tabindex，仅一个可 Tab 进入）。
  - `Delete` / `Backspace`（焦点在某标签时）：删除该标签，焦点移到相邻标签或输入框。
  - `Escape`：建议浮层开启时关闭它（`useDismiss`）。
  - `Tab`：整个控件作为一个 tab 停靠点离开。
- 焦点管理：删除标签后焦点不丢失（移到下一个或退回输入框）；达到 `max` 时输入框保持可聚焦但 `aria-readonly`。
- 实时播报：`useLiveAnnouncer` 在添加/删除/达上限/校验失败时以 `polite` 播报，文案走 i18n。
- 对比度：边框/文本/占位/删除图标在 default 与 dark 下均满足 ≥3:1（非文本）/≥4.5:1（文本）；聚焦描边不仅靠颜色，还有阴影厚度。
- reduced-motion：`prefers-reduced-motion: reduce` 时禁用标签增删过渡。
- RTL：`dir="rtl"` 时 prefix/suffix、ArrowLeft/Right 语义与 padding 自动镜像（使用逻辑属性 `padding-inline`）。

## 7. 国际化

用户可见文案零硬编码，全部经 i18n。日期/数字（如计数）通过 `Intl.NumberFormat` 格式化。

| i18n key | 默认（zh-CN） | 用途 |
|---|---|---|
| `TagInput.placeholder` | 请输入后按回车 | 输入框占位。 |
| `TagInput.removeTag` | 删除标签 {tag} | 删除按钮 aria-label。 |
| `TagInput.clearAll` | 清空全部 | 清空按钮 aria-label。 |
| `TagInput.added` | 已添加 {tag} | 添加成功播报。 |
| `TagInput.removed` | 已删除 {tag} | 删除播报。 |
| `TagInput.maxReached` | 最多可添加 {max} 个 | 达上限播报/提示。 |
| `TagInput.duplicate` | {tag} 已存在 | 重复拒绝播报。 |
| `TagInput.empty` | 不能添加空标签 | 空白拒绝播报。 |
| `TagInput.count` | 已添加 {count} 个 | 计数展示。 |

- `{count}` / `{max}` 经 `Intl.NumberFormat(locale)` 输出，适配阿拉伯语等数字系统。
- 文案支持复数规则（如英文 `1 tag` / `2 tags`）由 i18n 运行时按 locale 选择，组件不内置单复数判断。

## 8. 文案（content-guidelines）

- 占位文案动词在前、说明操作方式：“请输入后按回车”，避免“标签输入框”这类描述控件本身的文案。
- 计数与上限：用“已添加 N 个”“最多可添加 N 个”，统一“个”量词；不混用“项/条”。
- 校验提示简短可执行：“{tag} 已存在”而非“您输入的标签与已有标签重复，请重新输入”。
- 播报文案与可见文案语义一致，避免读屏与视觉描述冲突。

危险操作文案（单列）：
- 清空全部：按钮 `aria-label` 为“清空全部”。当标签数 ≥ 一定阈值或宿主标注 `confirmClear` 时，二次确认文案为：“清空全部标签？此操作不可撤销。”，确认按钮“清空”，取消按钮“取消”。默认不二次确认（轻量删除可逆性由宿主撤销机制承担）。

## 9. 性能（Perf Budget）

| 维度 | 预算 / 目标 | 说明 |
|---|---|---|
| gzip 体积（svelte） | ≤ 6.25 KB | 按实测校准（含 prefix/suffix、maxTagCount+Popover、validateTag、showContentTooltip、renderSuggestions 建议浮层 use:floating+useDismiss 等富功能）；不含共享 Tag/Input 基元与 core。 |
| gzip 体积（core createTagInput） | ≤ 1.8 KB | 纯逻辑，tree-shakable。 |
| 首次渲染（50 标签） | < 16ms | 单帧内完成。 |
| 添加/删除单标签 | < 4ms | 只更新增量节点，复用 `{#each key=tag-id}`。 |
| 大量标签（>200） | 启用 `virtualizeTags`（M3） | 默认不虚拟化；超阈值建议 Select。 |
| 输入抖动 | 无内置 debounce | 输入即时；建议浮层场景由宿主对 `inputChange` 自行 debounce。 |

策略说明：
- 标签用稳定 key（内容去重保证唯一）做 keyed each，避免整列表重渲染。
- 无浮层时不加载 `useDismiss`/`useScrollLock`（按需动态引入建议层逻辑）。
- 无 `destroyOnClose` 概念（非浮层组件）；建议浮层在关闭时卸载内容（惰性渲染）。

## 10. AI 元数据

提供 `component.meta.ts`，内容包含：
- `name: 'TagInput'`、`category: 'input'`、`stage: 'M2'`、`semiEquivalent: 'TagInput'`。
- `capabilities: ['multi-token-input', 'enter-to-tag', 'removable-tags', 'max-limit', 'dedupe', 'custom-validate']`。
- `props` / `events` / `slots` 的机器可读 schema（类型、默认值、是否受控）。
- `a11y: { role: 'group', pattern: 'roving-tabindex', keys: ['Enter','Backspace','ArrowLeft','ArrowRight','Delete','Escape'] }`。
- `i18nKeys`：第 7 节全部 key。
- `tokens`：第 5 节全部 Component Token 名。
- `relatedComponents: ['Select','Input','Tag','AutoComplete']`，含“何时改用 Select multiple”的选择指引。
- `examples`：基础、分隔符多字符、上限+校验、自定义标签渲染 四段最小可运行片段。

## 11. 测试

- 单元（core `createTagInput`）：
  - Enter / 自定义 separator 提交；trim 与空白忽略；去重（allowDuplicates 开关）。
  - `max` 上限拒绝并触发 `exceed`；`validateTag` 拒绝触发 `invalid`。
  - Backspace 退格删除最后一个；`removeTagAt` / `clear` 正确同步 value。
  - 受控 value 与非受控 defaultValue 行为分支。
- 组件（svelte，testing-library）：
  - 输入并回车后 DOM 出现对应 Tag；点击关闭按钮删除并触发 `remove`。
  - 受控模式下不传回新 value 时 DOM 不变（纯受控验证）。
  - disabled/readonly 下无法新增/删除。
- a11y：
  - jest-axe 零违规（default/error/disabled 三态）。
  - 键盘 E2E：ArrowLeft/Right roving 焦点、Delete 删除后焦点落点、Esc 关闭建议层。
  - `aria-live` 播报内容断言（添加/删除/上限/重复）。
- 视觉回归：small/default/large × default/warning/error × 空/多行换行 快照；RTL 镜像快照；reduced-motion 下无过渡。
- i18n：切换 locale 后占位、aria-label、播报、计数均更新；`Intl` 数字格式断言（含 ar-EG）。

## 12. 验收标准 checklist

- [ ] value 受控 + `on:change`，inputValue 受控 + `on:inputChange`，均提供非受控默认值。
- [ ] Enter 与可配置 `separator`（含多字符）正确成标签；trim/空白忽略；去重按 `allowDuplicates` 生效。
- [ ] Backspace 退格删除、关闭按钮删除、`max` 上限、`validateTag` 校验全部按 spec 行为，并发对应事件（add/remove/exceed/invalid）。
- [ ] headless 逻辑位于 `@chenzy-design/core` 的 `createTagInput`，渲染位于 `@chenzy-design/svelte`，复用 useRovingTabindex/useId/useLiveAnnouncer/useDismiss/use，无重复实现。
- [ ] 仅消费 `--cd-` Alias/Component Token，无写死颜色/尺寸；暗色随 Alias 自动适配。
- [ ] role=group + list/listitem 结构、删除按钮 aria-label、aria-invalid/readonly/disabled 同步；roving tabindex 焦点管理正确。
- [ ] 键盘交互（Enter/Backspace/Arrow/Delete/Escape）与 APG 一致；删除后焦点不丢失。
- [ ] `aria-live` 播报添加/删除/上限/重复/空白；文案走 i18n。
- [ ] 所有可见文案与 aria 文案零硬编码，i18n key 与第 7 节一致；计数/数字用 `Intl`。
- [ ] 危险操作（清空全部）文案与可选二次确认符合 content-guidelines。
- [ ] reduced-motion 关闭过渡；RTL 镜像（逻辑属性）正确。
- [ ] 对比度满足 AA（文本 ≥4.5:1、非文本 ≥3:1），聚焦态非仅依赖颜色。
- [ ] 性能达标：svelte ≤3.5KB / core ≤1.8KB gzip；keyed each 增量更新；50 标签首帧 <16ms。
- [ ] 提供 `component.meta.ts`，capabilities/props/events/slots/a11y/i18nKeys/tokens/examples 完整。
- [ ] 单元 + 组件 + a11y(jest-axe) + 视觉回归 + i18n 测试全部通过。
