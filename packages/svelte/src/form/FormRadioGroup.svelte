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
  const split = $derived(splitFieldProps(props));
  const fieldProps = $derived(split.fieldProps);
  const rest = $derived.by(() => {
    const { children, ...others } = split.rest as { children?: Snippet } & Record<string, unknown>;
    return others;
  });
  const labelForAria = $derived(typeof props.label === 'string' ? props.label : props.label?.text);
  const slotChildren = $derived(props.children);
</script>

<Field {...fieldProps}>
  {#snippet children({ value, onChange, status, disabled: fieldDisabled, id, describedBy, errorMessageId, labelledById, required })}
    <RadioGroup
      {...rest}
      {...(value !== undefined ? { value: value as NonNullable<RadioGroupProps['value']> } : {})}
      disabled={(rest.disabled as boolean | undefined) ?? fieldDisabled}
      {id}
      {...(labelledById !== undefined ? { ariaLabelledby: labelledById } : labelForAria !== undefined ? { 'aria-label': labelForAria } : {})}
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
