<!--
  Field — see specs/components/input/Form.spec.md
  Single-field wrapper: label + required mark + error/extra text + a11y wiring.
  Pulls field slices from the shared form context (read-only during render).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useId, type Rule, type ValidateTrigger } from '@chenzy-design/core';
  import { IconAlertCircle, IconAlertTriangle } from '@chenzy-design/icons';
  import { getFormContext, type FormLabelPosition, type FormLabelAlign } from './context.js';
  import { useLocale } from '../locale-provider/index.js';

  /** Label 对象形态（对齐 Semi LabelProps 子集）。 */
  interface FieldLabelProps {
    text?: string;
    align?: FormLabelAlign;
    width?: number | string;
    required?: boolean;
    extra?: string;
    optional?: boolean;
  }

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
    /** 标签：字符串，或对象形态（{text, align, width, ...}，对齐 Semi LabelProps）。 */
    label?: string | FieldLabelProps;
    /** field 级 label 位置覆盖（不传继承 Form context）。 */
    labelPosition?: FormLabelPosition;
    /** field 级 label 对齐覆盖（不传继承 Form context）。 */
    labelAlign?: FormLabelAlign;
    /** field 级 label 宽度覆盖（left 模式，不传继承 Form context）。 */
    labelWidth?: number | string;
    /**
     * 只去掉 Label，保留 error/wrapper（对齐 Semi noLabel；批D FormInputGroup 依赖）。
     */
    noLabel?: boolean;
    /**
     * 只去掉错误/校验信息块（对齐 Semi noErrorMessage；批D FormInputGroup 依赖）。
     */
    noErrorMessage?: boolean;
    /** label 的 htmlFor 目标（默认用自动生成 id；对齐 Semi name）。 */
    name?: string;
    /** field wrapper 的 class 透传（对齐 Semi fieldClassName）。 */
    fieldClassName?: string;
    /** field wrapper 的内联样式透传（对齐 Semi fieldStyle）。 */
    fieldStyle?: string;
    /** 提示文案：与 error 同块展示（有 error 时 error 优先，对齐 Semi helpText）。 */
    helpText?: string;
    /** field 级 extraText 位置覆盖（不传继承 Form context）。 */
    extraTextPosition?: 'middle' | 'bottom';
    /**
     * 只接管数据流，不插入 Label/ErrorMessage/extra，DOM 与原控件一致
     * （对齐 Semi pure；区别于 noStyle 仍渲染 wrapper）。
     */
    pure?: boolean;
    /**
     * group 内字段模式：不在 Field 内插 Label/ErrorMessage，交由 Group 级统一渲染
     * （对齐 Semi isInInputGroup；批D FormInputGroup 依赖）。
     */
    isInInputGroup?: boolean;
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
    labelPosition: labelPositionProp,
    labelAlign: labelAlignProp,
    labelWidth: labelWidthProp,
    noLabel = false,
    noErrorMessage = false,
    name,
    fieldClassName,
    fieldStyle,
    helpText,
    extraTextPosition: extraTextPositionProp,
    pure = false,
    isInInputGroup = false,
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

  // label 可为对象形态；归一化出文本与覆盖项（对齐 Semi）。
  const labelObj = $derived(
    typeof label === 'object' && label !== null ? (label as FieldLabelProps) : undefined,
  );
  const labelText = $derived(
    typeof label === 'string' ? label : labelObj?.text,
  );
  const hasLabel = $derived(labelText !== undefined);
  // label 对象可覆盖 required / optional / extra（对齐 Semi label 对象展开）。
  const labelRequired = $derived(labelObj?.required ?? required);
  const labelExtra = $derived(labelObj?.extra);
  const labelOptional = $derived(labelObj?.optional ?? false);

  const ctx = getFormContext();
  if (!ctx) throw new Error('<Form.Field> must be used inside <Form>');
  const { form, getFormState } = ctx;

  const loc = useLocale();

  const id = useId('cd-field');
  const errorId = `${id}-error`;
  const warningId = `${id}-warning`;
  const extraId = `${id}-extra`;
  const helpTextId = `${id}-help`;

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
    if (labelText !== undefined) config.label = labelText;
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

  const showRequiredMark = $derived(ctx.getRequiredMark() && labelRequired);
  const showExtra = $derived(
    !showError && !showWarning && extraText !== undefined && extraText !== '',
  );
  // helpText: 与 error 同块，无 error/warning 时展示（对齐 Semi helpText）。
  const showHelpText = $derived(
    !showError && !showWarning && helpText !== undefined && helpText !== '',
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
    // noStyle / pure / isInInputGroup render no status/extra elements here, so
    // there is nothing to point at (Group renders them at group level).
    noStyle || pure || isInInputGroup
      ? undefined
      : // noErrorMessage suppresses the error/warning block: don't point at it
        !noErrorMessage && showError
        ? errorId
        : !noErrorMessage && showWarning
          ? warningId
          : showHelpText
            ? helpTextId
            : showExtra
              ? extraId
              : undefined,
  );

  // field 级覆盖优先于 context（Semi mergeLabelPos = labelPosition || formProps.labelPosition）；
  // label 对象形态的 align/width 再优先于 field prop（对齐 Semi label 对象展开覆盖）。
  const labelWidth = $derived(labelObj?.width ?? labelWidthProp ?? ctx.getLabelWidth());
  const labelPosition = $derived(labelPositionProp ?? ctx.getLabelPosition());
  const labelAlign = $derived(labelObj?.align ?? labelAlignProp ?? ctx.getLabelAlign());
  const showValidateIcon = $derived(ctx.getShowValidateIcon());
  const extraTextPosition = $derived(
    extraTextPositionProp ?? ctx.getExtraTextPosition?.() ?? 'bottom',
  );
  // htmlFor 目标 name 优先于自动 id（对齐 Semi name）。
  const forId = $derived(name ?? id);
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
      fieldClassName,
    ]
      .filter(Boolean)
      .join(' '),
  );

  // `span` (spec §4.2 L86): occupy N columns of a grid parent (e.g. Form.Section).
  // Pure inline `grid-column` — inert when the parent isn't a grid. fieldStyle
  // (Semi) is merged after so callers can extend the wrapper style.
  const wrapStyle = $derived(
    [span !== undefined ? `grid-column:span ${span}` : undefined, fieldStyle]
      .filter(Boolean)
      .join(';') || undefined,
  );
