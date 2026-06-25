# SPEC · ScrollList
> 分类：show · 阶段：M4
> 对标 Semi：ScrollList

## 1. 概述

ScrollList 是一个 picker 风格的滚动选择列表组件，模拟移动端「滚轮选择器」的交互范式：选项垂直排列，通过滚动 / 拖拽 / 键盘将候选项对齐到中央的高亮选区（selection mask）即完成选择。支持单列与多列联动（例如时间选择 时:分:秒、地区三级联动），是构建 DatePicker 移动端形态、TimePicker、Cascader 滚轮形态的底层原语。

适用场景：
- 时间 / 日期的滚轮选择（多列并排）。
- 有限枚举值的紧凑选择（如音量、字号、温度档位）。
- 表单中需要节省纵向空间、强调「当前选中态居中」的选择交互。

不适用场景：候选项数量极大且无序（应使用 Select + 虚拟列表）；需要多选（ScrollList 仅单列单选，多选请用 CheckboxGroup / TreeSelect）。

核心特征：每列独立受控、snap 对齐（滚动停止后吸附到最近项）、惯性滚动（momentum）、中央选区遮罩、上下渐隐（fade mask）。它是纯客户端交互组件，不负责弹层；移动端的「底部弹出选择」由外层用 Popup/Sheet 包裹本组件实现。

## 2. 设计语义

- **结构**：外层视窗（viewport，固定高度 = `itemHeight × 可见行数`，可见行数为奇数以保证居中），内部为可滚动的 `cd-scrolllist__column`，每列由若干 `cd-scrolllist__item` 组成。视窗中央覆盖一层 `cd-scrolllist__mask`（选区高亮 + 上下边界线），视窗顶部/底部叠加 `cd-scrolllist__gradient`（渐隐遮罩，引导视觉焦点到中心）。
- **对齐语义**：滚动以 `itemHeight` 为步长 snap；当前对齐到中线的 item 即 `value`。第一项和最后一项需各自补 `(rows-1)/2` 个空白占位（spacer），使首尾项也能滚动到中心。
- **尺寸**：small(itemHeight 28px) | default(36px) | large(44px)。视窗高度 = `itemHeight × rows`，rows 默认 5。
- **状态语义**：item 有 normal / selected（居中高亮）/ adjacent（相邻，半透明渐变）/ disabled（不可吸附，跳过）四态。整体支持 disabled（禁止滚动）。
- **运动语义**：拖拽跟手 → 释放后惯性衰减 → snap 吸附（spring/ease-out 缓动 ~240ms）。`reduced-motion` 下取消惯性与缓动，直接定位到目标项。
- **多列联动**：多列时各列共享同一视窗高度与中线，列间以 `cd-scrolllist__divider` 分隔；联动数据变更时下游列重置/校正到合法值。
- **视觉对标 Semi**：中央选区为浅色填充 + 上下 1px 分割线（`--cd-color-border`），选中文字用 `--cd-color-text-0` 高对比，非选中渐弱至 `--cd-color-text-2`。

## 3. 分层实现

属于强交互 + 键盘 + a11y 组件，采用 core / svelte 分层。

**@chenzy-design/core · `createScrollList(config)`（headless）**
- 职责：滚动位置 ↔ 选中索引的数学映射（`offset → index = round(-offset / itemHeight)`，含 spacer 偏移）、惯性物理（velocity 采样 + 摩擦衰减）、snap 目标计算、disabled 项跳过、边界 clamp、多列联动协调、键盘导航状态机。
- 输出：每列的 `getViewportProps()` / `getColumnProps()` / `getItemProps(index)`（含 role/aria/tabindex/data-state）、`scrollToIndex(i, animated)`、`setValue`、订阅 `onChange`。
- 复用原语：
  - `useId`：生成 listbox / option id 用于 `aria-activedescendant`。
  - `useRovingTabindex`：列容器作为单一 tab stop，内部用 activedescendant 模式（列本身 `tabindex=0`）。
  - `useLiveAnnouncer`：snap 完成后播报「已选中 {label}」。
  - `useReducedMotion`（core 工具）：决定是否禁用惯性/缓动。
  - 不使用 useFocusTrap / useScrollLock（非弹层；弹层语义由外层容器负责，本组件需 `touch-action: pan-y` 与阻止滚动穿透由 svelte 层处理）。

