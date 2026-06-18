<!--
  Form — see specs/components/input/Form.spec.md
  Container that bridges the headless `createForm` (callback-subscribe) into Svelte
  runes and shares it via context. Token-driven, a11y-correct.
-->
<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import { createForm, type FormValues, type FieldErrors, type MessageDescriptor } from '@chenzy-design/core';
  import { setFormContext, type FormLayout, type FormLabelPosition, type FormSize } from './context.js';

  interface Props {
    /** controlled whole-form values (reported back via onChange, never written to the prop) */
    value?: FormValues;
    initValues?: FormValues;
    layout?: FormLayout;
    /** TODO: 'inset' label position is not implemented this round */
    labelPosition?: FormLabelPosition;
    labelWidth?: number | string;
    size?: FormSize;
    disabled?: boolean;
    requiredMark?: boolean;
    colon?: boolean;
    onSubmit?: (r: { valid: boolean; values: FormValues; errors: FieldErrors }) => void;
    onChange?: (values: FormValues) => void;
    children?: Snippet;
    footer?: Snippet<[{ submitting: boolean }]>;
  }

  let {
    value,
    initValues = {},
    layout = 'vertical',
    labelPosition = 'top',
    labelWidth,
    size = 'default',
    disabled = false,
    requiredMark = true,
    colon = false,
    onSubmit,
    onChange,
    children,
    footer,
  }: Props = $props();

  // TODO: i18n — wire this to the locale package via ConfigProvider. For now a
  // small built-in zh-CN message map with {label}/{min}/{max} interpolation.
  const ZH_MESSAGES: Record<string, string> = {
    'Form.required': '请输入{label}',
    'Form.typeError': '{label}格式不正确',
    'Form.minLength': '至少输入 {min} 个字符',
    'Form.maxLength': '最多输入 {max} 个字符',
    'Form.min': '不能小于 {min}',
    'Form.max': '不能大于 {max}',
    'Form.pattern': '{label}格式不正确',
  };

  function resolveMessage(d: MessageDescriptor): string {
    if (d.text !== undefined) return d.text;
    const template = ZH_MESSAGES[d.key] ?? d.key;
    const params = d.params ?? {};
    return template.replace(/\{(\w+)\}/g, (_m, k: string) =>
      k in params ? String(params[k]) : `{${k}}`,
    );
  }

  // initial values are a one-time snapshot by design; untrack makes the
  // non-reactive seed read explicit (later prop changes flow via the controlled
  // `value` effect / onChange, not by re-seeding the form).
  const seedValues: FormValues = untrack(() => value ?? initValues);
  const form = createForm({ initialValues: seedValues, resolveMessage });

  // Bridge: callback-subscribe → runes. core returns a STABLE state object whose
  // sub-objects are replaced immutably; we take a fresh shallow snapshot on every
  // emit so the new reference triggers Svelte reactivity. The $effect ONLY writes
  // formState — it never reads state that children write on mount, so no loop.
  let formState = $state({ ...form.getState() });
  let lastValues = form.getState().values;
  $effect(() =>
    form.subscribe((s) => {
      formState = { ...s };
      if (s.values !== lastValues) {
        lastValues = s.values;
        onChange?.(s.values);
      }
    }),
  );

  // Controlled `value`: push into the form only when the prop reference changes.
  // We never write back to the prop (onChange is the only outward channel), so
  // this cannot form a value -> onChange -> value loop.
  $effect(() => {
    if (value !== undefined) form.setFieldsValue(value);
  });

  setFormContext({
    form,
    getFormState: () => formState,
    getLabelPosition: () => labelPosition,
    getLabelWidth: () => labelWidth,
    getSize: () => size,
    getDisabled: () => disabled,
    getRequiredMark: () => requiredMark,
    getColon: () => colon,
  });

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const r = await form.submit();
    onSubmit?.(r);
  }

  const cls = $derived(
    `cd-form cd-form--${layout} cd-form--label-${labelPosition} cd-form--${size}`,
  );
</script>

<form class={cls} onsubmit={handleSubmit}>
  {@render children?.()}
  {#if footer}
    <div class="cd-form__footer">
      {@render footer({ submitting: formState.submitting })}
    </div>
  {/if}
</form>

<style>
  .cd-form {
    display: flex;
    flex-direction: column;
    gap: var(--cd-form-item-gap, var(--cd-spacing-4));
  }
  .cd-form__footer {
    display: flex;
    gap: var(--cd-spacing-3);
  }
</style>
