<!--
  Form.Cascader — convenience wrapper: <Form.Field> + <Cascader> bound to a field.
-->
<script lang="ts">
  import type { Rule, ValidateTrigger } from '@chenzy-design/core';
  import type { ComponentProps } from 'svelte';
  import Field from './Field.svelte';
  import Cascader from '../cascader/Cascader.svelte';

  type CascaderProps = ComponentProps<typeof Cascader>;

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
    // Cascader-specific props
    treeData?: CascaderProps['treeData'];
    multiple?: CascaderProps['multiple'];
    placeholder?: CascaderProps['placeholder'];
    disabled?: boolean;
    size?: CascaderProps['size'];
    displayProp?: CascaderProps['displayProp'];
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
    treeData,
    multiple,
    placeholder,
    disabled,
    size,
    displayProp,
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
    <Cascader
      value={value as CascaderProps['value']}
      {treeData}
      {multiple}
      {placeholder}
      disabled={disabled ?? fieldDisabled}
      {size}
      {displayProp}
      status={status === 'error' ? 'error' : 'default'}
      onChange={(v) => onChange(v)}
    />
  {/snippet}
</Field>
