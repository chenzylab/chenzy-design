<!--
  Form.Upload — convenience wrapper: <Form.Field> + <Upload> bound to a field.
-->
<script lang="ts">
  import type { Rule, ValidateTrigger } from '@chenzy-design/core';
  import type { ComponentProps, Snippet } from 'svelte';
  import Field from './Field.svelte';
  import Upload from '../upload/Upload.svelte';

  type UploadProps = ComponentProps<typeof Upload>;

  interface Props {
    field: string;
    label?: string;
    rules?: Rule[];
    initValue?: unknown;
    required?: boolean;
    validateStatus?: 'default' | 'warning' | 'error';
    extraText?: string;
    span?: number;
    transform?: (value: unknown, values: Record<string, unknown>) => unknown;
    dependencies?: string[];
    trigger?: ValidateTrigger | ValidateTrigger[];
    // Upload-specific props
    accept?: UploadProps['accept'];
    multiple?: UploadProps['multiple'];
    limit?: UploadProps['limit'];
    disabled?: boolean;
    listType?: UploadProps['listType'];
    drag?: UploadProps['drag'];
    action?: UploadProps['action'];
    size?: UploadProps['size'];
    children?: Snippet;
  }

  let {
    field,
    label,
    rules = [],
    initValue,
    required = false,
    validateStatus,
    extraText,
    span,
    transform,
    dependencies,
    trigger,
    accept,
    multiple,
    limit,
    disabled,
    listType,
    drag,
    action,
    size,
    children,
  }: Props = $props();

  const fieldProps = $derived<ComponentProps<typeof Field>>({
    field,
    rules,
    required,
    ...(label !== undefined ? { label } : {}),
    ...(initValue !== undefined ? { initValue } : {}),
    ...(validateStatus !== undefined ? { validateStatus } : {}),
    ...(extraText !== undefined ? { extraText } : {}),
    ...(span !== undefined ? { span } : {}),
    ...(transform !== undefined ? { transform } : {}),
    ...(dependencies !== undefined ? { dependencies } : {}),
    ...(trigger !== undefined ? { trigger } : {}),
  });
</script>

<Field {...fieldProps}>
  {#snippet children({ value, onChange, status, disabled: fieldDisabled })}
    <Upload
      value={Array.isArray(value) ? (value as UploadProps['value']) : undefined}
      {accept}
      {multiple}
      {limit}
      disabled={disabled ?? fieldDisabled}
      {listType}
      {drag}
      {action}
      {size}
      status={status === 'error' ? 'error' : 'default'}
      onChange={(list) => onChange(list)}
    >
      {@render children?.()}
    </Upload>
  {/snippet}
</Field>
