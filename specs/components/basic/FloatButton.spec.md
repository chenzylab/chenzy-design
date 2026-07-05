# SPEC · FloatButton

> 分类：basic · 阶段：M1（增补，对标 Semi Plus 后补齐）
> 对标 Semi：[FloatButton 悬浮按钮](https://semi.design/zh-CN/basic/floatbutton)（Semi 2.85.0+）
> 悬浮在页面上的可操作按钮，支持单个与成组。本 SPEC 对标 Semi 2.101.0 API，并在 a11y 上做增强（Semi 现状为 div+onClick、无键盘、无 ARIA、假链接）。

## 1. 概述

FloatButton 是**悬浮固定在页面视口上的可操作按钮**，用于承载全局快捷入口（AI 编辑、搜索、帮助、回到顶部等）。`FloatButtonGroup` 将多个悬浮按钮平铺成一组，统一分发点击。

## 2. 设计语义

**何时用**：需要一个始终可见、脱离文档流、固定在视口某角的快捷操作入口。
**何时不用**：
- 常规行内操作 → 用 `Button`。
- 仅"回到顶部"单一功能 → 本库已有 `BackTop`（FloatButton 可作其更通用的底座，但不替代 BackTop 的滚动监听逻辑）。
- 需要展开式菜单（主按钮 hover/click 展开子项）→ Semi 的 Group 不支持展开，本库也**不内置展开菜单**（平铺容器 + 使用方自行组合 Popover/Dropdown 实现）。

与 `Button` 的区别：FloatButton 默认脱离文档流、通过 `style` 逻辑属性定位、形状默认圆角、面向"悬浮入口"语义。

## 3. 分层实现

- **headless（core/）**：轻量，可不建独立 core。定位/形状/徽章都是渲染层配置；Group 的点击委托（读 data-value）逻辑简单，内联在 svelte 即可。若为一致性可建极薄 `createFloatButtonGroup`（解析 items → 事件委托），非必需。
- **渲染（svelte/）**：
  - `FloatButton.svelte`：根据有无 `href` 渲染 `<button type="button">` 或 `<a>`（**升级点**：Semi 用 div+JS 跳转，本库用语义化元素）。可选包 `Badge`。
  - `FloatButtonGroup.svelte`：平铺容器，遍历 `items` 渲染，事件委托回传 `value`。

## 4. API

### FloatButton Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `icon` | `Snippet \| Component` | — | 图标内容，渲染在按钮主体内。 |
| `badge` | `BadgeProps` | — | 徽章参数（复用本库 Badge：`dot`/`count`/`overflowCount`/`type` 等），有值时外层包裹 Badge。 |
| `shape` | `'round' \| 'square'` | `'round'` | 形状：round=圆角矩形，square=方形。 |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | 尺寸三档。 |
| `colorful` | `boolean` | `false` | AI 风格多彩渐变外观。 |
| `disabled` | `boolean` | `false` | 禁用（不触发跳转/onClick，`aria-disabled` 或原生 disabled）。 |
| `href` | `string` | — | 有值时渲染为 `<a>`（语义化链接，超越 Semi 的 JS 跳转）。 |
| `target` | `string` | — | 链接打开目标；`_blank` 时自动补 `rel="noopener noreferrer"`。 |
| `ariaLabel` | `string` | — | 无可视文字时的可访问名（图标按钮必填，dev 缺失时 warn）。 |
| `onClick` | `(e: MouseEvent) => void` | — | 点击回调。 |
| `class` | `string` | — | 根节点类名。 |
| `style` | `string` | — | **主要定位方式**：设 `inset-inline-end`/`inset-block-end`（推荐，RTL 友好）或 `bottom`/`right` 等。组件不提供独立 top/right/bottom/left prop（对齐 Semi）。 |

### FloatButtonGroup Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `items` | `FloatButtonGroupItem[]` | `[]` | 子项数组，遍历渲染。 |
| `disabled` | `boolean` | `false` | 组级禁用样式。 |
| `ariaLabel` | `string` | i18n 默认 | 组的可访问名（`role="group"`）。 |
| `onClick` | `(value: string, e: MouseEvent) => void` | — | 组级点击委托，回传被点项 `value`。 |
| `class` | `string` | — | 根节点类名。 |
| `style` | `string` | — | 定位方式，同 FloatButton。 |

`FloatButtonGroupItem` = FloatButton 全部 props + `{ value: string; content?: Snippet | string }`（`value` 渲染为 `data-value`，`content` 在 icon 之后渲染）。

### Events

| 名称 | 载荷 | 说明 |
| --- | --- | --- |
| FloatButton `onClick` | `MouseEvent` | 点击；disabled 时不触发。 |
| Group `onClick` | `(value, MouseEvent)` | 事件委托读 data-value。 |

### Slots

| 名称 | 说明 |
| --- | --- |
| icon | 图标内容（也可用 icon prop） |
| default | 按钮文字/内容（有则非 icon-only） |

## 5. 主题 / Token 表

组件级 Token，派生自 Alias。

| Token | 含义 | 默认引用 |
| --- | --- | --- |
| `--cd-floatbutton-size-small` | small 边长 | 派生自 spacing |
| `--cd-floatbutton-size-default` | default 边长 | |
| `--cd-floatbutton-size-large` | large 边长 | |
| `--cd-floatbutton-radius-round` | round 圆角 | `--cd-border-radius-large` |
| `--cd-floatbutton-radius-square` | square 圆角 | `--cd-border-radius-small` |
| `--cd-floatbutton-bg` | 背景 | `--cd-color-bg-2` |
| `--cd-floatbutton-bg-hover` | hover 背景 | `--cd-color-fill-0` |
| `--cd-floatbutton-color` | 图标/文字色 | `--cd-color-text-0` |
| `--cd-floatbutton-shadow` | 悬浮阴影 | `--cd-shadow-elevated` |
| `--cd-floatbutton-colorful-gradient` | colorful 渐变 | AI 品牌渐变 |
| `--cd-floatbutton-disabled-opacity` | 禁用透明度 | `--cd-opacity-disabled` |
| `--cd-floatbutton-group-gap` | 组内间距 | `--cd-spacing-tight` |

## 6. 无障碍

对标 Semi 的**增强**（Semi 是 div+onClick、无键盘/ARIA/真实链接）：

- **语义化元素**：无 href → `<button type="button">`；有 href → `<a href target rel>`。天然键盘可达（Enter/Space/点击）、原生焦点。
- **可访问名**：icon-only 必须 `aria-label`（dev 缺失 warn）。有 `content`/文字则用文字。
- **badge**：纯计数装饰 `aria-hidden`，或把语义并入按钮 label（如「通知，3 条未读」）。
- **Group**：`role="group"` + `aria-label`；各子项为独立 button/a，逐个可 Tab（非 roving，悬浮入口数量少）。
- **disabled**：原生 `disabled`（button）或 `aria-disabled`（a，且移出 tab 序）。
- **对比度**：悬浮按钮背景与页面内容对比 ≥3:1；阴影保证边界可辨。
- **reduced-motion**：colorful 渐变动画在 reduced-motion 下静止。
- **RTL**：定位用逻辑属性 `inset-inline-end`，组排布随 RTL 翻转。

## 7. 国际化

- i18n key：`FloatButton.groupAriaLabel`（组默认名，zh「悬浮操作组」/ en「Float actions」）。
- 单按钮 `ariaLabel` 为使用方内容文案，需业务侧本地化。
- RTL：逻辑属性定位，无额外文案。

## 8. 文案

- 无内置可视文案。`content` 与 `ariaLabel` 由使用方提供，遵循 content-guidelines（名词短语、动作明确）。

## 9. 性能（Perf Budget）

| 维度 | 预算 | 说明 |
| --- | --- | --- |
| FloatButton gzip | ≤ 2.5 KB | 含 Badge 复用引用 |
| Group gzip | ≤ 1.5 KB | 平铺 + 委托 |
| 渲染 | 直渲，无虚拟化 | 悬浮项数量少 |

- 无浮层、无 destroyOnClose。固定定位不触发重排（position: fixed）。

## 10. AI 元数据

`component.meta.ts`：
- `name: 'FloatButton'`、`category: 'basic'`、`stage: 'M1'`、`semiEquivalent: 'FloatButton'`。
- props/events schema；标注 Group items 结构。
- `a11yPattern: 'button'`；`examples`：单悬浮按钮、带徽章、colorful、href 链接、Group 平铺、回到顶部 recipe。
- `doNot`：不要用 div 假按钮、不要漏 icon-only 的 aria-label、不要用物理属性定位（用逻辑属性）。

## 11. 测试

- **单元**：Group 事件委托取 value；disabled 阻断 click；href→a、无 href→button 分支。
- **组件**：三尺寸 × 两形状渲染；badge 包裹；colorful class；Group items 遍历与 content 渲染；点击回调载荷。
- **a11y**：axe 无违规；button/a 语义正确；icon-only 有 aria-label；键盘 Enter/Space 触发；Group role=group；`_blank` 有 rel。
- **视觉回归**：尺寸 × 形状 × colorful × 暗色 × RTL。
- **i18n**：Group aria-label 随 locale。

## 12. 验收标准（对照 AGENTS.md §5 DoD）

- [ ] 分层正确 · [ ] 类型+JSDoc · [ ] Token 注册 · [ ] a11y 通过（语义元素 + 键盘 + aria-label）
- [ ] i18n 无硬编码 · [ ] 测试达标 · [ ] Perf 达标 · [ ] meta 提供 · [ ] 文档页 + demo 完成
