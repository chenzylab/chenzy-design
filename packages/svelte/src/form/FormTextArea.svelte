<!--
  Form.TextArea — convenience wrapper: <Form.Field> + <TextArea> bound to a field.
  对齐 Semi withField：field-level props 经 FieldPassthroughProps 透传给 Field，
  控件专属 props 给 TextArea。onChange 首参即值（string），直传。
-->
<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import Field from './Field.svelte';
  import TextArea from '../input/TextArea.svelte';
  import { splitFieldProps, type FieldPassthroughProps } from './field-props.js';

  type TextAreaProps = ComponentProps<typeof TextArea>;

  interface Props extends FieldPassthroughProps {
    placeholder?: TextAreaProps['placeholder'];
    disabled?: boolean;
    size?: TextAreaProps['size'];
    rows?: TextAreaProps['rows'];
    maxLength?: TextAreaProps['maxLength'];
    maxCount?: TextAreaProps['maxCount'];
    showCount?: TextAreaProps['showCount'];
    autosize?: TextAreaProps['autosize'];
  }

  const props: Props = $props();
  const split = $derived(splitFieldProps(props));
  const fieldProps = $derived(split.fieldProps);
  const rest = $derived(split.rest as Record<string, unknown>);
  const labelForAria = $derived(typeof props.label === 'string' ? props.label : props.label?.text);
</script>

<Field {...fieldProps}>
  {#snippet children({ value, onChange, onBlur, status, disabled: fieldDisabled, id, describedBy, errorMessageId, labelledById, required })}
    <TextArea
      {...rest}
      value={value === undefined ? '' : String(value)}
      validateStatus={status === 'error' ? 'error' : 'default'}
      disabled={(rest.disabled as boolean | undefined) ?? fieldDisabled}
      {id}
      {...(labelledById !== undefined ? { ariaLabelledby: labelledById } : labelForAria !== undefined ? { 'aria-label': labelForAria } : {})}
      {...(describedBy !== undefined ? { ariaDescribedby: describedBy } : {})}
      {...(errorMessageId !== undefined ? { ariaErrormessage: errorMessageId } : {})}
      {...(required ? { ariaRequired: true } : {})}
      onChange={(v) => onChange(v)}
      onBlur={() => onBlur()}
    />
  {/snippet}
</Field>
