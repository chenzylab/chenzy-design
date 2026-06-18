# SPEC · Steps
> 分类：navigation · 阶段：M3
> 对标 Semi：Steps

## 1. 概述

Steps（步骤条）用于引导用户按照预设的流程逐步完成任务，常见于注册引导、订单流程、表单分步提交、向导式配置等场景。它把一个复杂任务拆分为若干阶段，向用户清晰展示「当前在哪一步、已完成哪些步、还剩哪些步」。

核心能力（对标 Semi Steps）：
- 方向：水平（horizontal）/ 垂直（vertical）布局。
- 类型：fill（默认填充图标）/ basic（基础线框）/ nav（导航式，整块可点击）/ 点状 dot（仅圆点，弱化标题适合紧凑流程）。
- 单步状态：wait（未开始）/ process（进行中）/ finish（已完成）/ error / warning。
- 内容：标题（title）、描述（description）、自定义图标 / 序号、可选可点击（onChange 切换）。
- 自适应：步骤数量与容器宽度自适应，连接线在已完成段落高亮。

它本身不管理业务流转逻辑，仅负责「当前步索引 + 各步状态」的展示与可选的点击切换；与 Form / Wizard 等容器组件组合使用。

## 2. 设计语义

- **进度可视化**：当前步（process）使用 `--cd-color-primary`，已完成步（finish）使用主色 + 勾选图标，未开始（wait）使用 `--cd-color-text-2`/弱化前景，连接线在「已完成区段」着主色、其余着 `--cd-color-border`。
- **状态语义色**：error 用 `--cd-color-danger`、warning 用 `--cd-color-warning`，图标随之切换为感叹号/叉号，与文字颜色一致，确保单凭颜色之外仍有形状区分（a11y）。
- **节奏与留白**：步骤图标尺寸 / 连接线粗细 / 间距全部走 token，dot 类型采用更小的圆点（8px 级）与更紧凑的间距。
- **层级**：title 为主信息（`--cd-color-text-0`），description 为次要信息（`--cd-color-text-2`，字号更小）。
- **可点击反馈**：当步骤可点击（nav 类型或显式 clickable）时，hover/focus 提供背景或下划线反馈，光标 pointer；不可点击步骤无交互态。
- **方向语义**：horizontal 下连接线水平、文本居图标下方或右侧；vertical 下连接线竖直、文本恒在图标右侧，适合步骤含长描述的场景。

## 3. 分层实现

属于「半交互」组件：nav/clickable 模式有键盘与焦点逻辑，因此抽 headless 到 core；纯展示模式渲染极薄。

- **@chenzy-design/core · createSteps**
  - 入参：`{ current, status, type, direction, clickableResolver }`，输出每一步派生状态 `getStepState(index) => wait|process|finish|error|warning`（根据 current 与传入 status 计算）。
  - 交互原语：可点击场景复用 `useRovingTabindex`（一组步骤共享一个 tab stop，方向键在步骤间移动焦点，与 direction 对应 Left/Right 或 Up/Down），`useId` 生成 step / aria 关联 id。
  - 提供 `onStepActivate(index)`：触发 change 事件前判断该步是否 clickable。
  - 不依赖 useFocusTrap/useScrollLock/useDismiss（非浮层）；不需要 useLiveAnnouncer（进度变化由 aria-current 静态表达，避免冗余播报）。
- **@chenzy-design/svelte · Steps / Steps.Step**
  - `Steps` 渲染容器（`<ol role="list">` 语义或 nav 模式下 `<nav>`），遍历 children 计算位置（首/中/尾，控制连接线渲染），消费 core 的派生状态。
  - `Step` 渲染单个节点：图标插槽 / 序号、title、description、尾随连接线。
  - 支持两种用法：声明式 `<Steps><Steps.Step .../></Steps>` 与数据式 `<Steps steps={[...]}/>`。

## 4. API

