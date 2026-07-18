<!--
  Form.RadioGroup — convenience wrapper: <Form.Field> + <RadioGroup> bound to a field.
  值是选中项 value；RadioGroup onChange 收 RadioChangeEvent，取 e.target.value（非裸值！）。
  对齐 Semi valuePath='target.value'。
-->
<script lang="ts">
  import type { Rule, ValidateTrigger } from '@chenzy-design/core';
  import type { ComponentProps, Snippet } from 'svelte';
  import Field from './Field.svelte';
  import RadioGroup from '../radio/RadioGroup.svelte';

  type RadioGroupProps = ComponentProps<typeof RadioGroup>;

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
    // RadioGroup-specific props
    options?: RadioGroupProps['options'];
    disabled?: boolean;
    type?: RadioGroupProps['type'];
    buttonSize?: RadioGroupProps['buttonSize'];
    direction?: RadioGroupProps['direction'];
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
    buttonSize,
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
  {#snippet children({ value, onChange, disabled: fieldDisabled, id })}
    <RadioGroup
      {...(value !== undefined ? { value: value as NonNullable<RadioGroupProps['value']> } : {})}
      {...(options !== undefined ? { options } : {})}
      disabled={disabled ?? fieldDisabled}
      {...(type !== undefined ? { type } : {})}
      {...(buttonSize !== undefined ? { buttonSize } : {})}
      {...(direction !== undefined ? { direction } : {})}
      {id}
      {...(label !== undefined ? { ariaLabel: label } : {})}
      onChange={(e) => onChange(e.target.value)}
    >
      {@render slotChildren?.()}
    </RadioGroup>
  {/snippet}
</Field>