**@chenzy-design/svelte · `ScrollList.svelte` / `ScrollListColumn.svelte`**
- 职责：DOM 渲染、绑定 pointer/touch/wheel/keydown 事件到 core、应用 transform translateY、渲染 mask/gradient/spacer、`prefers-reduced-motion` 媒体查询、RTL 适配（多列顺序反转）。
- 通过 `transform: translate3d` 做 GPU 合成，requestAnimationFrame 驱动惯性帧；不在每帧触发 Svelte 响应式，offset 用直接 DOM 写入，仅 snap 落定时 commit value。

## 4. API

### Props

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| value | `string \| number \| (string\|number)[]` | — | 当前选中值（受控）；多列时为数组，与 columns 顺序对应 |
| defaultValue | `same as value` | — | 非受控初始值 |
| data | `Item[] \| Item[][]` | `[]` | 单列传 `Item[]`，多列传 `Item[][]`；`Item = { value; label; disabled? }` |
| size | `'small' \| 'default' \| 'large'` | `'default'` | 尺寸，决定 itemHeight |
| rows | `number` | `5` | 可见行数（奇数），决定视窗高度与首尾 spacer |
| itemHeight | `number` | 由 size 推导 | 单项像素高度，显式传入覆盖 size 默认 |
| cyclic | `boolean` | `false` | 是否循环滚动（首尾相接，无限滚动） |
| disabled | `boolean` | `false` | 禁用整个组件 |
| status | `'default' \| 'warning' \| 'error'` | `'default'` | 校验态（边框/选区描边色） |
| momentum | `boolean` | `true` | 是否启用惯性滚动 |
| renderItem | `(item: Item, selected: boolean) => Snippet` | — | 自定义单项渲染 |
| loadMore | `(direction: 'top'\|'bottom') => void` | — | 滚动至边界时触发（懒加载非循环长列表） |
| columnClassName | `string \| ((colIndex)=>string)` | — | 单列样式钩子 |
| ariaLabel | `string` | — | 无 label 关联时的可访问名称（i18n 调用方传入） |
| class | `string` | — | 根节点类名 |

`Item`: `{ value: string|number; label: string; disabled?: boolean }`

### Events

| 名称 | 回调签名 | 触发时机 |
|------|----------|----------|
| change | `(value, item, colIndex) => void` | snap 落定且选中项变化时（每列独立） |
| pick | `(value) => void` | 用户主动操作导致的选中（区分于程序化 setValue） |
| scrollStart | `(colIndex) => void` | 拖拽/滚动开始 |
| scrollEnd | `(colIndex) => void` | 惯性结束并完成 snap 吸附 |
| reachEnd | `(direction, colIndex) => void` | 滚动到顶/底边界（配合 loadMore） |

### Slots

| 名称 | 作用域参数 | 说明 |
|------|-----------|------|
| default / item | `{ item, selected, colIndex, index }` | 自定义单项内容，等价 renderItem |
| mask | `—` | 自定义中央选区遮罩内容 |
| divider | `{ leftCol, rightCol }` | 多列间分隔渲染（如时间的「:」） |
| empty | `—` | 某列 data 为空时的占位 |

## 5. 主题 / Token 表

组件仅消费 Alias / Component 级 Token，禁止写死。

| Component Token | 回退 (Alias) | 用途 |
|-----------------|--------------|------|
| --cd-scrolllist-item-height | `36px`（default；small 28 / large 44） | 单项高度，驱动视窗与 snap 步长 |
| --cd-scrolllist-color-text | `--cd-color-text-0` | 选中项文字色 |
| --cd-scrolllist-color-text-adjacent | `--cd-color-text-2` | 非选中项文字色 |
| --cd-scrolllist-color-text-disabled | `--cd-color-text-3` | 禁用项文字色 |
| --cd-scrolllist-mask-bg | `--cd-color-bg-1` | 中央选区背景填充 |
| --cd-scrolllist-mask-border | `--cd-color-border` | 选区上下边界线 |
| --cd-scrolllist-divider-color | `--cd-color-border` | 多列分隔线色 |
| --cd-scrolllist-gradient-color | `--cd-color-bg-0` | 上下渐隐遮罩起止色（视窗背景同色渐变到透明） |
| --cd-scrolllist-border-color | `--cd-color-border` | 视窗外边框 |
| --cd-scrolllist-status-warning | `--cd-color-warning` | status=warning 选区描边 |
| --cd-scrolllist-status-error | `--cd-color-danger` | status=error 选区描边 |
| --cd-scrolllist-radius | `--cd-radius-medium` | 视窗圆角 |
| --cd-scrolllist-transition | `--cd-motion-duration-mid` (240ms) | snap 缓动时长 |