### Props — Steps

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `current` | `number` | `0` | 当前步索引（受控）。配合 `on:change` 实现可点击切换 |
| `defaultCurrent` | `number` | `0` | 非受控初始当前步 |
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | 布局方向 |
| `type` | `'fill' \| 'basic' \| 'nav'` | `'fill'` | 步骤条类型 |
| `dot` | `boolean` | `false` | 点状步骤条（覆盖图标，弱化标题区） |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | 尺寸，影响图标与字号 |
| `status` | `'process' \| 'finish' \| 'error' \| 'warning'` | `'process'` | 当前步（current）所处状态，影响其图标与配色 |
| `steps` | `StepItem[]` | `—` | 数据式声明，等价于一组 `Steps.Step`；与 slot 二选一 |
| `clickable` | `boolean` | `type==='nav'` | 是否允许点击切换步骤（默认仅 nav 开启） |
| `initial` | `number` | `0` | 起始序号偏移（序号从 initial 开始计数） |
| `class` | `string` | `—` | 透传根节点类名 |

### Props — Steps.Step / StepItem

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `title` | `string` | `—` | 步骤标题 |
| `description` | `string` | `—` | 步骤描述（次要信息） |
| `status` | `'wait' \| 'process' \| 'finish' \| 'error' \| 'warning'` | `—` | 显式覆盖该步状态；不传时由 `current` 推断 |
| `icon` | `string \| Component` | `—` | 自定义图标，覆盖默认序号/勾选 |
| `disabled` | `boolean` | `false` | 禁用该步（不可点击、置灰） |

### Events — Steps

| 名称 | 载荷 (detail) | 触发时机 |
| --- | --- | --- |
| `change` | `{ current: number, previous: number }` | 用户点击可点击步骤（clickable/nav）切换当前步时。受控场景需据此回写 `current` |

### Slots

| 名称 | 作用域参数 | 说明 |
| --- | --- | --- |
| `default` | `—` | 放置 `Steps.Step` 子组件（声明式用法） |
| `icon`（Step） | `{ index, status }` | 自定义单步图标，覆盖序号/勾选 |
| `title`（Step） | `{ index, status }` | 自定义标题内容 |
| `description`（Step） | `{ index, status }` | 自定义描述内容 |

## 5. 主题 / Token 表

组件仅消费 Alias / Component 级 token，禁止写死值。

| Component Token | 引用 Alias / 计算 | 用途 |
| --- | --- | --- |
| `--cd-steps-icon-size` | global → `28px`(default) / `24px`(small) / `32px`(large) | 步骤图标直径 |
| `--cd-steps-dot-size` | global → `8px` | dot 类型圆点直径 |
| `--cd-steps-line-width` | global → `2px` | 连接线粗细 |
| `--cd-steps-gap` | global → `--cd-spacing-loose` | 步骤间距 |
| `--cd-steps-color-process` | `--cd-color-primary` | 进行中步图标背景/边框 |
| `--cd-steps-color-finish` | `--cd-color-primary` | 已完成步图标/连接线高亮 |
| `--cd-steps-color-wait-fg` | `--cd-color-text-2` | 未开始步前景 |
| `--cd-steps-color-wait-bg` | `--cd-color-bg-0` | 未开始步图标底色 |
| `--cd-steps-color-line` | `--cd-color-border` | 未完成连接线 |
| `--cd-steps-color-error` | `--cd-color-danger` | error 步图标与文字 |
| `--cd-steps-color-warning` | `--cd-color-warning` | warning 步图标与文字 |
| `--cd-steps-title-color` | `--cd-color-text-0` | 标题文字 |
| `--cd-steps-desc-color` | `--cd-color-text-2` | 描述文字 |
| `--cd-steps-clickable-hover-bg` | `--cd-color-fill-0` | nav/可点击步 hover 背景 |

对比度：finish/process 图标内的勾选/序号与主色背景需 ≥ 4.5:1（白前景 + 主色背景已满足）；wait 文字与背景 ≥ 4.5:1。

## 6. 无障碍

遵循 WAI-ARIA APG，Steps 表达「进度」语义而非 tablist（步骤通常不立即切换面板内容）。

