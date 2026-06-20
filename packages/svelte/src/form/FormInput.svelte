<!--
  FormInput — see specs/components/input/Form.spec.md
  Convenience wrapper: <Form.Field> + <Input> bound to a field.
-->
<script lang="ts">
  import type { Rule } from '@chenzy-design/core';
  import type { ComponentProps } from 'svelte';
  import Field from './Field.svelte';
  import Input from '../input/Input.svelte';

  interface Props {
    field: string;
    label?: string;
    rules?: Rule[];
    required?: boolean;
    extraText?: string;
    placeholder?: string;
    type?: 'text' | 'password';
    clearable?: boolean;
    maxLength?: number;
    dependencies?: string[];
  }

  let {
    field,
    label,
    rules = [],
    required = false,
    extraText,
    placeholder,
    type = 'text',
    clearable = false,
    maxLength,
    dependencies,
  }: Props = $props();

  // Build props with conditional keys so we never pass an explicit `undefined`
  // to an optional prop (exactOptionalPropertyTypes).
  const fieldProps = $derived<ComponentProps<typeof Field>>({
    field,
    rules,
    required,
    ...(label !== undefined ? { label } : {}),
    ...(extraText !== undefined ? { extraText } : {}),
    ...(dependencies !== undefined ? { dependencies } : {}),
  });
</script>

<Field {...fieldProps}>
  {#snippet children({ value, onChange, status, disabled, id, describedBy })}
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
      onChange={(v) => onChange(v)}
    />
  {/snippet}
</Field>
