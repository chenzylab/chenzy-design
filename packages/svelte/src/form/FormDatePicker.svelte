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
    format?: DatePickerProps['format'];
    disabledDate?: DatePickerProps['disabledDate'];
  }

  const props: Props = $props();
  const controlKeys = ['placeholder', 'disabled', 'size', 'format', 'disabledDate'] as const;
  const split = $derived(splitFieldProps(props));
  const fieldProps = $derived(split.fieldProps);
  const control = $derived(
    Object.fromEntries(controlKeys.filter((k) => props[k] !== undefined).map((k) => [k, props[k]])),
  );
  const labelForAria = $derived(typeof props.label === 'string' ? props.label : props.label?.text);
</script>

<Field {...fieldProps}>
  {#snippet children({ value, onChange, onBlur, status, disabled: fieldDisabled, describedBy, errorMessageId, labelledById, required, insetLabel, insetLabelId })}
    <DatePicker
      {...(value instanceof Date || value === null ? { value: value as NonNullable<DatePickerProps['value']> } : {})}
      {...(control.placeholder !== undefined ? { placeholder: control.placeholder as NonNullable<DatePickerProps['placeholder']> } : {})}
      disabled={(control.disabled as boolean | undefined) ?? fieldDisabled}
      {...(control.size !== undefined ? { size: control.size as NonNullable<DatePickerProps['size']> } : {})}
      {...(control.format !== undefined ? { format: control.format as NonNullable<DatePickerProps['format']> } : {})}
      {...(control.disabledDate !== undefined ? { disabledDate: control.disabledDate as NonNullable<DatePickerProps['disabledDate']> } : {})}
      validateStatus={status === 'error' ? 'error' : 'default'}
      {...(insetLabel !== undefined ? { insetLabel } : {})}
      {...(insetLabelId !== undefined ? { insetLabelId } : {})}
      {...(labelledById !== undefined ? { ariaLabelledby: labelledById } : labelForAria !== undefined ? { ariaLabel: labelForAria } : {})}
      {...(describedBy !== undefined ? { ariaDescribedby: describedBy } : {})}
      {...(errorMessageId !== undefined ? { ariaErrormessage: errorMessageId } : {})}
      {...(required ? { ariaRequired: true } : {})}
      onChange={(v) => onChange(v)}
      onBlur={() => onBlur()}
    />
  {/snippet}
</Field>
