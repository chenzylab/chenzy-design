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
  const controlKeys = ['placeholder', 'disabled', 'size', 'maxLength', 'allowDuplicates'] as const;
  const split = $derived(splitFieldProps(props));
  const fieldProps = $derived(split.fieldProps);
  const control = $derived(
    Object.fromEntries(controlKeys.filter((k) => props[k] !== undefined).map((k) => [k, props[k]])),
  );
</script>

<Field {...fieldProps}>
  {#snippet children({ value, onChange, status, disabled: fieldDisabled })}
    <TagInput
      {...(Array.isArray(value) ? { value: value as string[] } : {})}
      {...(control.placeholder !== undefined ? { placeholder: control.placeholder as NonNullable<TagInputProps['placeholder']> } : {})}
      disabled={(control.disabled as boolean | undefined) ?? fieldDisabled}
      {...(control.size !== undefined ? { size: control.size as NonNullable<TagInputProps['size']> } : {})}
      {...(control.maxLength !== undefined ? { maxLength: control.maxLength as NonNullable<TagInputProps['maxLength']> } : {})}
      {...(control.allowDuplicates !== undefined ? { allowDuplicates: control.allowDuplicates as NonNullable<TagInputProps['allowDuplicates']> } : {})}
      validateStatus={status === 'error' ? 'error' : 'default'}
      onChange={(tags) => onChange(tags)}
    />
  {/snippet}
</Field>
