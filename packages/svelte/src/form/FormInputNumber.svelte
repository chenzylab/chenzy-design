<!--
  Form.InputNumber — convenience wrapper: <Form.Field> + <InputNumber> bound to a field.
  field-level props 经 FieldPassthroughProps 透传给 Field；控件专属给 InputNumber。
  onChange 首参即值（number | string | null），直传。
-->
<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import Field from './Field.svelte';
  import InputNumber from '../input-number/InputNumber.svelte';
  import { splitFieldProps, type FieldPassthroughProps } from './field-props.js';

  type InputNumberProps = ComponentProps<typeof InputNumber>;

  interface Props extends FieldPassthroughProps {
    placeholder?: InputNumberProps['placeholder'];
    disabled?: boolean;
    size?: InputNumberProps['size'];
    min?: InputNumberProps['min'];
    max?: InputNumberProps['max'];
    step?: InputNumberProps['step'];
    precision?: InputNumberProps['precision'];
    showClear?: InputNumberProps['showClear'];
    innerButtons?: InputNumberProps['innerButtons'];
    hideButtons?: InputNumberProps['hideButtons'];
  }

  const props: Props = $props();
  const split = $derived(splitFieldProps(props));
  const fieldProps = $derived(split.fieldProps);
  const rest = $derived(split.rest as Record<string, unknown>);
  const labelForAria = $derived(typeof props.label === 'string' ? props.label : props.label?.text);
</script>

<Field {...fieldProps}>
  {#snippet children({ value, onChange, onBlur, status, disabled: fieldDisabled, id, describedBy, errorMessageId, labelledById, required, insetLabel, insetLabelId })}
    <InputNumber
      {...rest}
      {...(typeof value === 'number' ? { value } : { value: null })}
      validateStatus={status === 'error' ? 'error' : 'default'}
      disabled={(rest.disabled as boolean | undefined) ?? fieldDisabled}
      {id}
      {...(insetLabel !== undefined ? { insetLabel } : {})}
      {...(insetLabelId !== undefined ? { insetLabelId } : {})}
      {...(labelledById !== undefined ? { ariaLabelledby: labelledById } : labelForAria !== undefined ? { 'aria-label': labelForAria } : {})}
      {...(describedBy !== undefined ? { ariaDescribedby: describedBy } : {})}
      {...(errorMessageId !== undefined ? { ariaErrormessage: errorMessageId } : {})}
      {...(required ? { ariaRequired: true } : {})}
      onChange={(v) => onChange(v)}
      onBlur={() => onBlur()}
    />
  {/snippet}
</Field>
