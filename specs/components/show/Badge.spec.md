# SPEC · Badge
> 分类：show · 阶段：M4
> 对标 Semi：Badge

## 1. 概述

Badge（徽标）用于在宿主元素（图标、头像、按钮等）的角标位置展示提示：数字计数、红点（dot）、或自定义节点。典型场景包括消息计数、未读提醒、新功能标记。

核心能力：
- **数字徽标**：展示 `count` 数值/字符串；数值超过 `overflowCount` 时显示溢出格式（如 `99+`）。
- **红点（dot）**：不展示具体数值，仅以小圆点表示存在提醒，优先级高于 `count`。
- **自定义内容**：`count` 传入 Snippet（节点）时直接渲染该节点，不套用 `type`/`theme` 语义样式。
- **定位**：相对宿主元素四角定位（`position`：`leftTop`/`leftBottom`/`rightTop`/`rightBottom`，默认 `rightTop`）。
- **独立使用**：省略 `children`（宿主）时，徽标以 `static` 定位独立展示。

Badge 本质是纯展示组件，无键盘交互、无浮层、无受控状态，**不需要 @chenzy-design/core 的 headless 逻辑**。

非目标：Badge 不提供 status 独立状态指示器、不提供 `showZero`/`offset` 等 Semi 没有的能力、不提供点击行为的语义（`onClick`/`onMouseEnter`/`onMouseLeave` 仅做事件透传，交互逻辑由宿主/调用方决定）。

## 2. 设计语义

- **角标定位**：徽标绝对定位于宿主包裹盒（`position: relative` 的 `.cd-badge`）四角，用**物理属性** `top`/`right`/`bottom`/`left`（对齐 Semi，非逻辑属性 `inset-inline-*`），配合 `transform: translate(±50%, ±50%)` 使徽标中心落在宿主角点上。默认 `position` 为 `rightTop`；`direction === 'rtl'` 时默认值切换为 `leftTop`（读 `ConfigContext.current.direction`，对齐 Semi `defaultPosition` 逻辑）——用户显式传入的 `position` 不受 `direction` 影响，按物理方向原样渲染，不做 CSS 镜像。
- **数字徽标**（`.cd-badge-count`）：圆角胶囊，高度/最小宽度 `--cd-height-badge-count`（18px），单数字时为正圆，多字符横向 padding 扩展（`--cd-spacing-badge-count-paddingx` 4px）。背景 `--cd-color-badge-default-bg-default`，描边 `--cd-width-badge-border`（1px）+ `--cd-color-badge-default-border-default`，文字色 `--cd-color-badge-default-text-default`（继承默认值，随 `type`/`theme` 组合被下方规则覆盖）。
- **dot 红点**（`.cd-badge-dot`）：直径 `--cd-width-badge-dot`/`--cd-height-badge-dot`（8px），圆角 `--cd-radius-badge-dot`，无文字，同样带 1px 描边。
- **溢出**：`count` 为 number 且 `overflowCount && overflowCount < count` 时渲染 `${overflowCount}+`，否则渲染 `${count}`；`count` 为 string 时原样展示；为 Snippet 时直接渲染（custom 形态，套用 `.cd-badge-custom`，`display: flex`，不叠加 `type`/`theme` class）。
- **type × theme 矩阵**：`type`（`primary`/`secondary`/`tertiary`/`danger`/`warning`/`success`）× `theme`（`solid`/`light`/`inverted`）共 18 种组合：
  - `solid`：`background-color` 取对应语义色（如 `--cd-color-badge-primary-solid-bg-default`），文字色不额外设置，继承 `.cd-badge-count` 的默认文字色（`--cd-color-badge-default-text-default`，随主题反色，不写死白色）。
  - `light`：浅色背景 + 同色系文字（如 `--cd-color-badge-primary-light-bg-default` + `--cd-color-badge-primary-light-text-default`）。
  - `inverted`：不设背景，仅文字着色（如 `--cd-color-badge-primary-inverted-text-default`），用于在有色背景上展示。
