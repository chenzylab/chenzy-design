# SPEC · Tree
> 分类：show · 阶段：M4
> 对标 Semi：Tree

## 1. 概述

Tree（树形控件）以层级缩进的方式展示具有父子关系的结构化数据，支持展开/折叠、选中、勾选（含父子联动的半选态）、搜索过滤、节点拖拽排序与跨层级移动，并在大数据量下提供虚拟滚动。它是文件目录、组织架构、分类导航、权限树等场景的基础控件，同时作为 `TreeSelect`、`Cascader` 等高阶组件的内部渲染引擎。

核心能力边界：
- **展开/折叠**：受控 `expandedKeys` / 非受控 `defaultExpandedKeys`，支持手风琴 `accordion`、首屏自动展开 `defaultExpandAll`、按 `expandedDepth` 展开到指定层。
- **选择 vs 勾选**：两套独立语义。`multiple` 控制高亮选择（selection，单/多选）；`checkable` 控制复选框勾选（check），二者可同时存在。
- **勾选联动**：默认父子联动（勾选父全选子、子全选则父选中、部分选中显示半选 indeterminate）；`checkRelation="unRelated"` 关闭联动，`checkStrictly` 父子状态解耦。
- **搜索**：内置 `filterTreeNode` + 高亮匹配，命中节点的祖先链自动展开。
- **拖拽**：`draggable` 开启节点拖拽，支持插入到节点前/后/内部三种 drop 位置。
- **虚拟化**：`virtualized` 开启窗口化渲染，扁平化可见节点后只渲染视口内行。

不在本组件范围：异步分页加载列表（用 List）、表格行树（用 Table 的 `treeData`）、纯导航菜单（用 Menu）。异步子节点加载通过 `loadData` 内置支持。

## 2. 设计语义

- **节点行（node）**：单行高度 `default` 32px / `small` 28px / `large` 36px，由展开箭头、可选 checkbox、可选 icon、label、可选后缀操作区构成。
- **缩进（indent）**：每层缩进 `--cd-tree-indent`（默认 24px），通过 `indent * level` 计算左 padding，缩进区可绘制连接引导线 `showLine`。
- **展开箭头（switcher）**：仅当节点有子节点（或可异步加载）时显示，旋转 90° 表达展开态，loading 时替换为 spinner。
- **状态层次**：hover（`--cd-tree-node-bg-hover`）、selected（`--cd-tree-node-bg-selected` + 文本 `--cd-color-primary`）、disabled（`--cd-color-text-2` + 禁止指针）、dragOver（drop 指示线/高亮）。
- **半选态（indeterminate）**：checkbox 显示横杠，语义为"部分子节点被勾选"。
- **拖拽反馈**：拖动时跟随幽灵节点（drag ghost），目标位置以 1px 指示线（前/后）或整行高亮（内部）呈现。
- **空态**：无数据时展示 `emptyContent`（默认对接 Empty 组件文案）。
- 校验态 `status`（default/warning/error）作用于整个树容器边框，主要用于嵌入表单的 TreeSelect 场景透传。

## 3. 分层实现

**有交互/键盘/a11y 逻辑，需要 core 层。**

- `@chenzy-design/core` → `createTree`：
  - 维护 headless 状态机：扁平化树（flatten 可见节点为有序数组，便于虚拟化与键盘上下移动）、expanded/selected/checked/halfChecked/loaded 四组 key Set。
  - 勾选联动算法：`conduction`（自底向上、自顶向下传播 checked/indeterminate），`checkStrictly` 时旁路。
  - 搜索过滤：`computeFilteredKeys` 计算命中节点及需要保留展开的祖先链。
  - 拖拽逻辑：`computeDropPosition`（依据指针 Y 在目标行的相对位置返回 before/after/inside）、`isDropAllowed`（防止拖入自身子树）。
  - 复用 core 原语：
    - `useRovingTabindex`：整棵树作为单一 tab stop，方向键在可见节点间移动 roving focus。
    - `useId`：生成 `tree`/`treeitem`/`group` 的稳定 id，建立 `aria-activedescendant` 与 `aria-owns` 关联。
    - `useLiveAnnouncer`：展开/折叠/勾选/拖拽完成的屏幕阅读器播报。
  - 输出可注入的 selection/check 模型，供 TreeSelect 等复用。
