<!--
  Form.PinCode — convenience wrapper: <Form.Field> + <PinCode> bound to a field.
  onChange 首参即值（string 整串），直传。可选透传 onComplete。
  field-level props 经 FieldPassthroughProps 透传给 Field。
-->
<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import Field from './Field.svelte';
  import PinCode from '../pincode/PinCode.svelte';
  import { splitFieldProps, type FieldPassthroughProps } from './field-props.js';

  type PinCodeProps = ComponentProps<typeof PinCode>;

  interface Props extends FieldPassthroughProps {
    count?: PinCodeProps['count'];
    format?: PinCodeProps['format'];
    size?: PinCodeProps['size'];
    disabled?: boolean;
    autoFocus?: PinCodeProps['autoFocus'];
    onComplete?: PinCodeProps['onComplete'];
  }

  const props: Props = $props();
  const controlKeys = ['count', 'format', 'size', 'disabled', 'autoFocus', 'onComplete'] as const;
  const split = $derived(splitFieldProps(props));
  const fieldProps = $derived(split.fieldProps);
  const control = $derived(
    Object.fromEntries(controlKeys.filter((k) => props[k] !== undefined).map((k) => [k, props[k]])),
  );
  const labelForAria = $derived(typeof props.label === 'string' ? props.label : props.label?.text);
</script>

<Field {...fieldProps}>
  {#snippet children({ value, onChange, status, disabled: fieldDisabled, id })}
    <PinCode
      value={value === undefined ? '' : String(value)}
      status={status === 'error' ? 'error' : 'default'}
      disabled={(control.disabled as boolean | undefined) ?? fieldDisabled}
      {id}
      {...(control.count !== undefined ? { count: control.count as NonNullable<PinCodeProps['count']> } : {})}
      {...(control.format !== undefined ? { format: control.format as NonNullable<PinCodeProps['format']> } : {})}
      {...(control.size !== undefined ? { size: control.size as NonNullable<PinCodeProps['size']> } : {})}
      {...(control.autoFocus !== undefined ? { autoFocus: control.autoFocus as NonNullable<PinCodeProps['autoFocus']> } : {})}
      {...(labelForAria !== undefined ? { ariaLabel: labelForAria } : {})}
      onChange={(v) => onChange(v)}
      {...(control.onComplete !== undefined ? { onComplete: control.onComplete as NonNullable<PinCodeProps['onComplete']> } : {})}
    />
  {/snippet}
</Field>
