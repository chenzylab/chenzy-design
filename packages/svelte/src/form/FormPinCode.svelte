<!--
  Form.PinCode — convenience wrapper: <Form.Field> + <PinCode> bound to a field.
  onChange 首参即值（string 整串），直传。可选透传 onComplete。
-->
<script lang="ts">
  import type { Rule, ValidateTrigger } from '@chenzy-design/core';
  import type { ComponentProps } from 'svelte';
  import Field from './Field.svelte';
  import PinCode from '../pincode/PinCode.svelte';

  type PinCodeProps = ComponentProps<typeof PinCode>;

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
    // PinCode-specific props
    count?: PinCodeProps['count'];
    format?: PinCodeProps['format'];
    size?: PinCodeProps['size'];
    disabled?: boolean;
    autoFocus?: PinCodeProps['autoFocus'];
    onComplete?: PinCodeProps['onComplete'];
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
    count,
    format,
    size,
    disabled,
    autoFocus,
    onComplete,
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
  {#snippet children({ value, onChange, status, disabled: fieldDisabled, id })}
    <PinCode
      value={value === undefined ? '' : String(value)}
      status={status === 'error' ? 'error' : 'default'}
      disabled={disabled ?? fieldDisabled}
      {id}
      {...(count !== undefined ? { count } : {})}
      {...(format !== undefined ? { format } : {})}
      {...(size !== undefined ? { size } : {})}
      {...(autoFocus !== undefined ? { autoFocus } : {})}
      {...(label !== undefined ? { ariaLabel: label } : {})}
      onChange={(v) => onChange(v)}
      {...(onComplete !== undefined ? { onComplete } : {})}
    />
  {/snippet}
</Field>