- `@chenzy-design/svelte` → `Tree.svelte`：
  - 消费 `createTree` 返回的 store 与 action（`use:treeRoot`、`use:treeNode`）。
  - 渲染层负责虚拟滚动（与 core 的 flatten 数组对接）、`labelRender` / 自定义 switcher 插槽、拖拽 DOM 事件桥接。
  - 不在视图层放业务状态逻辑；所有键盘/联动结果由 core 计算后回流。
- **虚拟化**：`virtualized` 开启时仅渲染视口行（固定行高 + overscan）；关闭时全量渲染。`virtualized.itemSize` 可配。

## 4. API

### Props

| 名称 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `treeData` | `TreeNodeData[]` | `[]` | 树数据源；`{ key, label, value?, icon?, disabled?, checkable?, selectable?, isLeaf?, children? }` |
| `treeDataSimpleJson` | `Record<string, unknown>` | — | 简单 JSON 树数据：扁平 `{ key: value }`，key 作 key/label，value 作节点 value，嵌套对象转子树。`treeData` 非空时优先 |
| `fieldNames` | `{ key?; label?; children?; }` | `{key:'key',label:'label',children:'children'}` | 自定义数据字段映射 |
| `value` | `Key \| Key[] \| TreeNodeData \| TreeNodeData[]` | — | 受控选中项（selection）；`multiple` 时为数组。`onChangeWithObject` 时为节点对象形态 |
| `defaultValue` | `Key \| Key[] \| TreeNodeData \| TreeNodeData[]` | — | 非受控初始选中项；`onChangeWithObject` 时为节点对象形态 |
| `onChangeWithObject` | `boolean` | `false` | 以对象形态收发选中项：`onChange` 的 value 及受控 `value`/`defaultValue` 均为节点对象（含 label/value/其它字段）。对象标识优先取 `key` 缺省回退 `value` |
| `multiple` | `boolean` | `false` | 是否多选高亮选择 |
| `checkable` | `boolean` | `false` | 是否显示勾选框 |
| `checkedKeys` | `Key[]` | — | 受控勾选项 |
| `defaultCheckedKeys` | `Key[]` | `[]` | 非受控初始勾选项 |
| `checkRelation` | `'related' \| 'unRelated'` | `'related'` | 父子勾选是否联动 |
| `checkStrictly` | `boolean` | `false` | 父子勾选状态解耦（联动时仍各自独立） |
| `disableStrictly` | `boolean` | `false` | 严格禁用：disabled 节点勾选态被锁定，不能通过父/子级联动改变（区别于普通 disabled 仅禁直接点击）。仅 checkable 联动下有意义 |
| `leafOnly` | `boolean` | `false` | 多选勾选时 `onCheck` 回传的 checked/halfChecked 只含叶子节点 key（滤掉父/半选节点） |
| `expandedKeys` | `Key[]` | — | 受控展开项 |
| `defaultExpandedKeys` | `Key[]` | `[]` | 非受控初始展开项 |
| `defaultExpandAll` | `boolean` | `false` | 首屏展开全部 |
| `expandedDepth` | `number` | — | 默认展开到第 N 层 |
| `accordion` | `boolean` | `false` | 手风琴模式，同层只展开一个 |
| `selectable` | `boolean` | `true` | 节点是否可选择 |
| `draggable` | `boolean` | `false` | 是否可拖拽 |
| `showLine` | `boolean` | `false` | 显示层级连接线 |
| `showIcon` | `boolean` | `true` | 显示节点图标 |
| `filterTreeNode` | `boolean \| ((input, node) => boolean)` | `false` | 是否开启/自定义搜索过滤 |
| `treeNodeFilterProp` | `string` | `'label'` | 内置搜索匹配节点的哪个字段（仅内置谓词生效） |
| `searchStyle` | `string` | — | 搜索框内联样式（透传到 input style） |
| `searchClassName` | `string` | — | 搜索框附加 class（追加到 input） |
| `showClear` | `boolean` | `true` | 搜索框有内容时显示清除按钮 |
| `showFilteredOnly` | `boolean` | `false` | 搜索状态下只渲染命中节点及其祖先链，隐藏其它未命中节点（默认展示全树、命中高亮、祖先自动展开） |
| `searchValue` | `string` | — | 受控搜索关键词 |
| `expandAction` | `false \| 'click' \| 'doubleClick'` | `false` | 展开触发方式：false 仅点箭头；'click' 点整行；'doubleClick' 双击整行 |
| `autoMergeValue` | `boolean` | `true` | 多选受控 value 自动合并父子：父完全选中时 `onCheck` 只保留父不含子孙。仅 multiple+checkable 联动且 leafOnly=false 有意义 |
| `labelEllipsis` | `boolean` | `false`（virtualized 时 `true`） | label 超长单行省略 |
| `preventScroll` | `boolean` | `false` | 组件内 `focus()` 时是否阻止浏览器滚动文档 |
| `onDoubleClick` | `(e: MouseEvent, node: TreeNodeData) => void` | — | 节点双击回调 |
| `autoExpandWhenDragEnter` | `boolean` | `true` | 拖到节点内部时是否延时自动展开（仅 draggable） |
| `hideDraggingNode` | `boolean` | `false` | 是否隐藏拖拽 dragImg（设透明 drag image，仅 draggable） |
| `renderDraggingNode` | `(nodeInstance: HTMLElement, node: TreeNodeData) => HTMLElement` | — | 自定义拖拽 dragImg 元素，优先级高于 hideDraggingNode（仅 draggable） |
| `loadData` | `(node) => Promise<void>` | — | 异步加载子节点 |
| `virtualized` | `boolean \| { itemSize?: number; height?: number }` | `false` | 虚拟滚动配置 |
| `disabled` | `boolean` | `false` | 整树禁用 |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | 行高尺寸 |
| `status` | `'default' \| 'warning' \| 'error'` | `'default'` | 容器校验态（嵌入表单用） |
| `emptyContent` | `Snippet \| string` | — | 空态内容 |
| `blockNode` | `boolean` | `false` | 节点占满整行（点击行任意处选中） |
| `autoExpandParent` | `boolean` | `true` | 受控展开时自动展开父节点 |

