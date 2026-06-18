# SPEC · Icon
> 分类：basic · 阶段：M1
> 对标 Semi：Icon

## 1. 概述

Icon 是组件库最底层的视觉原语，负责以统一的尺寸、颜色、对齐方式渲染矢量图标。它有两个使用层级：

- **内置图标**：配合 `@chenzy-design/icons` 包导出的具名图标组件（每个图标是一个独立的 Svelte 组件，内部 wrap 本 Icon 容器），按需引入、tree-shaking 友好。
- **自定义图标**：通过 `<Icon>` 容器 + slot（传入任意 SVG/img）或 `svg`/`component` prop，把外部图标纳入统一的尺寸/颜色/旋转/状态体系。

它解决三个一致性问题：

1. **尺寸统一**：通过 `size` 枚举映射到 token，而非各处写死 `width/height`，保证与同行 Button/Input 文本基线对齐。
2. **颜色继承**：默认 `fill: currentColor`，跟随父级文本色；`spin` 颜色态用语义 token，避免散落的 hex。
3. **a11y 默认正确**：装饰性图标默认对屏幕阅读器隐藏，语义图标强制要求 `label`。

Icon 是纯展示组件，**无交互逻辑、无键盘处理、无浮层**，因此不拆 core headless 包（仅复用 `useId` 用于 `<title>` 关联）。被点击的场景应由外层 Button/可点击容器承载，Icon 不自带 `on:click` 语义角色。

## 2. 设计语义

| 维度 | 规则 |
|------|------|
| 尺寸基准 | `small=14px`、`default=16px`、`large=20px`；另支持 `extra-small=12px`、`extra-large=24px`。`size` 为数字时直接作为 px。 |
| 视觉重量 | 图标线宽固定 1.5px（24×24 grid），缩放时 viewBox 不变，靠 CSS 缩放保持笔画一致。 |
| 颜色 | 默认 `currentColor` 继承文本色；`status` 切换到对应语义色；`spin` 不改变颜色。 |
| 对齐 | `display: inline-flex; vertical-align: -0.125em`，与相邻文本视觉居中对齐。 |
| 旋转/翻转 | `rotate`（任意角度）、`spin`（持续匀速旋转，loading 场景）；`spin` 受 reduced-motion 抑制。 |
| 留白 | 图标自身零 padding，与文本间距由消费方（Button gap 等）控制，不内建 margin。 |
| 状态色映射 | warning→`--cd-color-warning`，error→`--cd-color-danger`，success→`--cd-color-success`，info→`--cd-color-info`。 |

## 3. 分层实现

**结论：不拆 core headless 包。** Icon 无交互/键盘/焦点/浮层逻辑，拆 `createIcon` 没有收益。所有实现位于 `@chenzy-design/svelte`。

- `@chenzy-design/svelte`：`Icon.svelte` 渲染容器，处理 size→token 映射、`currentColor`、`spin`/`rotate` 变换、a11y 属性派发（`aria-hidden` vs `role="img"`+`aria-label`）。
- `@chenzy-design/icons`：图标资产包。构建期由 SVGO 优化 + 代码生成，每个图标产出一个 `<XxxIcon>` 组件，内部 `<Icon>{@html svgPath}</Icon>`。该包仅依赖 `@chenzy-design/svelte` 的 Icon，零运行时副作用。
- core 复用：仅 `useId`（为自定义 `<title>` 生成稳定 id，关联 `aria-labelledby`）。`useFocusTrap/useRovingTabindex/useDismiss/useScrollLock/useLiveAnnouncer` 均不涉及。
- 主题：消费 Alias token 与 Component 级 `--cd-icon-*`，组件内不写死任何尺寸/颜色字面值。

## 4. API

### Props

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `size` | `'extra-small' \| 'small' \| 'default' \| 'large' \| 'extra-large' \| number` | `'default'` | 尺寸枚举或像素数值，映射到 `--cd-icon-size-*`。 |
| `spin` | `boolean` | `false` | 持续旋转，用于 loading。受 reduced-motion 抑制。 |
| `rotate` | `number` | `0` | 静态旋转角度（deg）。 |
| `status` | `'default' \| 'warning' \| 'error' \| 'success' \| 'info'` | `'default'` | 语义状态色；`default` 继承 `currentColor`。 |
| `color` | `string` | `undefined` | 显式覆盖颜色（建议传 token 变量，如 `var(--cd-color-primary)`），优先级高于 `status`。 |
| `svg` | `string` | `undefined` | 直接传入 SVG 字符串（内部 `@html`，构建期已 SVGO 净化）。 |
| `component` | `ComponentType` | `undefined` | 传入一个 Svelte 图标组件作为渲染源（与 slot 二选一）。 |
| `label` | `string` | `undefined` | 语义图标的可访问名称。提供后 `role="img"`；缺省则视为装饰性，`aria-hidden="true"`。 |
| `class` | `string` | `''` | 透传到根元素的附加类名。 |
| `style` | `string` | `''` | 透传内联样式。 |

### Events

