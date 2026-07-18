<!--
  Form.InputNumber — convenience wrapper: <Form.Field> + <InputNumber> bound to a field.
  onChange 首参即值（number | string | null），直传。
-->
<script lang="ts">
  import type { Rule, ValidateTrigger } from '@chenzy-design/core';
  import type { ComponentProps } from 'svelte';
  import Field from './Field.svelte';
  import InputNumber from '../input-number/InputNumber.svelte';

  type InputNumberProps = ComponentProps<typeof InputNumber>;

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
    // InputNumber-specific props
    placeholder?: InputNumberProps['placeholder'];
    disabled?: boolean;
    size?: InputNumberProps['size'];
    min?: InputNumberProps['min'];
    max?: InputNumberProps['max'];
    step?: InputNumberProps['step'];
    precision?: InputNumberProps['precision'];
    showClear?: InputNumberProps['showClear'];
    innerButtons?: InputNumberProps['innerButtons'];
    hideButtons?: InputNumberProps['hideButtons'];
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
    min,
    max,
    step,
    precision,
    showClear,
    innerButtons,
    hideButtons,
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
  {#snippet children({ value, onChange, onBlur, status, disabled: fieldDisabled, id, describedBy, required: fieldRequired })}
    <InputNumber
      {...(typeof value === 'number' ? { value } : { value: null })}
      validateStatus={status === 'error' ? 'error' : 'default'}
      disabled={disabled ?? fieldDisabled}
      {id}
      {...(placeholder !== undefined ? { placeholder } : {})}
      {...(size !== undefined ? { size } : {})}
      {...(min !== undefined ? { min } : {})}
      {...(max !== undefined ? { max } : {})}
      {...(step !== undefined ? { step } : {})}
      {...(precision !== undefined ? { precision } : {})}
      {...(showClear !== undefined ? { showClear } : {})}
      {...(innerButtons !== undefined ? { innerButtons } : {})}
      {...(hideButtons !== undefined ? { hideButtons } : {})}
      {...(label !== undefined ? { ariaLabel: label } : {})}
      onChange={(v) => onChange(v)}
      onBlur={() => onBlur()}
    />
  {/snippet}
</Field>
