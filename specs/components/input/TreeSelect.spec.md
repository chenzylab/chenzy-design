# SPEC · TreeSelect
> 分类：input · 阶段：M2
> 对标 Semi：TreeSelect

## 1. 概述

TreeSelect 是「树形数据 + 下拉选择」的复合输入控件：把 Tree 的层级结构折叠进一个 Select 触发器中，用于在具有父子层级关系的数据（组织架构、地区级联、分类目录、权限节点）里做单选或多选。它的核心定位是替代「层级很深、用 Cascader 又非严格逐级、用普通 Select 又丢失层级语义」的场景。

与库内相邻组件的边界：
- 对比 Select：TreeSelect 的选项是树而非扁平列表，新增展开/收起、父子联动选择、leafOnly 等概念。
- 对比 Cascader：Cascader 强调「逐级路径选择」（必须一级一级走），TreeSelect 允许直接勾选任意节点、支持父子级联与跨层级多选。
- 对比 Tree：Tree 是常驻面板的纯结构控件，TreeSelect 把它包进浮层并提供回填到触发器的语义。

关键能力：单选/多选、父子级联勾选（checked/halfChecked）、leafOnly、搜索过滤（远程/本地）、虚拟化长列表、异步加载子节点（loadData）、自定义回填渲染、校验态、尺寸。

## 2. 设计语义

- 触发器（Trigger）：默认 outline 输入框形态，单选回填为节点 label，多选回填为 Tag 列表（可 maxTagCount 折叠 +N）。占位 placeholder，可清除（showClear）时 hover 出现 clear 图标，尾部箭头 caret 随 open 旋转 180°。
- 浮层（Popover）：包裹 Tree 面板，宽度默认对齐触发器宽度（可 dropdownMatchSelectWidth），最大高度后内部滚动；超过阈值启用虚拟化。
- 选中语义：
  - 单选：点击节点即选中并关闭浮层；当前选中节点高亮（`--cd-tree-select-node-selected-bg`）。
  - 多选：节点前置 Checkbox，父子级联时父节点呈现 indeterminate（半选）。
  - leafOnly：仅叶子节点可被选中，父节点仅作展开容器。
- 状态：default / hover / focus（触发器外发光 ring）/ disabled（整体降透明度，节点级 disabled 单独置灰）/ status warning|error（边框换 `--cd-color-warning`/`--cd-color-danger`）。
- 节点行：缩进（indent × level）、展开箭头（叶子无箭头占位对齐）、可选 icon、label、可选后缀。
- 密度：尺寸 small|default|large 改变触发器高度与节点行高、字号。
- 动效：浮层展开淡入 + 轻微位移（120ms ease-out），箭头旋转 150ms；reduced-motion 下全部退化为即时切换。

## 3. 分层实现

属于强交互 + 键盘 + a11y 复合控件，采用 headless 分层。

**@chenzy-design/core · `createTreeSelect`**
- 维护状态机：`open`、`value`（单选 string|number / 多选数组）、`expandedKeys`、`checkedKeys`/`halfCheckedKeys`、`searchValue`、`loadingKeys`、`activeKey`（键盘高亮）。
- 派生：扁平化可见节点列表（folding + filter 后的 flatten，供虚拟化与 roving 使用）、父子级联计算（向上推导 halfChecked、向下传播 checked，含 disabled/disableCheckbox 节点跳过逻辑）、leafOnly 过滤。
- 复用原语：
  - `useDismiss`：点击外部 / Esc 关闭浮层。
  - `useFocusTrap`：多选带搜索框时管理浮层内焦点（弱 trap，允许 Tab 回到触发器）。
  - `useRovingTabindex`：在扁平化可见节点列表上做上下键导航。
  - `useScrollLock`：可选，移动端全屏弹层时锁背景滚动。
  - `useLiveAnnouncer`：播报「已选 N 项」「展开/收起」「加载中/无匹配」。
  - `useId`：生成 listbox/tree、active descendant、label 关联 id。
- 暴露纯函数：`toggleExpand(key)`、`toggleCheck(key)`、`selectNode(key)`、`setSearch(str)`、`getCheckedNodes()`、`computeCascade(...)`，便于跨框架与单测。

