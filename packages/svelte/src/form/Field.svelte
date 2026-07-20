<!--
  Field — see specs/components/input/Form.spec.md
  Single-field wrapper: label + required mark + error/extra text + a11y wiring.
  Pulls field slices from the shared form context (read-only during render).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useId, pathGet, type Rule, type ValidateTrigger } from '@chenzy-design/core';
  import { IconAlertCircle, IconAlertTriangle } from '@chenzy-design/icons';
  import { getFormContext, type FormLabelPosition, type FormLabelAlign } from './context.js';
  import { getFormInputGroupContext } from './input-group-context.js';
  import { useLocale } from '../locale-provider/index.js';
  import FormLabel from './FormLabel.svelte';

  /** Label 对象形态（对齐 Semi LabelProps 子集）。 */
  interface FieldLabelProps {
    text?: string;
    align?: FormLabelAlign;
    width?: number | string;
    required?: boolean;
    /** 标签后补充内容：字符串或 Snippet（对齐 Semi extra: ReactNode，可放 Tooltip/图标）。 */
    extra?: string | Snippet;
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
    /**
     * aria-describedby 目标：helpText/extraText 的 id 组合（对齐 Semi，不含 error）。
     * error 由 errorMessageId + aria-invalid 承载。
     */
    describedBy: string | undefined;
    /** error 态时 error-message 容器 id，供控件置 aria-errormessage + aria-invalid（对齐 Semi）。 */
    errorMessageId: string | undefined;
    /** label 元素 id，供控件置 aria-labelledby（对齐 Semi withField）；noLabel/无 label 时为空。 */
    labelledById: string | undefined;
    disabled: boolean;
    /**
     * whether this field is required (spec §138). Controls should expose it as
     * `aria-required="true"` so the required semantic reaches screen readers —
     * the visible star is `aria-hidden` and thus inaudible on its own.
     */
    required: boolean;
    /**
     * inset label：labelPosition==='inset' 且有 label 时携带 label 文本，控件应把它
     * 作为内嵌前缀（insetLabel prop）渲染在控件内部左侧（对齐 Semi withField）。
     * 非 inset 时为 undefined。
     */
    insetLabel: string | undefined;
    /** inset label 容器 id，供控件把它接入 aria（对齐 Semi insetLabelId）。 */
    insetLabelId: string | undefined;
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

  // FormInputGroup 内的 Field 自动进入 group 模式（对齐 Semi cloneElement isInInputGroup）：
  // Label/ErrorMessage 上提到 group 级统一渲染，Field 只把值/错误接管数据流。
  const groupCtx = getFormInputGroupContext();
  const inGroup = $derived(isInInputGroup || groupCtx !== undefined);
  // 注册本字段名到 group，供 GroupError 聚合组内所有字段错误（卸载时取消注册）。
  $effect(() => groupCtx?.register(field));

  const loc = useLocale();

  const id = useId('cd-field');
  const errorId = `${id}-error`;
  const warningId = `${id}-warning`;
  const extraId = `${id}-extra`;
  const helpTextId = `${id}-help`;
  const labelId = `${id}-label`;

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
  // `value` is read by nested path (`users[0].name`), aligned with the core's
  // nested value tree; errors/warnings/touched stay keyed by the field-name string.
  const value = $derived(pathGet(getFormState().values, field));
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
  // extraText 常显（对齐 Semi：与 error/helpText 并存，位于其后），不受 error/warning 影响。
  const showExtra = $derived(extraText !== undefined && extraText !== '');
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

  // aria-describedby：对齐 Semi withField —— 指向 helpText 和/或 extraText 的组合
  // （不含 error；error 走 aria-errormessage）。noStyle/pure/inGroup 不渲染这些块，故为空。
  const describedBy = $derived.by(() => {
    if (noStyle || pure || inGroup || noErrorMessage) return undefined;
    const ids: string[] = [];
    if (showHelpText) ids.push(helpTextId);
    if (showExtra) ids.push(extraId);
    return ids.length ? ids.join(' ') : undefined;
  });
  // aria-errormessage：对齐 Semi —— error 态时指向 error-message 容器（控件同时置 aria-invalid）。
  const errorMessageId = $derived(
    !noStyle && !pure && !inGroup && !noErrorMessage && showError ? errorId : undefined,
  );
  // aria-labelledby：对齐 Semi withField —— 有 label（含 inset，其 id 由控件 insetLabelId 承载）时
  // 指向 label 元素 id。noLabel / 无 label 时为空（控件退回 ariaLabel 或自身无障碍名）。
  // noStyle / pure / inGroup 分支不渲染独立 label（label 上提到 group 级或完全省略），
  // 此时不能指向不存在的 label id（否则 aria-labelledby 悬空 → 无可访问名），回退控件自身 ariaLabel。
  const labelledById = $derived(
    hasLabel && !noLabel && !noStyle && !pure && !inGroup ? labelId : undefined,
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
  // label 宽度只在 left 模式生效（对齐 Semi mergeLabelWidth，传给 FormLabel width）。
  const effLabelWidth = $derived(labelPosition === 'left' ? labelWidth : undefined);

  // inset：对齐 Semi withField —— label 作为控件的 insetLabel prefix 注入控件内部左侧，
  // Field 不渲染独立 label（无 floating 动画）。label 文本经 children 契约传给控件。
  const isInset = $derived(labelPosition === 'inset');
  // 有 label 且未被 noLabel 抑制时，inset 模式把 label 文本 / id 暴露给控件。
  const insetLabel = $derived(isInset && hasLabel && !noLabel ? labelText : undefined);

  // field class 严格对齐 Semi withField（`cd-form-field` + 可选 `cd-form-field-{name}` + fieldClassName）；
  // 状态与 label 位置不进 class，分别由 error-message 容器 / x-label-pos 属性驱动。
  const cls = $derived(
    [
      'cd-form-field',
      name ? `cd-form-field-${name}` : undefined,
      fieldClassName,
    ]
      .filter(Boolean)
      .join(' '),
  );

  // x-label-pos / x-field-id / x-extra-pos 镜像 Semi 供样式与外部 DOM 定位；经 attrs 对象展开，
  // 让 svelte-check 接受非标准属性名。
  const fieldDomAttrs = $derived({
    'x-label-pos': labelPosition,
    'x-field-id': field,
    'x-extra-pos': extraTextPosition,
  });

  // `span` (spec §4.2 L86): occupy N columns of a grid parent (e.g. Form.Section).
  // Pure inline `grid-column` — inert when the parent isn't a grid. fieldStyle
  // (Semi) is merged after so callers can extend the wrapper style.
  const wrapStyle = $derived(
    [span !== undefined ? `grid-column:span ${span}` : undefined, fieldStyle]
      .filter(Boolean)
      .join(';') || undefined,
  );
</script>

{#if noStyle || pure || inGroup}
  <!--
    noStyle (spec §4.2 L85 / §190) / pure / inGroup: register & collect
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
    errorMessageId,
    labelledById,
    disabled: ctx.getDisabled(),
    required,
    insetLabel,
    insetLabelId: insetLabel !== undefined ? labelId : undefined,
  })}
{:else}
<!--
  DOM 严格对齐 Semi withField：wrapper 用 x-label-pos/x-field-id/x-extra-pos 属性驱动，
  label 在 main 外（非 inset 非 noLabel 时经 FormLabel 渲染，inset 走控件 insetLabel），
  控件本体 + error-message + extra 包在 cd-form-field-main 内。data-field 保留供 scrollToError。
