<!--
  Form.AutoComplete — convenience wrapper: <Form.Field> + <AutoComplete> bound to a field.
  onChange 首参即值（string | number），直传。field-level props 经 FieldPassthroughProps 透传给 Field。
-->
<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import Field from './Field.svelte';
  import AutoComplete from '../autocomplete/AutoComplete.svelte';
  import { splitFieldProps, type FieldPassthroughProps } from './field-props.js';

  type AutoCompleteProps = ComponentProps<typeof AutoComplete>;

  interface Props extends FieldPassthroughProps {
    data?: AutoCompleteProps['data'];
    placeholder?: AutoCompleteProps['placeholder'];
    disabled?: boolean;
    size?: AutoCompleteProps['size'];
    showClear?: AutoCompleteProps['showClear'];
    onSearch?: AutoCompleteProps['onSearch'];
    loading?: AutoCompleteProps['loading'];
  }

  const props: Props = $props();
  const split = $derived(splitFieldProps(props));
  const fieldProps = $derived(split.fieldProps);
  const rest = $derived(split.rest as Record<string, unknown>);
  const labelForAria = $derived(typeof props.label === 'string' ? props.label : props.label?.text);
</script>

<Field {...fieldProps}>
  {#snippet children({ value, onChange, status, disabled: fieldDisabled, describedBy, errorMessageId, labelledById, required })}
    <AutoComplete
      {...rest}
      {...(value !== undefined ? { value: value as NonNullable<AutoCompleteProps['value']> } : {})}
      validateStatus={status === 'error' ? 'error' : 'default'}
      disabled={(rest.disabled as boolean | undefined) ?? fieldDisabled}
      {...(labelledById !== undefined ? { ariaLabelledby: labelledById } : labelForAria !== undefined ? { 'aria-label': labelForAria } : {})}
      {...(describedBy !== undefined ? { ariaDescribedby: describedBy } : {})}
      {...(errorMessageId !== undefined ? { ariaErrormessage: errorMessageId } : {})}
      {...(required ? { ariaRequired: true } : {})}
      onChange={(v) => onChange(v)}
    />
  {/snippet}
</Field>
