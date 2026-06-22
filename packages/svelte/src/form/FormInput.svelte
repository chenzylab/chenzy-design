<!--
  FormInput — see specs/components/input/Form.spec.md
  Convenience wrapper: <Form.Field> + <Input> bound to a field.
-->
<script lang="ts">
  import type { Rule, ValidateTrigger } from '@chenzy-design/core';
  import type { ComponentProps } from 'svelte';
  import Field from './Field.svelte';
  import Input from '../input/Input.svelte';

  interface Props {
    field: string;
    label?: string;
    rules?: Rule[];
    /** field-level initial value (spec §4.2 L79). */
    initValue?: unknown;
    required?: boolean;
    /** externally forced validate status — controlled display (spec §4.2 L81). */
    validateStatus?: 'default' | 'warning' | 'error';
    extraText?: string;
    /** column span inside a grid parent / Form.Section (spec §4.2 L86). */
    span?: number;
    /** pure value transform at collect/submit time (spec §4.2 L88). */
    transform?: (value: unknown, values: Record<string, unknown>) => unknown;
    placeholder?: string;
    type?: 'text' | 'password';
    clearable?: boolean;
    maxLength?: number;
    dependencies?: string[];
    /** field-level override of the form's validateTrigger (spec §4 L84). */
    trigger?: ValidateTrigger | ValidateTrigger[];
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
    placeholder,
    type = 'text',
    clearable = false,
    maxLength,
    dependencies,
    trigger,
  }: Props = $props();

  // Build props with conditional keys so we never pass an explicit `undefined`
  // to an optional prop (exactOptionalPropertyTypes).
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
  {#snippet children({ value, onChange, onBlur, status, disabled, id, describedBy, required })}
    <!--
      `id` is wired to the native <input> so Field's visible <label for={id}>
      precisely targets the control (WAI-ARIA preferred association): clicking the
      label focuses the input and screen readers pair them by name. `ariaLabel`
      remains as a redundant accessible name (and the only one when no `label`).
      `describedBy` links the error/warning/extra text to the control.
      blur-time validation is still deferred until Input gains an `onBlur` hook.
    -->
    <Input
      value={value === undefined ? '' : String(value)}
      status={status === 'error' ? 'error' : 'default'}
      {disabled}
      {id}
      {type}
      {clearable}
      {...(placeholder !== undefined ? { placeholder } : {})}
      {...(maxLength !== undefined ? { maxLength } : {})}
      {...(label !== undefined ? { ariaLabel: label } : {})}
      {...(describedBy !== undefined ? { ariaDescribedby: describedBy } : {})}
      {...(required ? { ariaRequired: true } : {})}
      onChange={(v) => onChange(v)}
      onBlur={() => onBlur()}
    />
  {/snippet}
</Field>
