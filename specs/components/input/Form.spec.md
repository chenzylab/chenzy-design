# SPEC · Form
> 分类：input · 阶段：M2
> 对标 Semi：Form

## 1. 概述

Form 是表单容器组件，负责承载并编排一组输入控件（Input/Select/Checkbox/Radio/DatePicker 等），提供字段注册、值收集、校验、错误展示与布局四大核心能力。它向下通过 Context 暴露表单实例，向上通过受控 `value`/`on:change` 或非受控 `initValues` 管理整棵表单状态树。

适用场景：登录/注册、设置面板、数据录入、筛选条件区、向导步骤表单。区别于单个 Input 的局部受控，Form 关注**跨字段聚合状态**（dirty/touched/errors）与**提交生命周期**。

核心子组件：
- `Form`：容器，持有 `createForm` 实例，提供 Context。
- `Form.Field`：单字段包裹器，完成注册、Label、必填星标、错误/提示文案、校验态联动。
- `Form.ArrayField`：动态字段数组，对齐 Semi `ArrayField`。
- `Form.Section` / `Form.Slot`：分组与自由插入。
- `Form.ErrorMessage` / `Form.Label`：可独立组合的原子。
- `Form.InputGroup`：字段组容器，Label/ErrorMessage 上提到 group 级统一渲染。

为获得"开箱即用"体验，Form 同时提供已绑定的字段封装，等价于 `Form.Field` + 对应控件，自动接管 `value`/`on:change`/`status`。全部挂载到 `Form.` 命名空间（对齐 Semi）：`Form.Input`、`Form.Select`、`Form.Checkbox`、`Form.CheckboxGroup`、`Form.Radio`、`Form.RadioGroup`、`Form.Switch`、`Form.Slider`、`Form.Rating`、`Form.DatePicker`、`Form.TagInput`、`Form.TreeSelect`、`Form.Cascader`、`Form.Upload`、`Form.TextArea`、`Form.InputNumber`、`Form.TimePicker`、`Form.AutoComplete`、`Form.PinCode`，以及动态字段 `Form.ArrayField`。

非目标：不内置网络提交（仅暴露 `onSubmit` 携带校验结果）；不内置复杂联动 DSL（通过 `dependencies` + 函数式 rules 表达）。

## 2. 设计语义

- **Label 位置**：`labelPosition: top | left | inset`。`top` 为移动优先默认；`left` 为桌面密集表单，配合 `labelWidth` 对齐；`inset` 为浮动标签。
- **必填指示**：必填字段在 Label 后显示 `--cd-color-form-requiredmark-text-default` 星标（`required` 或 rules 含 `{required:true}`）。
- **校验态语义**：字段 `status` 三态映射颜色——`default` 用控件自身描边，`warning` 用 warning 色，`error` 用 `--cd-color-form-message-error-text-default`；错误文案颜色与状态图标同源。
- **错误展示时机**：`validateTrigger: change | blur | custom | mount`（对齐 Semi `BasicTriggerType`，无 `submit`），默认 `['blur','change']`；`custom` 表示不自动触发，仅通过显式 `formApi.validate()`/`submitForm()` 触发。
- **额外文案层级**：`extraText`（中性辅助说明，常驻）与错误/提示文案（`helpText`，与 error 同块、error 优先），由 `showValidateIcon` 决定是否带图标。
- **反馈即时性**：提交时可滚动并聚焦到首个错误字段（`scrollToError`/`autoScrollToError`）。
- **布局**：支持两套并存的布局模型——
  1. 默认两分支（有无 label），间距由 Field/Group 的 padding 承载（`layout: vertical | horizontal`）。
  2. Form 同时配置 `labelCol` + `wrapperCol` 时，Field / Form.Slot / Form.InputGroup 一律改走 24 栏 Grid（`<Col>`）布局，无需手动 `Row`/`Col` 摆放（对齐 Semi `appendCol` 分支）。

## 3. 分层实现

属于"重交互/重状态"组件，逻辑下沉 core，渲染留 svelte。

