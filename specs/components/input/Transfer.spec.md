# SPEC · Transfer
> 分类：input · 阶段：M2
> 对标 Semi：Transfer

## 1. 概述

Transfer（穿梭框）用于在两组数据集合之间移动条目，实现"源 → 已选"的双栏选择交互。典型场景：权限分配、字段配置、人员/标签批量挑选等需要从大量候选中筛选出一个有序子集的表单输入。

核心能力：
- 双栏布局：左侧为候选源列表（source pool），右侧为已选列表（selected pool）。
- 双栏独立搜索过滤：每栏顶部带搜索框，按 `filter(input, item)` 实时过滤；远程场景支持 `onSearch` 异步拉取。
- 条目移动：勾选条目后点击中间方向按钮在两栏间移动；支持双击单条快速移动。
- 全选/反选：每栏头部 checkbox 控制当前（过滤后）可见项的全选/取消。
- 受控值：`value` 为已选项 key 数组，移动即触发 `on:change`。
- 自定义渲染：支持自定义条目、栏头、空状态、拖拽排序（draggable）等高级形态。
- 三种数据规模策略：小数据直渲、大数据虚拟化（`virtualize`）、远程分页。

它是表单级输入控件，遵循受控 `value + on:change` 约定，可被 Form 包裹接管校验态。

## 2. 设计语义

- **结构**：容器 `cd-transfer` 横向排布两个 `cd-transfer__panel`（source / selected），中间为 `cd-transfer__operations`（方向按钮组）。每个 panel = header（标题 + 计数 + 全选）+ search + body（列表）+ footer（可选）。
- **状态语义**：条目有 `unchecked / checked / disabled` 三态；面板有 `empty / loading / filtered-empty` 三态；整体受 `disabled` 与 `status`（default|warning|error）影响。
- **方向按钮**：`→` 将左栏勾选项移入右栏，`←` 反向；无勾选项时按钮 disabled。语义上"移动"而非"复制"，源与已选互斥。
- **尺寸**：small|default|large 影响条目行高、搜索框高度与字号，映射到 `--cd-transfer-item-height-*`。
- **校验态**：error/warning 时容器边框变色（`--cd-color-danger` / warning token），与 Form 错误信息联动。
- **对比与留白**：两栏视觉对称，header 用 `--cd-color-text-1` 次级文本表达计数；选中条目背景 `--cd-color-fill-0`。
- **动效**：条目移动可选淡入淡出（150ms），尊重 `prefers-reduced-motion` 时禁用。

## 3. 分层实现

属于复杂交互复合控件，需 headless + 渲染分层。

**@chenzy-design/core — `createTransfer`**
- 维护内部状态机：`sourceKeys`、`selectedKeys`（受控/非受控）、两栏各自的 `checkedKeys` 与 `searchValue`。
- 派生计算：`filteredSource`、`filteredSelected`、`canMoveRight`、`canMoveLeft`、每栏全选 checkbox 的 indeterminate/checked 状态。
- 行为方法：`moveToSelected()`、`moveToSource()`、`toggleItem(key)`、`toggleAll(panel)`、`setSearch(panel, value)`、`onSearch` 防抖（默认 300ms）。
- 复用 core 原语：
  - `useId` — 生成 panel/list/search 的关联 id（aria-controls/labelledby）。
  - `useRovingTabindex` — 每栏列表内的方向键导航（单一 Tab stop，↑↓ 移动 roving focus）。
  - `useLiveAnnouncer` — 移动操作后播报"已移动 N 项到已选/候选"。
  - `useScrollLock` — 仅在虚拟化滚动容器内部，不锁全局。
- 不依赖 DOM，返回 store/action，供 Svelte 与未来其他框架复用。

**@chenzy-design/svelte — `Transfer.svelte`**
- 消费 `createTransfer` store，渲染两 panel、operations、search、虚拟列表。
- 集成 `Checkbox`、`Input`（search）、`Button`（方向键）、`Empty`、`Spin` 等内部组件。
- `virtualize` 开启时挂载虚拟滚动（仅渲染可视行），`destroyOnClose` 不适用（非浮层），但 body 列表惰性测量。
- 转发 `on:change` / `on:search` / `on:select` 等事件。

## 4. API

### Props