-->
<div
  class={cls}
  data-field={field}
  {...fieldDomAttrs}
  style={wrapStyle}
>
  {#if hasLabel && !noLabel && !isInset}
    <FormLabel
      text={labelText}
      id={labelId}
      htmlFor={forId}
      align={labelAlign}
      required={showRequiredMark}
      optional={!labelRequired && labelOptional}
      {...effLabelWidth !== undefined ? { width: effLabelWidth } : {}}
      {...labelExtra !== undefined ? { extra: labelExtra } : {}}
    />
  {/if}

  <div class="cd-form-field-main">
    <!-- extraText middle：位于控件之前（对齐 Semi extraPos==='middle'）。 -->
    {#if !noErrorMessage && showExtra && extraTextPosition === 'middle'}
      <div id={extraId} class="cd-form-field-extra cd-form-field-extra-string cd-form-field-extra-middle">{extraText}</div>
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
      errorMessageId,
      labelledById,
      disabled: ctx.getDisabled(),
      required,
      insetLabel,
      insetLabelId: insetLabel !== undefined ? labelId : undefined,
    })}

    {#if validating}
      <div class="cd-form-field-validating" aria-live="polite">
        <span class="cd-form-field-spinner" aria-hidden="true"></span>
        <span>{validatingText}</span>
      </div>
    {/if}

    <!--
      error-message 块（对齐 Semi ErrorMessage）：error 与 warning 共用同一容器
      .cd-form-field-error-message（图标靠 validateStatus 区分：error→IconAlertCircle，
      warning→IconAlertTriangle）；helpText 用 .cd-form-field-help-text。noErrorMessage 时全省略。
    -->
    {#if !noErrorMessage && showError}
      <div id={errorId} role="alert" class="cd-form-field-error-message">
        {#if showValidateIcon}
          <IconAlertCircle class="cd-form-field-validate-status-icon" size="small" aria-hidden="true" />
        {/if}
        <span>{error}</span>
      </div>
    {:else if !noErrorMessage && showWarning}
      <div id={warningId} role="alert" class="cd-form-field-error-message cd-form-field-error-message-warning">
        {#if showValidateIcon}
          <IconAlertTriangle class="cd-form-field-validate-status-icon" size="small" aria-hidden="true" />
        {/if}
        <span>{warning}</span>
      </div>
    {:else if !noErrorMessage && showHelpText}
      <div id={helpTextId} class="cd-form-field-help-text">{helpText}</div>
    {/if}

    <!-- extraText bottom：位于 error/help 之后（对齐 Semi extraPos==='bottom'，默认）。 -->
    {#if !noErrorMessage && showExtra && extraTextPosition === 'bottom'}
      <div id={extraId} class="cd-form-field-extra cd-form-field-extra-string cd-form-field-extra-bottom">{extraText}</div>
    {/if}
  </div>
</div>
{/if}

<style>
  /*
    DOM/间距严格镜像 Semi form.scss。用 :global 保证 Field 自身及 InputGroup/Slot 复用同一套
    cd-form-field-* 规则。间距模型对齐 Semi：field 上下 padding 在 Form 层（.cd-form-vertical
    .cd-form-field）注入，Field 自身只保证 box-sizing + label 位置布局。
  */
  :global(.cd-form-field) {
    box-sizing: border-box;
  }
  /* 主体容器：控件 + error-message + extra 的列（对齐 Semi .semi-form-field-main width:100%）。 */
  :global(.cd-form-field-main) {
    width: 100%;
  }

  /* label 位置：top（label 块级在上）/ left（label 与 main 横排）/ inset（label 内嵌，无独立 label）。 */
  :global(.cd-form-field[x-label-pos='top']) {
    display: block;
  }
  :global(.cd-form-field[x-label-pos='top'] .cd-form-field-label) {
    display: block;
  }
  /* with-extra 时 label 恢复 flex 让 extra（Tooltip/图标）与文字同行（对齐 Semi）。 */
  :global(.cd-form-field[x-label-pos='top'] .cd-form-field-label-with-extra),
  :global(.cd-form-field[x-label-pos='left'] .cd-form-field-label-with-extra) {
    display: flex;
    align-items: center;
  }
  :global(.cd-form-field[x-label-pos='left']) {
    display: flex;
  }
  :global(.cd-form-field[x-label-pos='left'] .cd-form-field-label) {
    margin-block-end: var(--cd-spacing-form-label-posleft-marginbottom);
    margin-inline-end: var(--cd-spacing-form-label-posleft-marginright);
    /* padding-top 使 label 与控件首行文本水平对齐（Semi 精算 token）。 */
    padding-block-start: var(--cd-spacing-form-label-paddingtop);
    padding-block-end: var(--cd-spacing-form-label-paddingtop);
  }
  :global(.cd-form-field[x-label-pos='inset']) {
    display: block;
  }

  /* error-message / help-text：flex + 顶部外边距（对齐 Semi $spacing-form_message-marginTop）。 */
  :global(.cd-form-field-error-message),
  :global(.cd-form-field-help-text) {
    display: flex;
    align-items: center;
    margin-block-start: var(--cd-spacing-form-message-margintop);
    font-size: var(--cd-font-size-regular);
  }
  :global(.cd-form-field-error-message) {
    color: var(--cd-color-form-message-error-text-default);
  }
  :global(.cd-form-field-help-text) {
    color: var(--cd-color-form-label-extra-text-default);
  }
  /* warning：容器同 error-message，图标着警告色（对齐 Semi .semi-icon-alert_triangle 着色）。 */
  :global(.cd-form-field-error-message-warning) {
    color: var(--cd-color-form-label-extra-text-default);
  }
  :global(.cd-form-field-error-message-warning .cd-form-field-validate-status-icon) {
    color: var(--cd-color-form-alerticon-icon-default);
  }
  /* 状态图标：右外边距 + 顶部微调（对齐 Semi .semi-form-field-validate-status-icon）。 */
  :global(.cd-form-field-validate-status-icon) {
    margin-inline-end: var(--cd-spacing-form-statusicon-marginright);
    flex-shrink: 0;
    align-self: flex-start;
    position: relative;
    top: 2px;
  }

  /* extraText：常显提示（对齐 Semi .semi-form-field-extra）。 */
  :global(.cd-form-field-extra) {
    color: var(--cd-color-form-label-extra-text-default);
  }
  :global(.cd-form-field-extra-string) {
    font-size: var(--cd-font-size-regular);
  }
  :global(.cd-form-field[x-extra-pos='middle'] .cd-form-field-extra) {
    margin-block-start: var(--cd-spacing-form-extra-posmid-margintop);
    margin-block-end: var(--cd-spacing-form-extra-posmid-marginbottom);
  }
  :global(.cd-form-field[x-extra-pos='bottom'] .cd-form-field-extra) {
    margin-block-start: var(--cd-spacing-form-extra-posbottom-margintop);
  }

  /* 异步校验指示器（本库超集，Semi 无；纯 CSS spin，无 JS 几何）。 */
  :global(.cd-form-field-validating) {
    display: inline-flex;
    align-items: center;
    gap: var(--cd-spacing-extra-tight);
    margin-block-start: var(--cd-spacing-form-message-margintop);
    color: var(--cd-color-form-label-extra-text-default);
    font-size: var(--cd-font-size-regular);
  }
  :global(.cd-form-field-spinner) {
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
    :global(.cd-form-field-spinner) {
      animation-duration: 1.8s;
    }
  }
</style>