暗色模式：通过 Alias 自动切换（`--cd-color-bg-0/1`、`--cd-color-text-*` 由主题切换），组件无需单独定义 dark 变量。

## 6. 无障碍

遵循 WAI-ARIA APG「Listbox」模式（scrollable single-select），每列为一个 listbox。

- **role / aria**：
  - 列容器：`role="listbox"`，`aria-orientation="vertical"`，`tabindex="0"`，`aria-activedescendant` 指向当前居中 option 的 id，`aria-label`（来自 ariaLabel 或关联 label）。
  - 每项：`role="option"`，`aria-selected`（仅居中项为 true），`id` 由 useId 生成，disabled 项加 `aria-disabled="true"`。spacer 占位元素 `aria-hidden="true"`。
  - 多列外层：`role="group"` + `aria-label`（如「时间选择」）。
  - status=error：列容器 `aria-invalid="true"`。
- **键盘交互**（焦点在列上）：
  - `ArrowUp / ArrowDown`：上/下移一项（跳过 disabled），触发 snap + change。
  - `PageUp / PageDown`：移动 (rows-1) 项。
  - `Home / End`：跳到首/末有效项。
  - `Tab / Shift+Tab`：在多列间移动焦点（每列单一 tab stop，roving）。
  - `Enter / Space`：确认当前居中项（用于外层弹层「确定」场景，触发 pick）。
- **焦点管理**：采用 activedescendant 模式，DOM 焦点始终停在列容器，逻辑选中项随滚动更新 aria-activedescendant；不移动真实 focus，避免滚动抖动。
- **屏幕阅读器播报**：snap 完成经 useLiveAnnouncer (`polite`) 播报选中 label，避免拖拽过程中频繁播报（节流，仅落定时）。
- **对比度**：选中文字 vs 选区背景 ≥ 4.5:1；选区边界线 vs 视窗背景 ≥ 3:1（非文本图形）。渐隐遮罩不得使中线相邻项对比度低于 3:1。
- **reduced-motion**：`prefers-reduced-motion: reduce` 时禁用惯性与缓动，键盘/点击直接定位；不触发滚动动画。
- **RTL**：列从右向左排布（多列顺序在 `dir=rtl` 下反转），滚动方向仍为垂直不变；文字对齐随 dir。
- **指针可达性**：点击非居中项可直接将其滚动吸附到中心（点击命中即选中），点击目标高度 = itemHeight（default 36px，满足 ≥24px AA 目标尺寸）。

## 7. 国际化

- 用户可见文案零硬编码，全部走 i18n key：

| i18n key | 用途 |
|----------|------|
| ScrollList.ariaLabel | 列容器默认可访问名称 |
| ScrollList.groupLabel | 多列分组 role=group 的 label |
| ScrollList.announceSelected | 播报模板「已选中 {label}」 |
| ScrollList.empty | 空列占位文案 |
| ScrollList.loadingMore | loadMore 进行中提示 |

- `{label}` 等插值由 i18n 运行时格式化。
- 当 data 内容为日期/数字时，调用方应传入已用 `Intl.DateTimeFormat` / `Intl.NumberFormat`（按 locale）格式化的 `label`；组件内部不做格式化但在 DatePicker 组合场景下由上层用 Intl 生成 data。
- RTL locale（ar/he）下多列顺序与文字方向由 `dir` 驱动（见无障碍 RTL）。

## 8. 文案

- 遵循 content-guidelines：选项 label 简洁、统一格式（如时间补零「08」而非「8」由上层 Intl 决定）。
- 空态文案克制：`ScrollList.empty` 默认「暂无可选项」。
- 播报文案使用完整自然语句：「已选中 {label}」，不使用缩写。
- **危险操作**：ScrollList 本身不含危险/破坏性操作（无删除、无提交）。当用于不可逆配置（如确认后立即生效的设置）时，确认动作的二次确认与危险文案由外层弹层/按钮负责，本组件不内置危险文案。

## 9. 性能（Perf Budget）

| 维度 | 预算 / 目标 | 说明 |
|------|------------|------|
| svelte 组件 gzip | ≤ 5.75 KB | ScrollList + Column |
| core (createScrollList) gzip | ≤ 3 KB | 物理/snap/键盘逻辑，可独立 tree-shake |
| 拖拽跟手延迟 | ≤ 16ms/帧（60fps） | 仅写 transform，绕过 Svelte 响应式 |
| 惯性滚动帧率 | 稳定 60fps | rAF 驱动，translate3d GPU 合成 |
| snap 落定到 change 提交 | ≤ 1 帧 | 仅落定时触发响应式 |
| 单列渲染 DOM 节点 | ≤ rows + 2×spacer + 可视缓冲 | — |