**@chenzy-design/svelte · `<TreeSelect>`**
- 渲染触发器、浮层、Tree 节点、Tag、虚拟列表容器；绑定 core 输出的 actions/attrs（spread aria 属性）。
- 面板层直接复用 `../tree/treeNode.svelte`、`../tree/nodeList.svelte`（对齐 Semi treeNode.tsx 被 Tree/TreeSelect 共用同一份组件的事实）；改动这两个文件会同时影响 Tree 与 TreeSelect 的节点渲染，需同步验证两处消费方。
- 虚拟化：可见节点数 > `virtualizeThreshold`（默认 100）时启用窗口渲染（固定/估算行高），仅渲染视口 + overscan。
- destroyOnClose / lazy：浮层未首次打开不渲染 Tree DOM。

## 4. API

### Props

> 本表由 `packages/svelte/src/tree-select/meta.ts` 真源生成（2026-07-30 重校）。此前本表列的 prop 多为 Semi 对齐前的旧名或已删除项（如 `value`→`activeKey`、`change`→`onChange`），改 prop 时请同步 meta.ts，勿手写「规划中」的 prop。

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| value | `TreeKey\|TreeNode\|Array<TreeKey\|TreeNode>\|null` | `undefined` | onChangeWithObject 开启时为节点对象（或对象数组） |
| defaultValue | `TreeKey\|TreeNode\|Array<TreeKey\|TreeNode>\|null` | `null` | onChangeWithObject 开启时为节点对象（或对象数组） |
| treeData | `TreeNode[]` | `[]` | 树数据源；字段名可经 keyMaps 自定义 |
| defaultOpen | `boolean` | `false` |  |
| multiple | `boolean` | `false` | checkbox 多选 + 父子联动，多 tag 回显 |
| checkRelation | `'related'\|'unRelated'` | `'related'` | 多选父子是否级联联动；unRelated 互不影响（对齐 Semi） |
| maxTagCount | `number` | `undefined` | 多选回填 Tag 最大展示数，超出折叠为 +N（仅影响显示） |
| placeholder | `string` | `'请选择'` |  |
| size | `'small'\|'default'\|'large'` | `default` |  |
| status | `'default'\|'warning'\|'error'` | `default` |  |
| disabled | `boolean` | `false` |  |
| showClear | `boolean` | `false` | 值不为空时 trigger 展示清除按钮（对齐 Semi） |
| leafOnly | `boolean` | `false` |  |
| defaultExpandAll | `boolean` | `false` |  |
| defaultExpandedKeys | `TreeKey[]` | `[]` | 默认展开的节点 key（非受控初始展开集，与 defaultExpandAll 取并集；对齐 Semi） |
| filterTreeNode | `boolean \| ((inputValue: string, treeNodeString: string, data?: TreeNode) => boolean)` | `undefined` | 按输入筛选节点（对齐 Semi）：true 开启搜索并默认按 treeNodeFilterProp 包含匹配；函数则自定义匹配谓词。remote 或 filterTreeNode 真值时显示搜索框 |
| remote | `boolean` | `false` | 远程搜索：输入仅触发 onSearch，不本地过滤（外部更新 treeData） |
| onSearch | `(input: string, filteredExpandedKeys: TreeKey[], filteredNodes: TreeNode[]) => void` | `undefined` | 搜索输入回调（对齐 Semi 三入参）：入参为当前输入、过滤后应展开的节点 keys、命中节点数组 |
| loadData | `(node: TreeNode) => Promise<TreeNode[]>` | `undefined` | 异步加载子节点：展开未加载的非叶子节点时调用，返回该节点子节点数组（加载中显示 spinner，竞态去重，不写回 treeData）。与 Tree 的 loadData 对齐 |
| virtualize | `{ height?: number; width?: number \| string; itemSize?: number }` | `undefined` | 列表虚拟化（对齐 Semi）：传入对象即开启，仅渲染视口内可见行；height 视口高（默认 224）、itemSize 行高（默认 32）。复用 Tree 范式（core fixedRange），保持 role=tree/treeitem 语义 |
| triggerRender | `Snippet<[{ value: TreeKey\|TreeKey[]\|null\|undefined; placeholder: string; isOpen: boolean; disabled: boolean }]>` | `undefined` | 完全自定义触发器渲染（替换默认选择框）；参数含当前 value/placeholder/isOpen/disabled，与 Cascader.triggerRender 对齐 |
| insetLabel | `Snippet \| string` | `undefined` | 触发器内嵌标签，渲染在回填值/占位符之前（对齐 Semi insetLabel），消费 --cd-color/font-tree-select-label token |
| insetLabelId | `string` | `undefined` | 内嵌标签的 id（a11y 关联用），对齐 Semi insetLabelId |
| motion | `boolean` | `true` | 下拉浮层开合动画（淡入）；与 Cascader/Dropdown 的 motion 对齐。reduced-motion 退化 |
| onChange | `(value: TreeKey\|TreeNode\|Array<TreeKey\|TreeNode>\|null) => void` | `undefined` | 多选返回 checked 全集数组，单选返回单值；onChangeWithObject 开启时携带节点对象而非仅 key |
| aria-label | `string` | `undefined` |  |
| ariaLabelledby | `string` | `undefined` | aria-labelledby：关联外部 label 元素（Form.Field 透传 labelId，对齐 Semi） |
| ariaDescribedby | `string` | `undefined` | aria-describedby：关联 helpText / extraText（Form.Field 透传） |
| ariaErrormessage | `string` | `undefined` | aria-errormessage：error 态关联错误信息容器（Form.Field 透传） |
| ariaRequired | `boolean` | `undefined` | aria-required：必填语义（Form.Field required 透传） |
| position | `string` | `'bottomLeft'` | 浮层弹出位置（对齐 Semi，参考 Tooltip position）；映射到 use:floating placement |
| dropdownMatchSelectWidth | `boolean` | `true` | 浮层宽度对齐触发器（min-inline-size = 触发器宽） |
| getPopupContainer | `() => HTMLElement \| null \| undefined` | `undefined` | 浮层挂载容器，缺省 ConfigProvider 全局值再回退 document.body |
| stopPropagation | `boolean` | `true` | 触发器点击是否阻止事件冒泡（对齐 Semi） |
| borderless | `boolean` | `false` | 无边框模式：trigger 边框透明 |
| prefix | `Snippet \| string` | `undefined` | trigger 前缀 |
| suffix | `Snippet \| string` | `undefined` | trigger 后缀 |
| clearIcon | `Snippet` | `undefined` | 自定义清除按钮图标 |
| expandIcon | `Snippet<[{ node: TreeNode; expanded: boolean; level: number }]>` | `undefined` | 自定义展开图标；也可传无参 Snippet 统一渲染 |
| arrowIcon | `Snippet` | `undefined` | 自定义右侧下拉箭头（expandIcon 的别名） |
| showLine | `boolean` | `false` | 显示节点连接线（垂直导引线） |
| labelEllipsis | `boolean` | `true` | 节点 label 单行省略截断，可关闭以允许换行 |
| style | `string` | `undefined` | 选择框样式 |
| autoAdjustOverflow | `boolean` | `true` | 浮层遮挡时自动调整方向 |
| validateStatus | `'default'\|'error'\|'warning'` | `undefined` | status 的别名（优先于 status） |
| onBlur | `(e: FocusEvent) => void` | `undefined` | 失焦回调 |
| onFocus | `(e: FocusEvent) => void` | `undefined` | 聚焦回调 |
| preventScroll | `boolean` | `false` | 聚焦时阻止滚动 |
| outerTopSlot | `Snippet` | `undefined` | 面板顶部外层 slot（在搜索框之上） |
| outerBottomSlot | `Snippet` | `undefined` | 面板底部外层 slot（在树之下） |
| searchAutoFocus | `boolean` | `false` | 面板打开时搜索框自动获焦 |
| searchPosition | `'dropdown'\|'trigger'` | `'dropdown'` | 搜索框位置：'dropdown' 面板内；'trigger' trigger 内 |
| searchPlaceholder | `string` | `undefined` | 搜索框占位文字 |
| treeNodeFilterProp | `string` | `'label'` | 搜索过滤属性 |
| showSearchClear | `boolean` | `true` | 搜索框右侧显示清除按钮（有内容时） |
| showFilteredOnly | `boolean` | `false` | 搜索激活时仅显示命中节点，不显示祖先链 |
| emptyContent | `string \| Snippet` | `undefined` | 无匹配/无数据占位内容（对齐 Semi emptyContent）；未传回退 i18n TreeSelect.emptyText |
| searchRender | `boolean \| Snippet<[{ value: string; onInput: (v: string) => void; onKeydown: (e: KeyboardEvent) => void; placeholder: string }]>` | `undefined` | 自定义搜索框渲染：false 隐藏内置搜索框；Snippet 完全接管渲染（回调回填输入） |
| expandedKeys | `TreeKey[]` | `undefined` | 受控展开的节点 keys |
| expandAll | `boolean` | `false` | 动态全部展开（受控/动态，区别于 defaultExpandAll） |
| expandAction | `false \| 'click' \| 'doubleClick'` | `false` | 行点击展开方式：false 仅展开按钮；'click' 单击行；'doubleClick' 双击行 |
| autoExpandParent | `boolean` | `false` | 展开节点时自动展开其所有祖先链 |
| motionExpand | `boolean` | `true` | 展开/折叠动画 |
| onExpand | `(expandedKeys: TreeKey[], info: { expanded: boolean; node: unknown }) => void` | `undefined` | 节点展开回调 |
| autoMergeValue | `boolean` | `true` | 自动合并值：父节点全选时 value 折叠为父不含后代（对齐 Semi）；leafOnly 时改为仅叶子 |
| onChangeWithObject | `boolean` | `false` | onChange 回调携带完整节点对象而非仅 key |
| showRestTagsPopover | `boolean` | `false` | 多选 maxTagCount 折叠出 +N 时，hover +N 用 Popover 浮层展示折叠掉的剩余全部 Tag |
| restTagsPopoverProps | `Record<string, unknown>` | `undefined` | 透传给剩余 Tag Popover 浮层的额外 props（在默认 trigger=hover/position=top 之后展开，可覆盖） |
| triggerTagWrap | `boolean` | `false` | trigger 多选 tags 换行显示（默认单行截断折叠） |
| renderLabel | `Snippet<[{ node: TreeNodeData; level: number; searchValue: string; selected: boolean; checked: boolean }]>` | `undefined` | 自定义节点 label 渲染（仅替换文字部分）；与 Tree.svelte 签名统一（Semi treeNode.tsx 是 Tree/TreeSelect 共用同一份组件） |
| renderFullLabel | `Snippet<[FullLabelContext]>` | `undefined` | 完全自定义节点行渲染（替换整行内容）；FullLabelContext 含 data/level/style/className/expandIcon/isLeaf/checkStatus/expandStatus/filtered/searchWord/onClick/onCheck/onExpand/onContextMenu/onDoubleClick，定义见 `../tree/treeContext.ts` |
| renderSelectedItem | `Snippet<[{ node: TreeNode; onRemove: () => void }]>` | `undefined` | 自定义 trigger 已选 tag 渲染（多选时每个 tag 独立渲染） |
| treeNodeLabelProp | `string` | `'label'` | 节点数据中用作显示 label 的字段名 |
| keyMaps | `{ key?: string; label?: string; value?: string; children?: string }` | `undefined` | 自定义节点字段名映射（对齐 Semi keyMaps）：适配任意后端数据结构，如 { key:'id', label:'name', children:'sub' } |
| optionListStyle | `string \| Record<string, string>` | `undefined` | 选项列表容器的内联 style |
| loadedKeys | `Set<TreeKey>` | `undefined` | 受控已加载的节点 keys |
| clickToHide | `boolean` | `true` | 单选选中后自动关闭面板 |
| clickTriggerToHide | `boolean` | `true` | 面板开启时点击 trigger 关闭面板 |
| disableStrictly | `boolean` | `false` | 严格禁用：disabled 节点不因父节点联动而影响，禁用态独立 |
| dropdownMargin | `number \| { marginTop?: number; marginBottom?: number; marginLeft?: number; marginRight?: number }` | `undefined` | 浮层与 trigger 的额外间距（px）；数字映射到浮层 offset，对象取 marginTop |
| dropdownClassName | `string` | `undefined` | 追加到浮层根节点的自定义类名（与内置类名并存） |
| dropdownStyle | `string \| Record<string, string>` | `undefined` | 合并进浮层根节点的内联样式（不覆盖内置定位样式） |
| zIndex | `number` | `undefined` | 浮层层级（z-index），未传由 CSS 控制 |
| onClear | `(e: MouseEvent) => void` | `undefined` | 点击清除按钮回调 |
| onSelect | `(selectedKey: TreeKey, selected: boolean, node: unknown) => void` | `undefined` | 节点选中回调 |
| onLoad | `(loadedKeys: TreeKey[], treeNode: TreeNode) => void` | `undefined` | 异步加载完成回调（含已加载 key 集合与当前节点） |
| onVisibleChange | `(isVisible: boolean) => void` | `undefined` | 面板可见性变化回调（对齐 Semi onVisibleChange） |

