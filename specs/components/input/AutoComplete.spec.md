# SPEC · AutoComplete
> 分类：input · 阶段：M2
> 对标 Semi：AutoComplete

## 1. 概述

AutoComplete（输入联想补全）是一个文本输入框，用户键入时实时弹出候选列表，可用键盘或鼠标从候选中选择并回填到输入框。它介于 `Input` 与 `Select` 之间：值始终是自由文本（不强制从选项中选），选项只作为输入建议。

典型场景：
- 搜索框历史/热词联想（远程异步补全）。
- 邮箱后缀补全（输入 `tom` → `tom@gmail.com / tom@qq.com`）。
- 表单字段的本地建议（地址、标签、命令）。

与相邻组件的边界：
- 与 `Select`：Select 的值必须来自选项集合，AutoComplete 的值是任意字符串，选项仅为建议；AutoComplete 不渲染「未匹配/空」时的强制校验。
- 与 `Cascader/TreeSelect`：AutoComplete 候选为扁平一维列表，无层级。
- 与 `Mentions`：Mentions 在文本中部触发，AutoComplete 针对整个输入值。

核心能力：本地/远程数据源、自定义过滤、防抖、受控/非受控、虚拟化长列表、选项分组与自定义渲染、loading/empty 态、键盘全交互、尺寸与校验态。

## 2. 设计语义

- **触发关系**：输入框（Trigger）+ 浮层候选面板（Popover），面板宽度默认对齐输入框宽度（`dropdownMatchWidth`）。
- **值语义**：`value` 为字符串，代表输入框文本；选项 `value` 为字符串/数字，选中后将其文本写回输入框。`on:change` 在文本变化时触发；`on:select` 仅在用户从候选中选定时触发，便于区分「自由输入」与「采纳建议」。
- **显隐语义**：遵循全局 `open + on:openChange`。聚焦且有候选时展开；选定、失焦、Esc、清空时收起。
- **状态机**：`idle → focused → (typing) → loading?（远程）→ open(有候选) | empty(无候选) → 选中/收起`。
- **尺寸**：`small(32px) | default(36px) | large(44px)`，影响输入框高度、字号、选项行高与内边距。
- **校验态**：`status: default | warning | error`，仅改变边框/底色语义色，不影响候选逻辑。
- **运动**：面板入场 `--cd-motion-duration-fast` + 透明度/位移 4px 缩放，出场更短；`prefers-reduced-motion` 下取消位移仅保留透明度。
- **密度**：选项行高随尺寸联动；分组标题为非可选的弱化标签。

## 3. 分层实现

属于「有交互/键盘/a11y 逻辑」的复合控件，采用 headless + 渲染分层。

- **@chenzy-design/core · `createAutoComplete`**：纯逻辑，无 DOM。输出状态（`open/activeIndex/filteredOptions/loading`）与 getter（`getInputProps/getListboxProps/getOptionProps/getClearProps`）、事件处理器与 reducer。负责：过滤/防抖调度、键盘导航、active 项管理、受控/非受控同步、远程请求竞态（保留最新一次结果，丢弃过期响应）。
- **复用 core 原语**：
  - `useId`：输入框、listbox、各 option、分组标题的关联 id（`aria-activedescendant`/`aria-controls`/`aria-labelledby`）。
  - `useDismiss`：点击外部、Esc、滚动/失焦关闭面板。
  - `useRovingTabindex`：候选项导航采用 `aria-activedescendant` 模式（焦点常驻输入框），core 暴露 active 计算逻辑而非真实焦点移动。
  - `useLiveAnnouncer`：通过 polite live region 播报「N 条结果可用」「无匹配结果」「加载中」。
  - `useScrollLock`：默认不锁滚动（输入控件不应锁页面），不引入。
  - `useFocusTrap`：**不使用**（焦点必须留在输入框，面板不抢焦点）。
- **@chenzy-design/svelte · `AutoComplete.svelte`**：消费 `createAutoComplete` 的 getter 绑定到 DOM，渲染输入框、清除按钮、前后缀、浮层面板（默认 `destroyOnClose` 惰性渲染）、选项/分组/loading/empty 槽。浮层定位委托 `cd-popover` 定位原语（flip/shift/对齐宽度）。

## 4. API

### Props

