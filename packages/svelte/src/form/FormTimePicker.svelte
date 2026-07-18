<!--
  Form.TimePicker — convenience wrapper: <Form.Field> + <TimePicker> bound to a field.
  onChange 首参即值（Date | null | [..]），直传。
-->
<script lang="ts">
  import type { Rule, ValidateTrigger } from '@chenzy-design/core';
  import type { ComponentProps } from 'svelte';
  import Field from './Field.svelte';
  import TimePicker from '../time-picker/TimePicker.svelte';

  type TimePickerProps = ComponentProps<typeof TimePicker>;

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
    // TimePicker-specific props
    placeholder?: TimePickerProps['placeholder'];
    disabled?: boolean;
    size?: TimePickerProps['size'];
    format?: TimePickerProps['format'];
    use12Hours?: TimePickerProps['use12Hours'];
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
    use12Hours,
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
  {#snippet children({ value, onChange, status, disabled: fieldDisabled })}
    <TimePicker
      {...(value !== undefined && value !== null ? { value: value as NonNullable<TimePickerProps['value']> } : {})}
      validateStatus={status === 'error' ? 'error' : 'default'}
      disabled={disabled ?? fieldDisabled}
      {...(placeholder !== undefined ? { placeholder } : {})}
      {...(size !== undefined ? { size } : {})}
      {...(format !== undefined ? { format } : {})}
      {...(use12Hours !== undefined ? { use12Hours } : {})}
      onChange={(v) => onChange(v)}
    />
  {/snippet}
</Field>
