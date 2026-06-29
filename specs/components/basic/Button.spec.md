# SPEC · Button

> 分类：basic · 阶段：M1
> 对标 Semi Button。**示范组件**：作为「无交互/轻交互」组件 SPEC 的范例。

## 1. 概述
触发即时操作的按钮，是最基础的交互原子。

## 2. 设计语义
用于触发动作（提交、打开弹窗、跳转）。强调主操作用 primary，一组操作中只有一个主按钮。危险操作用 danger。链接式跳转优先考虑 Typography.Link。

## 3. 分层实现
- **headless**：无需独立状态机；loading/disabled 为纯展示态。可复用 core 的 `useId`。
- **渲染**：`Button.svelte`，可选内部 `ButtonGroup.svelte`。

## 4. API
### Props
| 名称 | 类型 | 默认 | 说明 |
|---|---|---|---|
| type | `'primary'\|'secondary'\|'tertiary'\|'warning'\|'danger'` | `'secondary'` | 语义类型 |
| theme | `'solid'\|'borderless'\|'light'\|'outline'` | `'light'` | 视觉变体 |
| size | `'small'\|'default'\|'large'` | `'default'` | 尺寸 |
| block | `boolean` | `false` | 撑满宽度 |
| disabled | `boolean` | `false` | 禁用 |
| loading | `boolean` | `false` | 加载态（带 Spin，禁用点击）|
| colorful | `boolean` | `false` | AI 多彩：所有 theme 下蓝→紫渐变；type 仅 `primary`/`tertiary` 有意义（其余回退 `primary`）|
| icon | `Snippet` | — | 图标插槽 |
| iconPosition | `'left'\|'right'` | `'left'` | 图标位置 |
| ariaLabel | `string` | — | 无障碍名；纯图标按钮必填 |
| htmlType | `'button'\|'submit'\|'reset'` | `'button'` | 原生 type |
| noHorizontalPadding | `boolean\|'left'\|'right'\|('left'\|'right')[]` | `false` | 仅 `icon` 时去单/双侧水平内距 |
| class | `string` | — | 根元素自定义类名（透传） |
| style | `string` | — | 根元素自定义内联样式（透传） |
| contentClassName | `string` | — | 内容区自定义类名（仅传入时包裹 `display:contents` 层） |

> 纯图标按钮：仅传 `icon`（无默认插槽文本）时自动收成正方形（宽=高、去水平内距），应提供 `ariaLabel`。
> 链接式跳转不再由 Button 承担（已移除 `href`），统一用 `Typography.Link`（对齐 Semi）。

### Events
| 事件 | 载荷 | 说明 |
|---|---|---|
| on:click | `MouseEvent` | disabled/loading 时不触发 |
| on:mousedown / on:mouseenter / on:mouseleave | `MouseEvent` | 鼠标按下/移入/移出 |
### Slots
| 名称 | 说明 |
|---|---|
| default | 按钮文本 |
| icon | 图标 |

## 5. 主题 / Token
| Token | 默认 | 用途 |
|---|---|---|
| --cd-button-height-default | 32px | 默认高度 |
| --cd-button-height-small/large | 24/40px | 尺寸 |
| --cd-button-padding-x | var(--cd-spacing-4) | 水平内距 |
| --cd-button-radius | var(--cd-radius-2) | 圆角 |
| --cd-button-color-bg-primary | var(--cd-color-primary) | 主按钮底色 |
| --cd-button-font-size | var(--cd-font-size-2) | 字号 |

## 6. 无障碍
- 渲染原生 `<button>`（链接式跳转用 `Typography.Link`，不再由 Button 承担）。
- 键盘：Enter/Space 触发原生 button 行为。
- `disabled` → 原生 disabled + `aria-disabled`；loading → `aria-busy="true"`。
- `:focus-visible` 焦点环用 `--cd-focus-ring`。
- 仅图标按钮必须有 `aria-label`（缺失则 dev 警告）。
- reduced-motion 下关闭 hover/active 过渡。

## 7. 国际化
- 自身无内置文案（文本由使用者传入）。loading 的可访问性提示用 `Button.loading`。

## 8. 文案
- 推荐动词/动宾短语；危险按钮文案明确（如「永久删除」）。遵循 content-guidelines。

## 9. 性能
### Perf Budget
| 指标 | 预算 |
|---|---|
| gzip 体积 | ≤ 2.9 KB（含 ButtonGroup/SplitButtonGroup/colorful）|
| 状态切换 | 纯 class 切换，无重排抖动 |
- 不需要虚拟化/惰性渲染。

## 10. AI 元数据
提供 `component.meta.ts`，含全部 props/events/slots/a11y/tokens/examples。

## 11. 测试
- 单测：type/theme/size class 映射、disabled/loading 不触发 click、href 渲染为链接。
- e2e：键盘激活、loading 态阻断点击。
- a11y：axe 0 violations；仅图标按钮缺 aria-label 报错。

## 12. 验收标准
对照 AGENTS.md §5 DoD 全勾。
