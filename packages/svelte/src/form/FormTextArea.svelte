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
  const controlKeys = [
    'placeholder',
    'disabled',
    'size',
    'rows',
    'maxLength',
    'maxCount',
    'showCount',
    'autosize',
  ] as const;
  const split = $derived(splitFieldProps(props));
  const fieldProps = $derived(split.fieldProps);
  const control = $derived(
    Object.fromEntries(controlKeys.filter((k) => props[k] !== undefined).map((k) => [k, props[k]])),
  );
  const labelForAria = $derived(typeof props.label === 'string' ? props.label : props.label?.text);
</script>

<Field {...fieldProps}>
  {#snippet children({ value, onChange, onBlur, status, disabled: fieldDisabled, id, describedBy, required })}
    <TextArea
      value={value === undefined ? '' : String(value)}
      validateStatus={status === 'error' ? 'error' : 'default'}
      disabled={(control.disabled as boolean | undefined) ?? fieldDisabled}
      {id}
      {...(control.placeholder !== undefined ? { placeholder: control.placeholder as NonNullable<TextAreaProps['placeholder']> } : {})}
      {...(control.size !== undefined ? { size: control.size as NonNullable<TextAreaProps['size']> } : {})}
      {...(control.rows !== undefined ? { rows: control.rows as NonNullable<TextAreaProps['rows']> } : {})}
      {...(control.maxLength !== undefined ? { maxLength: control.maxLength as NonNullable<TextAreaProps['maxLength']> } : {})}
      {...(control.maxCount !== undefined ? { maxCount: control.maxCount as NonNullable<TextAreaProps['maxCount']> } : {})}
      {...(control.showCount !== undefined ? { showCount: control.showCount as NonNullable<TextAreaProps['showCount']> } : {})}
      {...(control.autosize !== undefined ? { autosize: control.autosize as NonNullable<TextAreaProps['autosize']> } : {})}
      {...(labelForAria !== undefined ? { ariaLabel: labelForAria } : {})}
      {...(describedBy !== undefined ? { ariaDescribedby: describedBy } : {})}
      {...(required ? { ariaRequired: true } : {})}
      onChange={(v) => onChange(v)}
      onBlur={() => onBlur()}
    />
  {/snippet}
</Field>
