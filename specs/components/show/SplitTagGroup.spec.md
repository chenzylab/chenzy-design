# SPEC · SplitTagGroup

> 分类：show · 阶段：M4（增补，深度对标发现——Semi 正式导出的 Tag 子组件）
> 对标 Semi：[SplitTagGroup](https://semi.design/zh-CN/show/tag)（`export { SplitTagGroup }`）
> 连接式标签组：多个 Tag 连成一体（首尾圆角、相邻边合并），视觉上是一个分段控件。

## 1. 概述

SplitTagGroup 把一组 Tag 渲染成**连接的整体**——首个子元素前缘圆角、末个子元素后缘圆角、中间相邻边合并，形成分段式外观。典型场景：分段筛选标签、连续状态标签、分段展示。

## 2. 设计语义

**何时用**：多个 Tag 需要视觉上连成一个分段控件。
**何时不用**：
- 松散标签组（可折叠）→ TagGroup。
- 单标签 → Tag。

**与 TagGroup 的区别**：TagGroup 是松散标签 + 溢出折叠；SplitTagGroup 是连接式一体（不折叠，重点在首尾圆角/合并边框的分段外观）。

## 3. 分层实现

- 纯渲染，无 core。`SplitTagGroup.svelte`（`packages/svelte/src/tag/` 内），`decorateChildren` 逻辑：给首子加前缘圆角、末子加后缘圆角、中间去圆角合并边。

## 4. API

### Props

> 本表由 `packages/svelte/src/tag/meta.ts` 真源生成（2026-07-30 重校）。此前本表列的 prop 多为 Semi 对齐前的旧名或已删除项（如 `value`→`activeKey`、`change`→`onChange`），改 prop 时请同步 meta.ts，勿手写「规划中」的 prop。

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| type | `'light'\|'solid'\|'ghost'` | `'light'` | 视觉风格 |
| color | `'amber'\|'blue'\|'cyan'\|'green'\|'grey'\|'indigo'\|'light-blue'\|'light-green'\|'lime'\|'orange'\|'pink'\|'purple'\|'red'\|'teal'\|'violet'\|'yellow'\|'white'` | `'grey'` | 语义色，对齐 Semi 16 色板 + white |
| size | `'small'\|'default'\|'large'` | `'default'` | default 与 small 同高 |
| shape | `'square'\|'circle'` | `'square'` | circle 用胶囊圆角 |
| closable | `boolean` | `false` | 尾部关闭按钮 |
| visible | `boolean` | `undefined` | 受控显隐；受控时不回写，仅 onClose 通知 |
| colorful | `boolean` | `false` | AI 多彩标签：蓝→紫渐变，字重更重 |
| gradient | `boolean` | `false` | 渐变色，仅 colorful=true 时生效 |
| avatarSrc | `string` | `undefined` | 头像型 Tag 的图片地址 |
| avatarShape | `'square'\|'circle'` | `'square'` | 头像形状 |
| tagKey | `string\|number` | `undefined` | 在 TagGroup 中的稳定标识 |
| prefixIcon | `Snippet` | `undefined` | 前置图标 |
| suffixIcon | `Snippet` | `undefined` | 后置图标（关闭图标始终最右） |
| children | `Snippet` | `undefined` | 标签内容 |
| contentAlign | `'ellipsis' \| 'center'` | `'ellipsis'` | 内容对齐：ellipsis 纯文本单行省略号左对齐；center 含富内容（图标等）flex 垂直居中 |
| onClose | `(tagChildren, e, tagKey) => void` | `undefined` | 关闭回调；在回调内 e.preventDefault() 阻止默认隐藏 |
| onClick | `(e) => void` | `undefined` | 单击回调；传入后标签变可交互(role=button/可聚焦/Enter 激活) |
| onMouseEnter | `(e) => void` | `undefined` | 鼠标进入回调 |
| onKeyDown | `(e) => void` | `undefined` | 键盘事件回调（内部处理后触发） |
| tabIndex | `number` | `undefined` | 可交互 Tag 的 tabIndex（TagInput 内用 -1） |
| aria-label | `string` | `undefined` | 透传根元素可访问名（aria-label） |
| class | `string` | `undefined` | 透传根类名 |
| style | `string` | `undefined` | 透传根内联样式 |

**事件**（回调 prop 形式，对齐 Semi）：

| 事件 | 说明 |
| --- | --- |
| `onClose` | 关闭按钮点击（tagChildren, e, tagKey） |
| `onClick` | 标签点击（clickable 时） |
| `onMouseEnter` | 鼠标进入 |
| `onKeyDown` | 键盘按下 |

**子组件**：`TagGroup`、`SplitTagGroup`

### Slots

default：子 Tag。

## 5. 主题 / Token 表

复用 Tag token；`--cd-splittaggroup-*`（合并边宽/分段圆角）如需。

## 6. 无障碍

- 组容器 `role="group"` + `aria-label`（ariaLabel prop）。
- 子 Tag 保留自身 a11y；连接外观纯视觉不影响语义。

## 7. 国际化

- ariaLabel 由使用方提供。无内置文案。

## 8. 文案

- 无内置。

## 9. 性能

svelte gzip ≤ 1 KB。纯 CSS 装饰（首尾圆角/合并边），无运行时几何。

## 10. AI 元数据

`name: 'SplitTagGroup'`、`relatedTo: 'Tag'`、`semiEquivalent: 'SplitTagGroup'`。examples：分段筛选、连续状态标签。

## 11. 测试

- 组件：children 连接渲染、首尾圆角/中间合并边（class 或样式断言）。
- a11y（`*.a11y.test.ts`）：role=group + ariaLabel。

## 12. 验收标准

- [ ] 复用 Tag · [ ] 类型+JSDoc · [ ] Token（如需） · [ ] a11y · [ ] 测试 · [ ] Perf · [ ] meta · [ ] docs demo
