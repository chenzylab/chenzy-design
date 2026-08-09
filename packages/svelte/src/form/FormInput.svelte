<!--
  FormInput — Convenience wrapper: <Form.Field> + <Input> bound to a field.
  对齐 Semi withField：解构出 field-level props 交给 Field，剩余 rest 原样透传给 Input
  （对齐 withField.tsx `{ ...rest }` 语义，而非手写控件 prop 白名单——白名单每次只挑
  用到的 key，新增/未预料的 prop（如 style/class/addonAfter）会被静默丢弃）。
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
  const split = $derived(splitFieldProps(props));
  const fieldProps = $derived(split.fieldProps);
  // type='password' 是本库对齐 Semi 的语义映射（Input 内部叫 mode），需要转换不能直接透传。
  const rest = $derived.by(() => {
    const { type, ...others } = split.rest as { type?: string } & Record<string, unknown>;
    return { ...others, ...(type === 'password' ? { mode: 'password' as const } : {}) };
  });
  const labelForAria = $derived(typeof props.label === 'string' ? props.label : props.label?.text);
</script>

<Field {...fieldProps}>
  {#snippet children({ value, onChange, onBlur, status, disabled, id, describedBy, errorMessageId, labelledById, required, insetLabel, insetLabelId })}
    <Input
      {...rest}
      value={value === undefined ? '' : String(value)}
      validateStatus={status === 'error' ? 'error' : 'default'}
      {disabled}
      {id}
      showClear={Boolean((rest as Record<string, unknown>).showClear)}
      {...(insetLabel !== undefined ? { insetLabel } : {})}
      {...(insetLabelId !== undefined ? { insetLabelId } : {})}
      {...(labelledById !== undefined ? { ariaLabelledby: labelledById } : labelForAria !== undefined ? { 'aria-label': labelForAria } : {})}
      {...(describedBy !== undefined ? { ariaDescribedby: describedBy } : {})}
      {...(errorMessageId !== undefined ? { ariaErrormessage: errorMessageId } : {})}
      {...(required ? { ariaRequired: true } : {})}
      onChange={(v) => onChange(v)}
      onBlur={() => onBlur()}
    />
  {/snippet}
</Field>
