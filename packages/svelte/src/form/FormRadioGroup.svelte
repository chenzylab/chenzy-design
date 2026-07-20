<!--
  Form.RadioGroup — convenience wrapper: <Form.Field> + <RadioGroup> bound to a field.
  值是选中项 value；RadioGroup onChange 收 RadioChangeEvent，取 e.target.value（非裸值！）。
  对齐 Semi valuePath='target.value'。field-level props 经 FieldPassthroughProps 透传给 Field。
-->
<script lang="ts">
  import type { ComponentProps, Snippet } from 'svelte';
  import Field from './Field.svelte';
  import RadioGroup from '../radio/RadioGroup.svelte';
  import { splitFieldProps, type FieldPassthroughProps } from './field-props.js';

  type RadioGroupProps = ComponentProps<typeof RadioGroup>;

  interface Props extends FieldPassthroughProps {
    options?: RadioGroupProps['options'];
    disabled?: boolean;
    type?: RadioGroupProps['type'];
    buttonSize?: RadioGroupProps['buttonSize'];
    direction?: RadioGroupProps['direction'];
    children?: Snippet;
  }

  const props: Props = $props();
  const controlKeys = ['options', 'disabled', 'type', 'buttonSize', 'direction', 'children'] as const;
  const split = $derived(splitFieldProps(props));
  const fieldProps = $derived(split.fieldProps);
  const control = $derived(
    Object.fromEntries(controlKeys.filter((k) => props[k] !== undefined).map((k) => [k, props[k]])),
  );
  const labelForAria = $derived(typeof props.label === 'string' ? props.label : props.label?.text);
  const slotChildren = $derived(props.children);
</script>

<Field {...fieldProps}>
  {#snippet children({ value, onChange, status, disabled: fieldDisabled, id, describedBy, errorMessageId, labelledById, required })}
    <RadioGroup
      {...(value !== undefined ? { value: value as NonNullable<RadioGroupProps['value']> } : {})}
      {...(control.options !== undefined ? { options: control.options as NonNullable<RadioGroupProps['options']> } : {})}
      disabled={(control.disabled as boolean | undefined) ?? fieldDisabled}
      {...(control.type !== undefined ? { type: control.type as NonNullable<RadioGroupProps['type']> } : {})}
      {...(control.buttonSize !== undefined ? { buttonSize: control.buttonSize as NonNullable<RadioGroupProps['buttonSize']> } : {})}
      {...(control.direction !== undefined ? { direction: control.direction as NonNullable<RadioGroupProps['direction']> } : {})}
      {id}
      {...(labelledById !== undefined ? { ariaLabelledby: labelledById } : labelForAria !== undefined ? { ariaLabel: labelForAria } : {})}
      {...(describedBy !== undefined ? { ariaDescribedby: describedBy } : {})}
      {...(errorMessageId !== undefined ? { ariaErrormessage: errorMessageId } : {})}
      {...(required ? { ariaRequired: true } : {})}
      {...(status === 'error' ? { ariaInvalid: true } : {})}
      onChange={(e) => onChange(e.target.value)}
    >
      {@render slotChildren?.()}
    </RadioGroup>
  {/snippet}
</Field>
