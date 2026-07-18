<!--
  Field — see specs/components/input/Form.spec.md
  Single-field wrapper: label + required mark + error/extra text + a11y wiring.
  Pulls field slices from the shared form context (read-only during render).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useId, type Rule, type ValidateTrigger } from '@chenzy-design/core';
  import { IconAlertCircle, IconAlertTriangle } from '@chenzy-design/icons';
  import { getFormContext } from './context.js';
  import { useLocale } from '../locale-provider/index.js';

  type FieldStatus = 'default' | 'error' | 'warning';

  interface ChildArgs {
    /** Generic field value — always present, regardless of `valuePropName`. */
    value: unknown;
    onChange: (v: unknown) => void;
    onBlur: () => void;
    status: FieldStatus;
    id: string;
    /** id(s) of the field's error/warning/extra text, for the control's aria-describedby */
    describedBy: string | undefined;
    disabled: boolean;
    /**
     * whether this field is required (spec §138). Controls should expose it as
     * `aria-required="true"` so the required semantic reaches screen readers —
     * the visible star is `aria-hidden` and thus inaudible on its own.
     */
    required: boolean;
    /**
     * Convenience alias keyed by `valuePropName` (default 'value'), carrying the
     * same value as `value`. Lets non-`value` controls (e.g. Checkbox/Switch use
     * `checked`) destructure `{ checked, onChange }` directly from the snippet.
     */
    [key: string]: unknown;
  }

  interface Props {
    field: string;
    label?: string;
    rules?: Rule[];
    /** field-level initial value; overrides the container's initValues (spec §4.2 L79). */
    initValue?: unknown;
    required?: boolean;
    /**
     * externally forced validate status (spec §4.2 L81). A controlled DISPLAY
     * state only — it never feeds the internal validation engine and is never
     * written back (red line #1). When set it takes precedence over the
     * internally computed status for visuals/aria.
     */
    validateStatus?: 'default' | 'warning' | 'error';
    extraText?: string;
    /**
     * register & collect only, render no layout DOM (spec §4.2 L85 / §190). The
     * control snippet is still rendered (so it can bind), but the label / status
     * text / field wrapper chrome are skipped.
     */
    noStyle?: boolean;
    /** number of columns this field spans inside a grid parent / Form.Section (spec §4.2 L86). */
    span?: number;
    /** pure value transform applied at collect/submit time (spec §4.2 L88). */
    transform?: (value: unknown, values: Record<string, unknown>) => unknown;
    /**
     * Name of the control's value prop. Default 'value'. For boolean controls
     * such as Checkbox/Switch pass 'checked'; the snippet then exposes a
     * `checked` alias mirroring the field value.
     */
    valuePropName?: string;
    /** names of fields this field's validation depends on (e.g. confirm → ['password']) */
    dependencies?: string[];
    /** field-level override of the form's validateTrigger (spec §4 L84). */
    trigger?: ValidateTrigger | ValidateTrigger[];
    /**
     * 是否允许空字符串作为有效值（默认 false：空串当 undefined 处理，不触发 required 通过）。
     * 设为 true 后空串参与 required 校验和值收集。
     */
    allowEmptyString?: boolean;
    /**
     * 字段值在存入 formState 前的转换函数（在 Field 层执行，不同于 transform 的提交时转换）。
     * convert 的结果回写 formState，transform 的结果仅用于提交/收集，不回写。
     */
    convert?: (value: unknown) => unknown;
    /**
     * 组件卸载时保留字段状态（默认 false：卸载时清空字段值/错误/touched）。
     * 设为 true 后卸载不清 formState，下次挂载时继承上次状态。
     */
    keepState?: boolean;
    children?: Snippet<[ChildArgs]>;
  }

  let {
    field,
    label,
    rules = [],
    initValue,
    required = false,
    validateStatus,
    extraText,
    noStyle = false,
    span,
    transform,
    valuePropName = 'value',
    dependencies,
    trigger,
    allowEmptyString = false,
    convert,
    keepState = false,
    children,
  }: Props = $props();

  const ctx = getFormContext();
  if (!ctx) throw new Error('<Form.Field> must be used inside <Form>');
  const { form, getFormState } = ctx;

  const loc = useLocale();

  const id = useId('cd-field');
  const errorId = `${id}-error`;
  const warningId = `${id}-warning`;
  const extraId = `${id}-extra`;

  // Register the field in the core registry (a plain Map, not Svelte-reactive),
  // so this never feeds back into a render-read. Cleanup unregisters.
  $effect(() => {
    const effectiveRules = required ? [{ required: true } as Rule, ...rules] : rules;
    const config: {
      rules: Rule[];
      label?: string;
      initialValue?: unknown;
      dependencies?: string[];
      trigger?: ValidateTrigger | ValidateTrigger[];
      transform?: (value: unknown, values: Record<string, unknown>) => unknown;
    } = {
      rules: effectiveRules,
    };
    if (label !== undefined) config.label = label;
    if (initValue !== undefined) config.initialValue = initValue;
    if (dependencies !== undefined) config.dependencies = dependencies;
    if (trigger !== undefined) config.trigger = trigger;
    if (transform !== undefined) config.transform = transform;
    const unregister = form.registerField(field, config);
    // spec §2 L26: a `mount` trigger validates once right after registration.
    // Imperative one-shot (not a render read) so it cannot loop.
    if (form.getFieldTrigger(field).includes('mount')) void form.validateField(field);
    // keepState: when false (default), unregister clears field state on destroy.
    // When true, we skip the cleanup so state persists for future mounts.
    return keepState ? () => { /* preserve state — do not unregister */ } : unregister;
  });

  // Read-only slices derived from the bridged form state (render-safe getters).
  const value = $derived(getFormState().values[field]);
  const error = $derived(getFormState().errors[field]);
  const warning = $derived(getFormState().warnings[field]);
  const validating = $derived(getFormState().validating[field] === true);
  const touched = $derived(getFormState().touched[field]);

  // `validateStatus` is a controlled display override (spec §4.2 L81): it forces
  // the visual status without touching the internal validation engine (red line
  // #1 — never written back). When set, it wins over the computed status.
  const forcedError = $derived(validateStatus === 'error');
  const forcedWarning = $derived(validateStatus === 'warning');
  const showError = $derived(forcedError || (error !== undefined && error !== ''));
  // a warning only surfaces when there is no blocking error to show
  const showWarning = $derived(
    !showError && (forcedWarning || (warning !== undefined && warning !== '')),
  );
  const status = $derived<FieldStatus>(showError ? 'error' : showWarning ? 'warning' : 'default');

  const showRequiredMark = $derived(ctx.getRequiredMark() && required);
  const showExtra = $derived(
    !showError && !showWarning && extraText !== undefined && extraText !== '',
  );
  const validatingText = $derived(loc().t('Form.validating'));

  // resolved validation triggers for this field (own override → form default).
  // Plain getters off the core registry (a non-reactive Map), read inside event
  // handlers only — never during render, so no effect loop.
  function triggers(): ValidateTrigger[] {
    return form.getFieldTrigger(field);
  }

  function handleChange(v: unknown) {
    // allowEmptyString: treat empty string as undefined unless explicitly allowed.
    // This normalizes '' to undefined for required validation / collection.
    const coerced = !allowEmptyString && v === '' ? undefined : v;
    // convert: field-level value transform (applied before storing into formState).
    const stored = convert !== undefined ? convert(coerced) : coerced;
    const tr = triggers();
    // Validate on change when 'change' is an active trigger AND the field is
    // already "active": after a blur (touched) OR while an error is showing (so
    // typing clears a submit error). Controls like Input have no blur hook to
    // set `touched`, so the "showing error" path keeps submit errors clearable.
    const active = touched === true || (error !== undefined && error !== '');
    const validate = tr.includes('change') && active;
    form.setValue(field, stored, { validate });
  }

  function handleBlur() {
    form.setTouched(field);
    // only validate on blur when 'blur' is an active trigger for this field.
    if (triggers().includes('blur')) void form.validateField(field);
  }

  const describedBy = $derived(
    // noStyle renders no status/extra elements, so there is nothing to point at
    noStyle
      ? undefined
      : showError
        ? errorId
        : showWarning
          ? warningId
          : showExtra
            ? extraId
            : undefined,
  );

  const labelWidth = $derived(ctx.getLabelWidth());
  const labelPosition = $derived(ctx.getLabelPosition());
  const labelAlign = $derived(ctx.getLabelAlign());
  const showValidateIcon = $derived(ctx.getShowValidateIcon());
  const extraTextPosition = $derived(ctx.getExtraTextPosition?.() ?? 'bottom');
  // label style: fixed width in `left` mode + text-align from labelAlign (§4 L60)
  const labelStyle = $derived(
    [
      labelPosition === 'left' && labelWidth !== undefined
        ? `inline-size:${typeof labelWidth === 'number' ? `${labelWidth}px` : labelWidth}`
        : undefined,
      `text-align:${labelAlign}`,
    ]
      .filter(Boolean)
      .join(';'),
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

  // `span` (spec §4.2 L86): occupy N columns of a grid parent (e.g. Form.Section).
  // Pure inline `grid-column` — inert when the parent isn't a grid.
  const wrapStyle = $derived(span !== undefined ? `grid-column:span ${span}` : undefined);
</script>

{#if noStyle}
  <!--
    noStyle (spec §4.2 L85 / §190): register & collect only, render no layout
    chrome. The control snippet is still rendered so it can bind to the field;
    label / status text / wrapper DOM are skipped. `validateStatus`/error still
    flow into `status` so a custom control can style itself.
  -->
  {@render children?.({
    value,
    [valuePropName]: value,
    onChange: handleChange,
    onBlur: handleBlur,
    status,
    id,
    describedBy,
    disabled: ctx.getDisabled(),
    required,
  })}
{:else}
<div class={cls} data-field={field} style={wrapStyle}>
  {#if label !== undefined && !isInset}
    <label
      class="cd-form-field__label cd-form-field__label--align-{labelAlign}"
      for={id}
      style={labelStyle}
    >
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
      // alias keyed by valuePropName (e.g. `checked`); for the default 'value'
      // this is the same key and a no-op spread. Pure object construction —
      // no write-back, satisfies red line #1/#2.
      [valuePropName]: value,
      onChange: handleChange,
      onBlur: handleBlur,
      status,
      id,
      describedBy,
      disabled: ctx.getDisabled(),
      required,
    })}

    {#if validating}
      <div class="cd-form-field__validating" aria-live="polite">
        <span class="cd-form-field__spinner" aria-hidden="true"></span>
        <span>{validatingText}</span>
      </div>
    {/if}

    {#if showError}
      <div id={errorId} role="alert" class="cd-form-field__error">
        {#if showValidateIcon}
          <IconAlertCircle class="cd-form-field__status-icon" size="small" aria-hidden="true" />
        {/if}
        <span>{error}</span>
      </div>
    {:else if showWarning}
      <div id={warningId} class="cd-form-field__warning">
        {#if showValidateIcon}
          <IconAlertTriangle class="cd-form-field__status-icon" size="small" aria-hidden="true" />
        {/if}
        <span>{warning}</span>
      </div>
    {:else if showExtra}
      <div id={extraId} class="cd-form-field__extra" class:cd-form-field__extra--middle={extraTextPosition === 'middle'} class:cd-form-field__extra--bottom={extraTextPosition === 'bottom'}>{extraText}</div>
    {/if}
  </div>
</div>
{/if}

<style>
  .cd-form-field {
    display: flex;
    gap: var(--cd-form-label-gap);
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
    gap: var(--cd-spacing-extra-tight);
    color: var(--cd-form-label-color);
  }
  /* labelAlign (§4 L60): justify the label's inline content within its box */
  .cd-form-field__label--align-left {
    justify-content: flex-start;
  }
  .cd-form-field__label--align-right {
    justify-content: flex-end;
  }
  .cd-form-field--label-left .cd-form-field__label {
    padding-block-start: var(--cd-spacing-extra-tight);
  }
  .cd-form-field__required {
    color: var(--cd-form-required-color);
  }
  .cd-form-field__control {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: var(--cd-spacing-extra-tight);
    min-inline-size: 0;
  }
  /* inset floating label */
  .cd-form-field--label-inset {
    flex-direction: column;
  }
  .cd-form-field--label-inset .cd-form-field__control {
    position: relative;
    padding-block-start: var(--cd-spacing-base-tight);
  }
  .cd-form-field__inset-label {
    position: absolute;
    inset-block-start: 50%;
    inset-inline-start: var(--cd-input-padding-x, var(--cd-spacing-base-tight));
    transform: translateY(-50%);
    display: inline-flex;
    align-items: center;
    gap: var(--cd-spacing-extra-tight);
    color: var(--cd-input-color-placeholder);
    pointer-events: none;
    transition:
      transform var(--cd-motion-duration-fast) var(--cd-motion-ease-standard),
      font-size var(--cd-motion-duration-fast) var(--cd-motion-ease-standard),
      color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-form-field--floated .cd-form-field__inset-label {
    transform: translateY(calc(-50% - 0.85rem)) scale(0.85);
    color: var(--cd-form-label-color);
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-form-field__inset-label {
      transition: none;
    }
  }
  .cd-form-field__error {
    display: inline-flex;
    align-items: center;
    gap: var(--cd-spacing-extra-tight);
    color: var(--cd-form-error-color);
    font-size: var(--cd-form-error-font-size);
  }
  .cd-form-field__warning {
    display: inline-flex;
    align-items: center;
    gap: var(--cd-spacing-extra-tight);
    color: var(--cd-form-warning-color);
    font-size: var(--cd-form-error-font-size);
  }
  .cd-form-field__status-icon {
    flex: 0 0 auto;
  }
  .cd-form-field__extra {
    color: var(--cd-form-extra-color);
    font-size: var(--cd-form-error-font-size);
  }
  .cd-form-field__extra--middle {
    order: -1;
  }
  .cd-form-field__extra--bottom {
    order: 0;
  }
  /* async-validation indicator (red line #3: pure-CSS spin, no JS geometry) */
  .cd-form-field__validating {
    display: inline-flex;
    align-items: center;
    gap: var(--cd-spacing-extra-tight);
    color: var(--cd-form-extra-color);
    font-size: var(--cd-form-error-font-size);
  }
  .cd-form-field__spinner {
    inline-size: 0.85em;
    block-size: 0.85em;
    border: 2px solid var(--cd-form-spinner-track-color);
    border-block-start-color: var(--cd-form-spinner-active-color);
    border-radius: 50%;
    animation: cd-form-field-spin 0.7s linear infinite;
  }
  @keyframes cd-form-field-spin {
    to {
      transform: rotate(360deg);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-form-field__spinner {
      animation-duration: 1.8s;
    }
  }
</style>