### Events

> 本组件无事件回调 prop（meta.events 为空）。此前本表列的回调均未实现，已删。

### Methods

组件实例方法（Svelte 5 `export function`，经 `bind:this` 获取实例后调用）。

| 名称 | 说明 |
|---|---|
| `search(sugInput)` | 命令式搜索：把值置给内部搜索态并触发过滤（对齐 Semi，用于外部自定义搜索框）。 |

### Slots

> 本组件无独立 `<slot>` 通道，均由 Props 表内 Snippet 类型 prop 承担（Svelte 5 无 slot 概念）：完全自定义触发器见 `triggerRender`，节点 label 见 `renderLabel`/`renderFullLabel`，多选回填 Tag 见 `renderSelectedItem`，前缀图标见 `expandIcon`，空态见 `emptyContent`，触发器前后缀见 `prefix`/`suffix`，清除按钮图标见 `clearIcon`。无独立 loading 插槽。

## 5. 主题 / Token

仅消费 Alias / Component 级 Token，禁止写死。Component 级 Token 默认值映射到 Alias。

| Component Token | 默认引用 | 用途 |
| --- | --- | --- |
| `--cd-tree-select-bg` | `--cd-color-bg-0` | 触发器与浮层背景。 |
| `--cd-tree-select-border` | `--cd-color-border` | 触发器边框。 |
| `--cd-tree-select-border-hover` | `--cd-color-primary` | hover 边框。 |
| `--cd-tree-select-border-focus` | `--cd-color-primary` | focus 边框 + ring。 |
| `--cd-tree-select-border-warning` | `--cd-color-warning` | warning 态边框。 |
| `--cd-tree-select-border-error` | `--cd-color-danger` | error 态边框。 |
| `--cd-tree-select-text` | `--cd-color-text-0` | 选中值/节点文字。 |
| `--cd-tree-select-placeholder` | `--cd-color-text-2` | 占位文字。 |
| `--cd-tree-select-node-hover-bg` | `--cd-color-fill-0` | 节点行 hover 背景。 |
| `--cd-tree-select-node-active-bg` | `--cd-color-fill-1` | 键盘高亮节点背景。 |
| `--cd-tree-select-node-selected-bg` | `--cd-color-primary-light-default` | 单选选中背景。 |
| `--cd-tree-select-node-selected-text` | `--cd-color-primary` | 单选选中文字。 |
| `--cd-tree-select-node-disabled-text` | `--cd-color-text-3` | 禁用节点文字。 |
| `--cd-tree-select-indent` | `--cd-spacing-base`(=24px) | 单级缩进宽度。 |
| `--cd-tree-select-radius` | `--cd-radius-default` | 触发器/浮层圆角。 |
| `--cd-tree-select-shadow` | `--cd-shadow-elevated` | 浮层投影。 |
| `--cd-tree-select-height-small/default/large` | `--cd-height-s/m/l` | 三档触发器高度。 |