| 名称 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| value | `(string \| number)[]` | `[]` | 受控：已选项的 key 数组 |
| defaultValue | `(string \| number)[]` | `[]` | 非受控初始已选 key |
| dataSource | `TransferItem[]` | `[]` | 全量数据源，`TransferItem = { key; label; disabled?; ...rest }` |
| type | `'list' \| 'groupList' \| 'treeList'` | `'list'` | 数据形态：平铺 / 分组 / 树 |
| treeProps | `{ filterTreeNode?; defaultExpandedKeys?; expandAll? }` | - | `type='treeList'` 时透传给内部树：`filterTreeNode` 自定义搜索匹配、`defaultExpandedKeys` 初始展开、`expandAll` 默认全展开 |
| filter | `boolean \| ((input, item) => boolean)` | `true` | 是否启用搜索及自定义过滤逻辑 |
| onSearch | `(input: string, panel: 'source'\|'selected') => void` | - | 远程搜索回调（启用即视为受控搜索） |
| searchPlaceholder | `string` | i18n | 搜索框占位（可见文案，走 i18n 默认） |
| size | `'small' \| 'default' \| 'large'` | `'default'` | 尺寸 |
| status | `'default' \| 'warning' \| 'error'` | `'default'` | 校验态 |
| disabled | `boolean` | `false` | 整体禁用 |
| draggable | `boolean` | `false` | 已选栏是否可拖拽排序 |
| virtualize | `false \| { itemSize: number; height: number }` | `false` | 虚拟化配置（大数据） |
| oneWay | `boolean` | `false` | 单向模式：已选栏仅展示与移除 |
| showPanelTitle | `boolean` | `true` | 是否显示栏头标题与计数 |
| emptyContent | `{ left?: Snippet; right?: Snippet; search?: Snippet }` | - | 空态自定义 |
| loading | `boolean` | `false` | 加载态（远程） |
| className / style | `string` | - | 容器透传 |

### Events

| 事件 | payload | 说明 |
|---|---|---|
| on:change | `{ value: Key[]; items: TransferItem[] }` | 已选集合变化（移动/拖拽/移除） |
| on:search | `{ input: string; panel: 'source'\|'selected' }` | 搜索框输入变化（防抖后） |
| on:select | `{ panel: 'source'\|'selected'; checkedKeys: Key[] }` | 某栏勾选项变化 |
| on:moveToSelected | `{ keys: Key[] }` | 条目移入已选栏 |
| on:moveToSource | `{ keys: Key[] }` | 条目移回候选栏 |
| on:dragEnd | `{ value: Key[] }` | 已选栏拖拽排序完成（draggable 时） |

### Methods

组件实例方法（Svelte 5 `export function`，经 `bind:this` 获取实例后调用）。

| 名称 | 说明 |
|---|---|
| `search(value)` | 命令式搜索：把 `value` 置给左侧搜索框并触发过滤（对齐 Semi）。 |

### Slots

| Slot / Snippet | 作用域参数 | 说明 |
|---|---|---|
| renderSourceItem | `{ item, checked, onChange, disabled }` | 自定义候选条目渲染 |
| renderSelectedItem | `{ item, checked, onRemove, sortableHandle }` | 自定义已选条目渲染 |
| sourceHeader | `{ total, checkedCount, allChecked, indeterminate, onToggleAll }` | 自定义左栏头 |
| selectedHeader | `{ total, onClear }` | 自定义右栏头 |
| sourceEmpty / selectedEmpty | - | 各栏空态 |
| operations | `{ canMoveRight, canMoveLeft, moveRight, moveLeft }` | 自定义中间操作区 |

## 5. 主题 / Token 表

组件仅消费 Alias 与 Component 级 token，禁止写死。

| Component Token | 取值（引用 Alias） | 用途 |
|---|---|---|
| --cd-transfer-bg | var(--cd-color-bg-0) | 面板背景 |
| --cd-transfer-border | var(--cd-color-border) | 面板边框 |
| --cd-transfer-border-error | var(--cd-color-danger) | error 态边框 |
| --cd-transfer-border-warning | var(--cd-color-warning) | warning 态边框 |
| --cd-transfer-header-text | var(--cd-color-text-1) | 栏头标题/计数文本 |
| --cd-transfer-item-text | var(--cd-color-text-0) | 条目主文本 |
| --cd-transfer-item-bg-hover | var(--cd-color-fill-0) | 条目 hover 背景 |
| --cd-transfer-item-bg-checked | var(--cd-color-primary-light-default) | 勾选条目背景 |
| --cd-transfer-item-disabled-text | var(--cd-color-text-2) | 禁用条目文本 |
| --cd-transfer-op-bg | var(--cd-color-bg-1) | 方向按钮区背景 |
| --cd-transfer-item-height-small | var(--cd-spacing-7 / 28px alias) | small 行高 |
| --cd-transfer-item-height-default | var(--cd-spacing-8 / 32px alias) | default 行高 |
| --cd-transfer-item-height-large | var(--cd-spacing-9 / 40px alias) | large 行高 |
| --cd-transfer-radius | var(--cd-radius-medium) | 面板圆角 |
| --cd-transfer-gap | var(--cd-spacing-3) | 两栏与操作区间距 |

