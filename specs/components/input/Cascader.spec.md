# SPEC · Cascader
> 分类：input · 阶段：M2
> 对标 Semi：Cascader

## 1. 概述

Cascader（级联选择器）用于从一组有层级关系的数据集合中进行选择，常见于省/市/区、组织架构、商品分类等场景。用户在单一浮层中逐级展开子级，最终选定一条完整路径或多条路径。

核心能力：
- 单选 / 多选（multiple）—— 多选时带父子级联勾选与半选态。
- 静态全量数据 / 动态加载（loadData）—— 点击展开时按需请求子节点。
- 路径展示策略：显示完整路径 / 仅显示叶子节点（displayProp / displayRender）。
- 触发方式：点击展开下一级（click）或悬停展开（hover）。
- 可搜索（filterTreeNode）—— 跨层级模糊匹配命中路径。
- 受控/非受控 value，可清空、可禁用、可指定校验态。
- 叶子节点可选 / 任意层级可选（changeOnSelect）。

非目标：树形多选的复杂虚拟移动（交由 Tree/TreeSelect）；表格内联编辑场景（交由 Table）。

与同类组件边界：单层无层级用 Select；纯树展示用 Tree；树形勾选浮层用 TreeSelect；本组件专注"逐级浮层 + 路径语义"。

## 2. 设计语义

- 结构语义：触发器（Trigger，复用 Select 视觉规范）+ 浮层（Popover）+ 一列或多列级联面板（Panel/Column）。每一列代表一个层级，列项可含"展开箭头"指示下钻。
- 选中语义：单选时高亮整条激活路径（每列各高亮一个 active 项）；多选时叶子前置 Checkbox，父级呈现 indeterminate 半选。
- 状态语义：default / hover / active(当前激活路径) / selected(已确认值) / disabled / loading(动态加载中的占位 spinner)。
- 尺寸：small | default | large，影响触发器高度（24/32/40）、列项行高与字号，列宽随尺寸微调。
- 校验态：status=default|warning|error 改变触发器边框/背景，与 Form 联动。
- 空态：列为空显示 emptyContent；搜索无结果显示独立空态文案。
- 密度与节奏：列宽默认 180px，列间分隔用 1px --cd-color-border；激活项用 --cd-color-primary 文本 + 浅底。
- 动效：浮层展开/收起 120ms ease；新列加入时无横向位移跳变；reduced-motion 下取消过渡，仅切换显隐。

## 3. 分层实现

属于复杂交互复合控件，逻辑放 core，渲染放 svelte。

`@chenzy-design/core` — `createCascader`：
- 维护 `activePath`（当前激活节点路径）、`selectedKeys/selectedPaths`、`loadingKeys`、`expandedColumn` 派生的列数据 `columns`。
- 树规范化：将 treeData 扁平为 `Map<key, node>` 并建立 parent 索引，供路径回溯与多选级联计算。
- 多选级联算法：勾选父级 → 递归选中可选子级；子级全选 → 父级 checked，部分选 → indeterminate。
- 动态加载：暴露 `loadData(node)` 调度、`isLoading(key)`、加载完成后合入树并刷新对应列。
- 搜索：`filter(query)` 输出命中路径列表（扁平模式渲染）。
- 复用原语：`useId`（trigger/popover/列 id 关联）、`useDismiss`（点击外部/Esc 关闭）、`useScrollLock`（移动端可选）、`useRovingTabindex`（同一列上下移动焦点）、`useFocusTrap`（搜索框 + 列表浮层内可选）、`useLiveAnnouncer`（播报展开层级 / 加载完成 / 选中结果）。
- 输出：state stores + actions（`setActive`, `expand`, `toggleCheck`, `confirm`, `clear`, `search`）+ ARIA prop getters。

`@chenzy-design/svelte` — `Cascader.svelte`：
- 组合 Trigger（含 Tag/单值文本、清除按钮、箭头）+ Popover + Columns 渲染 + 搜索输入 + 空态/加载占位。
- 子组件：`CascaderColumn.svelte`、`CascaderItem.svelte`、`CascaderTags.svelte`（多选溢出折叠 maxTagCount）。
- `destroyOnClose` 控制浮层内容惰性渲染/销毁。
- 透传 core 的 prop getters 到 DOM，仅负责 DOM 与样式，不重复实现键盘逻辑。

## 4. API

