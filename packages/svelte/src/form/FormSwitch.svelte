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
  const controlKeys = ['disabled', 'size', 'loading', 'checkedText', 'uncheckedText'] as const;
  const split = $derived(splitFieldProps(props));
  // Switch 是布尔控件，valuePropName 固定 'checked'（未显式传时补默认）。
  const fieldProps = $derived<FieldPassthroughProps>({ valuePropName: 'checked', ...split.fieldProps });
  const control = $derived(
    Object.fromEntries(controlKeys.filter((k) => props[k] !== undefined).map((k) => [k, props[k]])),
  );
</script>

<Field {...fieldProps}>
  {#snippet children({ value, onChange, status, disabled: fieldDisabled })}
    <Switch
      {...(typeof value === 'boolean' ? { value } : {})}
      disabled={(control.disabled as boolean | undefined) ?? fieldDisabled}
      {...(control.size !== undefined ? { size: control.size as NonNullable<SwitchProps['size']> } : {})}
      {...(control.loading !== undefined ? { loading: control.loading as NonNullable<SwitchProps['loading']> } : {})}
      {...(control.checkedText !== undefined ? { checkedText: control.checkedText as string | Snippet } : {})}
      {...(control.uncheckedText !== undefined ? { uncheckedText: control.uncheckedText as string | Snippet } : {})}
      {...(status === 'error' ? { 'aria-invalid': true } : {})}
      onChange={(v) => onChange(v)}
    />
  {/snippet}
</Field>
