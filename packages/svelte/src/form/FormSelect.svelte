<!--
  Form.Select — convenience wrapper: <Form.Field> + <Select> bound to a field.
  field-level props 经 FieldPassthroughProps 透传给 Field；控件专属给 Select。
-->
<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import Field from './Field.svelte';
  import Select from '../select/Select.svelte';
  import { splitFieldProps, type FieldPassthroughProps } from './field-props.js';

  type SelectProps = ComponentProps<typeof Select>;

  interface Props extends FieldPassthroughProps {
    optionList?: SelectProps['optionList'];
    multiple?: SelectProps['multiple'];
    filter?: SelectProps['filter'];
    placeholder?: SelectProps['placeholder'];
    disabled?: boolean;
    showClear?: SelectProps['showClear'];
    size?: SelectProps['size'];
    maxTagCount?: SelectProps['maxTagCount'];
    allowCreate?: SelectProps['allowCreate'];
    virtualize?: SelectProps['virtualize'];
  }

  const props: Props = $props();
  const controlKeys = [
    'optionList',
    'multiple',
    'filter',
    'placeholder',
    'disabled',
    'showClear',
    'size',
    'maxTagCount',
    'allowCreate',
    'virtualize',
  ] as const;
  const split = $derived(splitFieldProps(props));
  const fieldProps = $derived(split.fieldProps);
  const control = $derived(
    Object.fromEntries(controlKeys.filter((k) => props[k] !== undefined).map((k) => [k, props[k]])),
  );
  const hasLabel = $derived(props.label !== undefined);
</script>

<Field {...fieldProps}>
  {#snippet children({ value, onChange, status, disabled: fieldDisabled, id, describedBy })}
    <Select
      {...(value !== undefined ? { value: value as NonNullable<SelectProps['value']> } : {})}
      {...(control.optionList !== undefined ? { optionList: control.optionList as NonNullable<SelectProps['optionList']> } : {})}
      {...(control.multiple !== undefined ? { multiple: control.multiple as NonNullable<SelectProps['multiple']> } : {})}
      {...(control.filter !== undefined ? { filter: control.filter as NonNullable<SelectProps['filter']> } : {})}
      {...(control.placeholder !== undefined ? { placeholder: control.placeholder as NonNullable<SelectProps['placeholder']> } : {})}
      disabled={(control.disabled as boolean | undefined) ?? fieldDisabled}
      {...(control.showClear !== undefined ? { showClear: control.showClear as NonNullable<SelectProps['showClear']> } : {})}
      {...(control.size !== undefined ? { size: control.size as NonNullable<SelectProps['size']> } : {})}
      {...(control.maxTagCount !== undefined ? { maxTagCount: control.maxTagCount as NonNullable<SelectProps['maxTagCount']> } : {})}
      {...(control.allowCreate !== undefined ? { allowCreate: control.allowCreate as NonNullable<SelectProps['allowCreate']> } : {})}
      {...(control.virtualize !== undefined ? { virtualize: control.virtualize as NonNullable<SelectProps['virtualize']> } : {})}
      validateStatus={status === 'error' ? 'error' : 'default'}
      {...(hasLabel ? {} : { ariaLabelledby: id })}
      {...(describedBy !== undefined ? { ariaLabel: describedBy } : {})}
      onChange={(v) => onChange(v)}
    />
  {/snippet}
</Field>