### Props

> 本表由 `packages/svelte/src/cascader/meta.ts` 真源生成（2026-07-30 重校）。此前本表列的 prop 多为 Semi 对齐前的旧名或已删除项（如 `value`→`activeKey`、`change`→`onChange`），改 prop 时请同步 meta.ts，勿手写「规划中」的 prop。

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| value | `(string\|number)[] \| (string\|number)[][]` | `undefined` | 单选单条路径；多选多条路径 |
| defaultValue | `(string\|number)[] \| (string\|number)[][]` | `undefined` |  |
| treeData | `CascaderNode[]` | `[]` |  |
| open | `boolean` | `undefined` |  |
| defaultOpen | `boolean` | `false` |  |
| multiple | `boolean` | `false` | 每列 checkbox 多选 + 父子联动，多 tag 回显 |
| size | `'small'\|'default'\|'large'` | `default` |  |
| validateStatus | `'default'\|'warning'\|'error'` | `default` | 校验状态（对齐 Semi validateStatus） |
| placeholder | `string` | `undefined` |  |
| disabled | `boolean` | `false` |  |
| changeOnSelect | `boolean` | `false` | 单选：点击任一层级（含中间非叶子）即提交该路径并触发 onChange，非叶子同时展开子列且不关闭面板，叶子提交并关闭；关闭时仅叶子提交并关闭 |
| leafOnly | `boolean` | `false` | 多选时完全勾选的父级折叠为父路径（只回传/计数到该父级）；默认 false 仅回传叶子 |
| filterTreeNode | `boolean \| ((query, path) => boolean)` | `undefined` | 是否可搜索及自定义匹配：false 关闭；true 默认 label 链子串匹配；函数自定义谓词 |
| filterLeafOnly | `boolean` | `true` | 搜索结果是否仅展示到叶子路径 |
| displayProp | `'label'\|'value'` | `'label'` | 触发器回显使用的字段 |
| separator | `string` | `' / '` | 路径分隔符（回显 + 搜索 label 链拼接） |
| maxTagCount | `number` | `undefined` | 多选 Tag 溢出折叠阈值：超出显示前 N 个 + +M |
| emptyContent | `string \| Snippet` | `undefined` | 列为空时内容；缺省走 i18n |
| zIndex | `number` | `1030` | 浮层层级 |
| getPopupContainer | `() => HTMLElement \| null \| undefined` | `undefined` | 浮层挂载容器，缺省 document.body；非 body 容器时 absolute 定位相对该容器 |
| loadData | `(node: CascaderNode) => Promise<CascaderNode[]>` | `undefined` | 动态加载子节点 |
| displayRender | `(labels: string[], selectedNodes: CascaderNode[]) => string` | `undefined` | 自定义触发器选中路径回显（单选 + 多选每个 tag 共用） |
| onChange | `(value: (string\|number)[] \| (string\|number)[][]) => void` | `undefined` | 单选回调单条路径；多选回调多条叶子路径 |
| aria-label | `string` | `'Cascader'` | 可访问名（对齐 Semi aria-label） |
| ariaLabelledby | `string` | `undefined` | aria-labelledby：关联外部 label 元素（Form.Field 透传） |
| ariaDescribedby | `string` | `undefined` | aria-describedby：关联 helpText / extraText（Form.Field 透传） |
| ariaErrormessage | `string` | `undefined` | aria-errormessage：error 态关联错误信息容器（Form.Field 透传） |
| ariaRequired | `boolean` | `undefined` | aria-required：必填语义（Form.Field required 透传） |
| borderless | `boolean` | `false` | 无边框模式 |
| prefix | `Snippet \| string` | `undefined` | 前置内容 |
| insetLabel | `Snippet \| string` | `undefined` | 内嵌标签：触发器在值前渲染的标签（如「地区：」），Semi 中为 prefix 的别名 |
| insetLabelId | `string` | `undefined` | 内嵌标签的 DOM id（供外部 aria-labelledby 引用） |
| suffix | `Snippet \| string` | `undefined` | 后置内容 |
| clearIcon | `Snippet` | `undefined` | 自定义清除图标 |
| expandIcon | `Snippet` | `undefined` | 自定义菜单项右侧展开图标（列项 icon，对齐 Semi expandIcon） |
| arrowIcon | `Snippet` | `undefined` | 自定义触发器右侧下拉箭头（对齐 Semi arrowIcon，与 expandIcon 语义不同） |
| motion | `boolean` | `true` | 下拉框展开动画 |
| mouseEnterDelay | `number` | `50` | 鼠标移入延迟（ms） |
| mouseLeaveDelay | `number` | `50` | 鼠标移出延迟（ms） |
| autoAdjustOverflow | `boolean` | `true` | 下拉框自动调整方向 |
| position | `string` | `'bottomStart'` | 下拉框方向 |
| style | `string` | `undefined` | 选择框样式 |
| dropdownStyle | `string \| Record<string, string>` | `undefined` | 下拉菜单样式（合并进浮层根节点，不覆盖内置定位样式） |
| dropdownClassName | `string` | `undefined` | 追加到浮层根节点的自定义类名（与内置类名并存） |
| dropdownMargin | `number \| { marginTop?: number; marginBottom?: number; marginLeft?: number; marginRight?: number }` | `undefined` | 浮层与 trigger 的额外间距（px）；数字映射到浮层 offset，对象取 marginTop |
| onBlur | `(e: MouseEvent) => void` | `undefined` | 失焦回调 |
| onFocus | `(e: MouseEvent) => void` | `undefined` | 聚焦回调 |
| preventScroll | `boolean` | `false` | 聚焦时阻止滚动 |
| stopPropagation | `boolean` | `true` | 阻止下拉框点击冒泡 |
| topSlot | `Snippet` | `undefined` | 面板顶部插槽 |
| bottomSlot | `Snippet` | `undefined` | 面板底部插槽 |
| searchPosition | `'trigger'\|'custom'` | `'trigger'` | 搜索框位置：'trigger' 内置；'custom' 不渲染内置搜索框 |
| searchPlaceholder | `string` | `undefined` | 搜索框占位文字 |
| treeNodeFilterProp | `string` | `'label'` | 搜索时过滤的属性 |
| filterRender | `Snippet<[{ path: FlatPath }]>` | `undefined` | 自定义搜索结果项渲染 |
| filterSorter | `(a: FlatPath, b: FlatPath, input: string) => number` | `undefined` | 搜索结果自定义排序 |
| onSearch | `(value: string) => void` | `undefined` | 搜索输入回调 |
| remote | `boolean` | `false` | 远程搜索模式：跳过本地过滤，只触发 onSearch |
| virtualizeInSearch | `{ height: number; width: number; itemSize: number }` | `undefined` | 搜索结果虚拟滚动配置 |
| autoMergeValue | `boolean` | `true` | 选中父节点时 value 不包含后代 |
| checkRelation | `'related'\|'unRelated'` | `'related'` | 勾选关系：'related' 父子联动；'unRelated' 独立 |
| onChangeWithObject | `boolean` | `false` | onChange 回调是否返回完整 option 对象 |
| max | `number` | `undefined` | 多选可勾选数量上限；超出时不选入并触发 onExceed（减少始终允许） |
| onExceed | `(items: CascaderNode[]) => void` | `undefined` | 超出 max 时回调，传当前（含超出项）勾选的节点集合 |
| showRestTagsPopover | `boolean` | `false` | 超出 maxTagCount 折叠的 tag 以 Popover 悬浮展示剩余项（hover +N） |
| restTagsPopoverProps | `Record<string, unknown>` | `undefined` | 传给剩余 tags Popover 的额外 props（透传，可覆盖默认） |
| showClear | `boolean` | `false` | 是否显示清除按钮（对齐 Semi showClear） |
| keyMaps | `{ value?: string; label?: string; children?: string; disabled?: string; isLeaf?: string }` | `undefined` | 自定义字段名映射 |
| clickToSelect | `boolean` | `false` | 点击任意节点即选中（含非叶子） |
| enableLeafClick | `boolean` | `false` | 多选模式下点击叶子节点触发勾选 |
| disableStrictly | `boolean` | `false` | 禁用不从父节点继承（严格禁用） |
| showNext | `'click'\|'hover'` | `'click'` | 展开触发方式（对齐 Semi showNext）：click 点击 / hover 悬停展开子列 |
| onClear | `() => void` | `undefined` | 清空回调 |
| onLoad | `(loadedKeys: Key[], data: CascaderNode) => void` | `undefined` | 异步加载完成回调 |
| onSelect | `(value: Key) => void` | `undefined` | 节点选中回调（单选叶子选中时） |
| onDropdownVisibleChange | `(visible: boolean) => void` | `undefined` | 下拉面板显隐回调 |
| onListScroll | `(e: Event, info: { panelIndex: number; activeNode: CascaderNode \| null }) => void` | `undefined` | 列滚动回调 |
| triggerRender | `Snippet<[{ value: Key[] \| Key[][] \| undefined; placeholder: string; isOpen: boolean; disabled: boolean }]>` | `undefined` | 完全自定义触发器渲染 |
| class | `string` | `''` | 根节点自定义类名（对齐 Semi className） |

