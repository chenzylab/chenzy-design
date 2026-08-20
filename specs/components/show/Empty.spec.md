# SPEC · Empty
> 分类：show · 阶段：M4
> 对标 Semi：Empty（严格对齐，2026-08-20 重写——此前版本描述的 role=status/size/responsive/6预设枚举/imageError事件/动效等特性均为 Semi 原版没有的规划态设计，已删；本表如实反映当前与 Semi 1:1 对齐的实现）

## 1. 概述

`Empty` 用于在「无数据 / 无搜索结果 / 无权限 / 网络错误」等场景下，向用户展示一个占位状态。它由「插画 + 标题 + 描述 + 动作区」四段式组成，通常被其他组件（Table / List / Select / Tree）作为空态插槽使用，也可独立使用。

核心定位：

- 纯展示组件，无内置交互、无键盘导航、无浮层。
- 不内置语义预设枚举；插画由业务经 `imageSlot`/`darkModeImage` 等 prop 显式传入，配套的语义插画由独立包 `@chenzy-design/illustrations`（对齐 `@douyinfe/semi-illustrations`）提供 8 语义 × light/dark 共 16 个插画组件。
- 支持 `layout="vertical"`（默认，居中堆叠）与 `layout="horizontal"`（插画在左、文案在右）两种排布。

非目标：不负责数据加载态（用 Loading/Skeleton）；不负责错误边界捕获（属于上层业务逻辑）。

## 2. 设计语义

- **DOM 结构**：`.cd-empty`（flex 容器）> `.cd-empty-image` + `.cd-empty-content`（title/description/footer），与 Semi `semi-ui/empty/index.tsx` 同构。
- **标题层级**：有插画时标题用 `Typography.Title heading=4`；无插画时降为 `heading=6 + weight=400`，对齐 Semi `titleProps` 分支逻辑。
- **暗色适配**：`darkModeImage`/`darkModeImageSlot` 存在时监听 `data-theme` 属性变化切换插画（对齐 Semi 监听 `body` 的 `theme-mode` 属性，属性名差异是本仓库既定的主题属性命名约定，非 Empty 独有）。
- **无动效**：Semi 原版无插画进入动效，本组件同样不引入。

## 3. 分层实现

`Empty` 是纯展示组件，省略 core——无键盘导航、无浮层、无焦点陷阱，不需要 headless 状态机。

- `@chenzy-design/svelte`
  - `Empty.svelte`：根渲染、布局编排、暗色插画切换。
- `@chenzy-design/illustrations`：独立包，16 个语义插画组件（路径级复刻 Semi 原始 SVG），供 `image`/`darkModeImage`/`imageSlot`/`darkModeImageSlot` 引入。
- 动作区：组件本身不内置按钮逻辑，通过 `children`（footer）slot 让业务塞入 `Button`。

## 4. API

### 4.1 Props

> 本表由 `packages/svelte/src/empty/meta.ts` 真源生成。

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| image | `{ id?; viewBox?; url? } \| string` | `undefined` | 占位图：SVG 精灵对象或图片 URL；自定义节点用 imageSlot |
| darkModeImage | `{ id?; viewBox?; url? } \| string` | `undefined` | 暗色模式占位图，响应 data-theme 变化 |
| title | `string` | `undefined` | 标题 |
| description | `string \| Snippet` | `undefined` | 内容描述；string 直渲，Snippet 渲染富内容 |
| imageStyle | `string` | `undefined` | 占位图容器（.cd-empty-image）内联样式 |
| layout | `'vertical'\|'horizontal'` | `'vertical'` | 布局方式 |
| class | `string` | `''` |  |
| style | `string` | `undefined` |  |
| children | `Snippet` | `undefined` | 动作区（footer） |
| imageSlot | `Snippet` | `undefined` | 自定义插画节点（等价 Semi image 传 ReactNode） |
| darkModeImageSlot | `Snippet` | `undefined` | 暗色自定义插画节点 |
| ...rest | `Record<string, unknown>` | `undefined` | 透传到根节点的其余属性（如 data-*），对齐 Semi `getDataAttr(rest)` |

> 说明：本组件无受控数据输入与浮层，故不涉及 `value/on:change`、`open/on:openChange`、`status`、`size`、`responsive` 等 Semi 原版没有的约定。

### 4.2 Events

> 本组件无事件回调 prop（meta.events 为空）。Semi 原版同样没有 `imageError` 等事件；动作的点击事件由 `children`（footer）内的业务组件（如 `Button`）自行派发。

### 4.3 Slots

| Slot | 说明 |
| --- | --- |
| `imageSlot` | 自定义插画/图片节点（亮色），等价 Semi `image` 传 ReactNode |
| `darkModeImageSlot` | 自定义插画/图片节点（暗色） |
| `description` | 传 Snippet 时渲染富文本描述 |
| `children` | 动作区（footer），放置按钮或链接 |

## 5. 主题 / Token 表