### Events

| 名称 | payload | 说明 |
|---|---|---|
| `change` | `{ value: Key \| Key[]; node: TreeNodeData; selected: boolean }` | selection 变化（受控核心事件，配合 `value`） |
| `check` | `{ checked: Key[]; node: TreeNodeData; checkedNodes: TreeNodeData[]; halfChecked: Key[] }` | 勾选变化 |
| `expandedChange` | `{ expanded: Key[]; node: TreeNodeData; expand: boolean }` | 展开/折叠变化（对齐 open+openChange 约定的展开语义） |
| `searchChange` | `{ value: string; filteredKeys: Key[] }` | 搜索关键词或过滤结果变化 |
| `load` | `{ node: TreeNodeData; loadedKeys: Key[] }` | 异步加载完成 |
| `dragStart` | `{ node: TreeNodeData; event: DragEvent }` | 开始拖拽 |
| `dragEnter` | `{ node: TreeNodeData; dropPosition: 'before'\|'after'\|'inside' }` | 拖入候选节点 |
| `drop` | `{ dragNode; dropNode; dropPosition; dropToGap: boolean }` | 放置完成（业务据此重排 `treeData`） |
| `rightClick` | `{ node: TreeNodeData; event: MouseEvent }` | 节点右键（用于上下文菜单） |
| `nodeFocus` | `{ node: TreeNodeData }` | roving focus 移动到节点 |

### Slots

| 名称 | 作用域参数 | 说明 |
|---|---|---|
| `label` | `{ node, level, searchValue, selected, checked }` | 自定义节点标签渲染（搜索高亮可在此处理） |
| `icon` | `{ node, expanded, isLeaf }` | 自定义节点图标 |
| `switcher` | `{ node, expanded, loading }` | 自定义展开箭头 |
| `suffix` | `{ node }` | 节点尾部操作区（如悬浮按钮） |
| `empty` | — | 自定义空态（优先级低于 `emptyContent` prop） |
| `dragGhost` | `{ node }` | 自定义拖拽幽灵节点 |

