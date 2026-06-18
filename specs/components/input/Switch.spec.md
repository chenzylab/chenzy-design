# SPEC · Switch
> 分类：input · 阶段：M2
> 对标 Semi：Switch

## 1. 概述

Switch（开关）是一个二态切换控件，用于在「开 / 关」两个互斥状态之间即时切换，操作结果立即生效（与需要提交的 Checkbox 不同）。

适用场景：
- 即时生效的设置项（如「开启通知」「夜间模式」）。
- 表单中的布尔字段（配合 status 校验态）。
- 列表/表格行内的快捷开关（small 尺寸）。
- 异步切换：点击后向服务端确认结果期间展示 loading，避免重复点击。

不适用场景：需要确认提交后再生效的选择，应使用 Checkbox；多选项的单选应使用 Radio；超过两态的应使用 RadioGroup 或 Select。

核心能力：尺寸（small/default/large）、loading 异步态、带文字（开/关态内嵌文案或图标）、受控/非受控、禁用、校验态、自定义开关值（checkedValue/uncheckedValue）。

## 2. 设计语义

- **形态**：胶囊（pill）轨道 + 圆形滑块（handle）。轨道宽度约为高度的 1.8 倍，保证滑块滑动行程清晰可辨。
- **状态色**：
  - 关态轨道 = `--cd-color-fill-2`（中性填充），开态轨道 = `--cd-color-primary`。
  - 滑块恒为 `--cd-color-bg-0`（白底），保证在两态轨道上均有足够对比。
- **尺寸**（轨道高 / 滑块直径 / 行程，Token 化）：
  - small：高 16px / 滑块 12px / 内嵌文字仅图标。
  - default：高 22px / 滑块 18px。
  - large：高 28px / 滑块 24px。
- **动效**：滑块位移 + 轨道色渐变，`transform`/`background-color` 过渡 `--cd-motion-duration-fast`（约 150ms）`ease-out`。`prefers-reduced-motion` 下移除位移过渡，仅瞬时切换。
- **loading**：滑块中心叠加旋转 spinner，轨道保持当前态色但降低交互（pointer 锁定）。
- **带文字**：开/关态文案位于轨道内、与滑块相对的一侧（开态文字居左、关态居右）；文字过长时轨道自适应加宽。
- **校验态**：error/warning 时轨道描边 `--cd-color-danger` / `--cd-color-warning`，用于表单内联校验提示。
- **焦点**：键盘聚焦时滑块外环 2px focus ring（`--cd-color-focus`），不依赖颜色单独传达状态（开/关另有滑块位移 + 文字/图标）。

## 3. 分层实现

属于「有交互/键盘/a11y 逻辑」的组件，采用 core + svelte 双层。

- **@chenzy-design/core · `createSwitch`**（headless）
  - 维护 checked 状态（受控/非受控融合）、disabled、loading、size、status。
  - 暴露 `getRootProps()`（role/aria/tabindex/事件）、`getInputProps()`（隐藏原生 checkbox，用于表单提交与可访问性回退）、`getHandleProps()`。
  - 键盘逻辑：Space/Enter 切换，loading/disabled 时拦截。
  - 复用原语：`useId`（关联 label 与 aria-labelledby）、`useLiveAnnouncer`（可选：切换后播报新状态，受 announceOnChange 控制）。
  - 不消费 `useFocusTrap/useRovingTabindex/useDismiss/useScrollLock`（单一焦点控件，无浮层、无组）。
  - 切换逻辑：点击/键盘触发 → 计算 nextValue（checkedValue/uncheckedValue）→ 派发 onChange；若 loading 由外部控制，core 仅锁定本地交互不自动复位。
- **@chenzy-design/svelte · `Switch.svelte`**（渲染）
  - 绑定 core 返回的 props，渲染 `cd-switch` 结构，挂接过渡与 spinner。
  - 提供 `checkedText/uncheckedText` slot 与 `checkedChildren/uncheckedChildren` props。
  - 透传 `class`/`style`/`...$$restProps` 到根节点。

