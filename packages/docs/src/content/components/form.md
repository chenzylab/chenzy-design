---
title: Form 表单
name: form
category: input
brief: Form 是表单容器组件，负责承载并编排一组输入控件，提供字段注册、值收集、校验、错误展示与布局四大核心能力。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';
  import Notice from '$lib/components/Notice.svelte';

  import Basic from '../../demos/form/01-basic.svelte';
  import basicSrc from '../../demos/form/01-basic.svelte?raw';
  import RenderSnippet from '../../demos/form/30-render-snippet.svelte';
  import renderSnippetSrc from '../../demos/form/30-render-snippet.svelte?raw';
  import Controls from '../../demos/form/02-controls.svelte';
  import controlsSrc from '../../demos/form/02-controls.svelte?raw';
  import ValueBinding from '../../demos/form/03-value-binding.svelte';
  import valueBindingSrc from '../../demos/form/03-value-binding.svelte?raw';
  import Layout from '../../demos/form/04-layout.svelte';
  import layoutSrc from '../../demos/form/04-layout.svelte?raw';
  import SectionDemo from '../../demos/form/05-section.svelte';
  import sectionSrc from '../../demos/form/05-section.svelte?raw';
  import NoLabel from '../../demos/form/06-no-label.svelte';
  import noLabelSrc from '../../demos/form/06-no-label.svelte?raw';
  import InsetLabel from '../../demos/form/07-inset-label.svelte';
  import insetLabelSrc from '../../demos/form/07-inset-label.svelte?raw';
  import LabelErrorMessage from '../../demos/form/28-label-errormessage.svelte';
  import labelErrorMessageSrc from '../../demos/form/28-label-errormessage.svelte?raw';
  import Slot from '../../demos/form/09-slot.svelte';
  import slotSrc from '../../demos/form/09-slot.svelte?raw';
  import HelpExtra from '../../demos/form/08-help-extra.svelte';
  import helpExtraSrc from '../../demos/form/08-help-extra.svelte?raw';
  import InputGroup from '../../demos/form/10-input-group.svelte';
  import inputGroupSrc from '../../demos/form/10-input-group.svelte?raw';
  import ModalDemo from '../../demos/form/13-modal.svelte';
  import modalSrc from '../../demos/form/13-modal.svelte?raw';
  import Validation from '../../demos/form/11-validation.svelte';
  import validationSrc from '../../demos/form/11-validation.svelte?raw';
  import FormValidator from '../../demos/form/23-form-validator.svelte';
  import formValidatorSrc from '../../demos/form/23-form-validator.svelte?raw';
  import FieldValidator from '../../demos/form/26-field-validator.svelte';
  import fieldValidatorSrc from '../../demos/form/26-field-validator.svelte?raw';
  import SilentValidate from '../../demos/form/24-silent-validate.svelte';
  import silentValidateSrc from '../../demos/form/24-silent-validate.svelte?raw';
  import Linkage from '../../demos/form/21-linkage.svelte';
  import linkageSrc from '../../demos/form/21-linkage.svelte?raw';
  import DynamicRemove from '../../demos/form/22-dynamic-remove.svelte';
  import dynamicRemoveSrc from '../../demos/form/22-dynamic-remove.svelte?raw';
  import KeepState from '../../demos/form/29-keep-state.svelte';
  import keepStateSrc from '../../demos/form/29-keep-state.svelte?raw';
  import ArrayFieldDemo from '../../demos/form/25-array-field.svelte';
  import arrayFieldSrc from '../../demos/form/25-array-field.svelte?raw';
  import Hooks from '../../demos/form/27-hooks.svelte';
  import hooksSrc from '../../demos/form/27-hooks.svelte?raw';
</script>

## 表单(Form)

- **按需重绘**，避免不必要的全量渲染，性能更高。
- 简单易用，**结构极简**，避免不必要的层级嵌套。
- 完善的无障碍支持。
- 在 Form 外部可方便地获取 formState / fieldState，并提供在外部对表单内部进行操作的方法：formApi / fieldApi。
- 支持将自定义组件封装成表单控件（通过带参 snippet 接入你自己的控件）。
- 支持 Form level / Field level 级别的赋值、校验（同步 / 异步）。