### Events

> 本组件无事件回调 prop（meta.events 为空）。此前本表列的回调均未实现，已删。

### Slots

| Slot | props | 说明 |
|---|---|---|
| trigger | `{ selectedNodes, open }` | 完全自定义触发器 |
| item | `{ node, level, active, checked, indeterminate, loading }` | 自定义列项渲染 |
| empty | `{ level }` | 自定义空态 |
| loading | `{ node }` | 自定义加载占位 |
| tag | `{ node, onClose }` | 自定义多选 Tag |
| suffix / prefix | — | 触发器前后缀（图标等） |
| notFound | `{ query }` | 搜索无结果 |

### Methods

通过组件实例（`bind:this`）调用的命令式方法：

| 方法 | 说明 |
|---|---|
| `open()` | 手动展开下拉面板 |
| `close()` | 手动关闭下拉面板 |
| `focus()` | 聚焦触发器（尊重 preventScroll） |
| `blur()` | 触发器失焦 |
| `search(value: string)` | 手动设置搜索词并触发搜索流程（需可搜索时有效） |

## 5. 主题 / Token

组件仅消费 Alias 与 Component 层 Token，禁止写死值。

| Component Token | 取值（引用 Alias） | 用途 |
|---|---|---|
| --cd-cascader-trigger-bg | --cd-color-bg-0 | 触发器背景 |
| --cd-cascader-trigger-border | --cd-color-border | 触发器边框 |
| --cd-cascader-trigger-border-hover | --cd-color-primary | hover 边框 |
| --cd-cascader-text | --cd-color-text-0 | 主文本 |
| --cd-cascader-placeholder | --cd-color-text-2 | 占位/弱文本 |
| --cd-cascader-panel-bg | --cd-color-bg-0 | 浮层/列背景 |
| --cd-cascader-column-border | --cd-color-border | 列分隔线 |
| --cd-cascader-item-hover-bg | --cd-color-fill-0 | 列项 hover 底 |
| --cd-cascader-item-active-bg | --cd-color-primary-light | 激活路径项底 |
| --cd-cascader-item-active-text | --cd-color-primary | 激活项文本 |
| --cd-cascader-item-disabled-text | --cd-color-text-3 | 禁用项文本 |
| --cd-cascader-arrow-color | --cd-color-text-2 | 列项展开箭头 |
| --cd-cascader-status-warning | --cd-color-warning | warning 边框 |
| --cd-cascader-status-error | --cd-color-danger | error 边框 |
| --cd-cascader-column-width | 180px | 列宽（可被 columnWidth 覆盖） |
| --cd-cascader-radius | --cd-radius-default | 圆角 |
| --cd-cascader-shadow | --cd-shadow-elevated | 浮层阴影 |