### Methods（组件实例命令式方法）

| 名称 | 签名 | 说明 |
|---|---|---|
| `focus` | `() => void` | 命令式聚焦树容器；尊重 `preventScroll`（为 true 时聚焦不滚动文档） |

## 5. 主题 / Token 表

组件仅消费 Alias / Component Token，禁止写死值。

| Component Token | 默认（引用 Alias） | 用途 |
|---|---|---|
| `--cd-tree-node-height` | `32px` | default 行高 |
| `--cd-tree-node-height-small` | `28px` | small 行高 |
| `--cd-tree-node-height-large` | `36px` | large 行高 |
| `--cd-tree-indent` | `24px` | 每层缩进 |
| `--cd-tree-node-color` | `var(--cd-color-text-0)` | 节点文本色 |
| `--cd-tree-node-color-disabled` | `var(--cd-color-text-2)` | 禁用文本色 |
| `--cd-tree-node-bg-hover` | `var(--cd-color-fill-0)` | 悬浮背景 |
| `--cd-tree-node-bg-selected` | `var(--cd-color-primary-light-default)` | 选中背景 |
| `--cd-tree-node-color-selected` | `var(--cd-color-primary)` | 选中文本色 |
| `--cd-tree-switcher-color` | `var(--cd-color-text-2)` | 展开箭头色 |
| `--cd-tree-line-color` | `var(--cd-color-border)` | 连接线颜色 |
| `--cd-tree-search-highlight-bg` | `var(--cd-color-warning-light-default)` | 搜索命中高亮背景 |
| `--cd-tree-drop-indicator-color` | `var(--cd-color-primary)` | 拖拽 drop 指示线 |
| `--cd-tree-dragover-bg` | `var(--cd-color-primary-light-default)` | 拖入内部高亮背景 |
| `--cd-tree-border-color` | `var(--cd-color-border)` | 容器边框（status=default） |
| `--cd-tree-border-color-warning` | `var(--cd-color-warning)` | status=warning 边框 |
| `--cd-tree-border-color-error` | `var(--cd-color-danger)` | status=error 边框 |
| `--cd-tree-focus-ring` | `var(--cd-color-primary)` | roving focus 焦点环 |

暗色主题通过 Alias 层切换自动继承，组件层无需额外定义。

## 6. 无障碍（WCAG 2.1 AA）

遵循 WAI-ARIA APG **Tree View** 模式。

- **角色结构**：根容器 `role="tree"`；含子节点的分组用 `role="group"`；节点 `role="treeitem"`。`multiple` 或 `checkable` 时 `aria-multiselectable="true"`。
- **节点 aria**：
  - `aria-expanded`：有子节点的 treeitem 上反映展开态（叶子节点不设）。
  - `aria-selected`：selection 高亮态（selectable 场景）。
  - `aria-checked`：`checkable` 时反映 true / false / `mixed`（半选 indeterminate）。
  - `aria-level`（从 1 起）、`aria-setsize`、`aria-posinset`：层级与同级定位。
  - `aria-disabled`：禁用节点。
  - `aria-busy`：异步 loadData 进行中的节点。
- **焦点管理**：单一 tab stop（`useRovingTabindex`）。树容器 `tabindex="0"`，使用 `aria-activedescendant` 指向当前 treeitem 的 id（虚拟化下避免逐项 DOM tabindex）。
- **键盘交互**：
  - `↑/↓`：在可见节点间移动焦点。
  - `←`：折叠展开节点 / 已折叠则移到父节点。
  - `→`：展开折叠节点 / 已展开则移到首个子节点。
  - `Home/End`：首/末可见节点。
  - `Enter`：触发 selection（change）。
  - `Space`：`checkable` 时切换勾选；否则等同选择。
  - `*`（asterisk）：展开当前层级全部同级节点（APG 推荐）。
  - 输入字符：typeahead 跳到匹配 label 前缀的节点。