## 表单控件(Field)

本库将所有自带的输入控件（文本输入框、下拉选择、复选框、单选框等）都用 Field 封装了一次，接管了它们的数据流（value & onChange）。使用时需要从 `Form` 中导出（注意：从 Form 导出的控件才具有数据同步功能）。

目前 Form 提供了如下表单控件：`Input`、`InputNumber`、`TextArea`、`Select`、`Checkbox`、`CheckboxGroup`、`Radio`、`RadioGroup`、`Switch`、`DatePicker`、`TimePicker`、`Slider`、`InputGroup`、`TreeSelect`、`Cascader`、`Rating`、`AutoComplete`、`Upload`、`PinCode`、`Label`、`ErrorMessage`、`Section`、`Slot`，都挂载在 Form 下，直接以 `<Form.Input>`、`<Form.Select>` 声明即可。

Field 级别组件的 `value`、`onChange` 属性都会被 Form 劫持，所以：

<Notice type="primary" title="注意事项">

1. 你不需要也不应该用 onChange 来作同步，当然你可以继续监听 onChange 事件获取最新的值。
2. 你不能再用控件的 `value`、`defaultValue`、`checked`、`defaultChecked` 等属性来设置表单控件的值，默认值可以通过 Field 的 `initValue` 或者 Form 的 `initValues` 设置。
3. 你不应该直接修改 FormState 的值，所有对 Form 内数据的修改都应该通过提供的 formApi、fieldApi 来完成。

</Notice>

## 代码演示

### 声明表单的多种写法

本库 Form 同时支持多种写法。

#### 基本写法

从 Form 中导出表单控件，给表单控件添加 `field` 属性，将其放置于 Form 内部即可。还可以给每个表单控件设置 `label` 属性，不传入时默认与 field 相同。`label` 可以直接传入字符串，亦可以以 object 方式声明，配置 `extra`、`required`、`optional` 等属性应对更复杂的场景。

<Notice type="primary" title="注意事项">对于 Field 级别组件来说，field 属性是必填项！</Notice>

<DemoBox code={basicSrc}><Basic /></DemoBox>

#### 带参 snippet 写法

当你需要在 Form 结构内部直接获取到 `formState`、`formApi`、`values` 等值时，可以使用带参 snippet 写法：`children` snippet 的入参即为 `{ formState, formApi }`。这一种写法等价于 Semi 的 render props / child render function / props.component 三种写法（Svelte 无 render props / HOC，用带参 snippet 统一表达）。

<Notice type="primary" title="注意事项">注意，此处获取的 formState、values 等并没有经过 deepClone。你应该只做读操作，而不应该做写操作，否则可能意外修改 form 内部的状态。所有对 Form 内部状态的更新都应该通过 formApi 去操作。</Notice>

<DemoBox code={renderSnippetSrc}><RenderSnippet /></DemoBox>

### 已支持的表单控件

<DemoBox code={controlsSrc}><Controls /></DemoBox>

### 表单控件值的绑定

每个表单控件都需要以 `field` 属性绑定一个字段名称，用于将表单项的值正确映射到 `FormState` 的 values / errors / touched 中。字段可以是简单的字符串，也可以是包含 `.` 或者 `[]` 的字符串，支持多级嵌套。带参 snippet 可实时映射 `formState.values`。

<DemoBox code={valueBindingSrc}><ValueBinding /></DemoBox>

### 表单布局

`layout` 控制表单控件间的布局（垂直 vertical / 水平 horizontal，默认垂直）；`labelPosition`（top / left / inset）与 `labelAlign`（left / right）控制 label 在 Field 中出现的位置与文本对齐方向。

<DemoBox code={layoutSrc}><Layout /></DemoBox>

### 表单分组

`Form.Section` 把字段按语义分区，带分区标题（仅影响布局，不影响数据结构）。