**@chenzy-design/core · `createForm(options)`** —— 框架无关的表单状态机：
- 状态树：`FormState = { values, errors, touched, submitting, submitCount }`。
- `FormOptions`：`initialValues`、`resolveMessage`（i18n 消息解析）、`validateTrigger`（默认 `['blur','change']`）、`stopValidateWithError`、`allowEmpty`、`validator`（Form 级自定义校验，推荐）、`validateFields`（`validator` 的废弃别名，仍兼容）。
- 字段注册表：`registerField(name, FieldConfig)` → 返回 unregister 函数；支持嵌套路径 `a.b[0].c`（get/set 用 lodash-free 的内部 `form-path.ts`）。`FieldConfig`：`rules`、`initialValue`、`label`、`dependencies`、`trigger`、`transform`。
- 校验引擎（`form-validate.ts`）：桥接 `async-validator`（与 Semi 同一底层库），内置 rule 类型 `required/min/max/minLength/maxLength/pattern/type/len/whitespace/enum/validator(async)`；`rules[].validator` 签名 `(value, values) => string | Promise<string> | undefined`，语义等价于 Semi `CommonFieldProps.validate`/`validator`（本库不单列 Field 级独立 `validator` prop，统一走 `rules` 表达，见 §4 Notice）。异步校验用 `useId` 的递增 token 防过期结果覆盖（竞态丢弃）。
- `FormApi.validate(namesOrOptions?)`：不传参校验全部字段；传 `string[]` 校验指定字段；传 `{ fields?, silent? }` 对象形态，`silent: true` 时纯计算返回布尔值、不触碰 form state（无 UI 错误、无 touched、无 emit），对齐 Semi `validate({ silent })`（v2.94.0+）。
- 方法全集（`FormApi`）：`getFormState / getFormProps / getValue(name?) / setValue(name, value, opts?) / getValues / setValues(values, opts?) / getError(name?) / setError(name, error) / getFieldExist(name) / getInitValue(name?) / getInitValues() / getTouched(name) / setTouched(name, touched?) / validateField(name) / validate(namesOrOptions?) / reset(fields?) / submitForm() / getFieldTrigger(name) / scrollToField(name, opts?) / scrollToError(opts?)`。
- 订阅：`subscribe(listener)`，svelte 层桥接为 `$state`。

**@chenzy-design/svelte** —— 提供 `Form`、`Form.Field`、绑定字段、`Form.ArrayField`、`Form.Section`、`Form.Slot`、`Form.InputGroup`、`Form.Label`、`Form.ErrorMessage`：
- 通过 Svelte Context（`setFormContext`/`getFormContext`）下发 `{ form, getFormState, getLabelPosition, getLabelWidth, getLabelAlign, getDisabled, getRequiredMark, getShowValidateIcon, getExtraTextPosition, getLabelCol, getWrapperCol }`。
- `Form.ArrayField` 额外经 `setArrayFieldContext`/`getArrayFieldContext` 下发 `{ inArrayField: true }`（对齐 Semi `ArrayFieldContext`），供 `Field.svelte` 判断是否强制忽略 `keepState`（数组行 remove/move 后字段路径整体偏移，按路径恢复语义不再成立）。
- Hooks（对齐 Semi `form/hooks`，Svelte 用 `getContext` 等价形态覆盖 React hooks 语义，须在组件 init 期调用）：`useFormApi()`、`useFormState()`、`useFieldState(field)`、`getFieldApi(field)`（对齐 Semi `useFieldApi`）、`useArrayFieldState()`。Semi `Form.useForm()` 靠 Proxy 实现"未挂载即可用"，Svelte `createForm()` 同步返回真实 api，天然不需要这层代理——外部预建 `const form = createForm()` 传给 `<Form {form}>` 即可。
- `labelCol`/`wrapperCol` 栅格分支：`Field.svelte`、`FormSlot.svelte`、`FormInputGroup.svelte` 三处均实现，裸用 `<Col>`（不包 `<Row>`），与 Semi `withField.tsx`/`slot.tsx`/`group.tsx` 源码一致；`Col` 组件在无 `Row` 祖先时 `gutters` 容错为 `[0,0]`（不强制报错）。

