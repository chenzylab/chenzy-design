<!--
  Form.AutoComplete — convenience wrapper: <Form.Field> + <AutoComplete> bound to a field.
  onChange 首参即值（string | number），直传。
-->
<script lang="ts">
  import type { Rule, ValidateTrigger } from '@chenzy-design/core';
  import type { ComponentProps } from 'svelte';
  import Field from './Field.svelte';
  import AutoComplete from '../autocomplete/AutoComplete.svelte';

  type AutoCompleteProps = ComponentProps<typeof AutoComplete>;

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
    // AutoComplete-specific props
    data?: AutoCompleteProps['data'];
    placeholder?: AutoCompleteProps['placeholder'];
    disabled?: boolean;
    size?: AutoCompleteProps['size'];
    showClear?: AutoCompleteProps['showClear'];
    onSearch?: AutoCompleteProps['onSearch'];
    loading?: AutoCompleteProps['loading'];
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
    data,
    placeholder,
    disabled,
    size,
    showClear,
    onSearch,
    loading,
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
    <AutoComplete
      {...(value !== undefined ? { value: value as NonNullable<AutoCompleteProps['value']> } : {})}
      {...(data !== undefined ? { data } : {})}
      validateStatus={status === 'error' ? 'error' : 'default'}
      disabled={disabled ?? fieldDisabled}
      {...(placeholder !== undefined ? { placeholder } : {})}
      {...(size !== undefined ? { size } : {})}
      {...(showClear !== undefined ? { showClear } : {})}
      {...(onSearch !== undefined ? { onSearch } : {})}
      {...(loading !== undefined ? { loading } : {})}
      {...(label !== undefined ? { ariaLabel: label } : {})}
      onChange={(v) => onChange(v)}
    />
  {/snippet}
</Field>
