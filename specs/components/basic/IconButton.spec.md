# SPEC · IconButton

> 分类：basic · 阶段：M1（增补，对标 Semi 后补齐）
> 对标 Semi：Semi 的 `button/index.tsx` 派发器在 `icon || (loading && !disabled)` 时委托独立的 `iconButton/index.tsx` 渲染，否则渲染纯容器 `button/Button.tsx`。本库镜像同一委托方向：`Button.svelte` 是薄派发器，`IconButton.svelte` 是图标装配唯一逻辑源（icon 组装/loading spinner/colorful fill 注入），对外仍只暴露 `Button` 为主入口；本组件作为**便捷封装 + 独立公开组件**落地。

## 1. 概述

IconButton 是**纯图标按钮**的便捷组件：等价于 `Button` 传 `icon` 且无文字，但强制 `ariaLabel` 必填以保证可访问名，并默认方形/对称内边距。用于工具栏、卡片操作区、输入框后缀等纯图标动作入口。

## 2. 设计语义

**何时用**：只显示一个图标、无文字的动作按钮，且希望组件层面强约束可访问名。
**何时不用**：
- 有文字（或图标+文字）→ 用 `Button`（`icon` + children）。
- 悬浮固定入口 → 用 `FloatButton`。

**与 Button 的关系（重要）**：`Button` 命中 `icon || (loading && !disabled)` 时内部渲染 `IconButton`（委托方向对齐 Semi index.tsx→IconButton），`iconOnly` 语义（无 children + 有 icon → 方形 + 内边距归零）由 IconButton 唯一实现，Button 不重复。IconButton 作为独立公开组件的增量价值：① `ariaLabel` 从可选变必填（类型 + dev warn）；② 提供更聚焦的 DX 与文档定位。**`circle` prop**（圆形按钮）落在 `BaseButton.svelte`，Button/IconButton 均可用。

## 3. 分层实现

- **headless（core/）**：无需新建。
- **渲染（svelte/）**：
  - `IconButton.svelte`：图标装配唯一逻辑源，转发全部 Button props（`type`/`theme`/`size`/`disabled`/`loading`/`colorful`/`circle`/`noHorizontalPadding` 等）+ `icon` + 必填 `ariaLabel`，内部渲染 `<BaseButton>`（纯容器）。`Button.svelte` 命中图标分支时委托本组件渲染，否则渲染 `BaseButton.svelte`。
  - **Button 增补**：`circle?: boolean` prop（CSS `border-radius: 50%` + 方形）落在 `BaseButton.svelte`，Button 与 IconButton 共用。

## 4. API

### IconButton Props

> 本表由 `packages/svelte/src/iconbutton/meta.ts` 真源生成（2026-07-30 重校）。此前本表列的 prop 多为 Semi 对齐前的旧名或已删除项（如 `value`→`activeKey`、`change`→`onChange`），改 prop 时请同步 meta.ts，勿手写「规划中」的 prop。

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| icon | `Snippet<[{ fill?: string \| string[] }]>` | `undefined` | 图标内容（可选）；colorful 命中 multipleColor/twoColor 时收到 fill 数组，供支持 fill prop 的具名图标消费 |
| children | `Snippet` | `undefined` | 文字内容（可选）；提供后非纯图标 |
| aria-label | `string` | `undefined` | 可访问名（透传到 aria-label）；纯图标按钮建议提供 |
| type | `'primary'\|'secondary'\|'tertiary'\|'warning'\|'danger'` | `primary` | 语义类型 |
| theme | `'solid'\|'borderless'\|'light'\|'outline'` | `light` | 视觉变体 |
| size | `'small'\|'default'\|'large'` | `default` | 尺寸三档 |
| iconPosition | `'left'\|'right'` | `left` | 图标相对文字位置（透传给 Button） |
| iconSize | `'inherit'\|'extra-small'\|'small'\|'default'\|'large'\|'extra-large'` | `undefined` | 图标尺寸（作用在图标元素上，对齐 Semi） |
| iconStyle | `string` | `undefined` | 图标内联样式（作用在图标元素上，对齐 Semi） |
| circle | `boolean` | `false` | 圆形按钮（复用 Button circle） |
| disabled | `boolean` | `false` | 禁用 |
| loading | `boolean` | `false` | 加载态（spin 图标替换） |
| colorful | `boolean` | `false` | AI 多彩 |
| block | `boolean` | `false` | 撑满容器宽度 |
| noHorizontalPadding | `boolean\|'left'\|'right'\|('left'\|'right')[]` | `false` | 去水平内边距（仅 icon 时有效） |
| htmlType | `'button'\|'submit'\|'reset'` | `button` | 原生 type |
| contentClassName | `string` | `undefined` | 内容区自定义类名（透传给 Button） |
| class | `string` | `undefined` | 根元素自定义类名 |
| style | `string` | `undefined` | 根元素自定义内联样式 |

