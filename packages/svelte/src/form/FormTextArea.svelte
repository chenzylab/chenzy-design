<!--
  Form.TextArea — convenience wrapper: <Form.Field> + <TextArea> bound to a field.
  onChange 首参即值（string），直传。
-->
<script lang="ts">
  import type { Rule, ValidateTrigger } from '@chenzy-design/core';
  import type { ComponentProps } from 'svelte';
  import Field from './Field.svelte';
  import TextArea from '../textarea/TextArea.svelte';

  type TextAreaProps = ComponentProps<typeof TextArea>;

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
    // TextArea-specific props
    placeholder?: TextAreaProps['placeholder'];
    disabled?: boolean;
    size?: TextAreaProps['size'];
    rows?: TextAreaProps['rows'];
    maxLength?: TextAreaProps['maxLength'];
    maxCount?: TextAreaProps['maxCount'];
    showCount?: TextAreaProps['showCount'];
    autosize?: TextAreaProps['autosize'];
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
    rows,
    maxLength,
    maxCount,
    showCount,
    autosize,
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
  {#snippet children({ value, onChange, onBlur, status, disabled: fieldDisabled, id, describedBy, required: fieldRequired })}
    <TextArea
      value={value === undefined ? '' : String(value)}
      validateStatus={status === 'error' ? 'error' : 'default'}
      disabled={disabled ?? fieldDisabled}
      {id}
      {...(placeholder !== undefined ? { placeholder } : {})}
      {...(size !== undefined ? { size } : {})}
      {...(rows !== undefined ? { rows } : {})}
      {...(maxLength !== undefined ? { maxLength } : {})}
      {...(maxCount !== undefined ? { maxCount } : {})}
      {...(showCount !== undefined ? { showCount } : {})}
      {...(autosize !== undefined ? { autosize } : {})}
      {...(label !== undefined ? { ariaLabel: label } : {})}
      {...(describedBy !== undefined ? { ariaDescribedby: describedBy } : {})}
      {...(fieldRequired ? { ariaRequired: true } : {})}
      onChange={(v) => onChange(v)}
      onBlur={() => onBlur()}
    />
  {/snippet}
</Field>
