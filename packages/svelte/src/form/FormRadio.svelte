<!--
  Form.Radio — convenience wrapper: <Form.Field> + <Radio> bound to a field.
  Uses valuePropName='checked' since Radio is a boolean/selected control.
-->
<script lang="ts">
  import type { Rule, ValidateTrigger } from '@chenzy-design/core';
  import type { ComponentProps, Snippet } from 'svelte';
  import Field from './Field.svelte';
  import Radio from '../radio/Radio.svelte';

  type RadioProps = ComponentProps<typeof Radio>;

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
    // Radio-specific props
    /** Radio 自身的业务值（用于 RadioGroup；作为独立 Field 时通常不需要）。 */
    value?: RadioProps['value'];
    disabled?: boolean;
    size?: RadioProps['size'];
    type?: RadioProps['type'];
    children?: Snippet;
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
    value: radioValue = '' as RadioProps['value'],
    disabled,
    size,
    type,
    children,
  }: Props = $props();

  const fieldProps = $derived<ComponentProps<typeof Field>>({
    field,
    rules,
    required,
    valuePropName: 'checked',
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
    <Radio
      value={radioValue}
      checked={typeof value === 'boolean' ? value : undefined}
      disabled={disabled ?? fieldDisabled}
      {size}
      {type}
      status={status === 'error' ? 'error' : 'default'}
      onChange={(checked) => onChange(checked)}
    >
      {@render children?.()}
    </Radio>
  {/snippet}
</Field>