类名：`cd-tree-select`、`cd-tree-select-trigger`、`cd-tree-select-tags`、`cd-tree-select-arrow`、`cd-tree-select-panel`、`cd-tree-select-search-wrapper`、`cd-tree-select-tree`、`cd-tree-select-node`、`cd-tree-select-expand`、`cd-tree-select-checkbox`、`cd-tree-select-node-label`、`cd-tree-select-empty`；修饰符 `--multiple`、`--small/--large`、`--error/--warning`、`--disabled`、`--open`、`cd-tree-select-node-selected/--active/--disabled`。

暗色模式由 Alias Token 自动翻转，组件层不写独立 dark 规则。

## 6. 无障碍

遵循 WAI-ARIA APG（Combobox + Tree 组合）。

- 触发器：`role="combobox"`，`aria-haspopup="tree"`，`aria-expanded`，`aria-controls=<treeId>`，`aria-activedescendant=<当前高亮节点id>`；通过 `aria-labelledby`/`aria-label` 关联外部 Form 标签；`status=error` 时 `aria-invalid="true"` 并 `aria-describedby` 指向错误提示。
- 浮层列表：`role="tree"`，`aria-multiselectable=multiple`。
- 节点：`role="treeitem"`，`aria-level`、`aria-setsize`、`aria-posinset`、`aria-expanded`（有子节点时）、`aria-selected`（单选）/`aria-checked`（多选，支持 `mixed` 表示半选）、`aria-disabled`。
- 键盘交互：
  - 触发器 `Enter`/`Space`/`Down` 打开浮层并聚焦首个/已选节点。
  - 列表内 `Up`/`Down` 移动高亮（roving，跨展开节点连续）；`Left` 收起或跳父节点，`Right` 展开或进入首子节点；`Home`/`End` 首/末。
  - `Enter`/`Space` 选中（多选切换勾选）；`Esc` 关闭浮层并焦点回触发器。
  - 可搜索时键入字符聚焦搜索框；`Tab` 离开关闭。
