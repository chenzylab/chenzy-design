<!--
  Form.TreeSelect — convenience wrapper: <Form.Field> + <TreeSelect> bound to a field.
  field-level props 经 FieldPassthroughProps 透传给 Field；控件专属给 TreeSelect。
-->
<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import Field from './Field.svelte';
  import TreeSelect from '../tree-select/TreeSelect.svelte';
  import { splitFieldProps, type FieldPassthroughProps } from './field-props.js';

  type TreeSelectProps = ComponentProps<typeof TreeSelect>;

  interface Props extends FieldPassthroughProps {
    treeData?: TreeSelectProps['treeData'];
    multiple?: TreeSelectProps['multiple'];
    placeholder?: TreeSelectProps['placeholder'];
    disabled?: boolean;
    showClear?: TreeSelectProps['showClear'];
    size?: TreeSelectProps['size'];
    maxTagCount?: TreeSelectProps['maxTagCount'];
  }

  const props: Props = $props();
  const controlKeys = ['treeData', 'multiple', 'placeholder', 'disabled', 'showClear', 'size', 'maxTagCount'] as const;
  const split = $derived(splitFieldProps(props));
  const fieldProps = $derived(split.fieldProps);
  const control = $derived(
    Object.fromEntries(controlKeys.filter((k) => props[k] !== undefined).map((k) => [k, props[k]])),
  );
  const labelForAria = $derived(typeof props.label === 'string' ? props.label : props.label?.text);
</script>

<Field {...fieldProps}>
  {#snippet children({ value, onChange, status, disabled: fieldDisabled, describedBy, errorMessageId, labelledById, required, insetLabel, insetLabelId })}
    <TreeSelect
      {...(value !== undefined ? { value: value as NonNullable<TreeSelectProps['value']> } : {})}
      {...(control.treeData !== undefined ? { treeData: control.treeData as NonNullable<TreeSelectProps['treeData']> } : {})}
      {...(control.multiple !== undefined ? { multiple: control.multiple as NonNullable<TreeSelectProps['multiple']> } : {})}
      {...(control.placeholder !== undefined ? { placeholder: control.placeholder as NonNullable<TreeSelectProps['placeholder']> } : {})}
      disabled={(control.disabled as boolean | undefined) ?? fieldDisabled}
      {...(control.showClear !== undefined ? { showClear: control.showClear as NonNullable<TreeSelectProps['showClear']> } : {})}
      {...(control.size !== undefined ? { size: control.size as NonNullable<TreeSelectProps['size']> } : {})}
      {...(control.maxTagCount !== undefined ? { maxTagCount: control.maxTagCount as NonNullable<TreeSelectProps['maxTagCount']> } : {})}
      status={status === 'error' ? 'error' : 'default'}
      {...(insetLabel !== undefined ? { insetLabel } : {})}
      {...(insetLabelId !== undefined ? { insetLabelId } : {})}
      {...(labelledById !== undefined ? { ariaLabelledby: labelledById } : labelForAria !== undefined ? { ariaLabel: labelForAria } : {})}
      {...(describedBy !== undefined ? { ariaDescribedby: describedBy } : {})}
      {...(errorMessageId !== undefined ? { ariaErrormessage: errorMessageId } : {})}
      {...(required ? { ariaRequired: true } : {})}
      onChange={(v) => onChange(v)}
    />
  {/snippet}
</Field>
