<!--
  Form.DatePicker — convenience wrapper: <Form.Field> + <DatePicker> bound to a field.
-->
<script lang="ts">
  import type { Rule, ValidateTrigger } from '@chenzy-design/core';
  import type { ComponentProps } from 'svelte';
  import Field from './Field.svelte';
  import DatePicker from '../date-picker/DatePicker.svelte';

  type DatePickerProps = ComponentProps<typeof DatePicker>;

  interface Props {
    field: string;
    label?: string;
    rules?: Rule[];
    initValue?: unknown;
    required?: boolean;
    validateStatus?: 'default' | 'warning' | 'error';
    extraText?: string;
    span?: number;
    transform?: (value: unknown, values: Record<string, unknown>) => unknown;
    dependencies?: string[];
    trigger?: ValidateTrigger | ValidateTrigger[];
    // DatePicker-specific props
    placeholder?: DatePickerProps['placeholder'];
    disabled?: boolean;
    size?: DatePickerProps['size'];
    format?: DatePickerProps['format'];
    disabledDate?: DatePickerProps['disabledDate'];
  }

  let {
    field,
    label,
    rules = [],
    initValue,
    required = false,
    validateStatus,
    extraText,
    span,
    transform,
    dependencies,
    trigger,
    placeholder,
    disabled,
    size,
    format,
    disabledDate,
  }: Props = $props();

  const fieldProps = $derived<ComponentProps<typeof Field>>({
    field,
    rules,
    required,
    ...(label !== undefined ? { label } : {}),
    ...(initValue !== undefined ? { initValue } : {}),
    ...(validateStatus !== undefined ? { validateStatus } : {}),
    ...(extraText !== undefined ? { extraText } : {}),
    ...(span !== undefined ? { span } : {}),
    ...(transform !== undefined ? { transform } : {}),
    ...(dependencies !== undefined ? { dependencies } : {}),
    ...(trigger !== undefined ? { trigger } : {}),
  });
</script>

<Field {...fieldProps}>
  {#snippet children({ value, onChange, onBlur, status, disabled: fieldDisabled, id })}
    <DatePicker
      {...(value instanceof Date || value === null ? { value: value as NonNullable<DatePickerProps['value']> } : {})}
      {...(placeholder !== undefined ? { placeholder } : {})}
      disabled={disabled ?? fieldDisabled}
      {...(size !== undefined ? { size } : {})}
      {...(format !== undefined ? { format } : {})}
      {...(disabledDate !== undefined ? { disabledDate } : {})}
      validateStatus={status === 'error' ? 'error' : 'default'}
      onChange={(v) => onChange(v)}
      onBlur={() => onBlur()}
    />
  {/snippet}
</Field>
