<!--
  Form.Rating — convenience wrapper: <Form.Field> + <Rating> bound to a field.
  field-level props 经 FieldPassthroughProps 透传给 Field；控件专属给 Rating。
-->
<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import Field from './Field.svelte';
  import Rating from '../rating/Rating.svelte';
  import { splitFieldProps, type FieldPassthroughProps } from './field-props.js';

  type RatingProps = ComponentProps<typeof Rating>;

  interface Props extends FieldPassthroughProps {
    // Rating-specific props（对齐 Semi Rating：无 readonly/status，只读用 disabled）
    count?: RatingProps['count'];
    allowHalf?: RatingProps['allowHalf'];
    allowClear?: RatingProps['allowClear'];
    disabled?: boolean;
    size?: RatingProps['size'];
    tooltips?: RatingProps['tooltips'];
  }

  const props: Props = $props();
  const split = $derived(splitFieldProps(props));
  const fieldProps = $derived(split.fieldProps);
  const rest = $derived(split.rest as Record<string, unknown>);
  const labelForAria = $derived(typeof props.label === 'string' ? props.label : props.label?.text);
</script>

<Field {...fieldProps}>
  {#snippet children({ value, onChange, status, disabled: fieldDisabled, describedBy, errorMessageId, labelledById, required })}
    <Rating
      {...rest}
      {...(typeof value === 'number' ? { value } : {})}
      disabled={(rest.disabled as boolean | undefined) ?? fieldDisabled}
      {...(labelledById !== undefined ? { 'aria-labelledby': labelledById } : labelForAria !== undefined ? { 'aria-label': labelForAria } : {})}
      {...(describedBy !== undefined ? { 'aria-describedby': describedBy } : {})}
      {...(errorMessageId !== undefined ? { 'aria-errormessage': errorMessageId } : {})}
      {...(required ? { 'aria-required': true } : {})}
      {...(status === 'error' ? { 'aria-invalid': true } : {})}
      onChange={(v) => onChange(v)}
    />
  {/snippet}
</Field>