<DemoBox code={sectionSrc}><SectionDemo /></DemoBox>

### 隐藏 Label

当你不需要自动添加 label 时，可将 `noLabel` 置为 true（保留 ErrorMessage）；`pure` 连 wrapper 也不插，样式、DOM 结构与原始控件保持一致。

<DemoBox code={noLabelSrc}><NoLabel /></DemoBox>

### 内嵌 Label

`labelPosition='inset'` 把 Label 内嵌在控件内部左侧（Input / InputNumber / DatePicker / TimePicker / Select / TreeSelect / Cascader / TagInput 支持）。

<DemoBox code={insetLabelSrc}><InsetLabel /></DemoBox>

### 导出 Label、ErrorMessage 使用

如果你需要 Form.Label、Form.ErrorMessage 模块自行组合使用，可以从 Form 中导出。例如：当自带的 Label、ErrorMessage 布局不满足业务需求，需要自行组合位置，但又希望能直接使用它们的默认样式时。

<DemoBox code={labelErrorMessageSrc}><LabelErrorMessage /></DemoBox>

### 使用 Form.Slot 放置自定义组件

当你的自定义组件需要与 Field 组件保持同样的布局样式时，可以通过 Form.Slot 放置你的自定义组件。在 Form 组件上设置的 `labelWidth`、`labelAlign` 会自动作用在 Form.Slot 上。

<DemoBox code={slotSrc}><Slot /></DemoBox>

### 使用 helpText、extraText 放置提示信息

可以通过 `helpText` 放置自定义提示信息，与校验信息（error）公用同一区块展示，两者均有值时优先展示校验信息；可以通过 `extraText` 放置额外的提示信息，常显，位于 helpText / error 后，`extraTextPosition` 控制其位置。

<DemoBox code={helpExtraSrc}><HelpExtra /></DemoBox>

### 使用 InputGroup 组合多个 Field

把多个控件组合为一组，仅需一个属于整组的 Label，控件无缝拼接，GroupError 聚合组内错误。

<DemoBox code={inputGroupSrc}><InputGroup /></DemoBox>

### Modal 弹出层中的表单

通过 `getFormApi` 拿到句柄，在弹窗确认时调用 `formApi.validate()` 集中校验。

<DemoBox code={modalSrc}><ModalDemo /></DemoBox>

### 配置初始值与校验规则

`initValues` 统一设初始值，`rules` 声明校验规则（基于 async-validator）；`stopValidateWithError` 命中首条错误即停。

<DemoBox code={validationSrc}><Validation /></DemoBox>

### 自定义校验(Form 级别)

你可以给 `Form` 整体设置自定义校验函数。推荐使用 `validator`（`validateFields` 为旧写法，仍保持兼容）。submit 或调用 formApi.validate() 时会进行调用，支持同步与异步。

<Notice title="注意">当配置了 Form 级别校验器（validator / validateFields）后，Field 级别的校验器（rules / validator）在 submit 或 formApi.validate() 时将不再生效。</Notice>

<DemoBox code={formValidatorSrc}><FormValidator /></DemoBox>

### 自定义校验(Field 级别)

你可以指定单个表单控件的自定义校验函数，支持同步、异步校验（通过返回 promise）。

<Notice title="关于 validator 与 rules[].validator">

本库的 Field 级自定义校验统一经 `rules[].validator` 表达（签名 `(value, values) => string | Promise<string>`，返回错误信息字符串或 undefined）。Semi 中 Field 上的 `validator` 与 `rules[].validator` 本是两个不同 API，本库不单列 Field `validator` prop，统一走 `rules`——需要多条规则或复用内置规则（required / type / pattern）时同样在 `rules` 中声明。

</Notice>

<DemoBox code={fieldValidatorSrc}><FieldValidator /></DemoBox>

### 静默校验

当你需要获取校验结果但不想触发 UI 更新时（如不显示错误提示、不设置 touched 状态），可以通过 `formApi.validate({ silent: true })` 实现。这在根据校验结果决定是否发起后端请求等场景中非常有用。也可通过 `formApi.validate({ fields: ['fieldA'], silent: true })` 对指定字段进行静默校验。