| 名称 | payload | 说明 |
|------|---------|------|
| —    | —       | Icon 为纯展示组件，**不定义任何对外事件**。点击交互请用外层 Button 或可聚焦容器承载，避免给非交互元素绑定 `on:click` 造成 a11y 反模式。原生事件可通过 `$$restProps` 透传至根 `<span>`（如外层确需 `on:click`，由消费方自担键盘可达性责任）。 |

### Slots

| 名称 | 作用域 props | 说明 |
|------|--------------|------|
| `default` | — | 自定义图标内容（直接放 `<svg>` / `<img>` / `<path>`）。与 `svg`/`component` 互斥，slot 优先。 |
| `title` | — | 可选，提供 `<title>` 文本节点；存在时自动生成 id 并 `aria-labelledby` 关联（等价于 `label`，适合需富文本/翻译插值场景）。 |

## 5. 主题 / Token 表

组件仅消费 Alias / Component 级 token，禁止字面值。

| Component Token | 默认引用（Alias/Global） | 用途 |
|-----------------|--------------------------|------|
| `--cd-icon-size-extra-small` | `12px`（Global 尺寸刻度） | extra-small 边长 |
| `--cd-icon-size-small` | `14px` | small 边长 |
| `--cd-icon-size-default` | `16px` | default 边长 |
| `--cd-icon-size-large` | `20px` | large 边长 |
| `--cd-icon-size-extra-large` | `24px` | extra-large 边长 |
| `--cd-icon-color` | `currentColor` | 默认填充色 |
| `--cd-icon-color-warning` | `var(--cd-color-warning)` | warning 状态色 |
| `--cd-icon-color-error` | `var(--cd-color-danger)` | error 状态色 |
| `--cd-icon-color-success` | `var(--cd-color-success)` | success 状态色 |
| `--cd-icon-color-info` | `var(--cd-color-info)` | info 状态色 |
| `--cd-icon-spin-duration` | `1s` | spin 动画周期 |
| `--cd-icon-spin-timing` | `linear` | spin 缓动 |

类名：根 `.cd-icon`，修饰 `.cd-icon--spin`、`.cd-icon--<size>`、`.cd-icon--status-<status>`。所有 `fill`/`stroke` 默认 `currentColor`，由 `color` 决定。暗色模式无需特殊处理（继承文本色 + 语义色已含主题切换）。

## 6. 无障碍

遵循 WCAG 2.1 AA。Icon 分两类处理：

- **装饰性图标（无 `label`/无 `title` slot）**：根元素 `aria-hidden="true"`，内部 `<svg>` 设 `focusable="false"`，对辅助技术完全透明，避免重复朗读（典型：Button 内文字旁的图标）。
- **语义图标（有 `label` 或 `title` slot）**：根元素 `role="img"`；`label` → `aria-label`；`title` slot → 生成 `<title id={useId()}>` 并 `aria-labelledby` 指向它。二者不应同时使用，同时存在时 `aria-labelledby` 优先。

其他要点：

- **对比度**：作为信息载体的语义图标需对背景满足 ≥3:1（WCAG 1.4.11 非文本对比度）；status 语义色 token 已按此校准。装饰性图标不强制。
- **reduced-motion**：`@media (prefers-reduced-motion: reduce)` 下禁用 `spin` 动画（`animation: none`），保持静态以免前庭不适。
- **RTL**：方向性图标（箭头、返回、列表缩进等）在 `[dir="rtl"]` 下需水平镜像，由 `@chenzy-design/icons` 标注 `directional` 元数据，容器加 `.cd-icon--flip-rtl` 应用 `transform: scaleX(-1)`；非方向性图标不翻转。
- **焦点管理**：Icon 本身不可聚焦，不进入 tab 序列；不承担焦点逻辑。
- 不依赖颜色单独传达含义（status 色须配合形状/文案，符合 1.4.1）。

## 7. 国际化

Icon 自身几乎无内置可见文案。涉及 i18n 的点：

| i18n key | 用途 |
|----------|------|
| `Icon.loading` | `spin` 用于 loading 时，若由消费方提供可访问名称的兜底文案（如未传 `label`）。 |

约定：

- 用户可见的 `label`/`title` 文案**由消费方传入已翻译字符串**，Icon 不硬编码任何语言文本。
- `@chenzy-design/icons` 的每个内置图标导出建议附带默认 i18n key（如 `Icon.search`、`Icon.close`），供需要语义朗读时引用，仍允许 `label` 覆盖。
- 无日期/数字格式化需求（不涉及 Intl）。
- RTL 镜像见第 6 节，属 i18n 关联的视觉方向处理。

## 8. 文案

- Icon 本身不产出业务文案；`label` 应为简洁名词/动作短语（如「搜索」「关闭」「加载中」），遵循 content-guidelines：动词优先、不带句号、首字母按语言习惯。
- loading 态可访问名称建议「加载中」而非「请稍候」，与全局 Spin/Button loading 文案一致。
- **危险操作文案**：当 Icon 作为危险动作的视觉提示（如删除 trash 图标 + `status="error"`），图标本身不承载确认文案；危险确认语句由外层 Button/Popconfirm 提供，Icon 仅提供 `label`（如「删除」），不得用图标替代明确的危险动作说明。