## 4. API

### Props（Form 容器）

> 本表由 `packages/svelte/src/form/meta.ts` 真源生成（2026-08-08 重校，见 §核实记录）。改 prop 时请同步 meta.ts，勿手写「规划中」的 prop。

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| value | `Record<string, unknown>` | `undefined` | 受控整表单值；变更经 onChange 上报 |
| initValues | `Record<string, unknown>` | `{}` | 非受控初始值 |
| id | `string` | `undefined` | form 元素 id（同时写 x-form-id 供外部 DOM 定位）（Semi id） |
| layout | `'vertical'\|'horizontal'` | `vertical` |  |
| labelPosition | `'top'\|'left'\|'inset'` | `top` |  |
| labelWidth | `number \| string` | `undefined` |  |
| labelAlign | `'left'\|'right'` | `left` | Label 文本对齐 |
| labelCol | `{ span?: number; offset?: number }` | `undefined` | 统一设置每个 Field 的 label 列（24 栏 Grid），需与 wrapperCol 同传才生效（Semi labelCol） |
| wrapperCol | `{ span?: number; offset?: number }` | `undefined` | 统一设置每个 Field 的控件列（24 栏 Grid），需与 labelCol 同传才生效（Semi wrapperCol） |
| disabled | `boolean` | `false` |  |
| requiredMark | `boolean` | `true` |  |
| scrollToError | `boolean` | `false` | 提交校验失败时滚动并聚焦首个错误字段 |
| validateTrigger | `'change'\|'blur'\|'custom'\|'mount'\|string[]` | `['blur','change']` | 全局默认校验时机，字段可经 trigger 覆盖；`custom` 表示不自动触发（对齐 Semi BasicTriggerType，无 `submit`） |
| showValidateIcon | `boolean` | `true` | 错误/警告文案是否带状态图标 |
| stopValidateWithError | `boolean` | `false` | 字段命中首条错误即停止该字段后续 rule |
| stopPropagation | `{ submit?: boolean; reset?: boolean }` | `undefined` | 提交/重置时是否阻止事件冒泡（对齐 Semi 对象形态） |
| allowEmpty | `boolean` | `false` | 收集值时是否保留空值字段键 |
| autoScrollToError | `boolean \| ScrollIntoViewOptions` | `false` | scrollToError 别名，可传 ScrollIntoViewOptions（Semi autoScrollToError） |
| getFormApi | `(formApi: FormApi & { scrollToField; scrollToError }) => void` | `undefined` | Form 挂载后一次性回传内部 FormApi 句柄，供父级外部命令式操作（Semi getFormApi） |
| form | `FormApi` | `undefined` | 外部预建 FormApi（createForm()），传入则用它，父层可立即操作（对齐 Semi Form.useForm()+form=）；不传则内部创建 |
| onSubmit | `(r: { valid; values; errors }) => void` | `undefined` |  |
| onSubmitFail | `(errors, values, e: SubmitEvent) => void` | `undefined` | 校验失败回调（带原生 submit 事件）（Semi onSubmitFail） |
| onChange | `(values: Record<string, unknown>) => void` | `undefined` |  |
| onReset | `() => void` | `undefined` | 表单重置时回调（原生 reset 或 formApi.reset()）（Semi onReset） |
| onErrorChange | `(errors, changedError) => void` | `undefined` | 任意字段错误集合变化时回调，入参为最新 errors + 变更子集（Semi onErrorChange） |
| children | `Snippet<[{ formState; formApi }]> \| Snippet` | `undefined` | 表单内容；带参 snippet 可拿 formState/formApi（Semi children-as-function） |
| footer | `Snippet<[{ submitting: boolean }]>` | `undefined` |  |
| validator | `(values) => FieldErrors \| Promise<FieldErrors>` | `undefined` | Form 级自定义校验函数（推荐），submit/validate 时调用；设置后 Field 级 rules 不再运行 |
| validateFields | `(values) => FieldErrors \| Promise<FieldErrors>` | `undefined` | validator 的旧别名（已废弃，仍兼容） |

