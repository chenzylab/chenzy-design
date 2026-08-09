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
  const split = $derived(splitFieldProps(props));
  const fieldProps = $derived(split.fieldProps);
  const rest = $derived.by(() => {
    const { children, ...others } = split.rest as { children?: Snippet } & Record<string, unknown>;
    return others;
  });
  const slotChildren = $derived(props.children);
</script>

<Field {...fieldProps}>
  {#snippet children({ value, onChange, status, disabled: fieldDisabled })}
    <Upload
      {...rest}
      {...(Array.isArray(value) ? { fileList: value as NonNullable<UploadProps['fileList']> } : {})}
      disabled={(rest.disabled as boolean | undefined) ?? fieldDisabled}
      validateStatus={status === 'error' ? 'error' : 'default'}
      onChange={({ fileList }) => onChange(fileList)}
    >
      {@render slotChildren?.()}
    </Upload>
  {/snippet}
</Field>