暗色模式由 Alias 层切换自动继承；对比度见第 6 节。

## 6. 无障碍

遵循 WAI-ARIA APG 的 listbox/dual-listbox 模式 + WCAG 2.1 AA。

**角色与结构**
- 每栏列表容器 `role="listbox"`，`aria-multiselectable="true"`，`aria-labelledby` 指向栏头标题 id。
- 条目 `role="option"`，`aria-selected` 反映勾选态，`aria-disabled` 反映禁用。
- 全选 checkbox 用原生 `<input type=checkbox>`，`aria-controls` 指向对应 listbox id；半选用 `indeterminate` 属性。
- 方向按钮为原生 `<button>`，`aria-label="移动到已选" / "移回候选"`（i18n），无勾选项时 `disabled`。
- 搜索框 `role="searchbox"`（或 `<input type=search>`），`aria-label` 走 i18n，`aria-controls` 指向其 listbox。

**键盘交互**
- Tab：在 [左搜索 → 左列表 → 操作区 → 右搜索 → 右列表] 之间移动（每个列表为单一 Tab stop）。
- 列表内 ↑/↓：roving focus 移动当前 option；Home/End 跳首尾。
- Space：切换当前 option 勾选；Shift+↑/↓：范围多选。
- Enter（列表聚焦时）：将当前栏勾选项移到对侧（等同方向按钮）。
- 操作区 Enter/Space：触发移动。

**焦点管理**
- 移动条目后，焦点保留在源列表（落到移动后该位置的相邻 option），避免焦点丢失到 body。
- 搜索过滤后若当前 focus option 被过滤掉，focus 落到列表首项。

**播报**：`useLiveAnnouncer` 在移动后以 `aria-live="polite"` 播报"已移动 {count} 项"。

**对比度 / 动效 / RTL**
- 文本与计数文本均满足 4.5:1（text-1 在 bg-0 上需校验）；勾选背景上的文本满足 AA。
- `prefers-reduced-motion: reduce` 时禁用移动淡入淡出。
- RTL：两栏左右镜像，方向按钮箭头与移动语义随 `dir` 翻转（→ 在 RTL 指向左栏）。

## 7. 国际化

用户可见文案零硬编码，全部走 i18n key；数字（计数）用 `Intl.NumberFormat` 本地化。

| i18n key | 默认（zh-CN） | 说明 |
|---|---|---|
| Transfer.searchPlaceholder | 搜索 | 搜索框占位 |
| Transfer.sourceTitle | 候选项 | 左栏标题 |
| Transfer.selectedTitle | 已选项 | 右栏标题 |
| Transfer.itemUnit | 项 | 计数单位 |
| Transfer.countSelected | {selected}/{total} 项 | 栏头计数（用 Intl 格式化数字） |
| Transfer.selectAll | 全选 | 全选 checkbox 辅助标签 |
| Transfer.clear | 清空 | 已选栏清空操作 |
| Transfer.moveToSelected | 移动到已选 | 右向按钮 aria-label |
| Transfer.moveToSource | 移回候选 | 左向按钮 aria-label |
| Transfer.empty | 暂无数据 | 空态 |
| Transfer.searchEmpty | 无匹配结果 | 过滤空态 |
| Transfer.movedAnnounce | 已移动 {count} 项 | live 播报 |
| Transfer.loading | 加载中 | 远程加载态 |

计数与百分比一律 `Intl.NumberFormat(locale)`；无日期场景。

## 8. 文案

遵循 content-guidelines：

- 标题用名词短语（"候选项"/"已选项"），计数紧凑（`3/120 项`），避免冗长。
- 搜索占位简洁单词"搜索"，不写"请输入关键词进行搜索"。
- 空态分两种语义：无数据（`暂无数据`）vs 搜过滤无果（`无匹配结果`），不可混用。
- 按钮 aria-label 用动宾短语（"移动到已选"），保持双栏对称措辞。

**危险操作文案（单列）**
- "清空"已选栏：若移除项数 > 阈值或处于不可逆表单上下文，触发二次确认 —
  - 标题：`确认清空已选项？`
  - 正文：`将移除全部 {count} 项已选内容，操作不可撤销。`
  - 确认按钮：`清空`（danger 样式），取消按钮：`取消`。
- 单项移除不弹确认（可逆，再移回即可）。

