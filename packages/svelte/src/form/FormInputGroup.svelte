<!--
  Form.InputGroup — 对齐 Semi form/group.tsx。
  容器：把内部多个 <Form.Field> 的 Label / ErrorMessage 上提到 group 级统一渲染，
  内部字段经 context 自动进入 isInInputGroup 模式（不各自插 Label/Error）。GroupError
  聚合组内所有字段的错误。视觉上用 InputGroup 把控件无缝拼接为一组。
  支持 label / labelPosition / extraText / extraTextPosition（对齐 Semi InputGroupProps）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { SvelteSet } from 'svelte/reactivity';
  import { getFormContext } from './context.js';
  import { setFormInputGroupContext } from './input-group-context.js';
  import FormLabel from './FormLabel.svelte';
  import FormErrorMessage from './FormErrorMessage.svelte';
  import InputGroup from '../input/InputGroup.svelte';

  /** 组标签（对齐 Semi LabelProps 子集）。 */
  interface GroupLabelProps {
    text?: string;
    align?: 'left' | 'right';
    width?: number | string;
    required?: boolean;
    extra?: string;
    optional?: boolean;
  }

  interface Props {
    /** 组级标签：字符串或对象形态（对齐 Semi label: LabelProps）。 */
    label?: string | GroupLabelProps;
    /** 组标签位置：'top' | 'left'（不传继承 Form context）。 */
    labelPosition?: 'top' | 'left';
    /** 额外说明文本（对齐 Semi extraText）。 */
    extraText?: string;
    /** 额外说明位置：'bottom'（控件下方，默认）| 'middle'（label 与控件之间）。 */
    extraTextPosition?: 'bottom' | 'middle';
    /** 整组尺寸，透传给 InputGroup（回退给组内控件）。 */
    size?: 'small' | 'default' | 'large';
    /** 根节点自定义类名。 */
    class?: string;
    /** 根节点自定义内联样式。 */
    style?: string;
    /** 组内字段（<Form.Field> / Form.Input 等）。 */
    children?: Snippet;
  }

  let {
    label,
    labelPosition: labelPositionProp,
    extraText,
    extraTextPosition = 'bottom',
    size,
    class: className,
    style,
    children,
  }: Props = $props();

  const ctx = getFormContext();
  if (!ctx) throw new Error('<Form.InputGroup> must be used inside <Form>');
  const { getFormState } = ctx;

  // label 归一化（字符串 / 对象）。
  const labelObj = $derived(
    typeof label === 'object' && label !== null ? label : undefined,
  );
  const labelText = $derived(typeof label === 'string' ? label : labelObj?.text);
  const hasLabel = $derived(labelText !== undefined && labelText !== '');

  // group label 位置：prop 优先，否则继承 Form；只支持 top/left（inset 回退 top）。
  const formLabelPos = $derived(ctx.getLabelPosition());
  const labelPosition = $derived(
    labelPositionProp ?? (formLabelPos === 'left' ? 'left' : 'top'),
  );
  const labelWidth = $derived(labelObj?.width ?? ctx.getLabelWidth());
  const labelAlign = $derived(labelObj?.align ?? ctx.getLabelAlign());
  const showValidateIcon = $derived(ctx.getShowValidateIcon());
  const disabled = $derived(ctx.getDisabled());

  // 收集组内字段名（Field 经 context 注册）；SvelteSet 保证 add/delete 触发响应式
  // （MEMORY: 普通 Set mutation 非响应式）。
  const fieldSet = new SvelteSet<string>();
  setFormInputGroupContext({
    register(field: string) {
      fieldSet.add(field);
      return () => fieldSet.delete(field);
    },
  });

  // GroupError：聚合组内所有字段的错误（对齐 Semi GroupError = fieldSet.map(get errors)）。
  const groupErrors = $derived(
    [...fieldSet]
      .map((f) => getFormState().errors[f])
      .filter((e): e is string => typeof e === 'string' && e !== ''),
  );

  // x-label-pos 镜像 Semi group 供样式与 DOM 定位；经 attrs 对象展开，让 svelte-check 接受非标准属性名。
  const rootAttrs = $derived({ 'x-label-pos': labelPosition });
  // size 仅在显式传入时透传（exactOptionalPropertyTypes：不能传 undefined 给必填 union）。
  const groupSize = $derived(size !== undefined ? { size } : {});
  // label 的 extra/width 仅在显式存在时透传（同 exactOptionalPropertyTypes 约束）。
  const labelExtra = $derived(labelObj?.extra !== undefined ? { extra: labelObj.extra } : {});
  const labelWidthAttr = $derived(labelWidth !== undefined ? { width: labelWidth } : {});
</script>

<!--
  DOM 对齐 Semi group.tsx：<div class="cd-form-field-group" x-label-pos><Label/>
  <div>{extra middle}<InputGroup>{fields}</InputGroup>{extra bottom}<GroupError/></div></div>。
-->
<div class={['cd-form-field-group', className].filter(Boolean).join(' ')} {...rootAttrs} {style}>
  {#if hasLabel}
    <FormLabel
      text={labelText}
      align={labelAlign}
      {...labelWidthAttr}
      required={labelObj?.required ?? false}
      optional={labelObj?.optional ?? false}
      {...labelExtra}
    />
  {/if}
  <div class="cd-form-field-group-body">
    {#if extraText && extraTextPosition === 'middle'}
      <div class="cd-form-field-extra cd-form-field-extra-string cd-form-field-extra-middle">{extraText}</div>
    {/if}
    <InputGroup {...groupSize} {disabled}>
      {@render children?.()}
    </InputGroup>
    {#if extraText && extraTextPosition === 'bottom'}
      <div class="cd-form-field-extra cd-form-field-extra-string cd-form-field-extra-bottom">{extraText}</div>
    {/if}
    <FormErrorMessage error={groupErrors} {showValidateIcon} isInInputGroup />
  </div>
</div>

<style>
  /* group：top 时 label 块级在上、body 在下；left 时 label 与 body 横排（对齐 Semi group scss）。 */
  .cd-form-field-group[x-label-pos='top'] {
    display: block;
  }
  .cd-form-field-group[x-label-pos='left'] {
    display: flex;
    align-items: flex-start;
  }
  .cd-form-field-group[x-label-pos='left'] .cd-form-field-group-body {
    flex: 1;
    min-inline-size: 0;
  }
</style>