校验态：error 用 --cd-color-danger，warning 用 --cd-color-warning，二者均需满足 AA 对比；激活项底色与文本组合需保证 ≥ 4.5:1。

## 6. 无障碍

对齐 Semi item.tsx 的 combobox + menu/menuitem 模式（非标准 APG listbox/tree，是 Semi 源生模式，严格对齐 Semi 优先于套用标准模式）。

角色与属性：
- 触发器：`role="combobox"`，`aria-haspopup="menu"`（浮层内容为 menu/menuitem，非 listbox），`aria-expanded`，`aria-controls=<popup-id>`，`aria-activedescendant` 指向当前激活项。可搜索时该语义整体下移到触发器内搜索 `input`，根容器不再是 combobox（避免嵌套双 combobox）。
- 浮层：可搜索时切换为扁平结果列表，列项 `role="menuitem"`；非搜索时列区域每列 `role="menu"`（`aria-label` 走 `Cascader.columnLabel`），列项 `role="menuitem"`，含 `aria-expanded`（有子级且展开中）、`aria-haspopup`（可展开）、`aria-owns`（非首列指向其父项 id）、`aria-disabled`；多选勾选态由内嵌 Checkbox 自身 `aria-checked` 承载（非列项本身）。浮层根容器本身不设 role（Semi 字面 DOM 是 `role="listbox"` 包裹 `role="menu"`，但该嵌套违反 ARIA `aria-required-children` 规则，本库有 axe 零违规闸门，故浮层根节点省略 role，仅内部列/列项保留 Semi 的 menu/menuitem 语义）。
- 多选 Tag 区：每个 Tag 关闭按钮配 `aria-label`（走 `Tag.closeAriaLabel` 由 Tag 组件产出；Cascader slice 无 `removeTag` 键）。