<DemoBox code={silentValidateSrc}><SilentValidate /></DemoBox>

### 表单联动

你可以通过监听 Field 的 onChange 事件，然后使用 formApi 进行相关修改，来使 Field 之间达到联动。

<DemoBox code={linkageSrc}><Linkage /></DemoBox>

### 动态表单

带参 snippet 拿到 `formState` 后，可按某字段的值条件渲染 / 卸载其他字段，实现动态增删表单项。

<DemoBox code={dynamicRemoveSrc}><DynamicRemove /></DemoBox>

默认情况下，当 Field 组件卸载后，其对应的值（value）、校验信息（error）、交互状态（touched）都会被重置。如果你希望 Field 卸载后保留这些状态（例如在条件渲染的场景中），可以使用 `keepState` 属性。

<DemoBox code={keepStateSrc}><KeepState /></DemoBox>

<Notice type="primary" title="注意事项">

- `keepState` 仅适用于「条件渲染卸载 / 重挂」的场景，并以 field 字段路径作为恢复依据。
- 在 `Form.List` 内部的 Field 不支持 `keepState`：调用 `remove` 会让后续行的字段路径整体前移，按路径恢复的语义不再匹配，容易出现已被删除的状态被「复活」等问题。
- 在 `Form.List` 中请通过其自身的 `add`、`remove`、`addWithInitValue` 管理数组项。

</Notice>

### 使用 Form.List

针对动态增删的数组类表单项，本库提供了 `Form.List` 作用域来简化 add / remove 的操作。`Form.List` 的 children snippet 暴露 `add`、`remove`、`addWithInitValue`、`arrayFields` 等 API，用来执行新增行、删除行、新增带初始值的行等操作（对齐 Semi ArrayField）。

<DemoBox code={arrayFieldSrc}><ArrayFieldDemo /></DemoBox>

### Hooks 的使用

我们提供了 `useFormApi`、`useFormState`、`getFieldApi`，使你在不需要通过 props 传递的情况下，也能在放置于 Form 结构内部的子组件中访问 Form 内部状态数据，以及调用 Form、Field 的相关 api。

<Notice title="关于 Svelte 的替代方式">Semi 用 React Hooks（useContext）拿 formApi / formState；Svelte 无 hooks 惯例，本库以 getContext 等价形态提供 `useFormApi()` / `useFormState()` / `getFieldApi(field)`，须在子组件 init 期（&lt;script&gt; 顶层）调用。Semi 的 HOC（withFormApi / withFormState）与 withField 封装自定义控件，在本库对应为「带参 snippet + 这三个函数」的组合，不再单列 HOC。</Notice>

<DemoBox code={hooksSrc}><Hooks /></DemoBox>

## API 参考

