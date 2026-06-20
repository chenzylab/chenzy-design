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
  {#snippet children({ value, onChange, status, disabled })}
    <!--
      Input does not expose `id`/`onBlur` props, so:
      - label `for` association degrades to `aria-label` (Field still renders the
        visible <label>). TODO: expose `id` on Input for proper for/id linking.
      - blur-time validation is deferred until Input gains an `onBlur` hook.
    -->
    <Input
      value={value === undefined ? '' : String(value)}
      status={status === 'error' ? 'error' : 'default'}
      {disabled}
      {type}
      {clearable}
      {...(placeholder !== undefined ? { placeholder } : {})}
      {...(maxLength !== undefined ? { maxLength } : {})}
      {...(label !== undefined ? { ariaLabel: label } : {})}
      onChange={(v) => onChange(v)}
    />
  {/snippet}
</Field>
