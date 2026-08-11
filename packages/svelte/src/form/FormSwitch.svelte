<!--
  Form.Switch — convenience wrapper: <Form.Field> + <Switch> bound to a field.
  Uses valuePropName='checked' since Switch is a boolean control（valuePropName 属
  field-level prop，经 FieldPassthroughProps + splitFieldProps 归到 fieldProps）。
-->
<script lang="ts">
  import type { ComponentProps, Snippet } from 'svelte';
  import Field from './Field.svelte';
  import Switch from '../switch/Switch.svelte';
  import { splitFieldProps, type FieldPassthroughProps } from './field-props.js';

  type SwitchProps = ComponentProps<typeof Switch>;

  interface Props extends FieldPassthroughProps {
    disabled?: boolean;
    size?: SwitchProps['size'];
    loading?: SwitchProps['loading'];
    checkedText?: string | Snippet;
    uncheckedText?: string | Snippet;
  }

  const props: Props = $props();
  const split = $derived(splitFieldProps(props));
  // Switch 是布尔控件，valuePropName 固定 'checked'（未显式传时补默认）。
  const fieldProps = $derived<FieldPassthroughProps>({ valuePropName: 'checked', ...split.fieldProps });
  const rest = $derived(split.rest as Record<string, unknown>);
  const labelForAria = $derived(typeof props.label === 'string' ? props.label : props.label?.text);
</script>

<Field {...fieldProps}>
  {#snippet children({ value, onChange, status, disabled: fieldDisabled, describedBy, errorMessageId, labelledById })}
    <Switch
      {...rest}
      {...(typeof value === 'boolean' ? { checked: value } : {})}
      disabled={(rest.disabled as boolean | undefined) ?? fieldDisabled}
      {...(labelledById !== undefined ? { 'aria-labelledby': labelledById } : labelForAria !== undefined ? { 'aria-label': labelForAria } : {})}
      {...(describedBy !== undefined ? { 'aria-describedby': describedBy } : {})}
      {...(errorMessageId !== undefined ? { 'aria-errormessage': errorMessageId } : {})}
      {...(status === 'error' ? { 'aria-invalid': true } : {})}
      onChange={(v) => onChange(v)}
    />
  {/snippet}
</Field>