## Form Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| allowEmpty | 是否保留 values 中为空值的 field 的 key | boolean | false |
| autoScrollToError | submit 或 formApi.validate() 校验失败时自动滚动至出错字段，可传 ScrollIntoViewOptions | boolean \| object | false |
| disabled | 统一应用在每个 Field 的 disabled 属性 | boolean | false |
| extraTextPosition | 统一应用在每个 Field 的 extraText 位置（middle / bottom） | string | 'bottom' |
| getFormApi | Form 挂载后回调，回传内部 formApi 句柄（含 scrollToField / scrollToError / getFormProps） | (formApi) => void | |
| form | 外部预建的 formApi 实例（createForm()），用于在 Form 外部控制表单状态 | FormApi | |
| initValues | 统一设置表单初始值（仅挂载时消费一次） | object | |
| labelAlign | 统一配置 label 的 text-align 值 | string | 'left' |
| labelPosition | 统一配置 Field 中 label 的位置（top / left / inset） | string | 'top' |
| labelWidth | 统一配置 label 宽度 | string \| number | |
| layout | 表单控件间的布局（vertical / horizontal） | string | 'vertical' |
| onChange | form 值更新时触发，入参为最新 values | (values) => void | |
| onErrorChange | 任意字段错误集合变化时触发，入参为最新 errors + 变更子集 | (errors, changedError) => void | |
| onReset | 点击 reset 或调用 formApi.reset() 时的回调 | () => void | |
| onSubmit | 校验成功后的提交回调 | `(r: { valid; values; errors }) => void` | |
| onSubmitFail | 校验失败后的提交回调（带原生 submit 事件） | (errors, values, e) => void | |
| showValidateIcon | 校验信息区块是否自动展示状态图标 | boolean | true |
| stopPropagation | 提交 / 重置时是否阻止事件冒泡（`{ submit?; reset? }`） | object | |
| stopValidateWithError | 统一应用在每个 Field 的 stopValidateWithError | boolean | false |
| validateTrigger | 统一应用在每个 Field 的校验时机（change / blur / submit / mount 或其组合） | string \| array | ['blur','change'] |
| validator | Form 级别自定义校验函数（推荐），submit / validate 时调用，返回 `{ field: 错误信息 }`。支持同步 / 异步 | (values) => object | |
| validateFields | validator 的旧别名（已废弃，仍兼容） | (values) => object | |
| requiredMark | 是否显示必填星标 | boolean | true |

## FormState

FormState 存储了所有 Form 内部的状态值，包括各表单控件的值、错误信息、touched 状态。进行表单提交时，实际提交的就是 formState.values。

| 名称 | 说明 | 初始值 | 示例 |
| --- | --- | --- | --- |
| values | 表单的值 | `{}` | `{ fieldA: 'str', fieldB: true }` |
| errors | 表单错误信息集合 | `{}` | `{ fieldA: 'length not valid' }` |
| touched | 用户点击过的 field 集合 | `{}` | `{ fieldA: true }` |

### 如何访问 formState

- 通过 `formApi.getFormState()`，在 Form 外部也可以获取 formState。
- 通过带参 snippet 声明表单，`formState` 会作为 snippet 参数注入。
- 通过 `useFormState()`，在 Form 内部的子组件访问父级 Form 的 formState。

## FormApi

FormApi 允许你使用 getter 和 setter 来获取和操作 formState 的值。你在 Form 内部、外部都可以方便地获取到 formApi。

| 方法 | 说明 | 示例 |
| --- | --- | --- |
| getFormState | 获取 FormState | formApi.getFormState() |
| getFormProps | 获取 Form 组件当前 props 值 | formApi.getFormProps(propNames?: string[]) |
| submitForm | 手动触发 submit 提交操作 | formApi.submitForm() |
| reset | 手动对 form 进行重置 | formApi.reset(fields?: string[]) |
| validate | 手动触发校验；不传参默认校验全部字段，传 `{ silent: true }` 静默校验、`{ fields, silent }` 静默校验指定字段 | `formApi.validate()` / `validate(['a','b'])` / `validate({ silent: true })` |
| validateField | 校验单个字段，resolve 其阻塞错误（或 undefined） | formApi.validateField(field: string) |
| setValues | 设置整个表单的值（config.isOverride 控制是否整体替换） | `formApi.setValues(values, { isOverride })` |
| setValue | 修改单个 field 的值 | formApi.setValue(field, value) |
| getValue | 获取单个 field 的值（不传返回全部 values 快照） | formApi.getValue(field?) |
| getValues | 获取所有 field 的值（honoring allowEmpty） | formApi.getValues() |
| setTouched | 修改 formState.touched | formApi.setTouched(field, isTouched) |
| getTouched | 获取 field 的 touched 状态 | formApi.getTouched(field) |
| setError | 修改某个 field 的 error 信息 | formApi.setError(field, message) |
| getError | 获取 field 的 error（不传返回整个 errors map） | formApi.getError(field?) |
| getFieldExist | 获取 Form 中是否存在对应 field | formApi.getFieldExist(field) |
| scrollToField | 滚动至指定 field | formApi.scrollToField(field, opts?) |
| scrollToError | 滚动至校验错误的 field | formApi.scrollToError(opts?) |

