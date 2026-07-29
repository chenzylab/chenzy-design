# CSS class 命名约定

> 状态：**约定已定，全量统一待独立 PR 执行**（2026-07-28 用户拍板「独立 PR，全量统一」）。

## 约定

**统一使用单连字符**，对齐 Semi：

```
cd-<component>-<element>[-<modifier>]
```

例：`cd-datepicker-day-main`、`cd-tabs-content`、`cd-select-option-list`。

**禁止** BEM 的 `__`（元素）与 `--`（修饰符）。理由：

1. **Semi 零使用**——`semi-foundation` 全库无 `__`/`--`，全部单连字符。本库以对齐 Semi 为目标，
   class 名是对外 API 的一部分（消费方靠它覆写样式），命名风格应一并对齐。
2. **本库当前是分裂的**——~108 个组件用单连字符，27 个用 BEM，且**无任何 spec 规定过**，
   属历史遗留而非有意设计。
3. **有真实代价**——写 DatePicker 的 demo CSS 时照 Semi 的 `semi-tabs-content` 推出
   `cd-tabs-content`，实际是 `cd-tabs__content`，选择器静默不匹配。消费方会反复踩。

## 待统一清单（27 个组件，1153 处 `__` + 441 处 `--`）

按出现次数：nav(165)、tabs(151)、tree-select(116)、select(107)、tree(97)、breadcrumb(78)、
sidebar-mcp(57)、sidebar-annotation(51)、color-picker(45)、card(31)、input-wrapper(29)、
sidebar(28)、sidebar-container(27)、tag(26)、tooltip(23)、sidebar-file-item(21)、
avatar-group(21)、sidebar-code-content(17)、time-picker(16)、pincode(16)、
sidebar-file-content(14)、virtual-list(6)、tag-group(3)、slider(3)、form(2)、
autocomplete(2)、notification-list(1)。

**同步影响面**：测试引用 101 处、docs 引用 9 处、spec 26 份。

## 折平后会撞名的 8 处（必须逐个起新名，不可盲目 sed）

| BEM 原名 | 折平后 | 冲突方所在 | 性质 |
|---|---|---|---|
| ~~`cd-select__list`~~ | `cd-select-list` | 同在 Select.svelte | ~~真冲突~~ **误报，已折平**：另一处 `cd-select-list` 是 `useId('cd-select-list')` 的 **id 前缀**（`useId` 还会加唯一后缀），不是 class；且 id 与 class 落在同一元素上，命名反而更一致。Select 已于 2026-07-29 全量折平（46 个类 / 160 处引用），全库测试 2029 passed |
| `cd-tree-select__panel` | `cd-tree-select-panel` | 同组件 | 需确认是否真冲突 |
| `cd-slider__handle` | `cd-slider-handle` | PreviewFooter vs Slider | 跨组件同前缀，非真冲突 |
| `cd-slider__rail` | `cd-slider-rail` | 同上 | 同上 |
| `cd-slider__track` | `cd-slider-track` | 同上 | 同上 |
| `cd-divider--vertical` | `cd-divider-vertical` | PreviewFooter vs Divider | 跨组件同前缀 |
| `cd-ai-dialogue-box--error` | `cd-ai-dialogue-box-error` | 同组件 | 需确认 |
| `cd-ai-dialogue-box-reference--text` | `cd-ai-dialogue-box-reference-text` | 同组件 | 需确认 |

**盲目 `sed 's/__/-/'` 会把两个不同元素静默合并成同一个类**（如 Select 的两处），
样式互相污染且不报错——必须逐组件核对后改名。

## 执行要点

- 一个组件一个 commit，便于回滚定位。
- 每组件改完跑：`pnpm -r typecheck`（**不是**只跑 docs，见 [[push-needs-recursive-typecheck-not-single-pkg]]）
  + 该组件测试 + 真机看一眼样式没塌。
- 同步改：组件 `.svelte`、测试选择器、docs demo/正文、组件 spec。
- 1.0 前无兼容包袱，直接改名不留 alias。