DOM 结构（BEM-like）：
```
button.cd-switch.cd-switch--<size>.cd-switch--checked?.cd-switch--disabled?.cd-switch--loading?.cd-switch--<status>
  span.cd-switch__handle
    span.cd-switch__loading (loading 时)
  span.cd-switch__text.cd-switch__text--checked
  span.cd-switch__text.cd-switch__text--unchecked
  input.cd-switch__native (visually-hidden, type=checkbox, 表单提交用)
```

## 4. API

### Props

| 名称 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| value | `boolean` | `false` | 受控开关态（约定 value + on:change）。绑定 `bind:value` 实现双向。 |
| defaultValue | `boolean` | `false` | 非受控初始态。 |
| checkedValue | `string \| number \| boolean` | `true` | 开态对应的实际值（用于表单提交与 onChange 回传）。 |
| uncheckedValue | `string \| number \| boolean` | `false` | 关态对应的实际值。 |
| size | `'small' \| 'default' \| 'large'` | `'default'` | 尺寸。 |
| status | `'default' \| 'warning' \| 'error'` | `'default'` | 校验态（注：约定为 default/warning/error）。 |
| disabled | `boolean` | `false` | 禁用，阻止交互与聚焦内交互。 |
| loading | `boolean` | `false` | 异步加载态，锁定交互并展示 spinner。 |
| checkedChildren | `string \| Snippet` | `undefined` | 开态内嵌文字/图标。 |
| uncheckedChildren | `string \| Snippet` | `undefined` | 关态内嵌文字/图标。 |
| name | `string` | `undefined` | 原生表单字段名（提交时使用）。 |
| required | `boolean` | `false` | 表单必填校验（须为开态）。 |
| ariaLabel | `string` | `undefined` | 无可见文本时的可访问名称。 |
| announceOnChange | `boolean` | `false` | 切换后是否用 live region 播报新状态。 |
| autofocus | `boolean` | `false` | 挂载后自动聚焦。 |

### Events

| 名称 | payload | 说明 |
|---|---|---|
| change | `{ value: boolean; nativeValue: string \| number \| boolean; event: Event }` | 状态变更（约定的受控事件）。nativeValue 为 checkedValue/uncheckedValue 映射结果。 |
| focus | `FocusEvent` | 获得焦点。 |
| blur | `FocusEvent` | 失去焦点。 |
| keydown | `KeyboardEvent` | 键盘按下（可用于自定义快捷键扩展）。 |

> 说明：本组件无浮层，故不提供 open/openChange。loading 由外部 props 控制，调用方在 change 回调内置 loading=true，请求结束后复位并按结果更新 value（典型异步开关模式）。

### Slots

| 名称 | props | 说明 |
|---|---|---|
| checked | — | 开态内嵌内容（优先级高于 checkedChildren）。 |
| unchecked | — | 关态内嵌内容（优先级高于 uncheckedChildren）。 |
| loading | — | 自定义 loading 指示器，替换默认 spinner。 |

## 5. 主题 / Token

组件仅消费 Alias 与 Component 级 Token，禁止写死值。

| Component Token | 回退 / 引用 Alias | 用途 |
|---|---|---|
| `--cd-switch-track-bg` | `--cd-color-fill-2` | 关态轨道背景 |
| `--cd-switch-track-bg-checked` | `--cd-color-primary` | 开态轨道背景 |
| `--cd-switch-track-bg-hover` | `--cd-color-fill-1` | 关态轨道 hover |
| `--cd-switch-track-bg-checked-hover` | `--cd-color-primary-hover` | 开态轨道 hover |
| `--cd-switch-handle-bg` | `--cd-color-bg-0` | 滑块背景 |
| `--cd-switch-text-color` | `--cd-color-text-0` | 内嵌文字色（开态，深底用反白时取 `--cd-color-text-light`） |
| `--cd-switch-disabled-opacity` | `0.4`（来自 Global `--cd-opacity-disabled`） | 禁用透明度 |
| `--cd-switch-focus-ring` | `--cd-color-focus` | 焦点环 |
| `--cd-switch-border-warning` | `--cd-color-warning` | warning 描边 |
| `--cd-switch-border-error` | `--cd-color-danger` | error 描边 |
| `--cd-switch-height-small` / `-default` / `-large` | `16px / 22px / 28px`（Global 尺寸阶） | 轨道高度 |
| `--cd-switch-handle-size-*` | 派生自 height | 滑块直径 |
| `--cd-switch-motion-duration` | `--cd-motion-duration-fast` | 过渡时长 |

