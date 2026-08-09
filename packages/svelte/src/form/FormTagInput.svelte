<!--
  Form.TagInput — convenience wrapper: <Form.Field> + <TagInput> bound to a field.
  field-level props 经 FieldPassthroughProps 透传给 Field；控件专属给 TagInput。
-->
<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import Field from './Field.svelte';
  import TagInput from '../tag-input/TagInput.svelte';
  import { splitFieldProps, type FieldPassthroughProps } from './field-props.js';

  type TagInputProps = ComponentProps<typeof TagInput>;

  interface Props extends FieldPassthroughProps {
    placeholder?: TagInputProps['placeholder'];
    disabled?: boolean;
    size?: TagInputProps['size'];
    maxLength?: TagInputProps['maxLength'];
    allowDuplicates?: TagInputProps['allowDuplicates'];
  }

  const props: Props = $props();
  const split = $derived(splitFieldProps(props));
  const fieldProps = $derived(split.fieldProps);
  const rest = $derived(split.rest as Record<string, unknown>);
  const labelForAria = $derived(typeof props.label === 'string' ? props.label : props.label?.text);
</script>

<Field {...fieldProps}>
  {#snippet children({ value, onChange, status, disabled: fieldDisabled, describedBy, errorMessageId, labelledById, required, insetLabel, insetLabelId })}
    <TagInput
      {...rest}
      {...(Array.isArray(value) ? { value: value as string[] } : {})}
      disabled={(rest.disabled as boolean | undefined) ?? fieldDisabled}
      validateStatus={status === 'error' ? 'error' : 'default'}
      {...(insetLabel !== undefined ? { insetLabel } : {})}
      {...(insetLabelId !== undefined ? { insetLabelId } : {})}
      {...(labelledById !== undefined ? { ariaLabelledby: labelledById } : labelForAria !== undefined ? { 'aria-label': labelForAria } : {})}
      {...(describedBy !== undefined ? { ariaDescribedby: describedBy } : {})}
      {...(errorMessageId !== undefined ? { ariaErrormessage: errorMessageId } : {})}
      {...(required ? { ariaRequired: true } : {})}
      onChange={(tags) => onChange(tags)}
    />
  {/snippet}
</Field>
