---
title: Form 表单
name: form
category: input
brief: Form 是表单容器组件，负责承载并编排一组输入控件，提供字段注册、值收集、校验、错误展示与布局四大核心能力。
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';
  import Notice from '$lib/components/Notice.svelte';

  import Basic from '../../demos/form/01-basic.svelte';
  import basicSrc from '../../demos/form/01-basic.svelte?raw';
  import RenderProp from '../../demos/form/31-render-prop.svelte';
  import renderPropSrc from '../../demos/form/31-render-prop.svelte?raw';
  import ChildFunction from '../../demos/form/32-child-function.svelte';
  import childFunctionSrc from '../../demos/form/32-child-function.svelte?raw';
  import ComponentProp from '../../demos/form/33-component-prop.svelte';
  import componentPropSrc from '../../demos/form/33-component-prop.svelte?raw';
  import Controls from '../../demos/form/02-controls.svelte';
  import controlsSrc from '../../demos/form/02-controls.svelte?raw';
  import ValueBinding from '../../demos/form/03-value-binding.svelte';
  import valueBindingSrc from '../../demos/form/03-value-binding.svelte?raw';
  import LayoutVertical from '../../demos/form/14-layout-vertical.svelte';
  import layoutVerticalSrc from '../../demos/form/14-layout-vertical.svelte?raw';
  import LayoutHorizontal from '../../demos/form/15-layout-horizontal.svelte';
  import layoutHorizontalSrc from '../../demos/form/15-layout-horizontal.svelte?raw';
  import Layout from '../../demos/form/04-layout.svelte';
  import layoutSrc from '../../demos/form/04-layout.svelte?raw';
  import LayoutGrid from '../../demos/form/16-layout-grid.svelte';
  import layoutGridSrc from '../../demos/form/16-layout-grid.svelte?raw';
  import ColLayout from '../../demos/form/30-col-layout.svelte';
  import colLayoutSrc from '../../demos/form/30-col-layout.svelte?raw';
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
  import HelpExtraPosition from '../../demos/form/17-help-extra-position.svelte';
  import helpExtraPositionSrc from '../../demos/form/17-help-extra-position.svelte?raw';
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

从 Form 中导出表单控件，给表单控件添加 `field` 属性，将其放置于 Form 内部即可  
还可以给每个表单控件设置 `label` 属性，不传入时默认与 field 相同  
`label` 可以直接传入字符串，亦可以以 object 方式声明，配置 `extra`、`required`、`optional` 等属性应对更复杂的场景

<Notice type="primary" title="注意事项">对于 Field 级别组件来说，field 属性是必填项！</Notice>

<DemoBox code={basicSrc}><Basic /></DemoBox>

#### 支持的其他写法

当你需要在 Form 结构内部直接获取到 `formState`、`formApi`、`values` 等值时，你还可以使用以下的写法。这三种写法在 Semi（React）里是 render props / child render function / props.component 三个不同入口，在本库（Svelte）中统一用带参 snippet 表达，入参均为 `{ formState, values, formApi }`（对齐 Semi FormFCChild）。

<Notice type="primary" title="注意事项">注意，此处获取的 formState、values 等并没有经过 deepClone。你应该只做读操作，而不应该做写操作，否则可能意外修改 form 内部的状态。所有对 Form 内部状态的更新都应该通过 formApi 去操作。</Notice>

#### 通过 render 属性传入

即 render props：把声明控件的带参 snippet 传给 Form 的 `render` 属性。

<DemoBox code={renderPropSrc}><RenderProp /></DemoBox>

#### 通过 child render function

Form 的 children 是一个带参 snippet，return 出所有表单控件。

<DemoBox code={childFunctionSrc}><ChildFunction /></DemoBox>

#### 通过 props.component

通过 `component` 属性直接将整个内部结构以带参 snippet 传入。

<DemoBox code={componentPropSrc}><ComponentProp /></DemoBox>

### 已支持的表单控件

<DemoBox code={controlsSrc}><Controls /></DemoBox>

### 表单控件值的绑定

每个表单控件都需要以 `field` 属性绑定一个字段名称，用于将表单项的值正确映射到 `FormState` 的 values / errors / touched 中。  
字段可以是简单的字符串，也可以是包含 `.` 或者 `[]` 的字符串，支持多级嵌套。  
下面是字段名称以及它们在 FormState 中映射路径的示例：

| Field                  | Resolution                         |
| ---------------------- | ----------------------------------- |
| username               | formState.values.username          |
| user\[0\]              | formState.values.user\[0\]         |
| siblings.1             | formState.values.siblings\[1\]     |
| siblings\['2'\]        | formState.values.siblings\[2\]     |
| parents\[0\].name      | formState.values.parents\[0\].name |
| parents\[1\]\['name'\] | formState.values.parents\[1\].name |

