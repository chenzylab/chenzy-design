<!--
  Form.TagInput — convenience wrapper: <Form.Field> + <TagInput> bound to a field.
-->
<script lang="ts">
  import type { Rule, ValidateTrigger } from '@chenzy-design/core';
  import type { ComponentProps } from 'svelte';
  import Field from './Field.svelte';
  import TagInput from '../tag-input/TagInput.svelte';

  type TagInputProps = ComponentProps<typeof TagInput>;

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
    // TagInput-specific props
    placeholder?: TagInputProps['placeholder'];
    disabled?: boolean;
    size?: TagInputProps['size'];
    maxLength?: TagInputProps['maxLength'];
    allowDuplicates?: TagInputProps['allowDuplicates'];
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
    maxLength,
    allowDuplicates,
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
    <TagInput
      value={Array.isArray(value) ? (value as string[]) : undefined}
      {placeholder}
      disabled={disabled ?? fieldDisabled}
      {size}
      {maxLength}
      {allowDuplicates}
      status={status === 'error' ? 'error' : 'default'}
      onChange={(tags) => onChange(tags)}
    />
  {/snippet}
</Field>