</script>

{#if noStyle || pure || isInInputGroup}
  <!--
    noStyle (spec §4.2 L85 / §190) / pure / isInInputGroup: register & collect
    only, render no layout chrome. The control snippet is still rendered so it can
    bind to the field; label / status text / wrapper DOM are skipped. For
    isInInputGroup the Group renders Label/ErrorMessage at group level.
    `validateStatus`/error still flow into `status` so a custom control can style
    itself.
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
  {#if hasLabel && !noLabel && !isInset}
    <label
      class="cd-form-field__label cd-form-field__label--align-{labelAlign}"
      for={forId}
      style={labelStyle}
    >
      {#if showRequiredMark}<span aria-hidden="true" class="cd-form-field__required">*</span>{/if}
      <span class="cd-form-field__label-text">{labelText}{ctx.getColon() ? '：' : ''}{#if !labelRequired && labelOptional}<span class="cd-form-field__label-optional">{loc().t('Form.optional')}</span>{/if}</span>
      {#if labelExtra !== undefined}<span class="cd-form-field__label-extra">{labelExtra}</span>{/if}
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
    {#if hasLabel && !noLabel && isInset}
      <label class="cd-form-field__inset-label" for={forId}>
        {#if showRequiredMark}<span aria-hidden="true" class="cd-form-field__required">*</span>{/if}
        <span class="cd-form-field__label-text">{labelText}</span>
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

    <!-- error / warning / helpText belong to the ErrorMessage block; noErrorMessage removes them all (Semi) -->
    {#if !noErrorMessage && showError}
      <div id={errorId} role="alert" class="cd-form-field__error">
        {#if showValidateIcon}
          <IconAlertCircle class="cd-form-field__status-icon" size="small" aria-hidden="true" />
        {/if}
        <span>{error}</span>
      </div>
    {:else if !noErrorMessage && showWarning}
      <div id={warningId} class="cd-form-field__warning">
        {#if showValidateIcon}
          <IconAlertTriangle class="cd-form-field__status-icon" size="small" aria-hidden="true" />
        {/if}
        <span>{warning}</span>
      </div>
    {:else if !noErrorMessage && showHelpText}
      <div id={helpTextId} class="cd-form-field__help-text">{helpText}</div>
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
  .cd-form-field__help-text {
    color: var(--cd-form-extra-color);
    font-size: var(--cd-form-error-font-size);
  }
  .cd-form-field__label-optional {
    margin-inline-start: var(--cd-spacing-extra-tight);
    color: var(--cd-form-optional-color);
    font-size: var(--cd-form-error-font-size);
  }
  .cd-form-field__label-extra {
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