键盘交互：
- 触发器：Enter/Space/Down 打开浮层并聚焦激活路径首列；Esc 关闭。
- 列内：Up/Down 同列移动（useRovingTabindex）；Right/Enter 展开并进入下一列；Left 回到上一列；Enter 在叶子（或 changeOnSelect 时任意级）确认；多选时 Space 切换勾选。
- Home/End 跳列首/尾；可搜索时输入自动进入过滤列表，Down 进入结果。
- Tab 关闭浮层并将焦点留在触发器（焦点不陷入）。

焦点管理：打开聚焦激活路径或首列首项；关闭归还触发器焦点；搜索框存在时可选 useFocusTrap。
对比度：所有文本/边框/激活态 ≥ AA；不可仅以颜色区分激活与禁用，激活项辅以底色与（可选）勾选标记。
reduced-motion：禁用浮层与列切换过渡。
RTL：列从右向左排布，箭头方向镜像，Left/Right 键义对调。
LiveAnnouncer：当前仅「加载中」走 `Cascader.loading`；「加载完成 / 加载失败 / 选中路径」三类播报**未实现**（locale 无 `loaded`/`selectedAnnounce` 键），如需补齐须同时加键与接线。

## 7. 国际化

用户可见文案零硬编码，全部走 i18n key：

> 本表由 `packages/locale/src/zh_CN.ts` 真源生成（2026-07-30 重校）。键名与键值都是 Semi 契约，勿手写「规划中」的键——历史上本表列过大量从未实现的键名，见 [[locale-dangling-keys-render-raw-key]]。

| i18n key | 默认（zh-CN） |
| --- | --- |
| `Cascader.clear` | 清除 |
| `Cascader.loading` | 加载中 |
| `Cascader.searchPlaceholder` | 搜索 |
| `Cascader.emptyText` | 无匹配项 |
| `Cascader.columnLabel` | 第 {level} 级选项 |
| `Cascader.searchResults` | 搜索结果 |

- 路径分隔符 separator 可随 locale 调整。
- `selectedCount` 等含复数语义文案交由 i18n 复数规则处理。
- 节点 label 若为数字/日期由调用方用 `Intl.NumberFormat` / `Intl.DateTimeFormat` 预格式化；组件内 count 用 `Intl.NumberFormat` 渲染。
- RTL locale 自动切换排布方向。

## 8. 文案

- 占位用动词短语"请选择"，不写"请选择级联数据"等冗余技术词。
- 空态简洁："暂无数据"；搜索无结果区分为"无匹配结果"。
- 加载失败提供可操作指引："加载失败，点击重试"，而非仅"出错了"。
- 计数文案统一"已选 N 项"，避免"选中了 N 个节点"口语化。
- 遵循 content-guidelines：句首大写（en）、中文不加句号、按钮用动词。

危险操作文案（单列）：
- 清除全部已选：触发器清除按钮 `aria-label` 走 `Cascader.clear`。二次确认**未实现**（locale 无 `clearConfirm` 键），需要时由调用方自行用 Popconfirm 包裹。

## 9. 性能

