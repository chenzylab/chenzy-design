<!--
  Form — see specs/components/input/Form.spec.md
  Container that bridges the headless `createForm` (callback-subscribe) into Svelte
  runes and shares it via context. Token-driven, a11y-correct.
-->
<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import {
    createForm,
    type FormApi,
    type FormValues,
    type FieldErrors,
    type MessageDescriptor,
    type ValidateTrigger,
  } from '@chenzy-design/core';
  import { interpolate } from '@chenzy-design/locale';
  import {
    setFormContext,
    type FormLayout,
    type FormLabelPosition,
    type FormSize,
    type FormLabelAlign,
    type GridCol,
  } from './context.js';
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
    /** Label 文本对齐（spec §4 L60，默认 'left'）。 */
    labelAlign?: FormLabelAlign;
    size?: FormSize;
    disabled?: boolean;
    requiredMark?: boolean;
    colon?: boolean;
    /** on failed submit, scroll to and focus the first errored field */
    scrollToError?: boolean;
    /** 全局默认校验时机（spec §4 L65，默认 ['blur','change']），字段可覆盖。 */
    validateTrigger?: ValidateTrigger | ValidateTrigger[];
    /** 错误/警告文案是否带状态图标（spec §4 L66，默认 true）。 */
    showValidateIcon?: boolean;
    /** 字段命中首条错误即停止该字段后续 rule（spec §4 L68，默认 false）。 */
    stopValidateWithError?: boolean;
    /** 是否拦截原生 submit 默认行为（spec §4 L69，默认 true）。 */
    preventDefault?: boolean;
    /** 提交时是否阻止 submit 事件冒泡（stopPropagation，默认 false）。 */
    stopPropagation?: boolean;
    /** 收集值时是否保留空值字段键（spec §4 L70，默认 false）。 */
    allowEmpty?: boolean;
    /** scrollToError 别名（优先级低于 scrollToError）。 */
    autoScrollToError?: boolean;
    /** 额外说明文本位置（默认 'bottom'，经 context 传给 FormField）。 */
    extraTextPosition?: 'middle' | 'bottom';
    /**
     * Form 挂载后一次性回调，回传内部 headless FormApi 句柄（Semi getFormApi，
     * props-gap-tracker §1 Form 高）。这是「渲染 <Form> 的父组件」唯一的命令式逃生舱：
     * FormApi 经 context 只下发给后代 Field，父级够不到；拿到句柄后可在外部
     * setFieldsValue / validate / validateField / resetFields。
     * 注：Semi 的 `validateFields` 是 Form 级自定义校验器（validator 旧别名），
     * 并非独立的外部触发校验入口——外部触发校验由本回调回传的 formApi.validate()
     * / formApi.validateField() 直接覆盖，故不单列 prop。
     */
    getFormApi?: (formApi: FormApi) => void;
    onSubmit?: (r: { valid: boolean; values: FormValues; errors: FieldErrors }) => void;
    /** 任意字段值变化时触发（不同于 onChange 的纯值快照，此回调额外携带变更字段信息）。 */
    onValueChange?: (values: FormValues, changedValues: Record<string, unknown>) => void;
    /** 表单校验失败时独立回调（onSubmit 只在 valid 时调用时可用此做失败分支）。 */
    onSubmitFail?: (errors: FieldErrors, values: FormValues) => void;
    onChange?: (values: FormValues) => void;
    /** 表单重置时回调（点击原生 reset 或 formApi.resetFields()）（Semi onReset，spec §4 Events reset）。 */
    onReset?: () => void;
    /** 任意字段错误集合变化时回调，入参为最新 formState.errors（Semi onErrorChange，props-gap-tracker §1 Form 中）。 */
    onErrorChange?: (errors: FieldErrors) => void;
    /** 控件布局列配置（Grid 布局时）。 */
    wrapperCol?: GridCol;
    /** 标签布局列配置（Grid 布局时）。 */
    labelCol?: GridCol;
    children?: Snippet;
    footer?: Snippet<[{ submitting: boolean }]>;
  }

  let {
    value,
    initValues = {},
    layout = 'vertical',
    labelPosition = 'top',
    labelWidth,
    labelAlign = 'left',
    size = 'default',
    disabled = false,
    requiredMark = true,
    colon = false,
    scrollToError = false,
    autoScrollToError = false,
    extraTextPosition = 'bottom',
    validateTrigger = ['blur', 'change'],
    showValidateIcon = true,
    stopValidateWithError = false,
    preventDefault = true,
    stopPropagation = false,
    allowEmpty = false,
    getFormApi,
    onSubmit,
    onValueChange,
    onSubmitFail,
    onChange,
    onReset,
    onErrorChange,
    wrapperCol,
    labelCol,
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
  // validateTrigger / stopValidateWithError / allowEmpty are construction-time
  // config of the headless form (read once, like initialValues). untrack keeps
  // the read non-reactive — the form instance is created exactly once.
  const form = createForm({
    initialValues: seedValues,
    resolveMessage,
    validateTrigger: untrack(() => validateTrigger),
    stopValidateWithError: untrack(() => stopValidateWithError),
    allowEmpty: untrack(() => allowEmpty),
  });

  // Bridge: callback-subscribe → runes. core returns a STABLE state object whose
  // sub-objects are replaced immutably; we take a fresh shallow snapshot on every
  // emit so the new reference triggers Svelte reactivity. The $effect ONLY writes
  // formState — it never reads state that children write on mount, so no loop.
  let formState = $state({ ...form.getState() });
  let lastValues = form.getState().values;
  // track the errors reference to fire onErrorChange only when the error set
  // actually changes (same immutable-replacement pattern as lastValues).
  let lastErrors = form.getState().errors;
  // Subscribe synchronously at component init (NOT inside an $effect): child
  // Field registration effects run after the parent's setup but emit on the core
  // bus; subscribing here guarantees we capture those early emits (e.g. a
  // field-level `initValue` seeding the value). The subscriber only WRITES
  // `formState` from the stable core state — it never reads child-written render
  // state, so there is no effect loop. Cleanup unsubscribes on destroy.
  const unsub = form.subscribe((s) => {
    formState = { ...s };
    if (s.values !== lastValues) {
      const prev = lastValues;
      lastValues = s.values;
      onChange?.(s.values);
      if (onValueChange) {
        // Compute changedValues: fields whose reference differs from previous snapshot.
        const changed: Record<string, unknown> = {};
        for (const k of Object.keys(s.values)) {
          if (s.values[k] !== prev[k]) changed[k] = s.values[k];
        }
        onValueChange(s.values, changed);
      }
    }
    // errors is replaced immutably by core on every validate; a changed
    // reference means the error set changed → notify (Semi onErrorChange).
    if (s.errors !== lastErrors) {
      lastErrors = s.errors;
      onErrorChange?.(s.errors);
    }
  });
  $effect(() => unsub);

  // getFormApi (Semi): hand the internal headless FormApi to the parent exactly
  // once, at mount. `form` is created synchronously above and never re-created,
  // so this is a one-shot escape hatch — not reactive. untrack keeps the read
  // non-reactive and guarantees the callback runs a single time even though it
  // lives in an $effect (the runes equivalent of onMount). We invoke `form`
  // methods only; we never write child-owned render state here → no effect loop.
  $effect(() => {
    untrack(() => getFormApi?.(form));
  });

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
    getLabelAlign: () => labelAlign,
    getSize: () => size,
    getDisabled: () => disabled,
    getRequiredMark: () => requiredMark,
    getColon: () => colon,
    getShowValidateIcon: () => showValidateIcon,
    getExtraTextPosition: () => extraTextPosition,
    getWrapperCol: () => wrapperCol,
    getLabelCol: () => labelCol,
  });

  // autoScrollToError 是 scrollToError 别名（scrollToError 优先）
  const effScrollToError = $derived(scrollToError || autoScrollToError || false);

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

  // Native <form> reset (a `<button type="reset">` or form.reset()). Red line #3:
  // this DOM-driven side effect lives in the event handler, never in render. We
  // reset the headless state then notify (Semi onReset / spec §4 Events reset).
  function handleReset() {
    form.resetFields();
    onReset?.();
  }

  async function handleSubmit(e: SubmitEvent) {
    // spec §4 L69 / §6 L140: preventDefault is now prop-controlled (default true
    // = previous hardcoded behavior, backward compatible).
    if (preventDefault) e.preventDefault();
    // stopPropagation：阻止 submit 事件向上冒泡（默认 false，向后兼容）。
    if (stopPropagation) e.stopPropagation();
    const r = await form.submit();
    if (!r.valid && effScrollToError) focusFirstError(r.errors);
    if (!r.valid) onSubmitFail?.(r.errors, r.values);
    onSubmit?.(r);
  }

  const cls = $derived(
    `cd-form cd-form--${layout} cd-form--label-${labelPosition} cd-form--${size}`,
  );
</script>

<form bind:this={formEl} class={cls} onsubmit={handleSubmit} onreset={handleReset}>
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
    gap: var(--cd-form-item-gap);
  }
  .cd-form__footer {
    display: flex;
    gap: var(--cd-spacing-base-tight);
  }
</style>
