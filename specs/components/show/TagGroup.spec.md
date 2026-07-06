# SPEC · TagGroup

> 分类：show · 阶段：M4（增补，深度对标发现——Semi 正式导出的 Tag 子组件，目录级核对漏掉）
> 对标 Semi：[Tag.Group / TagGroup](https://semi.design/zh-CN/show/tag)（`export { TagGroup }`）
> 标签组容器：多个 Tag 成组展示，支持超出 `maxTagCount` 折叠为「+N」并在弹层展示剩余。

## 1. 概述

TagGroup 把一组 Tag 成组渲染，超过 `maxTagCount` 时折叠剩余为「+N」标签，hover/点击在 Popover 中展示被折叠的 Tag。数据驱动（`tagList`）或子元素（children）两种用法。典型场景：用户标签、筛选条件、多选回显。

## 2. 设计语义

**何时用**：需要展示一组标签且数量可能超出容器、要优雅折叠。
**何时不用**：
- 单个标签 → Tag。
- 可输入的标签 → TagInput。
- 通用溢出折叠（非 Tag）→ OverflowList。

**与 OverflowList 的关系**：TagGroup 是 Tag 专属的溢出折叠便捷组件（内部可复用 OverflowList 的溢出计算或自行按 maxTagCount 截断）；OverflowList 是通用件。TagGroup 提供 Tag 语义的默认（+N 样式、弹层、size/avatarShape 透传）。

## 3. 分层实现

- **headless（core/）**：溢出计算（按 maxTagCount 截断 + restCount）可内联或复用 OverflowList 逻辑。core 禁 any。
- **渲染（svelte/）**：`TagGroup.svelte`（放 `packages/svelte/src/tag/` 内，作为 Tag 的兄弟/子组件），遍历 tagList/children，超出折叠为 +N Tag + Popover 弹层。

## 4. API

### Props

| 名称 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `tagList` | `TagProps[]` | — | 数据驱动的标签数据（与 children 二选一）。 |
| `maxTagCount` | `number` | — | 最多展示的标签数，超出折叠为 +N。 |
| `restCount` | `number` | — | 直接指定折叠数量（覆盖自动计算，用于外部已知总数场景）。 |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | 标签尺寸（透传各 Tag）。 |
| `mode` | `'custom' \| ...` | — | 展示模式（对齐 Semi）。 |
| `avatarShape` | `'circle' \| 'square'` | — | 标签内头像形状（透传）。 |
| `showPopover` | `boolean` | `true` | +N 是否 hover 弹层展示剩余。 |
| `popoverProps` | `PopoverProps` | — | 弹层透传（复用本库 Popover）。 |
| `onTagClose` | `(tag) => void` | — | 关闭某标签回调。 |
| `onPlusNMouseEnter` | `() => void` | — | 鼠标进入 +N 回调。 |
| `class` / `style` | `string` | — | 根节点。 |
| `children` | `Snippet` | — | 子 Tag（与 tagList 二选一）。 |

### Events / Slots

见 onTagClose / onPlusNMouseEnter；default slot 承载子 Tag。

## 5. 主题 / Token 表

复用 Tag 的 token（`--cd-tag-*`）；TagGroup 仅补 `--cd-taggroup-gap`（标签间距）与 +N 弹层复用 Popover token。

## 6. 无障碍

- 标签组 `role="group"` + aria-label；+N 标签 `aria-label`「还有 N 个」（i18n）。
- +N 弹层复用 Popover 的 a11y（键盘可达、Esc）。
- onTagClose 关闭按钮 aria-label（复用 Tag 的 close a11y）。

## 7. 国际化

- i18n key：`TagGroup.restTagsAriaLabel`（+N 可访问名，含 `{count}`，zh「还有 {count} 个标签」/ en「{count} more tags」）。

## 8. 文案

- +N 文案与弹层走 i18n。

## 9. 性能（Perf Budget）

| 维度 | 预算 | 说明 |
| --- | --- | --- |
| svelte gzip | ≤ 2.5 KB | 复用 Tag/Popover（externalize） |

- 溢出计算 O(n)；弹层惰性渲染（showPopover + Popover 自身惰性）。

## 10. AI 元数据

`component.meta.ts`（并入 Tag meta 的 subComponents 或独立）：`name: 'TagGroup'`、`relatedTo: 'Tag'`、`semiEquivalent: 'TagGroup'`。examples：数据驱动 tagList、maxTagCount 折叠、+N 弹层、可关闭。

## 11. 测试

- 组件：tagList/children 渲染、maxTagCount 折叠 +N、restCount 覆盖、showPopover 弹层、onTagClose、size/avatarShape 透传。
- a11y（`*.a11y.test.ts`）：role=group、+N aria-label、弹层键盘。

## 12. 验收标准

- [ ] 复用 Tag/Popover · [ ] 类型+JSDoc · [ ] Token · [ ] a11y · [ ] i18n · [ ] 测试 · [ ] Perf · [ ] meta · [ ] docs demo