### Props（Form.Field / 绑定字段）

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| field | `string` | **必填** | 字段路径（支持 `a.b[0]`） |
| label | `string \| { text; align; width; required; extra; optional }` | `undefined` | 标签：字符串或对象形态（对齐 Semi LabelProps） |
| labelPosition | `'top'\|'left'\|'inset'` | 继承容器 | field 级 label 位置覆盖 |
| labelAlign | `'left'\|'right'` | 继承容器 | field 级 label 对齐覆盖 |
| labelWidth | `number \| string` | 继承容器 | field 级 label 宽度覆盖（left 模式） |
| noLabel | `boolean` | `false` | 只去 Label 保留 error/wrapper（Semi noLabel） |
| noErrorMessage | `boolean` | `false` | 只去错误/提示信息块（Semi noErrorMessage） |
| name | `string` | `undefined` | label 的 htmlFor 目标（默认用自动 id）（Semi name） |
| fieldClassName | `string` | `undefined` | field wrapper 的 class 透传（Semi fieldClassName） |
| fieldStyle | `string` | `undefined` | field wrapper 的内联样式透传（Semi fieldStyle） |
| helpText | `string` | `undefined` | 提示文案，与 error 同块（error 优先）（Semi helpText） |
| extraText | `string \| Snippet` | `undefined` | 中性辅助说明 |
| extraTextPosition | `'middle'\|'bottom'` | 继承容器 | field 级 extraText 位置覆盖 |
| pure | `boolean` | `false` | 只接管数据流，不插 Label/ErrorMessage/extra（Semi pure） |
| isInInputGroup | `boolean` | `false` | group 内字段模式，Label/ErrorMessage 交由 Group 渲染（Semi isInInputGroup，Form.InputGroup 内自动置真） |
| rules | `Rule[]` | `[]` | 校验规则（基于 async-validator）；`rules[].validator` 表达 Semi 独立 Field validator/validate 的能力（见 §3、下方 Notice） |
| initValue | `unknown` | `undefined` | 字段级初始值，覆盖容器 initValues |
| required | `boolean` | `false` | 语义必填（等价 `{required:true}` rule，控制星标） |
| validateStatus | `'default'\|'warning'\|'error'` | `undefined` | 外部强制校验态（受控展示，不经内部校验、不回写） |
| noStyle | `boolean` | `false` | 仅注册收集、不渲染布局 DOM（纯收集） |
| span | `number` | `undefined` | Form.Section 栅格内占列（grid-column: span N） |
| transform | `(v, values) => unknown` | `undefined` | 提交前值转换（纯函数，不回写 state） |
| dependencies | `string[]` | `undefined` | 依赖字段名；其值变化时本字段自动重校验 |
| trigger | `'change'\|'blur'\|'custom'\|'mount'\|string[]` | 继承容器（`['blur','change']`） | 字段级校验时机覆盖 |
| valuePropName | `string` | `'value'` | 控件值属性名；如 Checkbox/Switch 用 'checked'，snippet 参数即多出同名别名映射字段值 |
| keepState | `boolean` | `false` | Field 卸载后是否保留其状态（value/error/touched）；在 `Form.ArrayField` 行内被强制忽略并 console.warn（见 §核实记录） |
| children | `Snippet<[{ value; [valuePropName]; onChange; onBlur; status; id; describedBy; errorMessageId; labelledById; disabled; required; insetLabel; insetLabelId }]>` | `undefined` | headless 自定义控件渲染契约 |

> **关于 Field 级 `validator` 与 `rules[].validator`**：Semi `CommonFieldProps` 上的 `validate`（已废弃）/`validator` 是独立于 `rules` 的字段级校验入口，签名 `(fieldValue, values) => string | Promise<string>`。本库不单列这个入口，统一用 `rules: [{ validator: fn }]` 表达（签名 `(value, values) => string | Promise<string> | undefined`，语义完全等价）——需要多条规则或复用内置规则（required/type/pattern）时同样在 `rules` 中声明。

