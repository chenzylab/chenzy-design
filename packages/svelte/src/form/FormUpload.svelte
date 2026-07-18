<!--
  Form.Upload — convenience wrapper: <Form.Field> + <Upload> bound to a field.
  field-level props 经 FieldPassthroughProps 透传给 Field；控件专属给 Upload。
-->
<script lang="ts">
  import type { ComponentProps, Snippet } from 'svelte';
  import Field from './Field.svelte';
  import Upload from '../upload/Upload.svelte';
  import { splitFieldProps, type FieldPassthroughProps } from './field-props.js';

  type UploadProps = ComponentProps<typeof Upload>;

  interface Props extends FieldPassthroughProps {
    accept?: UploadProps['accept'];
    multiple?: UploadProps['multiple'];
    limit?: UploadProps['limit'];
    disabled?: boolean;
    listType?: UploadProps['listType'];
    draggable?: UploadProps['draggable'];
    action?: UploadProps['action'];
    children?: Snippet;
  }

  const props: Props = $props();
  const controlKeys = ['accept', 'multiple', 'limit', 'disabled', 'listType', 'draggable', 'action', 'children'] as const;
  const split = $derived(splitFieldProps(props));
  const fieldProps = $derived(split.fieldProps);
  const control = $derived(
    Object.fromEntries(controlKeys.filter((k) => props[k] !== undefined).map((k) => [k, props[k]])),
  );
  const slotChildren = $derived(props.children);
</script>

<Field {...fieldProps}>
  {#snippet children({ value, onChange, status, disabled: fieldDisabled })}
    <Upload
      {...(Array.isArray(value) ? { fileList: value as NonNullable<UploadProps['fileList']> } : {})}
      {...(control.accept !== undefined ? { accept: control.accept as NonNullable<UploadProps['accept']> } : {})}
      {...(control.multiple !== undefined ? { multiple: control.multiple as NonNullable<UploadProps['multiple']> } : {})}
      {...(control.limit !== undefined ? { limit: control.limit as NonNullable<UploadProps['limit']> } : {})}
      disabled={(control.disabled as boolean | undefined) ?? fieldDisabled}
      {...(control.listType !== undefined ? { listType: control.listType as NonNullable<UploadProps['listType']> } : {})}
      {...(control.draggable !== undefined ? { draggable: control.draggable as NonNullable<UploadProps['draggable']> } : {})}
      {...(control.action !== undefined ? { action: control.action as NonNullable<UploadProps['action']> } : {})}
      validateStatus={status === 'error' ? 'error' : 'default'}
      onChange={({ fileList }) => onChange(fileList)}
    >
      {@render slotChildren?.()}
    </Upload>
  {/snippet}
</Field>