- **独立使用**（无 `children`）：`.cd-badge-block`，`position: static`，`display: inline-block`，不做绝对定位角标。
- **RTL**：`.cd-badge` 在 `.cd-rtl` 祖先下设置 `direction: rtl`（纯文本方向声明，不影响绝对定位的物理 `left`/`right` 计算），配合上述默认 `position` 切换共同实现镜像效果。

## 3. 分层实现

Badge 为**纯展示组件**，无交互逻辑，**省略 @chenzy-design/core 的 createBadge**，也不引入 `useId`/`useLiveAnnouncer` 等 core 原语（当前实现未消费）。

- **@chenzy-design/svelte**：`Badge.svelte` 单文件全部实现（内容格式化、class 组合、默认 position 派生）。对齐 Semi：Semi Badge 同样是单文件（`packages/semi-ui/badge/index.tsx`），不做多文件拆分。
- 定位/溢出/显隐均为 `$derived`/`$derived.by` 纯派生（无状态机），不引入 roving/focus-trap/dismiss/scroll-lock 等。
- 默认 `position` 通过 `getContext(CONFIG_CONTEXT_KEY)` 读取 `direction`，对齐 Semi `ConfigContext` 消费方式（`static contextType = ConfigContext`）。
- SSR 安全：不读取 DOM 尺寸，定位纯 CSS 绝对定位 + token，无客户端测量，首屏无闪烁。

## 4. API

### Props

> 本表由 `packages/svelte/src/badge/meta.ts` 真源生成，与 Semi `BadgeProps` 一一对应（`countClassName`→`countClass`、`className`→`class` 为 Svelte 化改名，其余同名）。

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| count | `number\|string\|Snippet` | `undefined` | 徽标内容；数字/字符串按 overflowCount 处理，Snippet 时直接渲染（custom） |
| dot | `boolean` | `false` | 显示小圆点，优先于 count |
| type | `'primary'\|'secondary'\|'tertiary'\|'danger'\|'warning'\|'success'` | `'primary'` | 徽标类型（语义色） |
| theme | `'solid'\|'light'\|'inverted'` | `'solid'` | 徽标主题 |
| position | `'leftTop'\|'leftBottom'\|'rightTop'\|'rightBottom'` | `'rightTop'`（RTL 下 `'leftTop'`） | 徽标位置 |
| overflowCount | `number` | `undefined` | 超出显示 `{n}+` |
| countStyle | `string` | `undefined` | 徽标内容区域样式（等价 Semi countStyle） |
| countClass | `string` | `undefined` | 徽标内容区域类名（等价 Semi countClassName） |
| style | `string` | `undefined` | 徽标内容区域内联样式，优先于 countStyle（对齐 Semi `style || countStyle`） |
| class | `string` | `undefined` | 根节点类名 |
| onClick | `(e: MouseEvent) => void` | `undefined` | 点击事件 |
| onMouseEnter | `(e: MouseEvent) => void` | `undefined` | 鼠标移入事件 |
| onMouseLeave | `(e: MouseEvent) => void` | `undefined` | 鼠标移出事件 |
| children | `Snippet` | `undefined` | 宿主子元素；省略时独立使用（block 形态） |

> Badge 无受控显隐、无 `showZero`/`offset`/`status` 等 Semi 没有的能力，不予实现。

### Events

> 本组件无独立事件回调（`meta.events` 为空）；`onClick`/`onMouseEnter`/`onMouseLeave` 是原生 DOM 事件的 prop 化透传，非语义事件。

### Slots

| 名称 | 说明 |
|---|---|
| default（children） | 宿主子元素（被包裹的图标/头像/按钮等）；省略时走独立使用形态 |
| count | `count` 传 Snippet 时的自定义徽标内容，直接渲染，不套用 type/theme 样式 |

## 5. 主题 / Token

组件仅消费 Alias 与 Component 级 Token（`--cd-` 前缀），禁止写死值。以下为 `packages/svelte/src/badge/Badge.svelte` 实际消费的全部 token，1:1 镜像 Semi `packages/semi-foundation/badge/variables.scss`：