- 焦点管理：浮层打开时使用弱 focus trap（搜索框存在时），关闭后焦点确定性回到触发器。虚拟化下高亮节点滚出视口时自动 scrollIntoView 并保持 activedescendant 同步（渲染保证目标节点在 DOM 中）。
- 对比度：文字/边框/占位均满足 AA（≥4.5:1 文本、≥3:1 大字与边框/图标）；半选 indeterminate 不仅靠颜色，提供 dash 视觉标记。
- reduced-motion：`prefers-reduced-motion: reduce` 时禁用浮层与箭头动效。
- RTL：`dir="rtl"` 下缩进、箭头方向、`Left/Right` 键语义整体镜像，Tag 折叠从右起算。

## 7. 国际化

用户可见文案零硬编码，全部走 i18n key；日期/数字若出现在节点（如计数）用 `Intl.NumberFormat`。

> 本表由 `packages/locale/src/zh_CN.ts` 真源生成（2026-07-30 重校）。键名与键值都是 Semi 契约，勿手写「规划中」的键——历史上本表列过大量从未实现的键名，见 [[locale-dangling-keys-render-raw-key]]。

| i18n key | 默认（zh-CN） |
| --- | --- |
| `TreeSelect.clear` | 清除 |
| `TreeSelect.emptyText` | 无数据 |
| `TreeSelect.searchPlaceholder` | 搜索 |
| `TreeSelect.restTagsCount` | 还有 {count} 项 |