| 名称 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `value` | `string` | `''` | 受控输入文本（配合 `on:change`） |
| `defaultValue` | `string` | `''` | 非受控初始文本 |
| `data` | `Array<string \| number \| { value: string\|number; label?: string; disabled?: boolean; group?: string }>` | `[]` | 候选数据源 |
| `open` | `boolean` | — | 受控面板显隐（配合 `on:openChange`） |
| `defaultOpen` | `boolean` | `false` | 非受控初始显隐 |
| `placeholder` | `string` | `''` | 输入占位符（建议走 i18n） |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | 尺寸 |
| `status` | `'default' \| 'warning' \| 'error'` | `'default'` | 校验态 |
| `disabled` | `boolean` | `false` | 禁用 |
| `loading` | `boolean` | `false` | 外部受控 loading 态（远程拉取中） |
| `filter` | `boolean \| ((input: string, option) => boolean)` | `true` | 过滤策略；`true`=默认包含匹配（不区分大小写），`false`=不过滤（远程已过滤），或自定义 |
| `defaultActiveFirstOption` | `boolean` | `true` | 展开时是否默认高亮首项 |
| `maxCount` | `number` | — | 候选最大渲染条数 |
| `debounce` | `number` | `300` | 触发 `on:search` 的防抖毫秒数 |
| `triggerRender` | `'change' \| 'focus'` | `'change'` | 弹出时机：输入即弹 / 聚焦即弹 |
| `clearable` | `boolean` | `false` | 显示清除按钮 |
| `prefix` / `suffix` | `Snippet` | — | 输入框前/后缀 |
| `insetLabel` | `string` | — | 内嵌前置标签 |
| `emptyContent` | `string \| Snippet` | i18n 默认 | 无匹配时内容 |
| `dropdownMatchWidth` | `boolean` | `true` | 面板宽度对齐输入框 |
| `dropdownMaxHeight` | `number` | `300` | 面板最大高度(px)，超出滚动 |
| `virtualize` | `boolean \| { itemHeight: number; overscan?: number }` | `false` | 长列表虚拟化 |
| `destroyOnClose` | `boolean` | `true` | 关闭时销毁面板 DOM |
| `getPopupContainer` | `() => HTMLElement` | `() => document.body` | 浮层挂载容器 |
| `renderItem` | `Snippet<[option]>` | — | 自定义选项渲染 |
| `class` | `string` | — | 根元素类名 |

### Events

| 名称 | 载荷 (`event.detail`) | 触发时机 |
|---|---|---|
| `change` | `{ value: string }` | 输入文本变化（键入或选中回填后） |
| `search` | `{ value: string }` | 防抖后的搜索词变化，用于触发远程拉取 |
| `select` | `{ value: string \| number; option: OptionData }` | 用户从候选中确认选定（点击/Enter） |
| `openChange` | `{ open: boolean }` | 面板显隐变化 |
| `focus` | `FocusEvent` | 输入框聚焦 |
| `blur` | `FocusEvent` | 输入框失焦 |
| `clear` | `void` | 点击清除按钮 |
| `keydown` | `KeyboardEvent` | 透传原生键盘事件（在内部处理后） |

### Slots / Snippets

| 名称 | 参数 | 说明 |
|---|---|---|
| `prefix` | — | 输入框前缀（图标/文字） |
| `suffix` | — | 输入框后缀 |
| `item` (`renderItem`) | `{ option, active, selected }` | 自定义单个候选项 |
| `group` | `{ label }` | 自定义分组标题 |
| `empty` (`emptyContent`) | — | 无匹配占位 |
| `loading` | — | 加载态占位 |
| `header` / `footer` | — | 面板顶部/底部固定内容（如「查看全部」） |

## 5. 主题 / Token

仅消费 Alias 与 Component 级 Token，禁止写死值。

| Component Token | 回退（Alias） | 用途 |
|---|---|---|
| `--cd-autocomplete-height-small` | `32px`（global spacing） | small 输入框高度 |
| `--cd-autocomplete-height-default` | `36px` | default 高度 |
| `--cd-autocomplete-height-large` | `44px` | large 高度 |
| `--cd-autocomplete-color-text` | `--cd-color-text-0` | 输入文本色 |
| `--cd-autocomplete-color-placeholder` | `--cd-color-text-2` | 占位符色 |
| `--cd-autocomplete-color-bg` | `--cd-color-bg-0` | 输入框/面板底色 |
| `--cd-autocomplete-color-border` | `--cd-color-border` | 默认边框 |
| `--cd-autocomplete-color-border-hover` | `--cd-color-primary` | 悬停边框 |
| `--cd-autocomplete-color-border-active` | `--cd-color-primary` | 聚焦边框 |
| `--cd-autocomplete-color-border-warning` | `--cd-color-warning` | warning 态边框 |
| `--cd-autocomplete-color-border-error` | `--cd-color-danger` | error 态边框 |
| `--cd-autocomplete-option-color-hover-bg` | `--cd-color-fill-0` | 选项 hover/active 底色 |
| `--cd-autocomplete-option-color-selected-bg` | `--cd-color-primary-light-default` | 选中项底色 |
| `--cd-autocomplete-option-color-text` | `--cd-color-text-0` | 选项文本 |
| `--cd-autocomplete-option-color-disabled` | `--cd-color-text-3` | 禁用选项文本 |
| `--cd-autocomplete-group-color-text` | `--cd-color-text-2` | 分组标题色 |
| `--cd-autocomplete-radius` | `--cd-radius-default` | 圆角 |
| `--cd-autocomplete-panel-shadow` | `--cd-shadow-elevated` | 面板阴影 |
| `--cd-autocomplete-motion-duration` | `--cd-motion-duration-fast` | 面板动效时长 |

