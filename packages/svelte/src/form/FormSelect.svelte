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
    style?: SelectProps['style'];
  }

  const props: Props = $props();
  const split = $derived(splitFieldProps(props));
  const fieldProps = $derived(split.fieldProps);
  const rest = $derived(split.rest as Record<string, unknown>);
  const labelForAria = $derived(typeof props.label === 'string' ? props.label : props.label?.text);
</script>

<Field {...fieldProps}>
  {#snippet children({ value, onChange, status, disabled: fieldDisabled, id, describedBy, errorMessageId, labelledById, required, insetLabel, insetLabelId })}
    <Select
      {...rest}
      {...(value !== undefined ? { value: value as NonNullable<SelectProps['value']> } : {})}
      disabled={(rest.disabled as boolean | undefined) ?? fieldDisabled}
      validateStatus={status === 'error' ? 'error' : 'default'}
      {id}
      {...(insetLabel !== undefined ? { insetLabel } : {})}
      {...(insetLabelId !== undefined ? { insetLabelId } : {})}
      {...(labelledById !== undefined ? { ariaLabelledby: labelledById } : labelForAria !== undefined ? { 'aria-label': labelForAria } : {})}
      {...(describedBy !== undefined ? { ariaDescribedby: describedBy } : {})}
      {...(errorMessageId !== undefined ? { ariaErrormessage: errorMessageId } : {})}
      {...(required ? { ariaRequired: true } : {})}
      onChange={(v) => onChange(v)}
    />
  {/snippet}
</Field>
