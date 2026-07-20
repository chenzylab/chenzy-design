<!--
  Form.Cascader — convenience wrapper: <Form.Field> + <Cascader> bound to a field.
  field-level props 经 FieldPassthroughProps 透传给 Field；控件专属给 Cascader。
-->
<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import Field from './Field.svelte';
  import Cascader from '../cascader/Cascader.svelte';
  import { splitFieldProps, type FieldPassthroughProps } from './field-props.js';

  type CascaderProps = ComponentProps<typeof Cascader>;

  interface Props extends FieldPassthroughProps {
    treeData?: CascaderProps['treeData'];
    multiple?: CascaderProps['multiple'];
    placeholder?: CascaderProps['placeholder'];
    disabled?: boolean;
    size?: CascaderProps['size'];
    displayProp?: CascaderProps['displayProp'];
  }

  const props: Props = $props();
  const controlKeys = ['treeData', 'multiple', 'placeholder', 'disabled', 'size', 'displayProp'] as const;
  const split = $derived(splitFieldProps(props));
  const fieldProps = $derived(split.fieldProps);
  const control = $derived(
    Object.fromEntries(controlKeys.filter((k) => props[k] !== undefined).map((k) => [k, props[k]])),
  );
  const labelForAria = $derived(typeof props.label === 'string' ? props.label : props.label?.text);
</script>

<Field {...fieldProps}>
  {#snippet children({ value, onChange, status, disabled: fieldDisabled, describedBy, errorMessageId, labelledById, required, insetLabel, insetLabelId })}
    <Cascader
      {...(value !== undefined ? { value: value as NonNullable<CascaderProps['value']> } : {})}
      {...(control.treeData !== undefined ? { treeData: control.treeData as NonNullable<CascaderProps['treeData']> } : {})}
      {...(control.multiple !== undefined ? { multiple: control.multiple as NonNullable<CascaderProps['multiple']> } : {})}
      {...(control.placeholder !== undefined ? { placeholder: control.placeholder as NonNullable<CascaderProps['placeholder']> } : {})}
      disabled={(control.disabled as boolean | undefined) ?? fieldDisabled}
      {...(control.size !== undefined ? { size: control.size as NonNullable<CascaderProps['size']> } : {})}
      {...(control.displayProp !== undefined ? { displayProp: control.displayProp as NonNullable<CascaderProps['displayProp']> } : {})}
      validateStatus={status === 'error' ? 'error' : 'default'}
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
