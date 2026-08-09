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
  {#snippet children({ value, onChange, disabled: fieldDisabled, id, labelledById })}
    <CheckboxGroup
      {...rest}
      {...(Array.isArray(value) ? { value: value as NonNullable<CheckboxGroupProps['value']> } : {})}
      disabled={(rest.disabled as boolean | undefined) ?? fieldDisabled}
      {id}
      {...(labelledById !== undefined ? { ariaLabelledby: labelledById } : labelForAria !== undefined ? { 'aria-label': labelForAria } : {})}
      onChange={(v) => onChange(v)}
    >
      {@render slotChildren?.()}
    </CheckboxGroup>
  {/snippet}
</Field>