`+{count}` 与 `已选 {count} 项` 中的数字经 `Intl.NumberFormat(locale)` 格式化。

## 8. 文案

- 遵循 content-guidelines：placeholder 用「请选择」而非「选择一个选项」；空态简短中性「暂无数据」，搜索无果用「无匹配结果」而非「错误」。
- Tag 折叠后缀统一 `+{count}`，不加「等」。
- 标签使用动宾或名词短语，避免标点结尾。
- 危险操作文案（单列）：本组件「清除」会一次性丢弃全部已选值，属可逆但易误触操作——
  - 清除按钮 `aria-label` = `TreeSelect.clear`（请勿用「删除/Delete」等破坏性措辞）。
  - 若业务需二次确认，应由上层 Popconfirm 包裹，TreeSelect 本身不内置确认弹层，避免阻断主流程。

## 9. 性能

| 维度 | Budget / 策略 |
| --- | --- |
| gzip 体积（svelte 渲染层） | ≤ 12 KB（按实测校准：含 searchPosition/放大镜搜索框/position 映射/showClear/renderSelectedItem 等富功能） |
| gzip 体积（core headless） | ≤ 5 KB（不含 Tree 原语共享部分） |
| 首次打开浮层（1k 节点，虚拟化） | < 16ms 首帧（仅渲染视口 + overscan） |
| 滚动帧 | 稳定 60fps；虚拟列表行回收，无整树重排 |
| 搜索过滤（5k 节点，本地） | < 50ms（防抖 200ms + 预建 key→node Map 与 path 索引） |
| 父子级联计算 | O(受影响子树 + 祖先链)，缓存 parent 映射，避免每次全树遍历 |
| 内存 | 虚拟化下 DOM 节点数 ≈ 视口可见 + overscan（默认 5），与数据规模解耦 |