## 9. 性能（Perf Budget）

| 维度 | 预算 / 策略 |
|---|---|
| gzip 体积（svelte 实现） | ≤ 9.4 KB（不含 Checkbox/Input/Button 共享依赖） |
| gzip 体积（core headless） | ≤ 3 KB |
| 首屏渲染（500 项，非虚拟化） | ≤ 16ms（1 帧）；超 200 项建议开 `virtualize` |
| 大数据（≥ 1k 项） | 必须 `virtualize`，仅渲染可视行（约 height/itemSize 行 + overscan 5） |
| 搜索过滤 | 本地过滤防抖 0（即时），`onSearch` 远程防抖 300ms |
| 全选大列表 | 操作 checkedKeys 用 Set，O(n) 一次，避免逐项 reactive 触发 |
| 移动操作 | 批量 splice + 单次 store 更新，避免 N 次渲染 |
| 内存 | 虚拟化下 DOM 节点恒定，不随 dataSource 线性增长 |

- `destroyOnClose`：不适用（非浮层组件）。
- 惰性渲染：折叠/未展开的 groupList 分组惰性渲染其子项。
- reduced-motion 下跳过过渡，减少 layout/paint。

## 10. AI 元数据

提供 `component.meta.ts`，内容包含：
- `name: 'Transfer'`、`category: 'input'`、`stage: 'M2'`、`semiEquivalent: 'Transfer'`。
- `props` schema（类型、默认、枚举、是否受控）供 AI 生成与校验。
- `events` / `slots` 描述与作用域参数签名。
- `a11yPattern: 'dual-listbox'`、`keyboard` 摘要、`i18nKeys` 列表。
- `tokens`：消费的 Component/Alias token 列表。
- `recipes`：常见用法片段（基础、远程搜索、虚拟化、单向、可拖拽排序）。
- `antiPatterns`：如"直接改 dataSource 而不通过 value 受控"、"超 200 项未虚拟化"。

确认随包导出 `component.meta.ts`，供文档站与 AI 工具消费。

## 11. 测试

- **单元（core `createTransfer`）**：moveToSelected/moveToSource 后 value 正确；全选/半选状态计算；过滤函数（布尔与自定义）；onSearch 防抖；oneWay 模式不可移回；disabled 项不被全选移动。
- **组件（svelte）**：受控 value 渲染分栏正确；on:change payload；空态/过滤空态切换；loading 态；status 边框；size 行高映射。
- **a11y（jest-axe + 手动）**：listbox/option role 与 aria-selected；全选 indeterminate；键盘 Tab 序列、↑↓ roving、Space/Enter、Home/End、Shift 范围多选；移动后焦点保留；live 播报。
- **虚拟化**：1k 项仅渲染可视行；滚动后节点回收；focus 行滚出仍可键盘恢复。
- **拖拽**：draggable 排序后 on:dragEnd value 顺序正确；键盘可达的排序回退。
- **i18n**：切 locale 后所有可见文案与计数数字格式更新；RTL 镜像与箭头翻转。
- **视觉回归**：三尺寸 × 三 status × 明暗主题快照。

## 12. 验收标准 checklist

- [ ] 受控 `value + on:change` 闭环；非受控 `defaultValue` 生效。
- [ ] 双栏独立搜索：本地 `filter` 与远程 `onSearch`（防抖 300ms）均工作。
- [ ] 方向按钮、双击移动、全选/半选/反选行为正确，disabled 项不被移动。
- [ ] headless 逻辑在 `@chenzy-design/core` 的 `createTransfer`，渲染在 `@chenzy-design/svelte`，复用 useId/useRovingTabindex/useLiveAnnouncer。
- [ ] a11y：dual-listbox role/aria 完整，键盘全交互可达，移动后焦点不丢失，jest-axe 0 violation。
- [ ] 所有可见文案走 i18n key（零硬编码），计数用 Intl，支持 RTL 镜像。
- [ ] 危险操作"清空"二次确认文案到位，确认按钮 danger 样式。
- [ ] 仅消费 `--cd-` Alias/Component token，无写死值；三 status 边框正确；明暗主题继承。
- [ ] Perf Budget 达标：svelte ≤ 9.4KB / core ≤ 3KB gzip；≥1k 项虚拟化仅渲染可视行。
- [ ] `prefers-reduced-motion` 下禁用过渡。
- [ ] 提供 `component.meta.ts`（props/events/slots/a11y/i18n/tokens/recipes）。
- [ ] 类名遵循 `cd-transfer` BEM-like 约定；尺寸/校验态 API 与库内一致。