### Props（Form.ArrayField）

对齐 Semi `ArrayField`。

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| field | `string` | **必填** | 数组字段名（子字段前缀），对齐 Semi `ArrayFieldProps.field` |
| initialCount | `number` | `0` | 初始行数 |
| children | `Snippet<[{ arrayFields; add; addWithInitValue; remove; move }]>` | `undefined` | 见下 |

children snippet 入参：
- `arrayFields`：每行 `{ key, index, field(sub), remove }`，`field(sub)` 拼接该行某子字段的完整路径 `field[index].sub`（对齐 Semi `arrayFields[i].field`），用于 `{#each}` 渲染。
- `add(index?)`：末尾追加空行；传 index 则在该位置插入。
- `addWithInitValue(rowVal, index?)`：用初始行对象追加/插入。
- `remove(item)` / `move(from, to)`：本库超集的旧式行操作 API（`items`/`name(item, sub)` 兼容形态）。

### Props（Form.InputGroup）

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| label | `string \| { text; align; width; required; extra; optional }` | `undefined` | 组级标签（Label 上提到 group 级） |
| labelPosition | `'top'\|'left'` | 继承容器 | 组标签位置 |
| extraText | `string` | `undefined` | 额外说明文本 |
| extraTextPosition | `'bottom'\|'middle'` | `bottom` | 额外说明位置 |
| size | `'small'\|'default'\|'large'` | `undefined` | 整组尺寸，透传给内部控件 |
| children | `Snippet` | `undefined` | 组内多个 `<Form.Field>`；自动进入 isInInputGroup 模式，Label/Error 上提 group 级 |

### Hooks

对齐 Semi `form/hooks`，Svelte 用 `getContext` 等价形态覆盖（须在组件 init 期调用）：

| Hook | 签名 | 说明 |
| --- | --- | --- |
| `useFormApi()` | `() => FormApi \| undefined` | 后代组件拿当前 Form 的 FormApi 句柄 |
| `useFormState()` | `() => FormState \| undefined` | 响应式 FormState 快照 |
| `useFieldState(field)` | `(field: string) => { value; error; touched }` | 单字段响应式状态快照（对齐 Semi useFieldState） |
| `getFieldApi(field)` | `(field: string) => FieldApi` | 字段级 API 闭包：getValue/setValue/getError/setError/getTouched/setTouched（对齐 Semi useFieldApi） |
| `useArrayFieldState()` | `() => { inArrayField: boolean } \| undefined` | 读取是否处于 `Form.ArrayField` 行内（对齐 Semi useArrayFieldState） |

## 5. 主题 / Token 表

全量对齐 Semi `semi-foundation/form/variables.scss`（38 个变量，2026-08-08 逐项核对，见 §核实记录），仅消费 Alias / Component 级，禁止硬编码。

