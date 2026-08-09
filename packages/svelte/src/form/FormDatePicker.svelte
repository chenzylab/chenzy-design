<!--
  Form.DatePicker — convenience wrapper: <Form.Field> + <DatePicker> bound to a field.
  field-level props 经 FieldPassthroughProps 透传给 Field；控件专属给 DatePicker。
-->
<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import Field from './Field.svelte';
  import DatePicker from '../date-picker/DatePicker.svelte';
  import { splitFieldProps, type FieldPassthroughProps } from './field-props.js';

  type DatePickerProps = ComponentProps<typeof DatePicker>;

  interface Props extends FieldPassthroughProps {
    placeholder?: DatePickerProps['placeholder'];
    disabled?: boolean;
    size?: DatePickerProps['size'];
    type?: DatePickerProps['type'];
    format?: DatePickerProps['format'];
    disabledDate?: DatePickerProps['disabledDate'];
    style?: DatePickerProps['style'];
  }

  const props: Props = $props();
  const split = $derived(splitFieldProps(props));
  const fieldProps = $derived(split.fieldProps);
  const rest = $derived(split.rest as Record<string, unknown>);
  const labelForAria = $derived(typeof props.label === 'string' ? props.label : props.label?.text);
</script>

<Field {...fieldProps}>
  {#snippet children({ value, onChange, onBlur, status, disabled: fieldDisabled, describedBy, errorMessageId, labelledById, required, insetLabel, insetLabelId })}
    <DatePicker
      {...rest}
      {...(value instanceof Date || value === null ? { value: value as NonNullable<DatePickerProps['value']> } : {})}
      disabled={(rest.disabled as boolean | undefined) ?? fieldDisabled}
      validateStatus={status === 'error' ? 'error' : 'default'}
      {...(insetLabel !== undefined ? { insetLabel } : {})}
      {...(insetLabelId !== undefined ? { insetLabelId } : {})}
      {...(labelledById !== undefined ? { ariaLabelledby: labelledById } : labelForAria !== undefined ? { 'aria-label': labelForAria } : {})}
      {...(describedBy !== undefined ? { ariaDescribedby: describedBy } : {})}
      {...(errorMessageId !== undefined ? { ariaErrormessage: errorMessageId } : {})}
      {...(required ? { ariaRequired: true } : {})}
      onChange={(v) => onChange(v)}
      onBlur={() => onBlur()}
    />
  {/snippet}
</Field>