| Component Token | 取值（默认引用） | 说明 |
|---|---|---|
| `--cd-color-badge-default-border-default` | `var(--cd-color-bg-1)` | 描边色 - 默认 |
| `--cd-color-badge-default-bg-default` | `var(--cd-color-bg-1)` | 背景色 - 默认（dot/count 通用底色） |
| `--cd-color-badge-default-text-default` | `var(--cd-color-bg-2)` | 文字色 - 默认（solid 主题继承此值，随主题反色） |
| `--cd-color-badge-{type}-solid-bg-default` | 各语义色（如 `var(--cd-color-primary)`） | solid 主题背景（type 为 primary/secondary/tertiary/danger/warning/success） |
| `--cd-color-badge-{type}-light-bg-default` | 各语义浅色（如 `var(--cd-color-primary-light-default)`） | light 主题背景 |
| `--cd-color-badge-{type}-light-text-default` | 各语义色 | light 主题文字 |
| `--cd-color-badge-{type}-inverted-text-default` | 各语义色 | inverted 主题文字 |
| `--cd-width-badge-dot` / `--cd-height-badge-dot` | `8px` | 点状徽标宽高 |
| `--cd-radius-badge-dot` | `var(--cd-border-radius-circle)` | 点状徽标圆角 |
| `--cd-height-badge-count` | `18px` | 数字徽标高度/最小宽度 |
| `--cd-spacing-badge-count-paddingy` | `0px` | 数字徽标上下内边距 |
| `--cd-spacing-badge-count-paddingx` | `4px` | 数字徽标左右内边距 |
| `--cd-width-badge-border` | `1px` | 描边宽度 |
| `--cd-z-badge` | `1` | 徽标 z-index |

> `color-badge-default-light-bg-default`（`var(--cd-color-bg-2)`）与 `z-badge-light-bg`（`-1`）为原始层完整镜像 Semi 保留的两个 token；Semi `badge.scss` 自身也未消费这两个变量（Semi 自身的死变量），组件层同样不消费，属正常现象，非缺口。

- 组件同时消费全局字体原子 token：`--cd-font-size-small`、`--cd-line-height-small`、`--cd-font-weight-regular`（数字徽标文字排版），这些是跨组件共享的全局 token，不在上表 badge 专属清单中重复列出。
- 暗色模式：所有色值经 Alias 自动切换，组件不需额外适配；例如 `--cd-color-bg-2` 在 light 下为 `white`，dark 下为 `#35363c`，solid 主题文字色随之自动反色（不得写死 `--cd-color-white`）。

## 6. 无障碍（WCAG 2.1 AA）

Badge 非交互，归类为纯展示元素：

- Badge 本身不需要 `tabindex`，不进入 Tab 序列。
- 数字/字符串徽标以文本节点渲染，可被屏幕阅读器读出；宿主元素可自行通过 `aria-describedby` 关联徽标内容。
- 纯红点（dot）无数值语义，其含义应由宿主元素的文案承载；独立使用时建议在相邻文字中给出状态说明（见 demo「独立使用」中 `<Badge dot /> 进行中` 的写法）。
- 不以颜色为唯一信息通道，需同时通过文案或图标区分语义。
- 对比度：solid 徽标文字与背景应满足 AA（≥4.5:1）；token 层色值已按此校准。

## 7. 国际化

Badge 无内置 i18n 文案 key（对齐 Semi：Semi Badge 同样不消费 `Locale` context，无 `locale.badge.*` 命名空间）。`count` 为调用方直接传入的数字/字符串/节点，不经库内文案层；溢出格式化为纯字符串拼接 `` `${overflowCount}+` ``，不经 `Intl.NumberFormat`（Semi 亦如此，`overflowCount && overflowCount < count ? \`${overflowCount}+\` : \`${count}\``，无千分位/locale 处理）。

## 8. 文案

遵循 content-guidelines：

