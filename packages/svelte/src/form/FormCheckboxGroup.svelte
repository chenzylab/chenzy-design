<!--
  Form.CheckboxGroup — convenience wrapper: <Form.Field> + <CheckboxGroup> bound to a field.
  值是数组，valuePropName 用默认 'value'；onChange 收裸数组直传。
  field-level props 经 FieldPassthroughProps 透传给 Field。
-->
<script lang="ts">
  import type { ComponentProps, Snippet } from 'svelte';
  import Field from './Field.svelte';
  import CheckboxGroup from '../checkbox/CheckboxGroup.svelte';
  import { splitFieldProps, type FieldPassthroughProps } from './field-props.js';

  type CheckboxGroupProps = ComponentProps<typeof CheckboxGroup>;

  interface Props extends FieldPassthroughProps {
    options?: CheckboxGroupProps['options'];
    disabled?: boolean;
    type?: CheckboxGroupProps['type'];
    direction?: CheckboxGroupProps['direction'];
    children?: Snippet;
  }

  const props: Props = $props();
  const controlKeys = ['options', 'disabled', 'type', 'direction', 'children'] as const;
  const split = $derived(splitFieldProps(props));
  const fieldProps = $derived(split.fieldProps);
  const control = $derived(
    Object.fromEntries(controlKeys.filter((k) => props[k] !== undefined).map((k) => [k, props[k]])),
  );
  const labelForAria = $derived(typeof props.label === 'string' ? props.label : props.label?.text);
  const slotChildren = $derived(props.children);
</script>

<Field {...fieldProps}>
  {#snippet children({ value, onChange, disabled: fieldDisabled, id, labelledById })}
    <CheckboxGroup
      {...(Array.isArray(value) ? { value: value as NonNullable<CheckboxGroupProps['value']> } : {})}
      {...(control.options !== undefined ? { options: control.options as NonNullable<CheckboxGroupProps['options']> } : {})}
      disabled={(control.disabled as boolean | undefined) ?? fieldDisabled}
      {...(control.type !== undefined ? { type: control.type as NonNullable<CheckboxGroupProps['type']> } : {})}
      {...(control.direction !== undefined ? { direction: control.direction as NonNullable<CheckboxGroupProps['direction']> } : {})}
      {id}
      {...(labelledById !== undefined ? { ariaLabelledby: labelledById } : labelForAria !== undefined ? { ariaLabel: labelForAria } : {})}
      onChange={(v) => onChange(v)}
    >
      {@render slotChildren?.()}
    </CheckboxGroup>
  {/snippet}
</Field>