暗色主题：通过 Alias 层切换自动适配，组件无需额外覆盖。

## 6. 无障碍（WCAG 2.1 AA）

- **role**：根元素用 `<button role="switch">`（APG Switch Pattern），优于 checkbox 角色以表达即时生效语义。
- **aria-***：
  - `aria-checked="true|false"`（loading 时维持当前态值，不使用 mixed）。
  - `aria-disabled="true"`（禁用时；同时移除 tabindex 内交互）。
  - `aria-busy="true"`（loading 时）。
  - `aria-label` / `aria-labelledby`（无可见文本时必填其一；与外部 Label 组件关联用 useId）。
  - `aria-invalid="true"`（status=error 时）。
- **键盘交互**：
  - `Space` / `Enter`：切换状态（loading/disabled 时无效）。
  - `Tab` / `Shift+Tab`：进出焦点。
- **焦点管理**：聚焦于根 button；2px focus ring 满足非文本对比 ≥ 3:1。
- **对比度**：开态 primary 轨道与白滑块、内嵌文字均需 ≥ 3:1（图形）/4.5:1（文字）；状态不仅靠颜色，还有滑块位移与文字/图标双重表达。
- **reduced-motion**：`prefers-reduced-motion: reduce` 时移除滑块位移与色渐变过渡。
- **RTL**：`[dir="rtl"]` 下开/关方向与文字侧镜像（滑块开态靠左、文字侧对调）。
- **隐藏原生 input**：`.cd-switch__native` 用 visually-hidden 而非 `display:none`，保证表单提交与辅助技术回退。

## 7. 国际化

- 用户可见文案零硬编码，全部走 i18n key。
- i18n keys：

| key | 默认（zh / en） | 用途 |
|---|---|---|
| `Switch.on` | 开 / On | 默认开态文字（未传 checkedChildren 且需文字时） |
| `Switch.off` | 关 / Off | 默认关态文字 |
| `Switch.loading` | 加载中 / Loading | loading 时的 aria 辅助文案 |
| `Switch.announceChecked` | 已开启 / Turned on | announceOnChange 播报（开） |
| `Switch.announceUnchecked` | 已关闭 / Turned off | announceOnChange 播报（关） |

- 无数字/日期格式化需求；若调用方在 children 中传入数值，由调用方用 `Intl.NumberFormat` 处理。
- RTL 语言下方向镜像见第 6 节。

## 8. 文案

- 遵循 content-guidelines：内嵌文字尽量短（建议 ≤ 2 个汉字 / 4 个字符），优先用图标承载语义，避免轨道无限加宽。
- 状态文案描述「状态」而非「动作」：用「开/关」而非「打开/点此关闭」。
- 校验提示文案不内置于 Switch 本身，由外层 FormField 承载（保持单一职责）。

危险操作文案（单列）：
- 当 Switch 控制破坏性/不可逆设置（如「关闭双重验证」「删除模式」）时，**不应**仅靠 Switch 即时生效，建议在 change 回调中触发 Modal.confirm 二次确认，确认前不更新 value。
- 二次确认文案需明确后果与对象，例如 key `Switch.dangerConfirm`（示例：「关闭双重验证将降低账户安全性，确认关闭？」），主操作按钮用具象动词「关闭」而非「确定」。

## 9. 性能（Perf Budget）

