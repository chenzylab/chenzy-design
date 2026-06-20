<!--
  Field — see specs/components/input/Form.spec.md
  Single-field wrapper: label + required mark + error/extra text + a11y wiring.
  Pulls field slices from the shared form context (read-only during render).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useId, type Rule } from '@chenzy-design/core';
  import { getFormContext } from './context.js';

  type FieldStatus = 'default' | 'error';

  interface ChildArgs {
    value: unknown;
    onChange: (v: unknown) => void;
    onBlur: () => void;
    status: FieldStatus;
    id: string;
    disabled: boolean;
  }

  interface Props {
    field: string;
    label?: string;
    rules?: Rule[];
    required?: boolean;
    extraText?: string;
    valuePropName?: string;
    children?: Snippet<[ChildArgs]>;
  }

  // TODO: `valuePropName` is reserved for non-`value` controls (e.g. checked);
  // it is part of the public Props but not consumed this round, so it is left
  // out of the destructure intentionally.
  let { field, label, rules = [], required = false, extraText, children }: Props = $props();

  const ctx = getFormContext();
  if (!ctx) throw new Error('<Form.Field> must be used inside <Form>');
  const { form, getFormState } = ctx;

  const id = useId('cd-field');
  const errorId = `${id}-error`;
  const extraId = `${id}-extra`;

  // Register the field in the core registry (a plain Map, not Svelte-reactive),
  // so this never feeds back into a render-read. Cleanup unregisters.
  $effect(() => {
    const effectiveRules = required ? [{ required: true } as Rule, ...rules] : rules;
    const config = label !== undefined ? { rules: effectiveRules, label } : { rules: effectiveRules };
    return form.registerField(field, config);
  });

  // Read-only slices derived from the bridged form state (render-safe getters).
  const value = $derived(getFormState().values[field]);
  const error = $derived(getFormState().errors[field]);
  const touched = $derived(getFormState().touched[field]);
  const status = $derived<FieldStatus>(error ? 'error' : 'default');

  const showRequiredMark = $derived(ctx.getRequiredMark() && required);
  const showError = $derived(error !== undefined && error !== '');
  const showExtra = $derived(!showError && extraText !== undefined && extraText !== '');

  function handleChange(v: unknown) {
    // Re-validate on change once the field is "active": after a blur (touched)
    // OR while an error is already showing (so typing clears a submit error).
    // Without this, a submit-time required error never clears as the user types
    // (controls like Input have no blur hook to set `touched`).
    const active = touched === true || (error !== undefined && error !== '');
    form.setFieldValue(field, v, { validate: active });
  }

  function handleBlur() {
    form.setFieldTouched(field);
    void form.validateField(field);
  }

  const describedBy = $derived(showError ? errorId : showExtra ? extraId : undefined);

  const labelWidth = $derived(ctx.getLabelWidth());
  const labelPosition = $derived(ctx.getLabelPosition());
  const labelStyle = $derived(
    labelPosition === 'left' && labelWidth !== undefined
      ? `inline-size:${typeof labelWidth === 'number' ? `${labelWidth}px` : labelWidth}`
      : undefined,
  );

  // inset：label 浮入控件，聚焦或有值时上浮变小（floating label）
  const isInset = $derived(labelPosition === 'inset');
  let focused = $state(false);
  const hasValue = $derived(value !== undefined && value !== null && value !== '');
  const labelFloated = $derived(focused || hasValue);

  const cls = $derived(
    [
      'cd-form-field',
      `cd-form-field--label-${labelPosition}`,
      `cd-form-field--${status}`,
      isInset && labelFloated && 'cd-form-field--floated',
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<div class={cls}>
  {#if label !== undefined && !isInset}
    <label class="cd-form-field__label" for={id} style={labelStyle}>
      {#if showRequiredMark}<span aria-hidden="true" class="cd-form-field__required">*</span>{/if}
      <span class="cd-form-field__label-text">{label}{ctx.getColon() ? '：' : ''}</span>
    </label>
  {/if}

  <!-- inset 时 label 浮入控件容器内；focusin/focusout 驱动上浮 (红线 #3 命令式 DOM 事件) -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="cd-form-field__control"
    aria-describedby={describedBy}
    onfocusin={isInset ? () => (focused = true) : undefined}
    onfocusout={isInset ? () => (focused = false) : undefined}
  >
    {#if label !== undefined && isInset}
      <label class="cd-form-field__inset-label" for={id}>
        {#if showRequiredMark}<span aria-hidden="true" class="cd-form-field__required">*</span>{/if}
        <span class="cd-form-field__label-text">{label}</span>
      </label>
    {/if}

    {@render children?.({
      value,
      onChange: handleChange,
      onBlur: handleBlur,
      status,
      id,
      disabled: ctx.getDisabled(),
    })}

    {#if showError}
      <div id={errorId} role="alert" class="cd-form-field__error">{error}</div>
    {:else if showExtra}
      <div id={extraId} class="cd-form-field__extra">{extraText}</div>
    {/if}
  </div>
</div>

<style>
  .cd-form-field {
    display: flex;
    gap: var(--cd-form-label-gap, var(--cd-spacing-2));
  }
  .cd-form-field--label-top {
    flex-direction: column;
  }
  .cd-form-field--label-left {
    flex-direction: row;
    align-items: flex-start;
  }
  .cd-form-field__label {
    display: inline-flex;
    align-items: center;
    gap: var(--cd-spacing-1);
    color: var(--cd-form-label-color, var(--cd-color-text-1));
  }
  .cd-form-field--label-left .cd-form-field__label {
    padding-block-start: var(--cd-spacing-1);
  }
  .cd-form-field__required {
    color: var(--cd-form-required-color, var(--cd-color-danger, #e54848));
  }
  .cd-form-field__control {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: var(--cd-spacing-1);
    min-inline-size: 0;
  }
  /* inset floating label */
  .cd-form-field--label-inset {
    flex-direction: column;
  }
  .cd-form-field--label-inset .cd-form-field__control {
    position: relative;
    padding-block-start: var(--cd-spacing-3);
  }
  .cd-form-field__inset-label {
    position: absolute;
    inset-block-start: 50%;
    inset-inline-start: var(--cd-input-padding-x, var(--cd-spacing-3));
    transform: translateY(-50%);
    display: inline-flex;
    align-items: center;
    gap: var(--cd-spacing-1);
    color: var(--cd-input-color-placeholder, var(--cd-color-text-3));
    pointer-events: none;
    transition:
      transform var(--cd-motion-duration-fast) var(--cd-motion-ease-standard),
      font-size var(--cd-motion-duration-fast) var(--cd-motion-ease-standard),
      color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-form-field--floated .cd-form-field__inset-label {
    transform: translateY(calc(-50% - 0.85rem)) scale(0.85);
    color: var(--cd-form-label-color, var(--cd-color-text-1));
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-form-field__inset-label {
      transition: none;
    }
  }
  .cd-form-field__error {
    color: var(--cd-form-error-color, var(--cd-color-danger, #e54848));
    font-size: var(--cd-form-error-font-size, var(--cd-font-size-1, 0.75rem));
  }
  .cd-form-field__extra {
    color: var(--cd-form-extra-color, var(--cd-color-text-3));
    font-size: var(--cd-form-error-font-size, var(--cd-font-size-1, 0.75rem));
  }
</style>
