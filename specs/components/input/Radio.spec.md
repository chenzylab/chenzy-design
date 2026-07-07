# SPEC · Radio
> 分类：input · 阶段：M2
> 对标 Semi：Radio / RadioGroup

## 1. 概述

Radio 用于在一组互斥选项中选择**单一**值。单独的 `<Radio>` 极少独立使用，绝大多数场景由 `<RadioGroup>` 统一托管 `value` / `on:change` / `name` / `disabled` / 校验态，子项之间形成单一焦点环（roving tabindex）。

典型用例：
- 表单中的二选一 / 多选一设置项（如"性别""配送方式"）。
- 配合 `type="button"` 渲染为**按钮组（Radio Button）**，作视图切换、过滤器。
- 配合 `type="card"` 渲染为**卡片选择**，承载更丰富的描述/图标。

边界（区分相邻组件）：
- 互斥但选项多、需搜索/虚拟化 → 用 `Select`。
- 可多选 → 用 `Checkbox` / `CheckboxGroup`。
- 视觉上是开关、单一布尔 → 用 `Switch`。

Radio 同时提供受控（传 `value`）与非受控（传 `defaultValue`）两种用法，对标 Semi 的 Radio/RadioGroup 行为。

## 2. 设计语义

- **形状**：默认圆形 indicator（外圈 `--cd-color-border`，选中时内圈实心 `--cd-color-primary` 圆点）。`type="button"` 为矩形分段按钮；`type="card"` 为带边框的卡片，选中时边框/背景高亮。
- **状态语义**：unchecked / checked / hover / focus-visible / disabled / readonly，以及组级校验态 `status`（warning/error 改变边框与文字色）。disabled 降低不透明度并禁用指针；checked+disabled 仍保留可辨识的选中态。
- **尺寸**：`small | default | large`，影响 indicator 直径、字号、按钮内边距与高度，均映射到 Component Token。
- **方向**：`RadioGroup` 支持 `direction: horizontal | vertical`，影响间距与换行；RTL 下顺序与 indicator-label 间距镜像。
- **焦点语义**：组内只有一个可 Tab 进入的成员（roving tabindex），方向键在成员间移动焦点并默认即时选中（APG 推荐）。
- **动效**：内圈圆点 scale-in（约 120ms ease-out），`prefers-reduced-motion` 下取消缩放仅切换透明度。

## 3. 分层实现

属于有键盘/焦点/a11y 逻辑的复合控件，逻辑下沉到 core，渲染在 svelte。

`@chenzy-design/core` — `createRadioGroup(options)`：
- 维护选中 `value`、注册/注销子 radio（`register(itemValue, el)`）。
- 复用 `useRovingTabindex`：管理 `tabindex`（选中项或首个可用项为 0，其余为 -1），实现 ArrowUp/Down/Left/Right/Home/End 焦点移动 + 即时选中（含 horizontal/vertical 与 RTL 方向解析、跳过 disabled、循环 wrap）。
- 复用 `useId` 生成 group/item id 关联 `aria-labelledby` / `aria-describedby`。
- 复用 `useLiveAnnouncer`（可选）在 `status=error` 时广播校验提示。
- 暴露 `getGroupProps()` / `getItemProps(itemValue)` / `getIndicatorProps()`，返回 role / aria / tabindex / 事件 handler，框架无关。
- 单个 `createRadio`（无 group 场景）：封装 checked 切换与 `aria-checked`，无 roving。

`@chenzy-design/svelte` — `Radio.svelte` / `RadioGroup.svelte`：
- 通过 Svelte `setContext`/`getContext`（key `cd-radio-group`）连接父子，子项消费 group 的 `name` / `disabled` / `size` / `status` / `value`。
- 绑定 core 返回的 props 到原生 `<input type="radio">`（视觉隐藏，保留可访问性）或 `role="radio"` 容器（button/card 型）。
- 不引入虚拟化；纯 CSS Token 驱动样式。

## 4. API