| 维度 | 预算 | 说明 |
|---|---|---|
| svelte 组件 gzip | ≤ 1.6 KB | 单组件，结构简单 |
| core `createSwitch` gzip | ≤ 1.0 KB | 含状态融合与键盘逻辑 |
| 首次渲染 | < 1ms | 单节点 + 滑块 |
| 切换交互 | 单帧内完成（< 16ms） | 仅 transform/background 过渡，走合成层 |
| 重渲染范围 | 仅自身 | 无子树、无列表 |

- 不需要虚拟化（非列表组件）。
- 不需要 destroyOnClose（无浮层）。
- 无惰性渲染需求；slot 内容随组件挂载渲染。
- 动效使用 `transform` 与 `background-color`，避免触发 layout/reflow。
- loading spinner 用 CSS 动画（非 JS），reduced-motion 下降级为静态指示。

## 10. AI 元数据

提供 `component.meta.ts`，内容包含：
- `name`: "Switch"，`category`: "input"，`stage`: "M2"，`semiEquivalent`: "Switch"。
- `tags`: ["toggle", "boolean", "instant", "loading", "form"]。
- `props` 的机器可读 schema（类型、默认值、枚举值 size/status、是否受控）。
- `events`: change/focus/blur/keydown 的 payload 形态。
- `slots`: checked/unchecked/loading。
- `a11y`: { role: "switch", keys: ["Space", "Enter"], pattern: "APG Switch" }。
- `i18nKeys`: 见第 7 节。
- `examples`: 基础、受控、异步 loading、带文字、危险二次确认、表单内（含 status）等可被 AI 复用的最小片段。
- `antiPatterns`: ["用于需提交后生效的场景（应用 Checkbox）", "破坏性操作不加二次确认即时切换"]。

## 11. 测试

- **单元（core）**：受控/非受控状态融合；checkedValue/uncheckedValue 映射；disabled/loading 时拦截切换；Space/Enter 触发；onChange payload 正确性。
- **组件（svelte）**：bind:value 双向同步；三尺寸类名与 Token 应用；带文字/slot 优先级（slot > children）；loading 渲染 spinner 且锁交互；status 描边与 aria-invalid。
- **a11y（自动）**：axe 无违规；role=switch、aria-checked 随状态变化；focus ring 可见；无可见文本时强制 aria-label（开发期警告）。
- **a11y（手动 / SR）**：VoiceOver / NVDA 播报「开关，开/关」；announceOnChange 播报新状态。
- **交互（Playwright）**：点击切换、键盘切换、loading 期间点击无效、RTL 镜像快照。
- **视觉回归**：6 态 × 3 尺寸 × 明暗主题 × RTL 快照矩阵；reduced-motion 下无位移过渡。

## 12. 验收标准 Checklist

- [ ] 包名 `@chenzy-design/core`（createSwitch）+ `@chenzy-design/svelte`（Switch.svelte）分层正确。
- [ ] 类名全部 `cd-switch` BEM-like，无散落硬编码类。
- [ ] CSS 仅消费 `--cd-` Alias/Component Token，无写死颜色/尺寸。
- [ ] API 遵循一致性约定：value + on:change；size = small/default/large；status = default/warning/error；无浮层故不含 open/openChange。
- [ ] 受控（bind:value）与非受控（defaultValue）均工作。
- [ ] checkedValue/uncheckedValue 映射正确，表单提交携带 name 与 nativeValue。
- [ ] loading 锁定交互并展示 spinner；disabled 阻止切换与内交互。
- [ ] role=switch + aria-checked/disabled/busy/invalid 完整；axe 0 违规。
- [ ] Space/Enter 切换；焦点环对比度 ≥ 3:1。
- [ ] prefers-reduced-motion 降级；RTL 镜像正确。
- [ ] 用户可见文案全部走 i18n key，无硬编码。
- [ ] 危险操作支持二次确认模式（change 拦截 + 确认后更新）。
- [ ] Perf：svelte ≤ 1.6KB / core ≤ 1.0KB gzip；切换单帧完成。
- [ ] 提供 component.meta.ts（含 props/events/slots/a11y/i18nKeys/examples/antiPatterns）。
- [ ] 单元 + 组件 + a11y + 交互 + 视觉回归测试齐备并通过。