带参 snippet 可实时映射 `formState.values`。

<DemoBox code={valueBindingSrc}><ValueBinding /></DemoBox>

### 表单布局

- 垂直布局：表单控件之间上下垂直排列（默认）。更推荐表单采用垂直布局。

<DemoBox code={layoutVerticalSrc}><LayoutVertical /></DemoBox>

- 水平布局：表单控件之间水平排列。可通过设置 `layout='horizontal'` 来使用水平布局。

<DemoBox code={layoutHorizontalSrc}><LayoutHorizontal /></DemoBox>

- `labelPosition`、`labelAlign`：可通过设置 `labelPosition`（top / left / inset）、`labelAlign`（left / right）控制 label 在 Field 中出现的位置，文本对齐的方向。

<DemoBox code={layoutSrc}><Layout /></DemoBox>

- 更复杂的布局：还可以结合 `Row`、`Col`，来对表单进行你想要的排列。

<DemoBox code={layoutGridSrc}><LayoutGrid /></DemoBox>

### wrapperCol / labelCol

需要为 Form 内的所有 Field 设置统一的布局时，可以在 Form 上设置 `wrapperCol`、`labelCol` 快速生成布局，无需手动使用 `Row`、`Col` 摆放。`wrapperCol`、`labelCol` 属性配置参考 [Col 组件](/components/grid#col)。

<DemoBox code={colLayoutSrc}><ColLayout /></DemoBox>

### 表单分组

`Form.Section` 把字段按语义分区，带分区标题（仅影响布局，不影响数据结构）。

<DemoBox code={sectionSrc}><SectionDemo /></DemoBox>

### 隐藏 Label

当你不需要自动添加 label 时，可将 `noLabel` 置为 true（保留 ErrorMessage）；  
`pure` 连 wrapper 也不插，样式、DOM 结构与原始控件保持一致。

<DemoBox code={noLabelSrc}><NoLabel /></DemoBox>

### 内嵌 Label

`labelPosition='inset'` 把 Label 内嵌在控件内部左侧（Input / InputNumber / DatePicker / TimePicker / Select / TreeSelect / Cascader / TagInput 支持）。

<DemoBox code={insetLabelSrc}><InsetLabel /></DemoBox>

### 导出 Label、ErrorMessage 使用

如果你需要 Form.Label、Form.ErrorMessage 模块自行组合使用，可以从 Form 中导出。  
例如：当自带的 Label、ErrorMessage 布局不满足业务需求，需要自行组合位置，但又希望能直接使用它们的默认样式时。

<DemoBox code={labelErrorMessageSrc}><LabelErrorMessage /></DemoBox>

### 使用 Form.Slot 放置自定义组件

当你的自定义组件需要与 Field 组件保持同样的布局样式时，可以通过 Form.Slot 放置你的自定义组件。  
在 Form 组件上设置的 `labelWidth`、`labelAlign` 会自动作用在 Form.Slot 上。

<DemoBox code={slotSrc}><Slot /></DemoBox>

### 使用 helpText、extraText 放置提示信息

可以通过 `helpText` 放置自定义提示信息，与校验信息（error）公用同一区块展示，两者均有值时优先展示校验信息。  
可以通过 `extraText` 放置额外的提示信息，当需要错误信息和提示文案同时出现时可以使用这个配置，常显，位于 helpText / error 后。  
当传入 `validateStatus` 时，优先展示 validateStatus 值对应的 UI 样式；不传入时，以 field 内部校验状态为准。

<DemoBox code={helpExtraSrc}><HelpExtra /></DemoBox>

通过配置 `extraTextPosition`，你可以控制 extraText 的显示位置，可选值 `bottom`、`middle`。例如当你希望将 extraText 提示信息显示在 Label 与 Field 控件中间时。  
该属性可在 Form 上统一配置，亦可在每个 Field 上单独配置，同时传入时以 Field 的配置为准。

<DemoBox code={helpExtraPositionSrc}><HelpExtraPosition /></DemoBox>

### 使用 InputGroup 组合多个 Field

把多个控件组合为一组，仅需一个属于整组的 Label，控件无缝拼接，GroupError 聚合组内错误。

<DemoBox code={inputGroupSrc}><InputGroup /></DemoBox>

### Modal 弹出层中的表单

通过 `getFormApi` 拿到句柄，在弹窗确认时调用 `formApi.validate()` 集中校验。

<DemoBox code={modalSrc}><ModalDemo /></DemoBox>

### 配置初始值与校验规则

`initValues` 统一设初始值，`rules` 声明校验规则（基于 async-validator）；  
`stopValidateWithError` 命中首条错误即停。

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
- 在 `Form.ArrayField` 内部的 Field 不支持 `keepState`：调用 `remove` 会让后续行的字段路径整体前移，按路径恢复的语义不再匹配，容易出现已被删除的状态被「复活」等问题。
- 在 `Form.ArrayField` 中请通过其自身的 `add`、`remove`、`addWithInitValue` 管理数组项。

</Notice>

### 使用 Form.ArrayField

针对动态增删的数组类表单项，本库提供了 `Form.ArrayField` 作用域来简化 add / remove 的操作（对齐 Semi ArrayField）。  
`Form.ArrayField` 的 children snippet 暴露 `add`、`remove`、`addWithInitValue`、`arrayFields` 等 API，用来执行新增行、删除行、新增带初始值的行等操作。

<DemoBox code={arrayFieldSrc}><ArrayFieldDemo /></DemoBox>

### Hooks 的使用

我们提供了 `useFormApi`、`useFormState`、`useFieldState`、`getFieldApi`、`useArrayFieldState`，使你在不需要通过 props 传递的情况下，也能在放置于 Form 结构内部的子组件中访问 Form 内部状态数据，以及调用 Form、Field 的相关 api。

<Notice title="关于 Svelte 的替代方式">Semi 用 React Hooks（useContext）拿 formApi / formState；Svelte 无 hooks 惯例，本库以 getContext 等价形态提供 `useFormApi()` / `useFormState()` / `useFieldState(field)` / `getFieldApi(field)` / `useArrayFieldState()`，须在子组件 init 期（&lt;script&gt; 顶层）调用。Semi 的 HOC（withFormApi / withFormState）与 withField 封装自定义控件，在本库对应为「带参 snippet + 这些函数」的组合，不再单列 HOC。Semi `Form.useForm()` 靠 Proxy 实现「未挂载即可用」，Svelte 中 `createForm()` 同步返回真实 api，天然无需这层代理，直接把 `const form = createForm()` 传给 Form 的 form prop 即可（见上文 FormApi 小节）。</Notice>

<DemoBox code={hooksSrc}><Hooks /></DemoBox>

## API 参考

## Form Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| allowEmpty | 是否保留 values 中为空值的 field 的 key | boolean | false |
| autoScrollToError | submit 或 formApi.validate() 校验失败时自动滚动至出错字段，可传 ScrollIntoViewOptions | boolean \| object | false |
| disabled | 统一应用在每个 Field 的 disabled 属性 | boolean | false |
| extraTextPosition | 统一应用在每个 Field 的 extraText 位置（middle / bottom） | string | 'bottom' |
| footer | 带参 snippet，入参为 `{ submitting }`，用于自定义提交区域 | Snippet | |
| getFormApi | Form 挂载后回调，回传内部 formApi 句柄（含 scrollToField / scrollToError / getFormProps） | (formApi) => void | |
| form | 外部预建的 formApi 实例（createForm()），用于在 Form 外部控制表单状态 | FormApi | |
| id | form 元素 id（同时写 x-form-id 供外部 DOM 定位） | string | |
| initValues | 统一设置表单初始值（仅挂载时消费一次） | object | |
| labelAlign | 统一配置 label 的 text-align 值 | string | 'left' |
| labelCol | 统一设置每个 Field 的 label 列（24 栏 Grid），需与 wrapperCol 同传才生效 | `{ span?; offset? }` | |
| labelPosition | 统一配置 Field 中 label 的位置（top / left / inset） | string | 'top' |
| labelWidth | 统一配置 label 宽度 | string \| number | |
| layout | 表单控件间的布局（vertical / horizontal） | string | 'vertical' |
| onChange | form 值更新时触发，入参为最新 values | (values) => void | |
| onErrorChange | 任意字段错误集合变化时触发，入参为最新 errors + 变更子集 | (errors, changedError) => void | |
| onReset | 点击 reset 或调用 formApi.reset() 时的回调 | () => void | |
| onSubmit | 校验成功后的提交回调 | `(r: { valid; values; errors }) => void` | |
| onSubmitFail | 校验失败后的提交回调（带原生 submit 事件） | (errors, values, e) => void | |
| onValueChange | 任意字段值变化时触发，入参为最新 values + 变更子集 | (values, changedValues) => void | |
| showValidateIcon | 校验信息区块是否自动展示状态图标 | boolean | true |
| stopPropagation | 提交 / 重置时是否阻止事件冒泡（`{ submit?; reset? }`） | object | |
| stopValidateWithError | 统一应用在每个 Field 的 stopValidateWithError | boolean | false |
| validateTrigger | 统一应用在每个 Field 的校验时机（change / blur / custom / mount 或其组合） | string \| array | ['blur','change'] |
| validator | Form 级别自定义校验函数（推荐），submit / validate 时调用，返回 `{ field: 错误信息 }`。支持同步 / 异步 | (values) => object | |
| validateFields | validator 的旧别名（已废弃，仍兼容） | (values) => object | |
| value | 受控整表单值；变更经 onChange 上报 | object | |
| requiredMark | 是否显示必填星标 | boolean | true |
| wrapperCol | 统一设置每个 Field 的控件列（24 栏 Grid），需与 labelCol 同传才生效 | `{ span?; offset? }` | |

## FormState

FormState 存储了所有 Form 内部的状态值，包括各表单控件的值、错误信息、touched 状态。进行表单提交时，实际提交的就是 formState.values。

| 名称 | 说明 | 初始值 | 示例 |
| --- | --- | --- | --- |
| values | 表单的值 | `{}` | `{ fieldA: 'str', fieldB: true }` |
| errors | 表单错误信息集合 | `{}` | `{ fieldA: 'length not valid' }` |
| touched | 用户点击过的 field 集合 | `{}` | `{ fieldA: true }` |
| submitting | 是否正在提交中 | `false` | `true` |
| submitCount | 提交次数 | `0` | `1` |

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
| getInitValue | 获取 field 的初始值（不传返回全部初始值快照） | formApi.getInitValue(field?) |
| getInitValues | 获取全部初始值快照 | formApi.getInitValues() |
| getFieldTrigger | 获取 field 解析后的校验时机（自身覆盖 → 表单默认） | formApi.getFieldTrigger(field) |
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
| trigger | 触发校验的时机：blur / change / custom / mount，或其组合 | string \| array | 继承容器（['blur','change']） |
| dependencies | 依赖字段名；其值变化时本字段自动重校验 | string[] | |
| valuePropName | 控件值属性名；如 Checkbox/Switch 用 'checked'，snippet 参数即多出同名别名映射字段值 | string | 'value' |
| noStyle | 仅注册收集、不渲染布局 DOM（纯收集） | boolean | false |
| span | Form.Section 栅格内占列（grid-column: span N） | number | |
| onChange | 外部值变化回调，数据流接管之后额外调用，不替代内部接管，常用于字段联动 | (value) => void | |
| onBlur | 外部失焦回调，内部失焦处理之后额外调用 | () => void | |
| transform | 校验前转换字段值（仅校验时消费，对 formState 无影响） | (value) => value | |
| convert | 字段值存入 formState 前的转换函数（回写 state，别于 transform 只用于提交不回写） | (value) => value | |
| allowEmptyString | 是否允许空字符串作为有效值；默认空串当 undefined 处理，不触发 required 通过 | boolean | false |
| keepState | Field 卸载后是否保留其状态（value / error / touched） | boolean | false |
| stopValidateWithError | 命中首条不通过的 rule 后不再触发后续 rule | boolean | false |
| helpText | 自定义提示信息，与校验信息公用同一区块（校验信息优先） | string | |
| extraText | 额外提示信息，位于 helpText / error 后 | string | |
| extraTextPosition | 控制 extraText 显示位置（middle / bottom） | string | 'bottom' |
| pure | 仅接管数据流，不插入 Label / ErrorMessage / extraText 等模块 | boolean | false |

## Form.ArrayField Props

针对动态增删的数组类表单项，`Form.ArrayField` 作用域简化 add / remove 操作（对齐 Semi ArrayField）。

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| field | 数组字段名（子字段前缀），必填 | string | |
| initValue | 初始整行数据数组，写入各行子字段（对齐 Semi ArrayFieldProps.initValue） | unknown[] | |
| initialCount | 初始行数（本库超集，无 initValue 时按空行数展开） | number | 0 |
| children | 带参 snippet，入参为 `{ arrayFields, add, addWithInitValue, remove, move }` | Snippet | |

children snippet 入参：`arrayFields`（每行 `{ key, index, field(sub), remove }`，用于 `{#each}` 渲染，对齐 Semi arrayFields[i].field）、`add(index?)`（末尾追加 / 指定位置插入空行）、`addWithInitValue(rowVal, index?)`（追加带初始值的行）、`remove(item)`、`move(from, to)`。

## 无障碍

- 每个 `Form.Field` 通过 `useId` 生成 `id`，Label 用 `for={id}` 关联；控件 `aria-describedby` 指向 `extraText` 和错误文案节点。
- 必填控件加 `aria-required="true"`；必填星标本身 `aria-hidden="true"`（避免读屏念"星号"）。
- 校验失败控件加 `aria-invalid="true"`；错误文案容器使用 `role="alert"` 或 `aria-live="polite"`。
- 提交失败后焦点移至首个错误字段（`scrollToError` + `.focus()`）；表单不劫持 Tab，保持自然 tab 序。