- **结构 role**：容器用 `<ol class="cd-steps" role="list">`（nav 类型外层包 `<nav aria-label>`）；每步 `<li role="listitem">`。
- **当前步**：当前步节点设 `aria-current="step"`，使屏幕阅读器明确朗读「当前步骤」。
- **状态可感知**：每步状态通过可见图标 + 视觉隐藏文本（`.cd-sr-only`）双重表达，如「步骤 2，共 4 步，已完成 / 进行中 / 错误」，颜色非唯一信息载体。
- **可点击步骤**：clickable 时该步为 `role="button"` 或包裹 `<button>`，键盘可达；不可点击/disabled 步 `aria-disabled="true"` 且不可聚焦。
- **键盘交互**（clickable/nav，roving tabindex）：
  - `Tab`：进入/离开整组（组内单一 tab stop）。
  - `Left/Right`（horizontal）或 `Up/Down`（vertical）：在可点击步骤间移动焦点（跳过 disabled）。
  - `Home/End`：移动到第一个/最后一个可点击步。
  - `Enter/Space`：激活当前聚焦步，触发 `change`。
- **焦点管理**：焦点环用 `:focus-visible`，对比度 ≥ 3:1；切换 current 后不强行移动焦点（避免打断）。
- **reduced-motion**：连接线进度填充 / 图标过渡在 `prefers-reduced-motion: reduce` 下禁用动画，直接切换终态。
- **RTL**：`dir="rtl"` 下水平方向连接线与序号顺序镜像，方向键 Left/Right 语义随之对调，icon 右侧文本变左侧。

## 7. 国际化

用户可见文案零硬编码，通过 i18n 提供（默认值在 messages 包中）。序号与「共 N 步」用 `Intl.NumberFormat` 按 locale 格式化。

| i18n key | 默认值 (zh) | 说明 |
| --- | --- | --- |
| `Steps.stepLabel` | `步骤 {index}` | 视觉隐藏的步骤序号标签 |
| `Steps.ofTotal` | `，共 {total} 步` | 总数后缀，拼接为完整朗读文本 |
| `Steps.statusWait` | `未开始` | wait 状态朗读 |
| `Steps.statusProcess` | `进行中` | process 状态朗读 |
| `Steps.statusFinish` | `已完成` | finish 状态朗读 |
| `Steps.statusError` | `错误` | error 状态朗读 |
| `Steps.statusWarning` | `警告` | warning 状态朗读 |
| `Steps.navAriaLabel` | `步骤导航` | nav 类型外层 `<nav>` 的 aria-label |

朗读组合示例：`Steps.stepLabel(2) + Steps.ofTotal(4) + Steps.statusFinish` → 「步骤 2，共 4 步，已完成」。

## 8. 文案

遵循 content-guidelines：

- **标题**：简短动宾或名词短语，建议 ≤ 6 字，如「填写信息」「确认订单」「完成」，平行结构、时态一致。
- **描述**：补充说明该步要做什么，一句话，句末不加句号（除非多句）。
- **状态文案**：error/warning 步的描述应说明问题与下一步动作，如「身份证号格式有误，请检查后重试」，而非仅「错误」。
- **避免**：标题里混用编号（序号已由组件提供）、描述堆砌冗长说明。

**危险操作文案（单列）**：Steps 自身不触发危险操作；当某步代表不可逆动作（如「提交并扣款」），其 title/description 须明确后果，且实际确认交由对应表单按钮或 Modal 处理，Steps 不承担确认职责。

## 9. 性能

| 指标 | 预算 / 说明 |
| --- | --- |
| svelte 组件 gzip | ≤ 3.5 KB（含 Step 子组件，不含图标资源） |
| core createSteps gzip | ≤ 1.2 KB（仅 clickable/nav 引入 roving 原语时计入） |
| 首次渲染 (10 步) | < 4ms，纯 DOM、无测量布局抖动 |
| 状态切换重渲染 | O(变化步数)，仅受影响步与相邻连接线更新，非整列重排 |
| 方向键导航响应 | < 16ms（单帧内完成焦点移动） |

性能策略：
- **无需虚拟化**：步骤数典型 < 20，全量渲染即可；超长流程建议改用其他模式而非虚拟化 Steps。
- **无浮层**，不涉及 destroyOnClose / 惰性渲染。
- 连接线高亮通过 CSS（基于 step 派生状态的 class），不在 JS 中逐帧计算宽度。
- 图标按需：勾选/感叹/叉号图标 tree-shake，仅用到的打入包。

