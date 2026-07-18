<!--
  Form.CheckboxGroup — convenience wrapper: <Form.Field> + <CheckboxGroup> bound to a field.
  值是数组，valuePropName 用默认 'value'；onChange 收裸数组直传。
-->
<script lang="ts">
  import type { Rule, ValidateTrigger } from '@chenzy-design/core';
  import type { ComponentProps, Snippet } from 'svelte';
  import Field from './Field.svelte';
  import CheckboxGroup from '../checkbox/CheckboxGroup.svelte';

  type CheckboxGroupProps = ComponentProps<typeof CheckboxGroup>;

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
    // CheckboxGroup-specific props
    options?: CheckboxGroupProps['options'];
    disabled?: boolean;
    type?: CheckboxGroupProps['type'];
    direction?: CheckboxGroupProps['direction'];
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
    options,
    disabled,
    type,
    direction,
    children: slotChildren,
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
  {#snippet children({ value, onChange, disabled: fieldDisabled, id, describedBy })}
    <CheckboxGroup
      {...(Array.isArray(value) ? { value: value as NonNullable<CheckboxGroupProps['value']> } : {})}
      {...(options !== undefined ? { options } : {})}
      disabled={disabled ?? fieldDisabled}
      {...(type !== undefined ? { type } : {})}
      {...(direction !== undefined ? { direction } : {})}
      {id}
      {...(label !== undefined ? { ariaLabel: label } : {})}
      onChange={(v) => onChange(v)}
    >
      {@render slotChildren?.()}
    </CheckboxGroup>
  {/snippet}
</Field>
