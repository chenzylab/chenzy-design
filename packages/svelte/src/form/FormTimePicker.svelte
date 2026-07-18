<!--
  Form.TimePicker — convenience wrapper: <Form.Field> + <TimePicker> bound to a field.
  onChange 首参即值（Date | null | [..]），直传。field-level props 经 FieldPassthroughProps 透传给 Field。
-->
<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import Field from './Field.svelte';
  import TimePicker from '../time-picker/TimePicker.svelte';
  import { splitFieldProps, type FieldPassthroughProps } from './field-props.js';

  type TimePickerProps = ComponentProps<typeof TimePicker>;

  interface Props extends FieldPassthroughProps {
    placeholder?: TimePickerProps['placeholder'];
    disabled?: boolean;
    size?: TimePickerProps['size'];
    format?: TimePickerProps['format'];
    use12Hours?: TimePickerProps['use12Hours'];
  }

  const props: Props = $props();
  const controlKeys = ['placeholder', 'disabled', 'size', 'format', 'use12Hours'] as const;
  const split = $derived(splitFieldProps(props));
  const fieldProps = $derived(split.fieldProps);
  const control = $derived(
    Object.fromEntries(controlKeys.filter((k) => props[k] !== undefined).map((k) => [k, props[k]])),
  );
</script>

<Field {...fieldProps}>
  {#snippet children({ value, onChange, status, disabled: fieldDisabled })}
    <TimePicker
      {...(value !== undefined && value !== null ? { value: value as NonNullable<TimePickerProps['value']> } : {})}
      validateStatus={status === 'error' ? 'error' : 'default'}
      disabled={(control.disabled as boolean | undefined) ?? fieldDisabled}
      {...(control.placeholder !== undefined ? { placeholder: control.placeholder as NonNullable<TimePickerProps['placeholder']> } : {})}
      {...(control.size !== undefined ? { size: control.size as NonNullable<TimePickerProps['size']> } : {})}
      {...(control.format !== undefined ? { format: control.format as NonNullable<TimePickerProps['format']> } : {})}
      {...(control.use12Hours !== undefined ? { use12Hours: control.use12Hours as NonNullable<TimePickerProps['use12Hours']> } : {})}
      onChange={(v) => onChange(v)}
    />
  {/snippet}
</Field>
