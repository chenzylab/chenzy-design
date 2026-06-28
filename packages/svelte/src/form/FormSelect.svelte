<!--
  Form.Select — convenience wrapper: <Form.Field> + <Select> bound to a field.
-->
<script lang="ts">
  import type { Rule, ValidateTrigger } from '@chenzy-design/core';
  import type { ComponentProps } from 'svelte';
  import Field from './Field.svelte';
  import Select from '../select/Select.svelte';

  type SelectProps = ComponentProps<typeof Select>;

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
    // Select-specific props
    options?: SelectProps['options'];
    multiple?: SelectProps['multiple'];
    filter?: SelectProps['filter'];
    placeholder?: SelectProps['placeholder'];
    disabled?: boolean;
    clearable?: SelectProps['clearable'];
    size?: SelectProps['size'];
    maxTagCount?: SelectProps['maxTagCount'];
    allowCreate?: SelectProps['allowCreate'];
    virtualized?: SelectProps['virtualized'];
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
    multiple,
    filter,
    placeholder,
    disabled,
    clearable,
    size,
    maxTagCount,
    allowCreate,
    virtualized,
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
  {#snippet children({ value, onChange, status, disabled: fieldDisabled, id, describedBy })}
    <Select
      {...(value !== undefined ? { value: value as NonNullable<SelectProps['value']> } : {})}
      {...(options !== undefined ? { options } : {})}
      {...(multiple !== undefined ? { multiple } : {})}
      {...(filter !== undefined ? { filter } : {})}
      {...(placeholder !== undefined ? { placeholder } : {})}
      disabled={disabled ?? fieldDisabled}
      {...(clearable !== undefined ? { clearable } : {})}
      {...(size !== undefined ? { size } : {})}
      {...(maxTagCount !== undefined ? { maxTagCount } : {})}
      {...(allowCreate !== undefined ? { allowCreate } : {})}
      {...(virtualized !== undefined ? { virtualized } : {})}
      status={status === 'error' ? 'error' : 'default'}
      {...(label !== undefined ? {} : { ariaLabelledby: id })}
      {...(describedBy !== undefined ? { ariaLabel: describedBy } : {})}
      onChange={(v) => onChange(v)}
    />
  {/snippet}
</Field>
