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

严格对齐 Semi 的文件拆分（`radio.tsx` / `radioInner.tsx` / `radioGroup.tsx` / `context.ts`）：全类型统一用同 `name` 的原生 `<input type="radio">`（`mode="advanced"` 时为 `<input type="checkbox">`），方向键切换即选中由浏览器原生 radio 分组接管，不下沉 core 也不做 JS roving tabindex。

`@chenzy-design/svelte/radio` — 四文件镜像 Semi：
- `context.ts`（对应 Semi `context.ts`）：`setRadioGroupContext` / `getRadioGroupContext`，透传 `name` / `getSelected()` / `getDisabled()` / `getType()` / `getMode()` / `getButtonSize()` / `onChange`。
- `RadioInner.svelte`（对应 Semi `radioInner.tsx`）：内层 `span.cd-radio-inner` 包裹原生 `<input>` + `span.cd-radio-inner-display`（选中时渲染 `IconRadio`）；承载 a11y（`aria-label`/`aria-labelledby`/`aria-describedby`）与命令式 `focus()`/`blur()`。
- `Radio.svelte`（对应 Semi `radio.tsx`）：外层 `<label>` 容器 + wrapper/addon class 组装 + content（children/extra）渲染；通过 `bind:this` 转发命令式 `focus()`/`blur()` 给 `RadioInner`。在/不在 `RadioGroup` 中分别解析 `checked`/`disabled`/`type`/`buttonSize`。
- `RadioGroup.svelte`（对应 Semi `radioGroup.tsx`）：`role="radiogroup"` 容器，`options` 数据驱动或默认 slot 两种渲染，`Context.Provider` 下发。

不引入虚拟化；纯 CSS Token 驱动样式，样式随 DOM 归属组件文件（跨组件组合选择器用 `:global()` 打透，参照 `checkbox/CheckboxInner.svelte` 拆分先例）。

## 4. API

### 4.1 Props — Radio

> 本表由 `packages/svelte/src/radio/meta.ts` 真源生成（2026-07-30 重校）。此前本表列的 prop 多为 Semi 对齐前的旧名或已删除项（如 `value`→`activeKey`、`change`→`onChange`），改 prop 时请同步 meta.ts，勿手写「规划中」的 prop。

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| value | `string \| number \| boolean` | `—` | 选项值（必填） |
| checked | `boolean` | `undefined` | 独立使用时受控选中 |
| defaultChecked | `boolean` | `false` |  |
| disabled | `boolean` | `false` |  |
| type | `'default'\|'button'\|'card'\|'pureCard'` | `继承 Group 或 default` | button/card/pureCard 用 role=radio 容器 + aria-checked |
| name | `string` | `undefined` |  |
| extra | `string` | `undefined` | 辅助说明，aria-describedby 关联 |
| children | `Snippet` | `undefined` | 标签内容 |
| onChange | `(e: RadioChangeEvent) => void` | `undefined` | 对齐 Semi：回调收到合成事件，e.target.{checked,value} |
| addonId | `string` | `undefined` | 内容容器 id，用作 input 的 aria-labelledby |
| addonClassName | `string` | `undefined` | 内容容器附加 class |
| addonStyle | `string` | `undefined` | 内容容器内联样式 |
| autoFocus | `boolean` | `false` | 挂载时自动聚焦 |
| extraId | `string` | `undefined` | 自定义 extra 元素 id（默认由 fieldId 派生） |
| mode | `'advanced'\|''` | `''` | advanced：再次点击选中项可取消（onChange(e.target.checked=false)） |
| class | `string` | `undefined` | 根元素附加 class（对齐 Semi className） |
| style | `string` | `undefined` | 根元素内联样式 |
| onMouseEnter | `(e: MouseEvent) => void` | `undefined` |  |
| onMouseLeave | `(e: MouseEvent) => void` | `undefined` |  |
| aria-label | `string` | `undefined` | 无障碍标签 |
| preventScroll | `boolean` | `false` | autoFocus 时阻止滚动 |

### 4.2 Props — RadioGroup

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `value` | `string \| number \| boolean` | — | 受控选中值（配合 `on:change`） |
| `defaultValue` | `string \| number \| boolean` | — | 非受控初始值 |
| `name` | `string` | 自动生成 | 同组互斥的原生 name；缺省用 `useId` |
| `options` | `Array<{label, value, disabled?, extra?}>` | — | 数据驱动渲染（与默认 slot 二选一） |
| `disabled` | `boolean` | `false` | 整组禁用 |
> 注：`size` **未实现**（2026-07-30 重校）——RadioGroup 对齐 Semi 后只有 `buttonSize`（仅 `type='button'` 生效）。
| `type` | `'default' \| 'button' \| 'card' \| 'pureCard'` | `'default'` | 整组形态 |
| `buttonSize` | `'small' \| 'middle' \| 'large'` | — | `type='button'` 时的尺寸（对齐 Semi；`middle→default` 映射，优先于 size，仅 button 生效） |
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | 排列方向（也决定方向键语义） |
> 注：`status` **未实现**（校验态由 Form.Field 承担）。
| `aria-label` / `aria-labelledby` | `string` | — | 组无可见标题时的可访问名称 |

### 4.3 Events

> 本组件无事件回调 prop（meta.events 为空）。此前本表列的回调均未实现，已删。

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

- **组件（svelte，@testing-library/svelte / vitest browser）**：受控 `value`/`onChange` 派发载荷正确（`e.target.{checked,value}`）；非受控 `defaultValue`/`defaultChecked` 行为；Group 的 `disabled`/`buttonSize`/`type` 下传子项；`options`（primitive/对象两种）与默认 slot 两种渲染一致；button/card/pureCard 型 class 与 DOM 结构正确。
- **a11y（axe，见 `RadioGroup.a11y.test.ts`）**：`role="radiogroup"`/`aria-label`/`aria-labelledby`/`aria-describedby` 无违规。
- **键盘交互（vitest browser，见 `RadioGroup.kbd.test.ts`）**：原生同 `name` radio 分组——Tab 落在选中项，方向键（Up/Down/Left/Right）移动焦点即选中并循环回绕。
- **视觉/真机核对**：逐 demo 对照 Semi 官方站，核对 DOM 结构、class 名、token 值、light/dark/RTL。

## 12. 验收标准 Checklist

- [x] 受控（`value`+`onChange`）与非受控（`defaultValue`）均正确工作，载荷符合 Semi `RadioChangeEvent` 约定。
- [x] 原生同 `name` radio 分组承接方向键移动焦点即选中、边界回绕、跳过 disabled（浏览器原生行为，无需 JS roving）。
- [x] `disabled`/`type`/`buttonSize`/`name` 由 Group 正确下传，子项 disabled 可叠加。
- [x] 仅消费 `--cd-` Alias/Component Token，逐条镜像 Semi `variables.scss` 命名与公式；light/dark 双主题达标。
- [x] role/aria-label/aria-labelledby/aria-describedby 符合 WAI-ARIA Radio Group APG，通过 axe。
- [x] focus-visible 焦点环仅键盘聚焦显示；`prefers-reduced-motion` 下无缩放动画。
- [x] 所有可见文案由调用方传入，零硬编码。
- [x] 提供 Radio 与 RadioGroup 的 `component.meta.ts`，schema 与本 SPEC 一致。
- [x] 文件结构严格镜像 Semi：`context.ts` / `RadioInner.svelte` / `Radio.svelte` / `RadioGroup.svelte`，逻辑与渲染均在 `@chenzy-design/svelte`（无 core 依赖，对齐 Semi 无 foundation 状态机的原生分组实现）。
