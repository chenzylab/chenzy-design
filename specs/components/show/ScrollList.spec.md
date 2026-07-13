# SPEC · ScrollList

> 分类：show · 阶段：M4
> 对标 Semi：ScrollList / ScrollItem（严格对齐，破坏性重写）

## 1. 概述

ScrollList 提供类似 iOS 的滚动选择模式，支持滚动至指定窗口位置选择与点击选择。它由**容器 `ScrollList`**（负责 header / footer / body 布局）与若干**列 `ScrollItem`** 组合而成，多列并排时由使用方手动放置多个 `ScrollItem` 并各自受控（对齐 Semi `<ScrollList>` + `<ScrollItem>` 用法）。

`ScrollItem` 有两种模式：
- **`wheel`**：滚轮模式。滚动或点击将候选项吸附到中央选区（selector）居中，`cycled` 时首尾相接无限循环。
- **`normal`**：普通列表模式。点击项即选中并高亮背景，不吸附居中。

典型场景：移动端风格的时间/日期滚轮选择（多列并排）。DatePicker 的年月快速跳转面板即复用本组件。

## 2. 设计语义（对齐 Semi scrollList.scss DOM 结构）

- **容器** `.cd-scrolllist`（flex column）：可选 `-header`（> `-title` + `-line`）、`-body`（flex，放列）、可选 `-footer`。
- **wheel 列** `.cd-scrolllist-item-wheel`：`-shade-pre` + `-selector`（中线选区，上下 1px 边框）+ `-shade-post`（上下渐隐遮罩 opacity 0.5）+ `-list-outer`（滚动容器）> ul(role=listbox) > li(role=option)。落定项加 `-item-selected` 类（primary 色 + 粗体）。
- **normal 列** `.cd-scrolllist-item`：> ul(role=listbox) > li(role=option)。选中项加 `-item-sel` 类（primary-light 背景）。
- **居中几何**：wheel 列按 `list-outer` 实测高度（默认 300px，支持 bodyHeight 收窄）算中线；某项居中所需 scrollTop = `index*itemHeight - (wrapperHeight - itemHeight)/2`（含 ul 顶部留白）。itemHeight 默认 36px。
- **禁用项**：滚动落定/点击时跳过 disabled 项，选中最近的非禁用项。

## 3. 分层实现

**@chenzy-design/core**（headless 纯函数，无 DOM/框架依赖）：
`resolveItemText`（选中项 transform 文案变换）、`centerOffset`（居中 scrollTop）、`nearestIndex`（中线最近非禁用项）、`wrapIndex`（cycled 取模）、`easeOut` / `scrollFrame`（缓动帧，等价 Semi semi-animation 弹簧）、`repeatCount`（cycled 补份数）。常量 `SCROLL_LIST_DEFAULT_ITEM_HEIGHT=36` / `SCROLL_LIST_DEFAULT_SCROLL_DURATION=120`。

**@chenzy-design/svelte · `ScrollList.svelte` / `ScrollItem.svelte`**：
DOM 渲染 + scroll/rAF 命令式绑定（+ cleanup）。wheel 滚动落定 debounce（~33ms）后吸附；cycled 渲染重复份、滚动落定后无缝重定位回中段（等价 Semi adjustInfiniteList 的节点搬移）。`prefers-reduced-motion` 或 `motion=false` 时直达无缓动。

## 4. API

### ScrollList（容器）

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| header | `Snippet \| string` | — | 头部 addon |
| footer | `Snippet \| string` | — | 底部 addon |
| bodyHeight | `number \| string` | — | body 高度；数字按 px |
| class | `string` | — | 根节点类名 |
| style | `string` | — | 根节点内联样式 |
| children | `Snippet` | — | 列内容：若干 `<ScrollItem>` |

### ScrollItem（列）

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| mode | `'wheel' \| 'normal'` | `'wheel'` | 模式：wheel 吸附居中 / normal 点击选中 |
| cycled | `boolean` | `false` | 无限循环（仅 wheel 生效） |
| list | `ScrollItemData[]` | `[]` | 列表数据，项 = `{ value; text?; disabled?; transform? }` |
| selectedIndex | `number` | `0` | 选中项索引（受控） |
| motion | `boolean` | `true` | 是否开启滚动缓动动画 |
| transform | `(value, text) => string` | — | 选中项文案变换（列级公共；项级 transform 优先） |
| type | `string \| number` | — | 列标识，透传回 onSelect 供外层区分列 |
| onSelect | `(data: ScrollItemSelectPayload) => void` | — | 选中回调，data 含 `{...item, value, index, type}` |
| class | `string` | — | 列样式类名 |
| style | `string` | — | 列内联样式 |
| ariaLabel | `string` | — | 列无障碍标签 |

`ScrollItemData`：`{ value: unknown; text?: string; disabled?: boolean; transform?: (value, text) => string }`

## 5. 主题 / Token

严格对齐 Semi `semi-foundation/scrollList/variables.scss`（39 变量）+ `animation.scss`（3 变量），全量 kebab 化为 `--cd-*-scroll-list-*`。无 chenzy 中间层短名 token。TimePicker 的 `--cd-height-time-picker-scrolllist-item` 复用 `--cd-height-scroll-list-item`。暗色模式经 Alias 自动切换。

## 6. 无障碍

- 每列 ul：`role="listbox"` + `aria-multiselectable="false"` + `aria-label`（来自 ariaLabel）。
- 每项 li：`role="option"` + `aria-selected`；disabled 项 `aria-disabled`。
- 支持滚动吸附与点击两种选择；`prefers-reduced-motion` 下禁用缓动，直接定位。

## 7. 测试

- **单元（core）**：resolveItemText（transform 优先级）、centerOffset、nearestIndex（跳过禁用）、wrapIndex、easeOut/scrollFrame、repeatCount。
- **交互（真机）**：wheel 点击吸附居中、滚动落定跳过禁用、cycled 无缝循环、normal 点击选中、DatePicker 年月面板联动。
- **meta**：subComponents 数组含 ScrollItem props，与实现一致。

## 8. 验收 Checklist

- [x] ScrollList 容器 + ScrollItem 列分层，严格对齐 Semi DOM/class/token/API。
- [x] wheel 滚动吸附、点击选中、cycled 无限循环、disabled 跳过、transform 文案变换均正确。
- [x] normal 模式点击选中并高亮。
- [x] 仅消费 `--cd-` 对齐 Semi 的 Token，无写死、无中间层短名；dark 经 Alias 适配。
- [x] DatePicker 消费方迁移到新 API 并真机验证联动。
- [x] demo 机制对齐 Semi 且场景数不少于 Semi（含 transform / bodyHeight / 多列联动补全）。
- [x] typecheck / test / lint / build 全绿；提供 component meta 且 props schema 与实现一致。