## 10. AI 元数据

提供 `component.meta.ts`，供 AI / 低代码消费：

```ts
export const meta = {
  name: 'Steps',
  category: 'navigation',
  stage: 'M3',
  semiEquivalent: 'Steps',
  capabilities: ['horizontal', 'vertical', 'dot', 'nav', 'clickable', 'status-states'],
  props: ['current', 'direction', 'type', 'dot', 'size', 'status', 'steps', 'clickable', 'initial'],
  events: ['change'],
  slots: ['default', 'icon', 'title', 'description'],
  a11y: { pattern: 'progress-indicator', roving: true, ariaCurrent: 'step' },
  i18nKeys: ['Steps.stepLabel', 'Steps.ofTotal', 'Steps.statusWait', 'Steps.statusProcess', 'Steps.statusFinish', 'Steps.statusError', 'Steps.statusWarning', 'Steps.navAriaLabel'],
  tokensPrefix: '--cd-steps-',
  whenToUse: '将多步骤任务流程可视化，展示进度与各步状态；需切换面板内容请用 Tabs',
  antiPatterns: ['用作 Tabs 切换内容面板', '步骤数 > 20 仍用横向布局'],
}
```

## 11. 测试

- **单元（core createSteps）**：`getStepState` 在不同 `current`/显式 `status` 组合下返回正确派生状态；clickable 解析；roving 焦点索引在 disabled 步跳过的正确性。
- **组件渲染**：horizontal/vertical、fill/basic/nav、dot 各组合快照；首/中/尾步连接线渲染与高亮区段正确。
- **交互**：点击可点击步触发 `change` 且 detail 含 current/previous；disabled 步点击/聚焦无响应；受控不回写时 current 不变。
- **键盘**：Left/Right（及 RTL 对调）、Up/Down（vertical）、Home/End、Enter/Space 行为；Tab 仅单一 tab stop。
- **a11y（axe）**：role/aria-current/aria-disabled 正确，无颜色单一依赖（视觉隐藏文本存在）；focus-visible 对比度。
- **i18n**：缺省 locale 回退、序号 Intl 格式化、朗读文本拼接正确。
- **视觉回归**：各 size / 各 status 配色、reduced-motion 关闭动画、RTL 镜像。

## 12. 验收标准 checklist

- [ ] 支持 horizontal / vertical 两方向，布局与连接线方向正确。
- [ ] 支持 fill / basic / nav 类型及 dot 点状模式。
- [ ] 支持 wait/process/finish/error/warning 五状态，颜色 + 图标双重表达。
- [ ] `current` 受控 + `defaultCurrent` 非受控；`on:change` 携带 `{current, previous}`。
- [ ] 声明式 `<Steps.Step>` 与数据式 `steps` 两种用法等价可用。
- [ ] clickable/nav 下完整键盘可达（方向键 / Home / End / Enter / Space）+ roving tabindex 单 tab stop。
- [ ] disabled 步不可点击不可聚焦，`aria-disabled` 正确。
- [ ] 当前步 `aria-current="step"`，每步含视觉隐藏的「步骤 X，共 N 步，状态」朗读文本。
- [ ] 全部颜色 / 尺寸 / 间距走 `--cd-steps-*` 及 Alias token，无写死值；对比度 ≥ AA。
- [ ] 用户可见文案全部走 i18n key，序号用 Intl 格式化；支持 RTL 镜像与方向键对调。
- [ ] `prefers-reduced-motion` 下禁用过渡动画。
- [ ] 提供 `component.meta.ts`；headless 逻辑位于 `@chenzy-design/core` 的 `createSteps`，渲染位于 `@chenzy-design/svelte`。
- [ ] gzip 体积满足 Perf Budget（svelte ≤ 3.5 KB，core ≤ 1.2 KB）。
- [ ] 单元 / 组件 / 交互 / 键盘 / axe / i18n / 视觉回归测试齐全且通过。