- Badge 内容若为英文时，首字母应大写（对齐 Semi md 文案规范，如 demo 中 `count='NEW'`）。
- 计数文本简洁，仅数字，无单位后缀（单位放宿主语境）。

**危险操作文案**：Badge 为只读展示，**不涉及危险操作**，无破坏性确认文案。`type=danger` 仅表示视觉强调（如错误计数），不得让其文案产生"点击即删除"等误导。

## 9. 性能（Perf Budget）

| 维度 | 预算 | 说明 |
|---|---|---|
| gzip 体积（svelte，单组件） | ≤ 2.5 KB | 纯展示，无状态机/无 core 依赖 |
| 共享 core 增量 | 0 | 不引入任何 core headless 原语 |
| 首次渲染 | < 0.3ms / 实例 | 纯 CSS 定位，无 DOM 测量 |
| count 更新 | 单文本节点更新，O(1) | 仅徽标文本变化，宿主不重渲染 |

- **不需要虚拟化**：单实例 DOM 极小（2 个 `<span>` 节点）。
- 溢出格式化为纯函数，按 `count`/`overflowCount` 派生（`$derived.by`），无副作用。
- 无进出场动画，无 CSS transition/animation。

## 10. AI 元数据

提供 `meta.ts`，内容包含：

- `name: 'Badge'`、`category: 'show'`。
- `props`/`events`/`slots`/`a11y`/`tokens`/`examples` 镜像本文档第 4/5/6 节真实实现范围。
- `a11y.note`：非交互、不进入 Tab 序，语义由宿主文案承载。

## 11. 测试

- **单元（vitest）**：
  - `count > overflowCount` 渲染 `${overflowCount}+`；边界 `count === overflowCount` 不溢出。
  - `dot=true` 仅渲染圆点、无文本，优先于 count。
  - `count` 为 Snippet 时走 custom 形态，不套用 type/theme class。
  - `type`/`theme` 组合映射正确的 class 组合。
  - 无 `children` 时走 block 形态（`position: static`）。
- **a11y（vitest-axe / testing-library）**：
  - 独立使用（block）形态渲染计数文本，axe 零违规。
  - overflow 场景文本正确，axe 零违规。
  - dot 场景仅圆点无文本，axe 零违规。
- **视觉回归（playwright + toMatchScreenshot）**：count/overflow/dot/type/theme 组合快照。
- **RTL**：`direction='rtl'` 时未显式传 `position` 的默认值应为 `leftTop`（组件层派生，非 CSS 镜像）。
- **SSR**：服务端渲染输出与客户端 hydrate 一致，无定位闪烁。

## 12. 验收标准 checklist

- [ ] Props/Events/Slots 与第 4 节一致，类型导出完整（含 `Snippet` 类型）。
- [ ] count 溢出、dot、custom（Snippet）、block（独立使用）四类分支行为正确，边界值覆盖。
- [ ] 仅消费 `--cd-` Alias/Component token，无写死颜色/尺寸（含 solid 主题文字色不得写死 `--cd-color-white`）。
- [ ] 类名遵循 `cd-badge` / `cd-badge-*` 单连字符约定（对齐 Semi，见 class-naming-convention.md）。
- [ ] 不引入 core headless、不引入 useId/useLiveAnnouncer 等未消费的 core 原语。
- [ ] 定位使用物理属性 `left`/`right`/`top`/`bottom`（非 `inset-inline-*`），RTL 通过组件层默认 position 切换实现，不做 CSS transform 镜像。
- [ ] a11y：Badge 不可聚焦、不进 Tab 序，axe 零违规。
- [ ] Perf：gzip ≤ 2.5KB；count 更新 O(1)；无 core 依赖增量。
- [ ] 提供 `meta.ts`，字段完整（props/slots/events/a11y/tokens/examples）且与真实实现同步。
- [ ] 单元 + a11y + 视觉回归 + SSR 测试齐全且通过。
- [ ] 无 Semi 没有的超集能力（status 独立指示器、showZero、offset 偏移、announce 播报、small 尺寸系统、动画过渡）。