暗色模式经 Alias 自动切换；高对比度模式下 `--cd-color-border` 加深，active/selected 底色提高对比，满足非文本对比 3:1。

## 6. 无障碍

遵循 WAI-ARIA APG「Combobox with list autocomplete」模式（`aria-activedescendant` 变体，焦点不离开输入框）。

- **角色与关系**：
  - 输入框：`role="combobox"`、`aria-expanded`（随 open）、`aria-controls=<listbox id>`、`aria-autocomplete="list"`、`aria-haspopup="listbox"`、`aria-activedescendant=<当前 active option id 或空>`。
  - 面板列表：`role="listbox"`、`aria-label`（来自 i18n）。
  - 每项：`role="option"`、`aria-selected`（active 项 true）、`aria-disabled`（禁用项）、`id` 由 `useId` 生成。
  - 分组：`role="group"` + `aria-label`（分组标题为 `presentation`，不可选）。
  - 清除按钮：`<button>` + `aria-label`（i18n `AutoComplete.clear`）。
- **键盘交互**：
  - `↓/↑`：移动 active 项（不移动真实焦点）；闭合时 `↓` 打开面板并高亮首项。
  - `Enter`：选中当前 active 项；无 active 时不拦截（保留表单提交语义可由 `defaultActiveFirstOption=false` 控制）。
  - `Esc`：关闭面板（保留已输入文本）；再次 Esc 由上层处理。
  - `Home/End`：跳到首/末项。
  - `Tab`：关闭面板并将焦点移出（不选中 active 项，符合 combobox 规范）。
  - 字符输入：始终编辑输入框文本。
- **焦点管理**：焦点全程留在 `<input>`；面板不抢焦点，不使用 focus trap。
- **播报**：`useLiveAnnouncer`（polite）播报结果数量变化、加载中、无结果（i18n key）。
- **对比度**：文本/占位符/边框满足 AA（正文 4.5:1，边框等非文本 3:1）。
- **reduced-motion**：禁用位移/缩放，仅保留 ≤100ms 透明度。
- **RTL**：根据 `dir` 镜像前后缀、清除按钮位置与面板对齐；箭头键语义不随 RTL 改变（上下导航）。

## 7. 国际化

用户可见文案零硬编码，全部走 i18n；日期/数字格式（若选项含数值/时间）用 `Intl`。

| i18n key | 默认（zh-CN） | 用途 |
|---|---|---|
| `AutoComplete.placeholder` | `请输入` | 输入占位符默认值 |
| `AutoComplete.empty` | `无匹配结果` | 空态文案 |
| `AutoComplete.loading` | `加载中…` | 加载态文案 |
| `AutoComplete.clear` | `清除` | 清除按钮 aria-label |
| `AutoComplete.listboxLabel` | `候选项` | listbox aria-label |
| `AutoComplete.resultsAnnounce` | `{count} 条结果可用` | live 播报（`Intl.NumberFormat` 格式化 count） |
| `AutoComplete.noResultsAnnounce` | `无匹配结果` | live 播报无结果 |
| `AutoComplete.loadingAnnounce` | `正在加载` | live 播报加载 |

- 复数与占位符插值由 i18n 运行时处理；`count` 经 `Intl.NumberFormat(locale)` 本地化。
- RTL 语言（ar/he）自动继承 `dir`。

## 8. 文案

遵循 content-guidelines：

- 占位符使用动词短句、简洁（「请输入关键词」而非「在此输入您想要搜索的内容」）。
- 空态文案中性、不指责用户：「无匹配结果」，可选副文案「换个关键词试试」。
- 加载态用进行时「加载中…」，含省略号表持续。
- 选项标签保持名词短语，长度尽量统一，避免句末标点。

**危险操作文案**（单列）：AutoComplete 自身不含破坏性操作。`clear` 仅清空输入文本，非破坏性、可重新输入，因此使用中性词「清除」，不加二次确认；若业务用其触发删除历史记录等破坏性动作，需由上层另行配确认弹窗与红色危险措辞，组件不内建。

## 9. 性能