| Component Token | 引用 | 用途 |
|-----------------|-----------|------|
| `--cd-spacing-form-field-horizontal-paddingright` | `--cd-spacing-base` | 水平布局表单项右侧内边距 |
| `--cd-spacing-form-field-group-horizontal-paddingright` | `--cd-spacing-base` | 水平布局表单组标题右侧内边距 |
| `--cd-spacing-form-field-vertical-paddingtop` | `--cd-spacing-base-tight` | 表单项顶部内边距（垂直布局） |
| `--cd-spacing-form-field-vertical-paddingbottom` | `--cd-spacing-base-tight` | 表单项底部内边距（垂直布局） |
| `--cd-spacing-form-field-group-vertical-paddingtop` | `--cd-spacing-base-tight` | 垂直布局表单组顶部内边距 |
| `--cd-spacing-form-field-group-vertical-paddingbottom` | `--cd-spacing-base-tight` | 垂直布局表单组底部内边距 |
| `--cd-spacing-form-label-paddingright` | `--cd-spacing-base` | 表单项标签右侧边距（水平布局） |
| `--cd-spacing-form-label-paddingtop` | `calc((--cd-control-height-default - 20px) * 0.5)` | 表单项标签顶部内边距（水平布局） |
| `--cd-spacing-form-label-marginbottom` | `--cd-spacing-extra-tight` | 表单项标签底部外边距 |
| `--cd-spacing-form-label-margintop` | `0px` | 表单项标签顶部外边距 |
| `--cd-spacing-form-label-extra-marginleft` | `--cd-spacing-extra-tight` | 表单项标签额外信息左侧边距 |
| `--cd-spacing-form-label-required-marginleft` | `--cd-spacing-extra-tight` | 表单项标签必填标志左侧边距 |
| `--cd-spacing-form-label-posleft-marginright` | `0`（Semi 真值即 0） | 表单项左侧标签右侧外边距 |
| `--cd-spacing-form-label-posleft-marginbottom` | `0`（Semi 真值即 0） | 表单项左侧标签底部外边距 |
| `--cd-spacing-form-label-postop-paddingtop` | `--cd-spacing-extra-tight` | 表单项顶部标签顶部边距 |
| `--cd-spacing-form-label-postop-paddingbottom` | `--cd-spacing-extra-tight` | 表单项顶部标签底部边距 |
| `--cd-spacing-form-extra-posmid-margintop` | `--cd-spacing-extra-tight` | extraText 顶部外边距（middle） |
| `--cd-spacing-form-extra-posmid-marginbottom` | `--cd-spacing-extra-tight` | extraText 底部外边距（middle） |
| `--cd-spacing-form-extra-posbottom-margintop` | `--cd-spacing-extra-tight` | extraText 顶部外边距（bottom） |
| `--cd-spacing-form-switch-rating-marginy` | `calc((--cd-control-height-default - 24px) * 0.5)` | Switch/Rating 表单项对齐高度 32px |
| `--cd-color-form-requiredmark-disabled-text-default` | `--cd-color-danger` | 禁用表单项必填标记颜色 |
| `--cd-color-form-label-disabled-text-default` | `--cd-color-disabled-text` | 禁用表单项标签文字颜色 |
| `--cd-font-form-label-fontweight` | `--cd-font-weight-bold` | 表单项标签字重 |
| `--cd-color-form-label-text-default` | `--cd-color-text-0` | 表单项标签文字颜色 |
| `--cd-color-form-label-optional-text-default` | `--cd-color-tertiary` | 表单项标签可选标记颜色 |
| `--cd-color-form-label-extra-text-default` | `--cd-color-tertiary` | 表单项标签额外信息颜色 |
| `--cd-color-form-requiredmark-text-default` | `--cd-color-danger` | 必填标记颜色 |
| `--cd-font-form-requiredmark-fontweight` | `--cd-font-weight-bold` | 表单必填标识字重 |
| `--cd-color-form-message-error-text-default` | `--cd-color-danger` | 错误提示颜色 |
| `--cd-color-form-alerticon-icon-default` | `--cd-color-warning` | 警告图标颜色 |
| `--cd-spacing-form-statusicon-marginright` | `--cd-spacing-extra-tight` | 表单校验状态图标右侧外边距 |
| `--cd-spacing-form-message-margintop` | `--cd-spacing-extra-tight` | 表单错误信息、辅助文字顶部外边距 |
| `--cd-color-form-section-text-default` | `--cd-color-text-0` | 表单分组标题文字颜色 |
| `--cd-color-form-section-border-default` | `--cd-color-border` | 表单分组标题底部描边颜色 |
| `--cd-width-form-section-border` | `--cd-border-thickness-control` | 表单分组标题底部描边宽度 |
| `--cd-spacing-form-section-margintop` | `calc(--cd-spacing-super-loose - --cd-spacing-base-tight)` | 表单分组顶部内边距 |
| `--cd-spacing-form-section-text-paddingbottom` | `--cd-spacing-tight` | 表单分组标题底部内边距 |
| `--cd-spacing-form-section-text-marginbottom` | `--cd-spacing-extra-tight` | 表单分组标题底部外边距 |
| `--cd-spacing-form-section-text-paddingtop` | `0px` | 表单分组标题顶部内边距 |
| `--cd-spacing-form-section-text-margintop` | `0px` | 表单分组标题顶部外边距 |

