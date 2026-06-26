<!--
  Form.TreeSelect — convenience wrapper: <Form.Field> + <TreeSelect> bound to a field.
-->
<script lang="ts">
  import type { Rule, ValidateTrigger } from '@chenzy-design/core';
  import type { ComponentProps } from 'svelte';
  import Field from './Field.svelte';
  import TreeSelect from '../tree-select/TreeSelect.svelte';

  type TreeSelectProps = ComponentProps<typeof TreeSelect>;

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
    // TreeSelect-specific props
    treeData?: TreeSelectProps['treeData'];
    multiple?: TreeSelectProps['multiple'];
    placeholder?: TreeSelectProps['placeholder'];
    disabled?: boolean;
    clearable?: TreeSelectProps['clearable'];
    size?: TreeSelectProps['size'];
    maxTagCount?: TreeSelectProps['maxTagCount'];
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
    clearable,
    size,
    maxTagCount,
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
    <TreeSelect
      value={value as TreeSelectProps['value']}
      {treeData}
      {multiple}
      {placeholder}
      disabled={disabled ?? fieldDisabled}
      {clearable}
      {size}
      {maxTagCount}
      status={status === 'error' ? 'error' : 'default'}
      onChange={(v) => onChange(v)}
    />
  {/snippet}
</Field>
