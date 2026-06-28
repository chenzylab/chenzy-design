<!--
  Form.Checkbox — convenience wrapper: <Form.Field> + <Checkbox> bound to a field.
  Uses valuePropName='checked' since Checkbox is a boolean control.
-->
<script lang="ts">
  import type { Rule, ValidateTrigger } from '@chenzy-design/core';
  import type { ComponentProps, Snippet } from 'svelte';
  import Field from './Field.svelte';
  import Checkbox from '../checkbox/Checkbox.svelte';

  type CheckboxProps = ComponentProps<typeof Checkbox>;

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
    // Checkbox-specific props
    disabled?: boolean;
    size?: CheckboxProps['size'];
    indeterminate?: CheckboxProps['indeterminate'];
    type?: CheckboxProps['type'];
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
    disabled,
    size,
    indeterminate,
    type,
    children: slotChildren,
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
  {#snippet children({ value, onChange, status, disabled: fieldDisabled, id, required: fieldRequired })}
    <Checkbox
      {...(typeof value === 'boolean' ? { checked: value } : {})}
      disabled={disabled ?? fieldDisabled}
      {...(size !== undefined ? { size } : {})}
      {...(indeterminate !== undefined ? { indeterminate } : {})}
      {...(type !== undefined ? { type } : {})}
      {id}
      status={status === 'error' ? 'error' : 'default'}
      onChange={(checked) => onChange(checked)}
    >
      {@render slotChildren?.()}
    </Checkbox>
  {/snippet}
</Field>