| 项 | 预算 / 策略 |
|---|---|
| gzip 体积（svelte 渲染层） | ≤ 8.95 KB |
| gzip 体积（core createCascader） | ≤ 5 KB |
| 首次打开浮层渲染 | < 16ms（仅渲染当前激活路径涉及的列，非全树） |
| 列项虚拟化 | 单列 > 100 项启用虚拟滚动（行高固定，windowing） |
| 动态加载 | loadData 按需触发，已加载子树缓存于 core 树 Map，不重复请求 |
| 搜索 | 输入 debounce 200ms；匹配在扁平 Map 上 O(n)，结果列表虚拟化 |
| 多选级联计算 | 勾选时仅回溯受影响子树/祖先链，避免全树扫描 |
| destroyOnClose | 默认 false（保留状态加速二次打开）；大数据/动态场景建议 true 释放 DOM |
| 惰性渲染 | 浮层未打开不渲染列 DOM；超出 maxTagCount 的 Tag 折叠为 +N |

关键场景：千级节点全量树打开 + 滚动应保持 60fps（依赖单列虚拟化）；动态加载每级请求结果可缓存。

## 10. AI 元数据

提供 `component.meta.ts`，包含：
- `name: 'Cascader'`，`category: 'input'`，`stage: 'M2'`，`semiEquivalent: 'Cascader'`。
- `capabilities`: ['multi-level-select','multiple','dynamic-load','searchable','change-on-select']。
- `props`/`events`/`slots` 的结构化签名（类型、默认值、是否受控、关联事件）供 AI 生成代码与校验。
- `controlledPairs`: [['value','change'],['open','openChange']]。
- `a11yRoles`: ['combobox','menu','menuitem']。
- `i18nKeys`: 第 7 节全部 key。
- `tokens`: 第 5 节 Component Token 清单。
- `examples`: 静态级联、动态加载、多选级联勾选、可搜索四个最小可运行片段。
- `antiPatterns`: ['用 Cascader 处理无层级数据（应用 Select）','在 loadData 内做无缓存重复请求']。

## 11. 测试

单元（core）：
- 树规范化与 parent 索引正确性；activePath 派生 columns 正确。
- 多选级联：父选全子、子全选回父 checked、部分选 indeterminate、disabled 子级不被级联。
- changeOnSelect / leafOnly 下 value 与 selectedNodes 输出。
- loadData：触发、loading 态、合入树、缓存命中不重复请求、失败回滚。
- 搜索：filterTreeNode 命中路径、filterLeafOnly 行为、无结果。

交互 / a11y（svelte + testing-library + axe）：
- 键盘：Up/Down/Left/Right/Enter/Space/Esc/Home/End 全覆盖（含 RTL 键义对调）。
- 焦点：打开聚焦激活路径、关闭归还触发器、Tab 不陷入。
- ARIA：combobox/menu/menuitem 属性、aria-activedescendant 跟随、aria-busy 加载态、axe 0 violations。
- LiveAnnouncer 播报展开/加载/选中。

视觉 / 回归：三尺寸 × 三校验态、激活/hover/disabled、多选折叠 +N、空态/无结果/加载/失败快照；reduced-motion 关过渡。
E2E：动态加载逐级展开 + 多选确认 + 清除完整流程。

## 12. 验收标准 Checklist

- [ ] 单选/多选、changeOnSelect、leafOnly 行为符合 API 表
- [ ] 动态加载 loadData 正确：loading 态、合入树、缓存命中不重复请求、失败可重试
- [ ] 多选级联勾选与 indeterminate 半选正确，disabled 子级不被级联
- [ ] 搜索可用：命中路径、filterLeafOnly、无结果空态、debounce
- [ ] value+on:change、open+on:openChange 受控/非受控均工作
- [ ] size(small/default/large)、status(default/warning/error) 视觉与 Form 联动正确
- [ ] 仅消费 --cd- Alias/Component Token，无写死值；激活/校验态对比度 ≥ AA
- [ ] 键盘交互全覆盖，焦点打开/关闭管理正确，Tab 不陷入
- [ ] ARIA 角色/属性完整，axe 0 violations，LiveAnnouncer 播报到位
- [ ] reduced-motion 关过渡，RTL 列方向与键义镜像正确
- [ ] 用户可见文案全部走 i18n key，无硬编码；count 用 Intl 格式化
- [ ] 危险操作（清除全部）文案单列且可选二次确认
- [ ] core 拆分 createCascader 并复用 useId/useDismiss/useRovingTabindex/useLiveAnnouncer/useScrollLock/useFocusTrap
- [ ] Perf Budget 达标：体积、单列虚拟化、destroyOnClose、惰性渲染
- [ ] 提供 component.meta.ts，字段完整可被 AI 消费
- [ ] 单元/交互/a11y/视觉/E2E 测试齐全并通过