> Semi `empty/variables.scss` 全量对齐（6 个），组件直接消费原始层 token，无 Alias 回退包装。

| Token | 值 | 用途 |
| --- | --- | --- |
| `--cd-spacing-empty-content-vertical-margintop` | `24px` | vertical 布局下 content 与 image 的间距 |
| `--cd-spacing-empty-content-horizontal-marginleft` | `32px` | horizontal 布局下 content 与 image 的间距 |
| `--cd-spacing-empty-title-margintop` | `16px` | title 与 description 间距 |
| `--cd-spacing-empty-footer-margintop` | `24px` | footer 与上方内容间距 |
| `--cd-font-empty-title-fontweight` | `var(--cd-font-weight-bold)`（600） | 标题字重 |
| `--cd-color-empty-description-text-default` | `var(--cd-color-text-1)` | 描述文字色 |

类名约定：`cd-empty`、`cd-empty-image`、`cd-empty-content`、`cd-empty-title`、`cd-empty-description`、`cd-empty-footer`；修饰符 `cd-empty-vertical`/`cd-empty-horizontal`。

## 6. 无障碍

Semi 原版 `Empty` 无 `role="status"`/`aria-live`/`aria-labelledby`/`aria-describedby`/`useId` 关联，本组件严格对齐，同样不引入。

- **插画**：SVG 加 `aria-hidden="true"`，不进无障碍树。
- **外部图片**：`<img>` 的 `alt` 取 `description`（字符串时），缺省为 `"empty"`。
- **焦点管理**：组件自身不抢焦点；footer 内按钮需可 Tab 聚焦、有可见焦点环，由业务组件自身保证。
- **RTL**：horizontal 布局在 `.cd-rtl` 下镜像 content 间距，对齐 Semi `rtl.scss`。

## 7. 国际化

本组件不消费 locale：`Empty.svelte` 内无 `useLocale`，所有用户可见文案由调用方经 `title`/`description` props 传入，无内置文案，无 i18n 键表。

## 8. 文案（业务侧参考）

`Empty` 本身不内置任何预设文案，以下为业务调用方组织空态文案的建议（非组件强制约束）：

- 标题简短，陈述事实，不带情绪；描述补充原因或动作建议。
- 不使用「Oops / 哎呀 / 出错啦」等卖萌或推责口吻。
- 「无数据」与「无搜索结果」应区分：前者是「还没有」，后者是「没匹配到」，引导动作不同。
- 动作文案用动宾短语，首词为动词。

### 危险操作文案（单列）

`Empty` 自身不触发破坏性操作；但其 footer（`children`）常承载危险动作（如「清空全部」）。约定：

- 危险动作按钮用 `Button type="danger"`，文案明确对象与不可逆性。
- 危险动作须经二次确认（`Popconfirm`/`Modal`），不在空态里一键执行。
- 不把危险动作设为空态里视觉最强的主按钮。

## 9. 性能

纯展示组件，单实例、节点数恒定，无虚拟化需求、无 ResizeObserver、无动效计算。插画来自独立包 `@chenzy-design/illustrations`，业务按需 import 具名插画组件即可 tree-shaking，未引用的插画不进 bundle。

## 10. AI 元数据

提供 `meta.ts`，供 AI/低代码消费：`name`、`category`、`description`、`props`、`a11y`、`tokens`。

## 11. 测试

- **单元**（组件渲染）：
  - `image`/`darkModeImage` 三种输入形态（Snippet、SVG 精灵对象、URL 字符串）分别正确渲染。
  - `title` 存在时按有无插画渲染对应 heading 档位。
  - `description` 缺省时不渲染该行节点；传 Snippet 渲染富文本。
  - `layout` 派生正确的修饰类名。
  - `darkModeImage`/`darkModeImageSlot` 存在时随 `data-theme` 变化切换插画。
  - `...rest` 透传到根节点（如 `data-testid`）。
- **a11y**（axe + 断言）：插画 `aria-hidden="true"`；外部图 alt 取 description。
- **视觉回归**：16 个插画（`@chenzy-design/illustrations`）× vertical/horizontal 关键组合截图。

## 12. 验收标准 checklist

- [x] Props/Events/Slots 与本 SPEC §4 一致，与 `meta.ts` 同步。
- [x] 16 个插画（8 语义 × light/dark）由 `@chenzy-design/illustrations` 提供，路径级复刻 Semi 原始 SVG。
- [x] 仅消费 Semi 对齐的原始层 token，无写死颜色/尺寸值（插画内部品牌色 token 化，中性色对齐 Semi 硬编码值）。
- [x] 类名遵循 `cd-empty` 约定，与 Semi 一致。
- [x] 插画 `aria-hidden`，外部图 alt 合理。
- [x] `dir="rtl"` 下 horizontal 正确镜像间距。
- [x] 提供 `meta.ts`。
- [ ] 单元 / a11y / 视觉回归测试通过（含新插画包）。