### 4.1 Props — Radio

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `value` | `string \| number \| boolean` | — | 该选项代表的值（在 Group 内用于匹配选中） |
| `checked` | `boolean` | `false` | 单独使用时的受控选中态（Group 内忽略，由 Group 接管） |
| `defaultChecked` | `boolean` | `false` | 单独使用时的非受控初始选中态 |
| `disabled` | `boolean` | `false` | 禁用本项（Group 的 disabled 优先级更高） |
| `size` | `'small' \| 'default' \| 'large'` | 继承 Group 或 `'default'` | 尺寸 |
| `type` | `'default' \| 'button' \| 'card' \| 'pureCard'` | 继承 Group 或 `'default'` | 渲染形态 |
| `name` | `string` | 继承 Group | 原生表单 name |
| `addonClass` / `addonStyle` | `string` | — | label 文本容器的扩展类/样式 |
| `extra` | `string` | — | 卡片型下的辅助说明文本（i18n 由调用方传入） |
| `mode` | `'advanced' \| ''` | `''` | `advanced`：已选中项再次点击可取消（`onChange(false)`，对齐 Semi） |
| `autoFocus` | `boolean` | `false` | 挂载时自动聚焦 |
| `preventScroll` | `boolean` | `false` | 命令式 `focus()` / autoFocus 时阻止滚动文档 |

### 4.2 Props — RadioGroup

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `value` | `string \| number \| boolean` | — | 受控选中值（配合 `on:change`） |
| `defaultValue` | `string \| number \| boolean` | — | 非受控初始值 |
| `name` | `string` | 自动生成 | 同组互斥的原生 name；缺省用 `useId` |
| `options` | `Array<{label, value, disabled?, extra?}>` | — | 数据驱动渲染（与默认 slot 二选一） |
| `disabled` | `boolean` | `false` | 整组禁用 |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | 整组尺寸 |
| `type` | `'default' \| 'button' \| 'card' \| 'pureCard'` | `'default'` | 整组形态 |
| `buttonSize` | `'small' \| 'middle' \| 'large'` | — | `type='button'` 时的尺寸（对齐 Semi；`middle→default` 映射，优先于 size，仅 button 生效） |
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | 排列方向（也决定方向键语义） |
| `status` | `'default' \| 'warning' \| 'error'` | `'default'` | 校验态 |
| `aria-label` / `aria-labelledby` | `string` | — | 组无可见标题时的可访问名称 |

### 4.3 Events

| 事件 | 载荷 (`event.detail`) | 触发组件 | 说明 |
|---|---|---|---|
| `on:change` | `{ value, nativeEvent }` | RadioGroup | 选中值变化（受控/非受控均派发） |
| `on:change` | `{ checked, value, nativeEvent }` | Radio（单独使用） | 单项选中态变化 |
| `on:focus` | `FocusEvent` | Radio | 获得焦点（roving 移动时） |
| `on:blur` | `FocusEvent` | Radio | 失去焦点 |

> 约定：受控输入统一 `value + on:change`；本组件无浮层，故无 `open/openChange`。

### 4.3.1 Methods — Radio

通过组件实例（`bind:this`）调用（对齐 Semi）：

| 方法 | 说明 |
|---|---|
| `focus()` | 命令式聚焦内部 radio input（尊重 preventScroll） |
| `blur()` | 命令式移除焦点 |

### 4.4 Slots

| Slot | 作用域 props | 所属 | 说明 |
|---|---|---|---|
| `default` | — | Radio | label 内容（覆盖 `options.label`，支持富文本/图标） |
| `extra` | — | Radio | card 型的描述区自定义内容 |
| `default` | `{ value }` | RadioGroup | 直接书写 `<Radio>` 子项（与 `options` 互斥） |

## 5. 主题 / Token

仅消费 Alias / Component Token，禁止写死颜色与尺寸。Component Token 兜底引用 Alias。