### 如何获取 formApi

- 通过 Form 的 `getFormApi` 回调，在回调中保存 formApi 引用。
- 通过外部预建 `const form = createForm()` 并传入 `<Form {form}>`（对齐 Semi Form.useForm()，Svelte 中 createForm() 同步返回真 api，父组件立即可调）。
- 通过带参 snippet 声明表单，`formApi` 会作为 snippet 参数注入。
- 通过 `useFormApi()`，在 Form 内部的子组件访问父级 Form 的 formApi。

## Field Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| field | 该表单控件的值在 formState.values 中的映射路径，**必填** | string | |
| label | label 标签文本，不传默认与 field 同名；传 object 时透传给 Form.Label | string \| object | |
| labelPosition | 该控件的 label 位置（top / left / inset），与 Form 同传时以 Field 为准 | string | |
| labelAlign | 该控件的 label 文本对齐，与 Form 同传时以 Field 为准 | string | |
| labelWidth | 该控件的 label 宽度，与 Form 同传时以 Field 为准 | string \| number | |
| noLabel | 不自动添加 label | boolean | false |
| noErrorMessage | 不自动添加 ErrorMessage 模块（此时 helpText 也不展示） | boolean | false |
| name | fieldWrapper 追加的 className（自动加前缀） | string | |
| fieldClassName | 整个 fieldWrapper 的 className（不加前缀） | string | |
| fieldStyle | 整个 fieldWrapper 的内联样式 | object | |
| initValue | 该控件的初始值（仅 mounted 时消费一次），优先级高于 Form 的 initValues | any | |
| rules | 校验规则（基于 async-validator），支持 rules[].validator 自定义校验 | array | |
| validateStatus | 该控件的校验结果状态（仅影响样式）：success / error / warning / default | string | 'default' |
| trigger | 触发校验的时机：blur / change / custom / mount，或其组合 | string \| array | 'change' |
| onChange | 值变化时的回调 | (value) => void | |
| transform | 校验前转换字段值（仅校验时消费，对 formState 无影响） | (value) => value | |
| keepState | Field 卸载后是否保留其状态（value / error / touched） | boolean | false |
| stopValidateWithError | 命中首条不通过的 rule 后不再触发后续 rule | boolean | false |
| helpText | 自定义提示信息，与校验信息公用同一区块（校验信息优先） | string | |
| extraText | 额外提示信息，位于 helpText / error 后 | string | |
| extraTextPosition | 控制 extraText 显示位置（middle / bottom） | string | 'bottom' |
| pure | 仅接管数据流，不插入 Label / ErrorMessage / extraText 等模块 | boolean | false |

## Form.List Props

针对动态增删的数组类表单项，`Form.List` 作用域简化 add / remove 操作。

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| name | 数组字段名（子字段前缀），必填 | string | |
| initialCount | 初始行数 | number | 0 |
| children | 带参 snippet，入参为 `{ arrayFields, add, addWithInitValue, remove, move }` | Snippet | |

children snippet 入参：`arrayFields`（每行 `{ key, index, name(sub), remove }`，用于 `{#each}` 渲染）、`add(index?)`（末尾追加 / 指定位置插入空行）、`addWithInitValue(rowVal, index?)`（追加带初始值的行）、`remove(item)`、`move(from, to)`。

## 无障碍

- 每个 `Form.Field` 通过 `useId` 生成 `id`，Label 用 `for={id}` 关联；控件 `aria-describedby` 指向 `extraText` 和错误文案节点。
- 必填控件加 `aria-required="true"`；必填星标本身 `aria-hidden="true"`（避免读屏念"星号"）。
- 校验失败控件加 `aria-invalid="true"`；错误文案容器使用 `role="alert"` 或 `aria-live="polite"`。
- 提交失败后焦点移至首个错误字段（`scrollToError` + `.focus()`）；表单不劫持 Tab，保持自然 tab 序。