## 6. 无障碍

遵循 WAI-ARIA APG，表单字段为原生 form controls，避免自定义 role。

- **关联**：每个 `Form.Field` 用 `useId` 生成 `id`，Label 用 `for={id}`；控件 `aria-describedby` 指向 `extraText`/`helpText` 节点 id；错误时经 `aria-errormessage` 指向错误节点。
- **必填**：必填控件 `aria-required="true"`；星标本身 `aria-hidden="true"`，必填语义靠 `aria-required`。
- **错误态**：失败控件 `aria-invalid="true"`；错误文案容器 `role="alert"`。
- **RTL**：全走 CSS 逻辑属性（`margin-inline-*`/`padding-inline-*`/`border-block-*`），但**逻辑属性生效的前提是元素自身 `direction: rtl`**——`.cd-rtl` 类本身不带样式，只是作用域标记（同 Carousel/DatePicker 等组件架构），`Form.svelte`/`Field.svelte`/`FormSection.svelte` 各自在根节点声明 `:global(.cd-rtl) .cd-xxx { direction: rtl; }` 作为镜像开关（对齐 Semi `rtl.scss` 的 `direction: rtl` 声明，2026-08-08 补齐，此前缺失导致逻辑属性从未真正镜像，见 §核实记录）。`FormLabel.svelte` 另有 `text-align` 的 left/right 硬镜像（不依赖 direction）。

## 7. 国际化

用户可见文案零硬编码，经 i18n provider 注入；日期/数字校验提示用 `Intl`。

> 本表由 `packages/locale/src/zh_CN.ts` 真源生成（2026-08-08 重校）。**仅 `Form.optional` 是 Semi 契约**（键名与键值均对齐 Semi `locale/source/*.ts` 的 `Form.optional`：zh_CN `（可选）`、en_US `(optional)`，此前本库误写为「选填」「optional」，已修正）；其余 8 个 key 是本库超集——Semi Form 本身没有 required/typeError/minLength 等校验提示的 locale key，只依赖 `async-validator` 库自带的英文默认消息，本库主动补齐中文校验提示以提升开箱体验。勿手写「规划中」的键。

| i18n key | 默认（zh-CN） | 默认（en-US） | 是否 Semi 契约 |
| --- | --- | --- | --- |
| `Form.optional` | （可选） | (optional) | 是（Semi 唯一的 Form locale key） |
| `Form.required` | {label}为必填项 | {label} is required | 否，本库超集 |
| `Form.typeError` | {label}格式不正确 | {label} has an invalid format | 否，本库超集 |
| `Form.minLength` | 至少输入 {min} 个字符 | Enter at least {min} characters | 否，本库超集 |
| `Form.maxLength` | 最多输入 {max} 个字符 | Enter at most {max} characters | 否，本库超集 |
| `Form.min` | 不能小于 {min} | Cannot be less than {min} | 否，本库超集 |
| `Form.max` | 不能大于 {max} | Cannot be greater than {max} | 否，本库超集 |
| `Form.pattern` | {label}格式不符合要求 | {label} does not match the required format | 否，本库超集 |

## 8. 文案

遵循 content-guidelines：

- 错误文案聚焦"如何修正"而非指责：用"请输入有效的邮箱地址"而非"邮箱错了"。
- 必填提示简洁，统一"为必填项"。
- `extraText` 用于前置引导，减少校验失败概率。
- 句末标点：错误短句不加句号，与 Semi 一致。

## 9. 性能

| 指标 | 预算 | 说明 |
|------|------|------|
| `@chenzy-design/core` createForm (gzip) | ≤ 4.5 KB | 状态机 + 校验引擎 + path util |
| `@chenzy-design/svelte` Form 套件 (gzip) | ≤ 6.15 KB | Form/Field/ArrayField/Section/InputGroup/绑定字段 |
| 单字段输入 → 重渲染范围 | 仅该 Field | 细粒度 selector 订阅 |
| 异步校验竞态 | token 丢弃过期结果 | 无内存泄漏 |

