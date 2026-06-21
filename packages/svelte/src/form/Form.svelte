<!--
  Form — see specs/components/input/Form.spec.md
  Container that bridges the headless `createForm` (callback-subscribe) into Svelte
  runes and shares it via context. Token-driven, a11y-correct.
-->
<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import { createForm, type FormValues, type FieldErrors, type MessageDescriptor } from '@chenzy-design/core';
  import { interpolate } from '@chenzy-design/locale';
  import { setFormContext, type FormLayout, type FormLabelPosition, type FormSize } from './context.js';
  import { useLocale } from '../locale-provider/index.js';
  import { getGlobalValidateMessages } from '../config-provider/index.js';

  interface Props {
    /** controlled whole-form values (reported back via onChange, never written to the prop) */
    value?: FormValues;
    initValues?: FormValues;
    layout?: FormLayout;
    /** 'top' | 'left' | 'inset'（inset：label 浮入控件，聚焦/有值时上浮变小） */
    labelPosition?: FormLabelPosition;
    labelWidth?: number | string;
    size?: FormSize;
    disabled?: boolean;
    requiredMark?: boolean;
    colon?: boolean;
    /** on failed submit, scroll to and focus the first errored field */
    scrollToError?: boolean;
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
    scrollToError = false,
    onSubmit,
    onChange,
    children,
    footer,
  }: Props = $props();

  const loc = useLocale();
  // 全局校验文案覆盖（来自 ConfigProvider getValidateMessages）；须在 init 期读 context。
  const globalValidateMessages = getGlobalValidateMessages();

  // 校验消息优先级：
  // 1) rule.message（descriptor.text）显式覆盖；
  // 2) ConfigProvider getValidateMessages() 提供的对应 `Form.*` 键模板（带插值）；
  // 3) locale 内置 Form.* 模板。
  // 未配置全局覆盖时行为完全不变（向后兼容）。
  function resolveMessage(d: MessageDescriptor): string {
    if (d.text !== undefined) return d.text;
    const override = globalValidateMessages?.()[d.key];
    if (override !== undefined) return d.params ? interpolate(override, d.params) : override;
    return loc().t(d.key, d.params);
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

  // ref to the <form> element — used imperatively (red line #3: DOM ops live in
  // the event handler, never in render) to locate the first errored field.
  let formEl: HTMLFormElement | undefined;

  function focusFirstError(errors: FieldErrors): void {
    if (!formEl) return;
    // walk fields in DOM order so we land on the *first* errored one on screen.
    const nodes = formEl.querySelectorAll<HTMLElement>('[data-field]');
    for (const node of nodes) {
      const name = node.dataset.field;
      if (name === undefined) continue;
      const err = errors[name];
      if (err === undefined || err === '') continue;
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const control = node.querySelector<HTMLElement>(
        'input, textarea, select, [tabindex]:not([tabindex="-1"])',
      );
      control?.focus({ preventScroll: true });
      return;
    }
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const r = await form.submit();
    if (!r.valid && scrollToError) focusFirstError(r.errors);
    onSubmit?.(r);
  }

  const cls = $derived(
    `cd-form cd-form--${layout} cd-form--label-${labelPosition} cd-form--${size}`,
  );
</script>

<form bind:this={formEl} class={cls} onsubmit={handleSubmit}>
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
