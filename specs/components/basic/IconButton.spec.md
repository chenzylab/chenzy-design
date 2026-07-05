# SPEC · IconButton

> 分类：basic · 阶段：M1（增补，对标 Semi 后补齐）
> 对标 Semi：Semi 的 IconButton 是 Button 内部的图标分发分支（`ButtonProps extends IconButtonProps`），对外只暴露 Button。本库既有 Button 已完整覆盖 icon-only 语义；本组件作为**便捷封装 + Button 增补**落地。

## 1. 概述

IconButton 是**纯图标按钮**的便捷组件：等价于 `Button` 传 `icon` 且无文字，但强制 `ariaLabel` 必填以保证可访问名，并默认方形/对称内边距。用于工具栏、卡片操作区、输入框后缀等纯图标动作入口。

## 2. 设计语义

**何时用**：只显示一个图标、无文字的动作按钮，且希望组件层面强约束可访问名。
**何时不用**：
- 有文字（或图标+文字）→ 用 `Button`（`icon` + children）。
- 悬浮固定入口 → 用 `FloatButton`。

**与 Button 的关系（重要）**：IconButton 内部就是 `Button`，`iconOnly` 语义（无 children + 有 icon → 方形 + `padding-inline: 0`）本库 Button 已实现。IconButton 的增量价值仅两点：① `ariaLabel` 从可选变必填（类型 + dev warn）；② 提供更聚焦的 DX 与文档定位。**同时给 Button 增补 `circle` prop**（圆形按钮），IconButton 复用。

## 3. 分层实现

- **headless（core/）**：无需新建。复用 Button 现有逻辑。
- **渲染（svelte/）**：
  - `IconButton.svelte`：极薄封装，转发全部 Button props（`type`/`theme`/`size`/`disabled`/`loading`/`colorful`/`circle`/`noHorizontalPadding` 等）+ `icon` + 必填 `ariaLabel`，内部渲染 `<Button icon={icon} ariaLabel={ariaLabel} {...rest} />`，不传 children。
  - **Button 增补**：新增 `circle?: boolean` prop（CSS `border-radius: 50%` + 方形），Button 与 IconButton 共用。

## 4. API

### IconButton Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `icon` | `Snippet \| Component` | — | **必填**。图标内容。 |
| `ariaLabel` | `string` | — | **必填**。可访问名（纯图标无文字，屏幕阅读器唯一名称来源）。dev 缺失时 error/warn。 |
| `type` | `'primary' \| 'secondary' \| 'tertiary' \| 'warning' \| 'danger'` | `'secondary'` | 语义类型（对齐本库 Button 默认，非 Semi 的 primary）。 |
| `theme` | `'solid' \| 'borderless' \| 'light' \| 'outline'` | `'light'` | 视觉变体。 |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | 尺寸三档。 |
| `circle` | `boolean` | `false` | 圆形按钮（复用新增的 Button circle）。 |
| `disabled` | `boolean` | `false` | 禁用。 |
| `loading` | `boolean` | `false` | 加载态（用 spin 图标替换）。 |
| `colorful` | `boolean` | `false` | AI 多彩。 |
| `noHorizontalPadding` | `boolean \| 'left' \| 'right' \| ('left'\|'right')[]` | `false` | 去水平内边距。 |
| `htmlType` | `'button' \| 'reset' \| 'submit'` | `'button'` | 原生 type。 |
| `onClick` | `(e: MouseEvent) => void` | — | 点击回调。 |
| `class` / `style` | `string` | — | 根节点透传。 |

> 其余 Button props（`onmousedown`/`onmouseenter`/`onmouseleave`/`block` 等）原样转发。

### Events

| 名称 | 载荷 | 说明 |
| --- | --- | --- |
| `onClick` | `MouseEvent` | 点击。 |

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