| 项目 | 预算 / 策略 |
|---|---|
| gzip 体积（svelte 渲染层） | ≤ 4.5 KB |
| gzip 体积（core `createAutoComplete`） | ≤ 2.5 KB |
| 首屏渲染 | 面板 `destroyOnClose=true` 惰性渲染，未展开不进入 DOM |
| 输入响应 | 键入→过滤本地数据 < 16ms（≤1000 项）；远程经 `debounce`（默认 300ms）触发 `on:search` |
| 远程竞态 | core 标记请求序号，仅采纳最新响应，丢弃过期结果，避免抖动 |
| 长列表 | `virtualize` 开启后仅渲染可视区 + overscan；建议候选 > 100 项启用 |
| 重渲染 | active 项变化只更新受影响 option 的 class/aria，不整列表重绘 |
| 动画 | 仅 transform/opacity（合成层），不触发 layout |
| 内存 | 关闭即销毁面板节点与虚拟化缓存（destroyOnClose） |

## 10. AI 元数据

提供 `component.meta.ts`，内容包含：

- `name: 'AutoComplete'`、`category: 'input'`、`stage: 'M2'`、`semiEquivalent: 'AutoComplete'`。
- `summary`：「输入联想补全，自由文本输入 + 候选建议，支持本地/远程数据源」。
- `props/events/slots` 的机读 schema（类型、默认值、是否受控、i18n 关联）。
- `aria: { pattern: 'combobox-list', activedescendant: true }`。
- `tokens`：本组件消费的 Component Token 列表与 Alias 回退映射。
- `examples`：本地数据补全、远程异步补全、邮箱后缀补全、虚拟化长列表四个最小示例片段。
- `relations`：`{ similarTo: ['Select','Mentions'], differsBy: '值为自由文本而非受限选项' }`，供 AI 选型。
- `i18nKeys`：第 7 节 key 列表。

## 11. 测试

- **单元（core `createAutoComplete`）**：过滤策略（true/false/自定义）、防抖调度、键盘导航边界（首末项环绕禁用、跳过 disabled 项）、受控/非受控值与 open 同步、远程竞态（旧响应被丢弃）、`defaultActiveFirstOption` 行为。
- **组件（svelte）**：渲染尺寸/状态类名、清除按钮显隐与 `on:clear`、prefix/suffix/分组/自定义 renderItem 渲染、destroyOnClose 节点销毁、dropdownMatchWidth 宽度对齐。
- **a11y（jest-axe + 手测）**：combobox 角色与 aria 关系、`aria-activedescendant` 随导航更新、`aria-expanded` 同步、键盘全路径（↓↑ Enter Esc Home End Tab）、live region 播报、reduced-motion、RTL 镜像、对比度断言。
- **交互（Playwright）**：键入→联想→键盘选中→回填、远程 loading→结果、点击外部关闭、滚动关闭、虚拟化滚动定位 active 项可见。
- **视觉回归**：三尺寸 × 三状态 × 明暗主题 × open/closed 快照。
- **性能**：1000 项本地过滤帧时间、虚拟化 DOM 节点数上限断言。

## 12. 验收标准 Checklist

- [ ] core 与 svelte 分层落地，`createAutoComplete` 无 DOM 依赖，复用 useId/useDismiss/useLiveAnnouncer/roving(activedescendant)。
- [ ] API 命名遵守全局约定：`value+on:change`、`open+on:openChange`、`size`、`status`。
- [ ] 受控/非受控（value/defaultValue、open/defaultOpen）均工作且同步正确。
- [ ] 本地过滤、`filter=false` 远程、自定义 filter 三路径均覆盖。
- [ ] 远程异步：debounce + 竞态丢弃 + loading/empty 态正确。
- [ ] `on:select` 与 `on:change` 语义可区分（自由输入 vs 采纳建议）。
- [ ] WAI-ARIA combobox(list, activedescendant) 角色/aria/键盘全部达标，jest-axe 通过。
- [ ] 所有可见文案走 i18n，无硬编码；count 经 Intl 本地化；RTL 正常。
- [ ] 仅消费 `--cd-` Alias/Component Token，无写死颜色/尺寸；暗色与高对比通过。
- [ ] `destroyOnClose` 默认开启，惰性渲染；`virtualize` 长列表生效。
- [ ] 文案符合 content-guidelines，`clear` 为中性非破坏性，未内建危险措辞。
- [ ] 提供 `component.meta.ts` 且字段完整（props/events/slots/aria/tokens/relations/i18nKeys）。
- [ ] gzip 体积满足 Perf Budget（svelte ≤4.5KB / core ≤2.5KB）。
- [ ] 单元/组件/a11y/交互/视觉/性能测试全部通过。
