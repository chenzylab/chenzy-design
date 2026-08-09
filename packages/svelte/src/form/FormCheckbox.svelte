<!--
  Form.Checkbox — convenience wrapper: <Form.Field> + <Checkbox> bound to a field.
  Uses valuePropName='checked' since Checkbox is a boolean control（valuePropName 属
  field-level prop，经 FieldPassthroughProps + splitFieldProps 归到 fieldProps）。
-->
<script lang="ts">
  import type { ComponentProps, Snippet } from 'svelte';
  import Field from './Field.svelte';
  import Checkbox from '../checkbox/Checkbox.svelte';
  import { splitFieldProps, type FieldPassthroughProps } from './field-props.js';

  type CheckboxProps = ComponentProps<typeof Checkbox>;

  interface Props extends FieldPassthroughProps {
    disabled?: boolean;
    indeterminate?: CheckboxProps['indeterminate'];
    type?: CheckboxProps['type'];
    children?: Snippet;
  }

  const props: Props = $props();
  const split = $derived(splitFieldProps(props));
  // Checkbox 是布尔控件，valuePropName 固定 'checked'（未显式传时补默认）。
  const fieldProps = $derived<FieldPassthroughProps>({ valuePropName: 'checked', ...split.fieldProps });
  // children 是 snippet 子内容，走单独的 {@render} 而非当作控件 prop 透传。
  const rest = $derived.by(() => {
    const { children, ...others } = split.rest as { children?: Snippet } & Record<string, unknown>;
    return others;
  });
  const labelForAria = $derived(typeof props.label === 'string' ? props.label : props.label?.text);
  const slotChildren = $derived(props.children);
</script>

<Field {...fieldProps}>
  {#snippet children({ value, onChange, status, disabled: fieldDisabled, id, describedBy, errorMessageId, labelledById, required })}
    <Checkbox
      {...rest}
      {...(typeof value === 'boolean' ? { checked: value } : {})}
      disabled={(rest.disabled as boolean | undefined) ?? fieldDisabled}
      {id}
      {...(labelledById !== undefined ? { ariaLabelledby: labelledById } : labelForAria !== undefined ? { 'aria-label': labelForAria } : {})}
      {...(describedBy !== undefined ? { ariaDescribedby: describedBy } : {})}
      {...(errorMessageId !== undefined ? { ariaErrormessage: errorMessageId } : {})}
      {...(required ? { ariaRequired: true } : {})}
      ariaInvalid={status === 'error'}
      onChange={(e) => onChange(e.target.checked)}
    >
      {@render slotChildren?.()}
    </Checkbox>
  {/snippet}
</Field>