- **不内置虚拟化**：表单字段语义需全部可达；超长表单推荐 `Form.Section` 折叠或多步表单。
- **惰性**：`noStyle` 字段不渲染布局 DOM；卸载自动 unregister（`keepState` 可选保留，`Form.ArrayField` 内强制忽略）。

## 10. AI 元数据

提供 `component.meta.ts`（`packages/svelte/src/form/meta.ts`），内容包含 `name`/`category`/`description`/`subComponents`/`props`/`a11y`/`tokens`，与本 spec 同步维护。

## 11. 测试

- **core 单测**（`packages/core/src/form.test.ts`）：注册/注销、嵌套 path get/set、各 rule 类型、异步校验竞态、validate 返回结构（含 silent）、resetFields、submit 生命周期、dependencies 触发重校验、validateTrigger 各值（含 `custom`）。
- **svelte 组件测**：`Form.a11y.test.ts`、`FormInputGroup.a11y.test.ts`、`FormErrorMessage.a11y.test.ts`（数组全 falsy / 空字符串不渲染边界）、`ArrayField.a11y.test.ts`（keepState 忽略警告、useArrayFieldState）。
- **RTL 真机 e2e**（browser project）：`Field.rtl.kbd.test.ts`，`getComputedStyle` 实测 `direction` 生效与 margin 镜像互换。
- **a11y**：axe 无违规；Label-for 关联、aria-required/aria-invalid/aria-describedby 切换。

## 12. 核实记录（2026-08-08 Semi 严格对齐工程）

本次工程逐项核实并修复的真实缺口，供后续维护参考：

- **命名统一**：`FieldArray.svelte`/`Form.List` → `ArrayField.svelte`/`Form.ArrayField`，内部 `name` prop → `field`，对齐 Semi `ArrayField`/`ArrayFieldProps.field`。
- **validateTrigger 枚举值修正**：`'submit'` → `'custom'`（core 类型定义、测试、meta.ts、docs 全同步），对齐 Semi `BasicTriggerType`；两者在代码里都是"未被消费的占位值"，纯命名对齐非功能变更。
- **hooks 补齐**：新增 `useFieldState`、`useArrayFieldState`（+ `ArrayFieldContext`/`setArrayFieldContext`），`Form.useForm()` 的 Proxy 延迟绑定机制确认为 React 特有必要性，Svelte `createForm()` 同步返回真实 api 无需移植。
- **labelCol/wrapperCol 栅格分支补齐**：`Field.svelte`/`FormSlot.svelte`/`FormInputGroup.svelte` 三处新增 `appendCol` 四分支渲染。过程中发现并修复 `Col.svelte` 的一个真实 bug——曾无条件要求 `Row` 祖先（否则 throw），但真机验证 Semi 官网 `wrapperCol/labelCol` demo 证实 Semi Form 本身裸用 `<Col>` 且无报错，已改为无 Row 祖先时 `gutters` 容错为 `[0,0]`。
- **RTL 开关缺失修复**：`Form.svelte`/`Field.svelte`/`FormSection.svelte` 原本完全没有 `direction: rtl` 声明——`.cd-rtl` 类本身不带样式（纯作用域标记），逻辑属性（`margin-inline-*` 等）若没有 `direction: rtl` 触发镜像，永远解析为 LTR 物理方向。已补齐三处开关规则，对齐 Semi `rtl.scss` 的 `direction: rtl` 声明，真机测试验证。
- **Field 级 validate/validator**：确认本库故意不设独立入口，统一用 `rules[].validator` 表达（签名语义与 Semi 完全等价），已有代码注释 + docs Notice 说明，非缺口。
- **ValidateOptions.silent**：确认已完整实现（`packages/core/src/form.ts`），行为正确（不触碰 state）。
- **FormErrorMessage 边界**：确认数组全 falsy / 空字符串不渲染的两条 Semi 边界均已正确覆盖，补充测试固化。
- **Token 表**：38 项与 Semi `variables.scss` 逐条核对，命名/值/calc 公式全部一致（此前 spec 表仅 12 项，严重过时）。