**事件**（回调 prop 形式，对齐 Semi）：

| 事件 | 说明 |
| --- | --- |
| `onclick` | disabled/loading 时不触发 |
| `onmousedown` | 鼠标按下 |
| `onmouseenter` | 鼠标移入 |
| `onmouseleave` | 鼠标移出 |

> 其余 Button props（`onmousedown`/`onmouseenter`/`onmouseleave`/`block` 等）原样转发。

### Events

| 事件 | 说明 |
| --- | --- |
| `onclick` | disabled/loading 时不触发 |
| `onmousedown` | 鼠标按下 |
| `onmouseenter` | 鼠标移入 |
| `onmouseleave` | 鼠标移出 |

### Slots

| 名称 | 说明 |
| --- | --- |
| icon | 图标内容（也可用 icon prop） |

## 5. 主题 / Token 表

**不新增独立 token**，复用 `--cd-button-*` 全套。新增 `circle` 仅是形状 CSS（`border-radius: 50%`），不引入新 token（复用 icon-only 的方形尺寸 token）。

## 6. 无障碍

- **强制可访问名**：`ariaLabel` 必填 → `<button aria-label>`。dev 模式缺失时 `console.warn`（超越 Semi 的「可选不校验」）。
- 复用 Button 的 a11y：原生 `<button>`、Enter/Space、`aria-busy`（loading）、`disabled`、内部 spin 图标 `aria-hidden`。
- **对比度**：icon 与背景 ≥3:1（非文本图形）。
- **命中目标**：icon-only 按钮命中区 ≥24×24px（small 尺寸下扩展命中区满足 WCAG 2.5.8）。
- **reduced-motion**：loading spin 停转。
- **loading spinner**：严格对齐 Semi spin/icon.tsx——渐变描边圆弧（`<linearGradient>`），非纯色；SSR/hydration 用固定 fallback id，挂载后换实例唯一 id。
- **RTL**：icon-only padding、content-left/right margin 严格对齐 Semi button/rtl.scss 的物理属性左右互换（`.cd-rtl` 作用域覆盖）。

## 7. 国际化

- `ariaLabel` 为使用方内容文案，需业务侧本地化（如「删除」「编辑」「更多」）。组件不提供默认值。
- 无组件内置文案。

## 8. 文案

- 无内置可视文案。`ariaLabel` 遵循 content-guidelines：动作动词或名词短语，简洁。

## 9. 性能（Perf Budget）

| 维度 | 预算 | 说明 |
| --- | --- | --- |
| svelte gzip | ≤ 0.6 KB | 极薄封装，复用 Button |

- 无额外运行时开销；`circle` 仅 CSS。

## 10. AI 元数据

`component.meta.ts`：
- `name: 'IconButton'`、`category: 'basic'`、`stage: 'M1'`、`semiEquivalent: 'Button (icon-only)'`。
- props schema；标注 `icon`/`ariaLabel` 必填。
- `examples`：基础图标按钮、圆形、各 theme、loading、危险操作（danger + 删除图标）。
- `doNot`：不要漏 ariaLabel、不要用它承载图标+文字（那用 Button）。
- 关系说明：`relatedTo: 'Button'`，记录「IconButton = Button icon-only 的便捷封装」。

## 11. 测试

- **组件**：转发 Button props；不传 children；`circle` class；loading spin；缺 ariaLabel 触发 dev warn。
- **Button 增补**：`circle` prop 渲染圆形（含与 icon-only 组合）。
- **a11y**：axe 无违规；aria-label 存在且非空；键盘 Enter/Space；命中目标尺寸。
- **视觉回归**：type × theme × size × circle × 暗色。

## 12. 验收标准（对照 AGENTS.md §5 DoD）

- [ ] 复用 Button（不重复逻辑） · [ ] Button 增补 circle · [ ] 类型+JSDoc（icon/ariaLabel 必填） · [ ] a11y 通过（强制 aria-label）
- [ ] i18n 无硬编码 · [ ] 测试达标 · [ ] Perf 达标 · [ ] meta 提供（含 relatedTo Button） · [ ] 文档页 + demo 完成