- **拖拽 a11y**：拖拽为增强能力，须提供键盘替代（`suffix` 中的"上移/下移/缩进"操作或上下文菜单）；拖拽过程经 `useLiveAnnouncer` 播报"已移动 X 到 Y 之前/内部"。
- **对比度**：选中/半选/搜索高亮文本与背景对比度 ≥ 4.5:1；焦点环 ≥ 3:1 且不依赖颜色单独表意（箭头形状 + aria）。
- **reduced-motion**：`prefers-reduced-motion: reduce` 时禁用展开折叠高度过渡与箭头旋转动画，瞬时切换。
- **RTL**：`dir="rtl"` 下缩进改为右侧 padding，`←/→` 键语义镜像，箭头方向翻转。

## 7. 国际化

- 用户可见文案零硬编码，全部走 i18n。日期类节点 label 由业务侧用 `Intl.DateTimeFormat` 预格式化（组件不内置）；计数（如"已选 N 项"）用 `Intl.NumberFormat` 与 ICU 复数。
- i18n keys：

| key | 默认（zh-CN） | 用途 |
|---|---|---|
| `Tree.emptyText` | 暂无数据 | 空态默认文案 |
| `Tree.searchPlaceholder` | 搜索 | 搜索框占位 |
| `Tree.loading` | 加载中… | 异步节点加载 |
| `Tree.loadMore` | 加载更多 | 异步触发提示 |
| `Tree.selectedCount` | 已选 {count, plural, other {# 项}} | 选中计数（ICU 复数） |
| `Tree.checkAll` | 全选 | 全选操作 |
| `Tree.expandAll` | 展开全部 | 展开操作 |
| `Tree.collapseAll` | 收起全部 | 折叠操作 |
| `Tree.a11yExpanded` | 已展开 {label} | 展开播报 |
| `Tree.a11yCollapsed` | 已收起 {label} | 折叠播报 |
| `Tree.a11yChecked` | 已勾选 {label} | 勾选播报 |
| `Tree.a11yMoved` | 已将 {drag} 移动到 {drop} {position} | 拖拽完成播报 |
| `Tree.a11yPositionBefore` | 之前 | 拖拽位置 |
| `Tree.a11yPositionAfter` | 之后 | 拖拽位置 |
| `Tree.a11yPositionInside` | 内部 | 拖拽位置 |

## 8. 文案

遵循 content-guidelines：

- 节点 label 由业务提供；空态/加载等系统文案简洁中性，句末不加句号（如"暂无数据"）。
- 搜索无结果复用空态文案"暂无匹配结果"（key `Tree.emptyText` 可被搜索态覆盖）。
- 计数用"已选 N 项"，避免"个/条"混用，统一 ICU plural。
- 操作动词统一："展开/收起"成对，"全选"而非"勾选全部"。

**危险操作文案（单列）**：
- Tree 自身不含删除等破坏性操作；若业务在 `suffix` 放置删除按钮，须由业务侧二次确认。建议确认文案："删除「{label}」及其全部子节点？此操作不可撤销。"（破坏性按钮用 `--cd-color-danger`，默认聚焦取消项）。

## 9. 性能（Perf Budget）

| 维度 | 预算 / 策略 |
|---|---|
| gzip 体积（svelte 层） | ≤ 9.8 KB |
| gzip 体积（core createTree） | ≤ 6 KB |
| 首屏渲染（1k 节点，virtualized 开） | 仅渲染视口约 20–30 行，初次 paint < 50ms |
| 首屏渲染（5k 节点，virtualized 关） | 不推荐；提示开启虚拟化 |
| 滚动帧率（virtualized） | 60fps，复用行节点，overscan 默认 4 |
| 勾选联动（10k 节点全选） | conduction 算法 O(n)，< 16ms（一帧内） |
| 搜索过滤（10k 节点） | 增量计算 filteredKeys，debounce 200ms，< 30ms |
| 展开动画 | 仅对视口内节点应用 transition；reduced-motion 跳过 |

- **虚拟化**：`virtualized` 必须基于 core 的 flatten 数组（已扁平化的可见节点）做窗口化，固定行高换取 O(1) 定位。
- **惰性渲染**：折叠子树不渲染 DOM；异步 `loadData` 按需拉取。
- **destroyOnClose**：Tree 常驻无浮层；嵌入 TreeSelect 浮层时由 TreeSelect 的 `destroyOnClose` 控制下拉销毁，Tree 自身不持有该 prop。
- 大数据下避免对每个 treeitem 设置独立 DOM `tabindex`，统一用 `aria-activedescendant`（见 a11y）。

## 10. AI 元数据

提供 `component.meta.ts`，内容包含：
- `name: 'Tree'`、`category: 'show'`、`stage: 'M4'`、`semiEquivalent: 'Tree'`。
- `tags: ['tree','hierarchy','checkbox','draggable','virtualized','apg-tree']`。
- `aiHints`：何时用 Tree vs TreeSelect（需收纳到表单/下拉用 TreeSelect）vs Cascader（强单链路径选择用 Cascader）vs Menu（导航用 Menu）。
- `propsSchema`：从 Props 表生成的 JSON Schema，标注受控/非受控配对（value↔defaultValue、checkedKeys↔defaultCheckedKeys、expandedKeys↔defaultExpandedKeys）。
- `events`、`slots`、`tokens`（Component Token 列表）、`i18nKeys`。
- `a11yPattern: 'WAI-ARIA Tree View'`、`keyboardMap`（方向键/Space/Enter/*/typeahead）。
- `examples`：基础、勾选联动、搜索、虚拟化 1k、可拖拽、异步加载、嵌入 Form 七个最小可运行片段。

## 11. 测试

- **单元（core `createTree`）**：
  - flatten 输出顺序、展开/折叠后可见节点正确性。
  - conduction 联动：勾选父→全选子、子全选→父 checked、部分→half；`checkStrictly`/`unRelated` 旁路验证。
  - `computeFilteredKeys`：命中节点祖先链展开；无匹配返回空。
  - 拖拽 `computeDropPosition` / `isDropAllowed`（禁止拖入自身子树）。
- **组件（svelte）**：受控 value/checkedKeys/expandedKeys 回流、accordion、loadData 异步态、virtualized 视口渲染数量、blockNode 整行点击。
- **a11y**：axe 无违规；角色/`aria-level`/`aria-setsize`/`aria-posinset` 正确；`aria-checked="mixed"` 半选；focus ring 可见。
- **键盘**：↑↓←→/Home/End/Enter/Space/*/typeahead 全路径；RTL 下左右键镜像。
- **拖拽**：DnD 集成测试覆盖 before/after/inside 三种 drop 与键盘替代路径；播报触发。
- **视觉回归**：尺寸 × 状态（hover/selected/disabled/half/dragOver）× 主题（亮/暗）× showLine 快照。
- **性能基准**：1k/10k 节点首屏与勾选联动耗时纳入 CI 阈值守护。

## 12. 验收标准 checklist

- [ ] core/svelte 分层落地，`createTree` 复用 useRovingTabindex/useId/useLiveAnnouncer，渲染层无业务状态逻辑
- [ ] 受控/非受控配对完整：value+change、checkedKeys+check、expandedKeys+expandedChange，符合全局一致性 API 约定
- [ ] 勾选联动（related/unRelated/checkStrictly）正确，半选 `aria-checked="mixed"`
- [ ] 搜索过滤命中祖先链自动展开，命中高亮使用 Token，无硬编码
- [ ] 拖拽 before/after/inside 正确且禁止拖入自身子树，提供键盘替代并播报
- [ ] 虚拟化基于 flatten 数组、固定行高、滚动 60fps，达成 Perf Budget
- [ ] 异步 loadData 支持，节点 `aria-busy` 与 loading 态正确
- [ ] WAI-ARIA Tree View 角色/aria/键盘全覆盖，axe 无违规，对比度 ≥ AA
- [ ] reduced-motion 跳过动画，RTL 缩进与左右键镜像正确
- [ ] 所有可见文案走 i18n key，计数用 Intl + ICU plural，零硬编码
- [ ] 仅消费 Alias/Component Token，`--cd-tree-*` 全量定义，亮/暗主题继承正确
- [ ] gzip 体积达标（svelte ≤ 9KB / core ≤ 6KB）
- [ ] 提供 component.meta.ts（props/events/slots/tokens/i18nKeys/keyboardMap/examples）
- [ ] 危险操作（业务侧 suffix 删除）二次确认文案与 danger 色规范落地
