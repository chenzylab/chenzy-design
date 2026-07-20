<!--
  FormInput — Convenience wrapper: <Form.Field> + <Input> bound to a field.
  对齐 Semi withField：field-level props（label/labelPosition/noLabel/helpText/rules/...）
  经 FieldPassthroughProps 透传给 Field，控件专属 props（placeholder/type/...）给 Input。
-->
<script lang="ts">
  import Field from './Field.svelte';
  import Input from '../input/Input.svelte';
  import { splitFieldProps, type FieldPassthroughProps } from './field-props.js';

  interface Props extends FieldPassthroughProps {
    placeholder?: string;
    type?: 'text' | 'password';
    showClear?: boolean;
    maxLength?: number;
    /** 最小长度（对齐 Semi minLength），下发原生 minlength 触发校验。 */
    minLength?: number;
    /** 自定义字符计数（对齐 Semi getValueLength），配合 max/minLength 按可见长度校验。 */
    getValueLength?: (value: string) => number;
  }

  const props: Props = $props();
  // 控件专属 props(非 field-level)在这里显式取，其余经 splitFieldProps 分离。
  const controlKeys = ['placeholder', 'type', 'showClear', 'maxLength', 'minLength', 'getValueLength'] as const;
  const split = $derived(splitFieldProps(props));
  const fieldProps = $derived(split.fieldProps);
  const control = $derived(
    Object.fromEntries(controlKeys.filter((k) => props[k] !== undefined).map((k) => [k, props[k]])),
  );
  const labelForAria = $derived(typeof props.label === 'string' ? props.label : props.label?.text);
</script>

<Field {...fieldProps}>
  {#snippet children({ value, onChange, onBlur, status, disabled, id, describedBy, errorMessageId, labelledById, required, insetLabel, insetLabelId })}
    <Input
      value={value === undefined ? '' : String(value)}
      validateStatus={status === 'error' ? 'error' : 'default'}
      {disabled}
      {id}
      {...(control.type === 'password' ? { mode: 'password' as const } : {})}
      showClear={Boolean(control.showClear)}
      {...(control.placeholder !== undefined ? { placeholder: control.placeholder as string } : {})}
      {...(control.maxLength !== undefined ? { maxLength: control.maxLength as number } : {})}
      {...(control.minLength !== undefined ? { minLength: control.minLength as number } : {})}
      {...(control.getValueLength !== undefined ? { getValueLength: control.getValueLength as (value: string) => number } : {})}
      {...(insetLabel !== undefined ? { insetLabel } : {})}
      {...(insetLabelId !== undefined ? { insetLabelId } : {})}
      {...(labelledById !== undefined ? { ariaLabelledby: labelledById } : labelForAria !== undefined ? { ariaLabel: labelForAria } : {})}
      {...(describedBy !== undefined ? { ariaDescribedby: describedBy } : {})}
      {...(errorMessageId !== undefined ? { ariaErrormessage: errorMessageId } : {})}
      {...(required ? { ariaRequired: true } : {})}
      onChange={(v) => onChange(v)}
      onBlur={() => onBlur()}
    />
  {/snippet}
</Field>
