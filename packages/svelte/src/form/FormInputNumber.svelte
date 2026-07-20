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
  const controlKeys = [
    'placeholder',
    'disabled',
    'size',
    'min',
    'max',
    'step',
    'precision',
    'showClear',
    'innerButtons',
    'hideButtons',
  ] as const;
  const split = $derived(splitFieldProps(props));
  const fieldProps = $derived(split.fieldProps);
  const control = $derived(
    Object.fromEntries(controlKeys.filter((k) => props[k] !== undefined).map((k) => [k, props[k]])),
  );
  const labelForAria = $derived(typeof props.label === 'string' ? props.label : props.label?.text);
</script>

<Field {...fieldProps}>
  {#snippet children({ value, onChange, onBlur, status, disabled: fieldDisabled, id, insetLabel, insetLabelId })}
    <InputNumber
      {...(typeof value === 'number' ? { value } : { value: null })}
      validateStatus={status === 'error' ? 'error' : 'default'}
      disabled={(control.disabled as boolean | undefined) ?? fieldDisabled}
      {id}
      {...(insetLabel !== undefined ? { insetLabel } : {})}
      {...(insetLabelId !== undefined ? { insetLabelId } : {})}
      {...(control.placeholder !== undefined ? { placeholder: control.placeholder as NonNullable<InputNumberProps['placeholder']> } : {})}
      {...(control.size !== undefined ? { size: control.size as NonNullable<InputNumberProps['size']> } : {})}
      {...(control.min !== undefined ? { min: control.min as NonNullable<InputNumberProps['min']> } : {})}
      {...(control.max !== undefined ? { max: control.max as NonNullable<InputNumberProps['max']> } : {})}
      {...(control.step !== undefined ? { step: control.step as NonNullable<InputNumberProps['step']> } : {})}
      {...(control.precision !== undefined ? { precision: control.precision as NonNullable<InputNumberProps['precision']> } : {})}
      {...(control.showClear !== undefined ? { showClear: control.showClear as NonNullable<InputNumberProps['showClear']> } : {})}
      {...(control.innerButtons !== undefined ? { innerButtons: control.innerButtons as NonNullable<InputNumberProps['innerButtons']> } : {})}
      {...(control.hideButtons !== undefined ? { hideButtons: control.hideButtons as NonNullable<InputNumberProps['hideButtons']> } : {})}
      {...(labelForAria !== undefined ? { ariaLabel: labelForAria } : {})}
      onChange={(v) => onChange(v)}
      onBlur={() => onBlur()}
    />
  {/snippet}
</Field>
