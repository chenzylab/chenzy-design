<!--
  Form.Rating — convenience wrapper: <Form.Field> + <Rating> bound to a field.
-->
<script lang="ts">
  import type { Rule, ValidateTrigger } from '@chenzy-design/core';
  import type { ComponentProps } from 'svelte';
  import Field from './Field.svelte';
  import Rating from '../rating/Rating.svelte';

  type RatingProps = ComponentProps<typeof Rating>;

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
    // Rating-specific props（对齐 Semi Rating：无 readonly/status，只读用 disabled）
    count?: RatingProps['count'];
    allowHalf?: RatingProps['allowHalf'];
    allowClear?: RatingProps['allowClear'];
    disabled?: boolean;
    size?: RatingProps['size'];
    tooltips?: RatingProps['tooltips'];
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
    count,
    allowHalf,
    allowClear,
    disabled,
    size,
    tooltips,
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
    <Rating
      {...(typeof value === 'number' ? { value } : {})}
      {...(count !== undefined ? { count } : {})}
      {...(allowHalf !== undefined ? { allowHalf } : {})}
      {...(allowClear !== undefined ? { allowClear } : {})}
      disabled={disabled ?? fieldDisabled}
      {...(size !== undefined ? { size } : {})}
      {...(tooltips !== undefined ? { tooltips } : {})}
      {...(status === 'error' ? { 'aria-invalid': true } : {})}
      onChange={(v) => onChange(v)}
    />
  {/snippet}
</Field>
