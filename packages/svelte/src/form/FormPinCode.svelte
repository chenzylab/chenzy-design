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
  const split = $derived(splitFieldProps(props));
  const fieldProps = $derived(split.fieldProps);
  const rest = $derived(split.rest as Record<string, unknown>);
  const labelForAria = $derived(typeof props.label === 'string' ? props.label : props.label?.text);
</script>

<Field {...fieldProps}>
  {#snippet children({ value, onChange, status, disabled: fieldDisabled, id, describedBy, errorMessageId, labelledById, required })}
    <PinCode
      {...rest}
      value={value === undefined ? '' : String(value)}
      status={status === 'error' ? 'error' : 'default'}
      disabled={(rest.disabled as boolean | undefined) ?? fieldDisabled}
      {id}
      {...(labelledById !== undefined ? { ariaLabelledby: labelledById } : labelForAria !== undefined ? { 'aria-label': labelForAria } : {})}
      {...(describedBy !== undefined ? { ariaDescribedby: describedBy } : {})}
      {...(errorMessageId !== undefined ? { ariaErrormessage: errorMessageId } : {})}
      {...(required ? { ariaRequired: true } : {})}
      onChange={(v) => onChange(v)}
    />
  {/snippet}
</Field>