| Component Token | 兜底（Alias） | 用途 |
|---|---|---|
| `--cd-radio-size` | `16px`（small `14px` / large `18px`） | indicator 直径 |
| `--cd-radio-dot-size` | `--cd-radio-size * 0.5` | 选中内圆点直径 |
| `--cd-radio-color-border` | `--cd-color-border` | 外圈描边（默认态） |
| `--cd-radio-color-checked` | `--cd-color-primary` | 选中外圈 + 内圆点 |
| `--cd-radio-color-text` | `--cd-color-text-0` | label 文字 |
| `--cd-radio-color-bg` | `--cd-color-bg-0` | indicator/卡片背景 |
| `--cd-radio-color-hover` | `--cd-color-primary` | hover 外圈 |
| `--cd-radio-color-disabled` | `--cd-color-text-2` | 禁用文字/描边 |
| `--cd-radio-color-warning` | `--cd-color-warning` | status=warning 边框 |
| `--cd-radio-color-error` | `--cd-color-danger` | status=error 边框/文字 |
| `--cd-radio-gap` | `8px` | indicator 与 label 间距 |
| `--cd-radio-focus-ring` | `--cd-color-primary` | focus-visible 焦点环 |
| `--cd-radio-button-height` | `32px`（small `24` / large `40`） | button 型高度 |
| `--cd-radio-card-radius` | `--cd-radius-medium` | card 型圆角 |
| `--cd-radio-card-border-checked` | `--cd-color-primary` | card 选中边框 |

对比度：label 文字与背景 ≥ 4.5:1；选中圆点与外圈在浅/深主题均 ≥ 3:1。所有 Token 同时提供 light/dark 取值。

## 6. 无障碍（WCAG 2.1 AA / WAI-ARIA APG: Radio Group）

- **角色**：默认型用原生 `<input type="radio">`（隐式 role）；button/card 型用容器 `role="radiogroup"` + 子 `role="radio"`。RadioGroup 根元素 `role="radiogroup"`。
- **ARIA**：
  - Group：`aria-labelledby`（关联可见标题）或 `aria-label`；`status=error` 时 `aria-invalid="true"` 并 `aria-describedby` 指向错误说明。
  - Item：`aria-checked`（button/card 型），`aria-disabled`（禁用项），`aria-label`（无可见 label 时）。
- **键盘交互**（APG）：
  - `Tab` 进入组：焦点落在选中项；无选中时落在首个可用项；`Tab` 再次离开整组。
  - `ArrowDown` / `ArrowRight`：移到下一可用项并即时选中（vertical 用上下，horizontal 用左右；两个方向键集合都生效以兼顾布局）。
  - `ArrowUp` / `ArrowLeft`：移到上一可用项并即时选中。
  - 到边界循环回绕；跳过 disabled 项。
  - `Space`：选中当前聚焦项（用于无选中态进入时）。
- **焦点管理**：roving tabindex —— 组内仅一个 `tabindex=0`，其余 `-1`；焦点移动同步更新。focus-visible 显示焦点环（`--cd-radio-focus-ring`），鼠标点击不显示。
- **reduced-motion**：尊重 `prefers-reduced-motion`，关闭圆点 scale 动画。
- **RTL**：`dir="rtl"` 下 indicator 与 label 镜像，左右方向键语义反转。
- **对比度**：见第 5 节；焦点环对相邻背景 ≥ 3:1。

## 7. 国际化

- 组件自身**无内置可见文案**；label / extra / 错误说明均由调用方传入，天然零硬编码。
- 供 Storybook/示例与可选内置提示使用的 i18n key：

| i18n key | 用途 |
|---|---|
| `Radio.required` | 表单校验"此项必选"提示 |
| `Radio.groupLabel` | 示例中组的默认可访问名称 |

- 不涉及日期/数字格式化；若 label 含数值由调用方用 `Intl.NumberFormat` 预格式化后传入。
- LiveAnnouncer 播报文本经 i18n 解析后传入，不在组件内拼接。

## 8. 文案

- 遵循 content-guidelines：label 用名词/名词短语，简短、平行结构（如"标准配送"/"次日达"），避免整句。
- 句首大写（英文）/不加句末标点；button 型文案尽量 1-2 词。
- card 型 `extra` 可用一句话说明，结尾不加句号以保持卡片清爽。
- **危险操作**：Radio 本身不执行操作，仅表达选择。若某选项会触发危险后果（如"永久删除模式"），危险性须在**确认环节**（Button/Modal）的文案体现，Radio label 仅中性描述选项，不写"危险""不可恢复"等恐吓性词，避免误导单击即触发。

## 9. 性能（Perf Budget）

