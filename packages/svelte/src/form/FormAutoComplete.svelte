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
  const controlKeys = ['data', 'placeholder', 'disabled', 'size', 'showClear', 'onSearch', 'loading'] as const;
  const split = $derived(splitFieldProps(props));
  const fieldProps = $derived(split.fieldProps);
  const control = $derived(
    Object.fromEntries(controlKeys.filter((k) => props[k] !== undefined).map((k) => [k, props[k]])),
  );
  const labelForAria = $derived(typeof props.label === 'string' ? props.label : props.label?.text);
</script>

<Field {...fieldProps}>
  {#snippet children({ value, onChange, status, disabled: fieldDisabled, describedBy, errorMessageId, labelledById, required })}
    <AutoComplete
      {...(value !== undefined ? { value: value as NonNullable<AutoCompleteProps['value']> } : {})}
      {...(control.data !== undefined ? { data: control.data as NonNullable<AutoCompleteProps['data']> } : {})}
      validateStatus={status === 'error' ? 'error' : 'default'}
      disabled={(control.disabled as boolean | undefined) ?? fieldDisabled}
      {...(control.placeholder !== undefined ? { placeholder: control.placeholder as NonNullable<AutoCompleteProps['placeholder']> } : {})}
      {...(control.size !== undefined ? { size: control.size as NonNullable<AutoCompleteProps['size']> } : {})}
      {...(control.showClear !== undefined ? { showClear: control.showClear as NonNullable<AutoCompleteProps['showClear']> } : {})}
      {...(control.onSearch !== undefined ? { onSearch: control.onSearch as NonNullable<AutoCompleteProps['onSearch']> } : {})}
      {...(control.loading !== undefined ? { loading: control.loading as NonNullable<AutoCompleteProps['loading']> } : {})}
      {...(labelledById !== undefined ? { ariaLabelledby: labelledById } : labelForAria !== undefined ? { ariaLabel: labelForAria } : {})}
      {...(describedBy !== undefined ? { ariaDescribedby: describedBy } : {})}
      {...(errorMessageId !== undefined ? { ariaErrormessage: errorMessageId } : {})}
      {...(required ? { ariaRequired: true } : {})}
      onChange={(v) => onChange(v)}
    />
  {/snippet}
</Field>