## 9. 性能（Perf Budget）

| 项 | 预算 | 说明 |
|----|------|------|
| `Icon.svelte` gzip | ≤ 1.2 KB | 容器组件运行时，无外部依赖。 |
| 单个内置图标 gzip | ≤ 0.4 KB | 优化后 SVG path + 极薄 wrapper，tree-shakable。 |
| `@chenzy-design/icons` 全量 | 不约束总量 | 必须按需引入；禁止 barrel 全量打包进产物（提供 ESM named export + sideEffects:false）。 |
| 首次渲染 | < 0.1ms/个 | 纯 SVG 输出，无布局抖动。 |
| 列表大量图标（>500） | 由消费方虚拟化 | Icon 不内建虚拟化；表格/长列表场景由父容器虚拟滚动。 |

性能策略：

- **无虚拟化/无惰性渲染/无 destroyOnClose**：纯展示、即挂即显。
- `svg` 字符串走构建期 SVGO，运行时 `@html` 不做净化（信任构建产物）；用户传入的运行时 `svg` 需自行确保可信。
- `spin` 用 CSS `@keyframes` + `transform`（GPU 合成层），不触发重排。
- 图标资产生成期去重 viewBox/attribute，压缩 path。

## 10. AI 元数据

提供 `component.meta.ts`，内容要点：

```ts
export default {
  name: 'Icon',
  category: 'basic',
  stage: 'M1',
  pkg: { core: null, svelte: '@chenzy-design/svelte', assets: '@chenzy-design/icons' },
  headless: false,
  semioCounterpart: 'Icon',
  a11y: { decorativeDefault: true, role: 'img-when-labeled', reducedMotion: true, rtlMirror: true },
  props: ['size', 'spin', 'rotate', 'status', 'color', 'svg', 'component', 'label', 'class', 'style'],
  events: [],
  slots: ['default', 'title'],
  tokens: ['--cd-icon-size-*', '--cd-icon-color', '--cd-icon-color-{warning|error|success|info}', '--cd-icon-spin-duration', '--cd-icon-spin-timing'],
  i18nKeys: ['Icon.loading'],
  usageHints: [
    '装饰图标省略 label（自动 aria-hidden）；语义图标必须传 label 或 title slot',
    '点击交互用外层 Button，勿给 Icon 绑 on:click',
    'loading 用 spin，颜色用 status/color 而非内联 hex',
  ],
  antiPatterns: ['给 Icon 直接绑 on:click 作为按钮', '写死 width/height/hex 而不用 size/token', 'barrel 全量引入 icons 包'],
} satisfies ComponentMeta;
```

## 11. 测试

- **单元（Vitest）**：size 枚举→token class 映射；`size` 数字→内联 px；`status` → 对应 class/颜色 token；`color` 优先级高于 `status`；`rotate` 输出 transform；`spin` 加 `--spin` class。
- **a11y（vitest-axe / Testing Library）**：无 `label` 时根元素 `aria-hidden="true"` 且 `svg focusable="false"`；有 `label` 时 `role="img"` + `aria-label`；`title` slot 生成唯一 id 并 `aria-labelledby` 关联；axe 零违规。
- **slot/源互斥**：slot 优先于 `svg` 优先于 `component`；`@html` 净化路径（构建期 SVGO 快照）。
- **reduced-motion**：模拟 `prefers-reduced-motion: reduce` 下 `spin` 动画为 none。
- **RTL**：`directional` 图标在 `dir="rtl"` 下加 `--flip-rtl`；非方向图标不翻转。
- **视觉回归（Playwright/快照）**：五档 size 基线对齐、spin 帧、status 五色、暗色模式。
- **tree-shaking**：构建产物校验仅引入的图标进入 bundle（size-limit / 打包快照）。

## 12. 验收标准 checklist

- [ ] 五档 `size` 枚举与数字均正确映射，与 Button/Input 文本基线对齐。
- [ ] 默认 `currentColor` 继承父文本色；`status`/`color` 覆盖生效且 `color` 优先级最高。
- [ ] 所有尺寸/颜色均走 token，无任何字面 px/hex（lint 校验通过）。
- [ ] 装饰图标默认 `aria-hidden="true"` + `focusable="false"`；语义图标 `role="img"` + `aria-label`/`aria-labelledby` 正确。
- [ ] `title` slot 生成唯一 id（useId）并正确关联，axe 零违规。
- [ ] `spin` 正常旋转且在 reduced-motion 下停用；`rotate` 静态角度生效。
- [ ] 方向性图标在 RTL 下镜像，非方向性不翻转。
- [ ] `@chenzy-design/icons` 按需引入、tree-shaking 生效，`sideEffects:false`。
- [ ] Perf Budget 达标：`Icon.svelte` ≤1.2KB gzip，单图标 ≤0.4KB gzip。
- [ ] 提供 `component.meta.ts`，字段完整可被 AI 消费。
- [ ] i18n：无任何硬编码可见文案，`label`/`title` 由消费方注入。
- [ ] 单元 / a11y / RTL / reduced-motion / 视觉回归 / tree-shaking 测试全部通过。