| 指标 | 预算 | 说明 |
|---|---|---|
| Radio gzip | ≤ 1.8 KB | 含样式，不含 core |
| RadioGroup gzip | ≤ 4.1 KB | 含 context + 数据驱动渲染 |
| core `createRadioGroup` gzip | ≤ 1.5 KB | 复用 useRovingTabindex/useId |
| 首次渲染（20 项 group） | < 4 ms | 主线程 |
| 方向键移动焦点 | < 1 ms / 次 | roving 仅改 2 个节点 tabindex |
| 选中切换重渲染 | 仅旧/新选中项 | context 派生订阅，避免全组 re-render |

- **不需要虚拟化**：Radio 适用于小规模互斥选项（建议 ≤ ~20 项），超出应改用 `Select`。
- **无浮层**，故不涉及 `destroyOnClose` / 惰性渲染。
- `options` 与 default slot 互斥，避免双重渲染开销。

## 10. AI 元数据

提供 `component.meta.ts`（Radio 与 RadioGroup 各一份），内容包含：
- `name`、`category: "input"`、`stage: "M2"`、`semiEquivalent: "Radio/RadioGroup"`。
- props/events/slots 的机器可读 schema（类型、默认值、枚举、必填）。
- `a11y`: `{ role: "radiogroup", apg: "radio", keyboard: ["Arrow*","Home","End","Space"], rovingTabindex: true }`。
- `tokens`: 第 5 节 Component Token 列表及其 Alias 兜底。
- `relations`: `{ alternatives: ["Select","Checkbox","Switch"], composedWith: ["Form","Button"] }`。
- `examples`: 受控 / 非受控 / button 型 / card 型 / 校验态 代码片段。
- `aiHints`: "多选用 Checkbox；选项 >20 用 Select；危险后果放确认环节而非 label"。

## 11. 测试

- **单元（core）**：`createRadioGroup` 注册/注销、value 匹配、roving tabindex 计算（选中项=0）、方向键导航（含 wrap、跳过 disabled、horizontal/vertical/RTL）、Home/End、Space 选中。
- **组件（svelte，@testing-library/svelte）**：受控 `value`/`on:change` 派发载荷正确；非受控 `defaultValue` 行为；Group 的 `disabled`/`size`/`status` 下传子项；`options` 与 slot 两种渲染一致；button/card 型 `role/aria-checked` 正确。
- **a11y（axe / jest-axe）**：role/aria-labelledby/aria-invalid 无违规；焦点环 contrast；reduced-motion 媒体查询生效。
- **键盘交互（user-event）**：Tab 进入落点、Arrow 即时选中、边界回绕、disabled 跳过。
- **视觉回归**：5 状态 × 3 尺寸 × {default/button/card} × {light/dark/RTL} 快照。
- **i18n**：传入不同 locale label，无截断/溢出（vertical 与 horizontal 换行）。

## 12. 验收标准 Checklist

- [ ] 受控（`value`+`on:change`）与非受控（`defaultValue`）均正确工作，载荷符合约定。
- [ ] RadioGroup 实现 roving tabindex：组内仅一个 `tabindex=0`，焦点随导航迁移。
- [ ] 方向键导航即时选中，支持 Home/End、边界回绕、跳过 disabled，horizontal/vertical/RTL 语义正确。
- [ ] `disabled`/`size`/`type`/`status`/`name` 由 Group 正确下传，子项 disabled 可叠加。
- [ ] 仅消费 `--cd-` Alias/Component Token，无硬编码颜色/尺寸；light/dark 双主题达标。
- [ ] role/aria-checked/aria-labelledby/aria-invalid/aria-describedby 符合 WAI-ARIA Radio Group APG，通过 axe。
- [ ] focus-visible 焦点环对比度 ≥ 3:1；`prefers-reduced-motion` 下无缩放动画。
- [ ] 所有可见文案由调用方传入，零硬编码；i18n key 已登记。
- [ ] 危险后果文案不在 Radio label，而在确认环节。
- [ ] 满足 Perf Budget：体积达标、方向键移动 < 1ms、选中切换不触发全组 re-render。
- [ ] 提供 Radio 与 RadioGroup 的 `component.meta.ts`，schema 与本 SPEC 一致。
- [ ] 逻辑位于 `@chenzy-design/core` 的 `createRadioGroup/createRadio`，渲染位于 `@chenzy-design/svelte`，复用 useRovingTabindex/useId/useLiveAnnouncer。
