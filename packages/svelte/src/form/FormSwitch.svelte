<!--
  Form.Switch — convenience wrapper: <Form.Field> + <Switch> bound to a field.
  Uses valuePropName='checked' since Switch is a boolean control.
-->
<script lang="ts">
  import type { Rule, ValidateTrigger } from '@chenzy-design/core';
  import type { ComponentProps, Snippet } from 'svelte';
  import Field from './Field.svelte';
  import Switch from '../switch/Switch.svelte';

  type SwitchProps = ComponentProps<typeof Switch>;

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
    // Switch-specific props
    disabled?: boolean;
    size?: SwitchProps['size'];
    loading?: SwitchProps['loading'];
    checkedChildren?: string | Snippet;
    uncheckedChildren?: string | Snippet;
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
    disabled,
    size,
    loading,
    checkedChildren,
    uncheckedChildren,
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
  {#snippet children({ value, onChange, onBlur, status, disabled: fieldDisabled })}
    <Switch
      {...(typeof value === 'boolean' ? { value } : {})}
      disabled={disabled ?? fieldDisabled}
      {...(size !== undefined ? { size } : {})}
      {...(loading !== undefined ? { loading } : {})}
      {...(checkedChildren !== undefined ? { checkedChildren } : {})}
      {...(uncheckedChildren !== undefined ? { uncheckedChildren } : {})}
      status={status === 'error' ? 'error' : 'default'}
      onChange={(v) => onChange(v)}
      onBlur={() => onBlur()}
    />
  {/snippet}
</Field>
