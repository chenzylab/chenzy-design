<!--
  Form.Radio — convenience wrapper: <Form.Field> + <Radio> bound to a field.
  Uses valuePropName='checked' since Radio is a boolean/selected control（valuePropName 属
  field-level prop，经 FieldPassthroughProps + splitFieldProps 归到 fieldProps）。
-->
<script lang="ts">
  import type { ComponentProps, Snippet } from 'svelte';
  import Field from './Field.svelte';
  import Radio from '../radio/Radio.svelte';
  import { splitFieldProps, type FieldPassthroughProps } from './field-props.js';

  type RadioProps = ComponentProps<typeof Radio>;

  interface Props extends FieldPassthroughProps {
    /** Radio 自身的业务值（用于 RadioGroup；作为独立 Field 时通常不需要）。 */
    value?: RadioProps['value'];
    disabled?: boolean;
    type?: RadioProps['type'];
    children?: Snippet;
  }

  const props: Props = $props();
  const controlKeys = ['value', 'disabled', 'type', 'children'] as const;
  const split = $derived(splitFieldProps(props));
  // Radio 是布尔/选中控件，valuePropName 固定 'checked'（未显式传时补默认）。
  const fieldProps = $derived<FieldPassthroughProps>({ valuePropName: 'checked', ...split.fieldProps });
  const control = $derived(
    Object.fromEntries(controlKeys.filter((k) => props[k] !== undefined).map((k) => [k, props[k]])),
  );
  const radioValue = $derived((control.value ?? '') as NonNullable<RadioProps['value']>);
  const slotChildren = $derived(props.children);
</script>

<Field {...fieldProps}>
  {#snippet children({ value, onChange, disabled: fieldDisabled })}
    <Radio
      value={radioValue}
      {...(typeof value === 'boolean' ? { checked: value } : {})}
      disabled={(control.disabled as boolean | undefined) ?? fieldDisabled}
      {...(control.type !== undefined ? { type: control.type as NonNullable<RadioProps['type']> } : {})}
      onChange={(e) => onChange(e.target.checked)}
    >
      {@render slotChildren?.()}
    </Radio>
  {/snippet}
</Field>