- **虚拟化**：默认全量渲染（picker 候选通常 ≤ 几十项）；当单列 `data.length > 100` 时启用窗口化（仅渲染视窗 ± 缓冲区），结合 `cyclic` 时用取模映射避免无限 DOM。
- **惰性渲染**：配合 `loadMore` 对超长有序列表（如年份）按需补充。
- **destroyOnClose**：本组件不管理弹层；在 Popup/Sheet 中使用时由弹层的 `destroyOnClose` 控制卸载，关闭时应卸载以释放 rAF / 事件监听（组件 onDestroy 必须 cancelAnimationFrame 并解绑 pointer/wheel）。
- 事件监听 wheel 用 `{ passive: false }` 以可 preventDefault 阻止穿透，但跟手用 pointer events 优先。

## 10. AI 元数据

提供 `component.meta.ts`，内容包含：
- `name: 'ScrollList'`、`category: 'show'`、`stage: 'M4'`、`semiEquivalent: 'ScrollList'`。
- `tags: ['picker', 'wheel', 'scroll-select', 'time-picker-base', 'mobile']`。
- `whenToUse` / `whenNotToUse`（见概述）。
- `props` schema（类型、默认、枚举）供 AI 生成正确用法。
- `composes: ['createScrollList']`、`primitives: ['useId','useRovingTabindex','useLiveAnnouncer','useReducedMotion']`。
- `relatedComponents: ['DatePicker','TimePicker','Cascader','Select']`、`commonCompositions: ['Popup>ScrollList','Sheet>ScrollList(多列时间)']`。
- `a11yPattern: 'APG/Listbox(scrollable single-select, activedescendant)'`。
- `examples`：单列、三列时间联动、循环滚动、表单校验态各一段最小代码。

## 11. 测试

- **单元（core）**：offset↔index 映射（含 spacer 偏移、边界 clamp）、disabled 项跳过逻辑、cyclic 取模、惯性衰减目标计算、多列联动校正、setValue 不触发 pick 仅触发 change。
- **交互（svelte + Testing Library / Playwright）**：
  - 拖拽释放后吸附到最近项；快速甩动产生惯性并最终 snap。
  - 点击非居中项滚动并选中；点击 disabled 项不选中。
  - 键盘 ArrowUp/Down/PageUp/PageDown/Home/End/Enter 行为。
  - 多列 Tab 焦点移动与各列独立 change。
- **a11y**：axe 无违规；`role/aria-activedescendant/aria-selected` 随选中更新；reduced-motion 下无动画（断言无 transition 应用）；播报节流（仅落定播报一次）。
- **视觉回归**：三尺寸 × 选区遮罩/渐隐 × dark × RTL（多列顺序反转）截图快照。
- **性能**：拖拽帧不触发组件级 re-render（spy Svelte 更新计数）；onDestroy 释放 rAF / 监听（无泄漏）。
- **i18n**：缺省 locale 与 RTL locale 下文案与方向正确。

## 12. 验收标准 Checklist

- [ ] core `createScrollList` 与 svelte 渲染分层，core 可独立引入并通过单元测试。
- [ ] 滚动 snap 吸附、惯性、点击命中选中、disabled 跳过均符合预期。
- [ ] 支持单列与多列联动；多列各列独立受控并独立 change。
- [ ] 受控 `value` + `change`、`open` 语义交由外层弹层（本组件不含弹层）符合一致性 API 约定。
- [ ] 三尺寸 / status 校验态 / cyclic / 自定义 renderItem 全部可用。
- [ ] 仅消费 `--cd-` Alias/Component Token，无写死颜色/尺寸；dark 模式经 Alias 自动适配。
- [ ] WAI-ARIA Listbox（activedescendant）模式落地，键盘交互全集通过，axe 0 违规。
- [ ] 对比度 AA、reduced-motion、RTL（多列反转）、目标尺寸 ≥24px 均满足。
- [ ] 用户可见文案 100% 走 i18n key，无硬编码；日期/数字由上层 Intl 格式化。
- [ ] 满足 Perf Budget：gzip 体积达标、拖拽/惯性 60fps、拖拽不触发组件级 re-render。
- [ ] onDestroy 正确 cancelAnimationFrame 并解绑事件，无内存泄漏；destroyOnClose 场景验证。
- [ ] 提供 `component.meta.ts`，字段完整且 props schema 与实现一致。