策略要点：默认 `virtualizeThreshold=100` 自动虚拟化；`destroyOnClose` 与 lazy 首开渲染减少常驻 DOM；`loadData` 支持惰性子树加载，避免一次性挂载深树；搜索结果折叠路径增量计算。

## 10. AI 元数据

提供 `component.meta.ts`，导出 `TreeSelectMeta`，内容包含：
- `name`、`category: 'input'`、`stage: 'M2'`、`semiEquivalent: 'TreeSelect'`。
- `props/events/slots` 的结构化描述（类型、默认值、枚举值、是否受控对 `value/open`）。
- `tokens`：第 5 节 Component Token 列表与 Alias 映射。
- `a11y`：role/aria 摘要、APG 模式标识 `combobox+tree`、键盘表。
- `i18nKeys`：第 7 节 key 列表。
- `examples`：单选、多选级联、leafOnly、远程搜索、虚拟化大数据、异步 loadData 共 6 个最小可运行片段。
- `relations`：`{ alternativeTo: ['Select','Cascader'], composedOf: ['Tree','Tag','Popover','Checkbox','Input'] }`，供 AI 选型推荐。

## 11. 测试

- 单元（core，框架无关）：`computeCascade` 向上半选/向下传播、`disabled/disableCheckbox` 跳过；`showCheckedStrategy` 三策略收敛；`leafOnly` 过滤；扁平化可见列表随展开/过滤正确性；受控 vs 非受控 `value/open/expandedKeys` 分支。
- 交互（svelte + testing-library）：键盘全路径（开/关、上下左右、Home/End、Enter/Space、Esc）；roving 与 `aria-activedescendant` 同步；多选 Tag 增删与 `maxTagCount` 折叠；showClear 行为与 `on:clear`。
- a11y：axe 无违规；role/aria 断言（treeitem 的 level/posinset/setsize、`aria-checked=mixed`）；focus trap 与焦点回归；reduced-motion 媒体查询生效。
- 虚拟化：1k/10k 节点渲染节点数上界断言；高亮 scrollIntoView 命中；滚动后选中态保持。
- 异步：`loadData` resolve/reject、loading 态、加载后展开正确；远程 `on:search` 防抖与竞态（后到先到丢弃）。
- 视觉回归：尺寸 ×3、status ×3、单/多选、RTL、dark 快照。

## 12. 验收标准 Checklist

- [ ] 单选点击即选中并关闭；多选切换勾选且浮层保持打开。
- [ ] 父子级联 checked/halfChecked 正确，`checkRelation='unRelated'` 时互不影响。
- [ ] `showCheckedStrategy` all/parent/child 回填值与 Tag 符合预期。
- [ ] `leafOnly` 下父节点不可选、仅作展开容器。
- [ ] `value/defaultValue`、`open/defaultOpen`、`expandedKeys` 受控与非受控均工作。
- [ ] `on:change` 携带 value + nodes；`on:openChange/expand/check/select/clear/load/search` 语义正确。
- [ ] filterable 本地过滤 + 路径保留；remote 仅触发 `on:search` 不本地过滤，含防抖与竞态处理。
- [ ] 节点数超阈值自动虚拟化，DOM 节点数与数据规模解耦，滚动 60fps。
- [ ] `loadData` 异步加载、loading 占位、加载后展开正确。
- [ ] 键盘交互全覆盖（含 Left/Right 展开收起、Esc 焦点回归），`aria-activedescendant` 同步。
- [ ] ARIA：combobox + tree，treeitem 的 level/setsize/posinset/checked(mixed)/selected/disabled 正确，axe 无违规。
- [ ] 全部可见文案走 i18n，无硬编码；计数经 Intl 格式化。
- [ ] 仅消费 Alias/Component Token，无写死颜色/尺寸；dark 自动适配；RTL 镜像正确。
- [ ] reduced-motion 下动效退化。
- [ ] gzip 体积达标（svelte ≤12KB / core ≤5KB）。
- [ ] 提供 `component.meta.ts`，字段完整且与本 SPEC 一致。
- [ ] `showClear` 一次清空全部，`aria-label` 用「清除」非破坏性措辞。
