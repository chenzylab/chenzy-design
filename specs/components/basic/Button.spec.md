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

> 本表由 `packages/svelte/src/button/meta.ts` 真源生成（2026-07-30 重校）。此前本表列的 prop 多为 Semi 对齐前的旧名或已删除项（如 `value`→`activeKey`、`change`→`onChange`），改 prop 时请同步 meta.ts，勿手写「规划中」的 prop。

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| type | `'primary'\|'secondary'\|'tertiary'\|'warning'\|'danger'` | `primary` | 语义类型 |
| theme | `'solid'\|'borderless'\|'light'\|'outline'` | `light` | 视觉变体：有背景/无背景/浅背景/边框 |
| size | `'small'\|'default'\|'large'` | `default` | 尺寸 |
| block | `boolean` | `false` | 撑满容器宽度 |
| disabled | `boolean` | `false` | 禁用状态（底灰 + 灰字，优先级高于 loading） |
| loading | `boolean` | `false` | 加载态（带旋转图标，禁用点击） |
| colorful | `boolean` | `false` | AI 多彩按钮：type 仅 primary/tertiary 有意义（对齐 Semi） |
| circle | `boolean` | `false` | 圆形按钮（border-radius:50%），配合 icon-only 呈正圆 |
| htmlType | `'button'\|'submit'\|'reset'` | `button` | 原生 button 的 type 值 |
| icon | `Snippet` | `undefined` | 图标插槽；纯图标按钮需提供 aria-label |
| iconPosition | `'left'\|'right'` | `left` | 图标相对文字位置 |
| iconSize | `IconSize` | `undefined` | 图标尺寸（作用在图标元素上，需搭配 icon 使用） |
| iconStyle | `string` | `undefined` | 图标内联样式（作用在图标元素上，需搭配 icon 使用） |
| noHorizontalPadding | `boolean\|'left'\|'right'\|('left'\|'right')[]` | `false` | 仅设置 icon 时去单/双侧水平内距（inline padding） |
| aria-label | `string` | `undefined` | 无障碍名（透传 aria-label）；纯图标按钮必填 |
| class | `string` | `undefined` | 根元素自定义类名 |
| style | `string` | `undefined` | 根元素自定义内联样式 |
| contentClassName | `string` | `undefined` | 内容区（.cd-button-content）自定义类名 |
| ...rest | `HTMLButtonAttributes` | `-` | 其余原生属性透传到根 button：data-*/name/value/form/title/tabindex/aria-controls/aria-expanded 等 |

**事件**（回调 prop 形式，对齐 Semi）：

| 事件 | 说明 |
| --- | --- |
| `onclick` | disabled/loading 时不触发（原生 disabled 阻断） |
| `onmousedown` | 鼠标按下 |
| `onmouseenter` | 鼠标移入 |
| `onmouseleave` | 鼠标移出 |

**子组件**：`ButtonGroup`、`SplitButtonGroup`

> 纯图标按钮：仅传 `icon`（无默认插槽文本）时自动收成正方形（宽=高、去水平内距），应提供 `ariaLabel`。
> 链接式跳转不再由 Button 承担（已移除 `href`），统一用 `Typography.Link`（对齐 Semi）。

### Events
| 事件 | 说明 |
| --- | --- |
| `onclick` | disabled/loading 时不触发（原生 disabled 阻断） |
| `onmousedown` | 鼠标按下 |
| `onmouseenter` | 鼠标移入 |
| `onmouseleave` | 鼠标移出 |
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
| gzip 体积 | ≤ 4 KB（含 ButtonGroup/SplitButtonGroup/colorful；DSM 全量对齐 Semi 206 token 后按实测 3.5 KB +15% 校准）|
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
