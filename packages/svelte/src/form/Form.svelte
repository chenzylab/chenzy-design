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
    type FormState,
    type FormValues,
    type FieldErrors,
    type MessageDescriptor,
    type ValidateTrigger,
  } from '@chenzy-design/core';
  import {
    setFormContext,
    type FormLayout,
    type FormLabelPosition,
    type FormLabelAlign,
    type GridCol,
  } from './context.js';
  import { useLocale } from '../locale-provider/index.js';

  /** children-as-function 入参（对齐 Semi FormFCChild：拿到 formState/formApi）。 */
  interface FormRenderArgs {
    formState: FormState;
    formApi: FormApi;
  }

  /** scrollToField/scrollToError 增补方法（DOM 层，注入到 getFormApi 回传的句柄）。 */
  type ScrollToOptions = boolean | ScrollIntoViewOptions;
  interface FormApiWithScroll extends FormApi {
    /** 滚动到指定字段（对齐 Semi scrollToField）。 */
    scrollToField(field: string, opts?: ScrollIntoViewOptions): void;
    /** 滚动到首个错误字段（对齐 Semi scrollToError）。 */
    scrollToError(opts?: ScrollIntoViewOptions): void;
  }

  interface Props {
    /**
     * 外部预建的 FormApi（对齐 Semi `Form.useForm()` + `<Form form={api}>`）。传入时用它作为
     * headless 实例，父组件可在渲染 <Form> 前 `const form = createForm(...)` 并立即操作
     * （Svelte 无需 React 的 Proxy 延迟绑定）。不传则内部 createForm（getFormApi 回调仍可拿句柄）。
     * 注意：外部 form 的 initialValues/validateTrigger 等构造项由创建方决定，Form 上对应 prop
     * （initValues/validateTrigger/...）在传入 form 时不再重复应用（避免双写）。
     */
    form?: FormApi;
    /** controlled whole-form values (reported back via onChange, never written to the prop) */
    value?: FormValues;
    initValues?: FormValues;
    layout?: FormLayout;
    /** form 元素 id（同时写到 x-form-id 供 scrollToError 定位）。 */
    id?: string;
    /** 'top' | 'left' | 'inset'（inset：label 浮入控件，聚焦/有值时上浮变小） */
    labelPosition?: FormLabelPosition;
    labelWidth?: number | string;
    /** Label 文本对齐（spec §4 L60，默认 'left'）。 */
    labelAlign?: FormLabelAlign;
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
    /**
     * 提交/重置时是否阻止事件冒泡（对齐 Semi stopPropagation 对象：{submit?, reset?}）。
     */
    stopPropagation?: { submit?: boolean; reset?: boolean };
    /** 收集值时是否保留空值字段键（spec §4 L70，默认 false）。 */
    allowEmpty?: boolean;
    /**
     * 提交校验失败时滚动到首个错误字段（scrollToError 别名，可为 boolean 或
     * ScrollIntoViewOptions，对齐 Semi autoScrollToError）。
     */
    autoScrollToError?: boolean | ScrollIntoViewOptions;
    /** 额外说明文本位置（默认 'bottom'，经 context 传给 FormField）。 */
    extraTextPosition?: 'middle' | 'bottom';
    /**
     * Form 挂载后一次性回调，回传内部 headless FormApi 句柄（Semi getFormApi，
     * props-gap-tracker §1 Form 高）。这是「渲染 <Form> 的父组件」唯一的命令式逃生舱：
     * FormApi 经 context 只下发给后代 Field，父级够不到；拿到句柄后可在外部
     * setValues / validate / validateField / reset。
     * 注：Semi 的 `validateFields` 是 Form 级自定义校验器（validator 旧别名），
     * 并非独立的外部触发校验入口——外部触发校验由本回调回传的 formApi.validate()
     * / formApi.validateField() 直接覆盖，故不单列 prop。
     */
    getFormApi?: (formApi: FormApiWithScroll) => void;
    onSubmit?: (r: { valid: boolean; values: FormValues; errors: FieldErrors }) => void;
    /** 任意字段值变化时触发（不同于 onChange 的纯值快照，此回调额外携带变更字段信息）。 */
    onValueChange?: (values: FormValues, changedValues: Record<string, unknown>) => void;
    /** 表单校验失败时独立回调（onSubmit 只在 valid 时调用时可用此做失败分支；带原生 submit 事件）。 */
    onSubmitFail?: (errors: FieldErrors, values: FormValues, e: SubmitEvent) => void;
    onChange?: (values: FormValues) => void;
    /** 表单重置时回调（点击原生 reset 或 formApi.reset()）（Semi onReset，spec §4 Events reset）。 */
    onReset?: () => void;
    /** 任意字段错误集合变化时回调，入参为最新 formState.errors + 变更子集（Semi onErrorChange）。 */
    onErrorChange?: (errors: FieldErrors, changedError: FieldErrors) => void;
    /** 控件布局列配置（Grid 布局时）。 */
    wrapperCol?: GridCol;
    /** 标签布局列配置（Grid 布局时）。 */
    labelCol?: GridCol;
    /**
     * 表单内容。可为无参 snippet（普通用法），也可为带参 snippet 拿到
     * { formState, formApi }（对齐 Semi children-as-function / render）。
     */
    children?: Snippet<[FormRenderArgs]> | Snippet;
    footer?: Snippet<[{ submitting: boolean }]>;
    /** 透传到 form 的原生属性（class、style、data-attr、name、action、aria-label 等）。 */
    [key: string]: unknown;
  }

  let {
    form: externalForm,
    value,
    initValues = {},
    layout = 'vertical',
    id,
    labelPosition = 'top',
    labelWidth,
    labelAlign = 'left',
    disabled = false,
    requiredMark = true,
    colon = false,
    scrollToError = false,
    autoScrollToError = false,
    extraTextPosition = 'bottom',
    validateTrigger = ['blur', 'change'],
    showValidateIcon = true,
    stopValidateWithError = false,
    stopPropagation,
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
    ...rest
  }: Props = $props();

  const loc = useLocale();

  // 校验消息优先级（对齐 Semi：ConfigProvider 无全局校验文案覆盖，文案走 locale）：
  // 1) rule.message（descriptor.text）显式覆盖；
  // 2) locale 内置 Form.* 模板。
  function resolveMessage(d: MessageDescriptor): string {
    if (d.text !== undefined) return d.text;
    return loc().t(d.key, d.params);
  }

  // initial values are a one-time snapshot by design; untrack makes the
  // non-reactive seed read explicit (later prop changes flow via the controlled
  // `value` effect / onChange, not by re-seeding the form).
  const seedValues: FormValues = untrack(() => value ?? initValues);
  // validateTrigger / stopValidateWithError / allowEmpty are construction-time
  // config of the headless form (read once, like initialValues). untrack keeps
  // the read non-reactive — the form instance is created exactly once.
  // 外部预建 form（Semi Form.useForm() 对齐）：直接用传入实例，其构造项由创建方决定，
  // 不再用 Form 上的 initValues/validateTrigger/... 重复应用（避免双写）。untrack 让
  // "有无外部 form" 的判定成为一次性读取，form 实例只建一次。
  const form = untrack(() => externalForm) ??
    createForm({
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
  let formState = $state({ ...form.getFormState() });
  let lastValues = form.getFormState().values;
  // track the errors reference to fire onErrorChange only when the error set
  // actually changes (same immutable-replacement pattern as lastValues).
  let lastErrors = form.getFormState().errors;
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
      const prev = lastErrors;
      lastErrors = s.errors;
      if (onErrorChange) {
        // changedError: fields whose error reference differs from previous snapshot.
        const changed: FieldErrors = {};
        for (const k of new Set([...Object.keys(prev), ...Object.keys(s.errors)])) {
          if (s.errors[k] !== prev[k]) changed[k] = s.errors[k];
        }
        onErrorChange(s.errors, changed);
      }
    }
  });
  $effect(() => unsub);

  // getFormApi (Semi): hand the internal headless FormApi (augmented with the
  // DOM-layer scrollToField/scrollToError) to the parent exactly once, at mount.
  // `form` is created synchronously above and never re-created, so this is a
  // one-shot escape hatch — not reactive. untrack keeps the read non-reactive and
  // guarantees the callback runs a single time even though it lives in an $effect
  // (the runes equivalent of onMount). We invoke `form` methods only; we never
  // write child-owned render state here → no effect loop.
  const formApiWithScroll: FormApiWithScroll = Object.assign(
    Object.create(form) as FormApi,
    {
      scrollToField: (field: string, opts?: ScrollIntoViewOptions) =>
        scrollToFieldEl(field, opts),
      scrollToError: (opts?: ScrollIntoViewOptions) =>
        focusFirstError(form.getFormState().errors, opts),
    },
  ) as FormApiWithScroll;
  $effect(() => {
    untrack(() => getFormApi?.(formApiWithScroll));
  });

  // Controlled `value`: push into the form only when the prop reference changes.
  // We never write back to the prop (onChange is the only outward channel), so
  // this cannot form a value -> onChange -> value loop.
  $effect(() => {
    if (value !== undefined) form.setValues(value);
  });

  setFormContext({
    form,
    getFormState: () => formState,
    getLabelPosition: () => labelPosition,
    getLabelWidth: () => labelWidth,
    getLabelAlign: () => labelAlign,
    getDisabled: () => disabled,
    getRequiredMark: () => requiredMark,
    getColon: () => colon,
    getShowValidateIcon: () => showValidateIcon,
    getExtraTextPosition: () => extraTextPosition,
    getWrapperCol: () => wrapperCol,
    getLabelCol: () => labelCol,
  });

  // autoScrollToError 是 scrollToError 别名（scrollToError 优先）。可为 boolean 或
  // ScrollIntoViewOptions（对齐 Semi），object 形态即视为开启并作为滚动参数。
  const effScrollToError = $derived(scrollToError || autoScrollToError !== false);
  const scrollOpts = $derived(
    typeof autoScrollToError === 'object' ? autoScrollToError : undefined,
  );

  // ref to the <form> element — used imperatively (red line #3: DOM ops live in
  // the event handler, never in render) to locate the first errored field.
  let formEl: HTMLFormElement | undefined;

  const DEFAULT_SCROLL: ScrollIntoViewOptions = { behavior: 'smooth', block: 'center' };

  // scroll to (and focus) a single field by name (Semi scrollToField).
  function scrollToFieldEl(field: string, opts?: ScrollIntoViewOptions): void {
    if (!formEl) return;
    const node = formEl.querySelector<HTMLElement>(`[data-field="${field}"]`);
    if (!node) return;
    node.scrollIntoView(opts ?? DEFAULT_SCROLL);
    const control = node.querySelector<HTMLElement>(
      'input, textarea, select, [tabindex]:not([tabindex="-1"])',
    );
    control?.focus({ preventScroll: true });
  }

  function focusFirstError(errors: FieldErrors, opts?: ScrollIntoViewOptions): void {
    if (!formEl) return;
    // walk fields in DOM order so we land on the *first* errored one on screen.
    const nodes = formEl.querySelectorAll<HTMLElement>('[data-field]');
    for (const node of nodes) {
      const name = node.dataset.field;
      if (name === undefined) continue;
      const err = errors[name];
      if (err === undefined || err === '') continue;
      node.scrollIntoView(opts ?? DEFAULT_SCROLL);
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
  function handleReset(e: Event) {
    // stopPropagation.reset: 阻止 reset 事件冒泡（对齐 Semi stopPropagation 对象）。
    if (stopPropagation?.reset) e.stopPropagation();
    form.reset();
    onReset?.();
  }

  async function handleSubmit(e: SubmitEvent) {
    // Semi 硬编码拦截原生 submit 默认行为（不再暴露 preventDefault prop）。
    e.preventDefault();
    // stopPropagation.submit: 阻止 submit 事件冒泡（对齐 Semi stopPropagation 对象）。
    if (stopPropagation?.submit) e.stopPropagation();
    const r = await form.submitForm();
    if (!r.valid && effScrollToError) focusFirstError(r.errors, scrollOpts);
    if (!r.valid) onSubmitFail?.(r.errors, r.values, e);
    onSubmit?.(r);
  }

  // merge caller-provided class (via rest) with the computed base classes.
  const cls = $derived(
    [`cd-form cd-form--${layout} cd-form--label-${labelPosition}`, rest.class]
      .filter(Boolean)
      .join(' '),
  );
  // x-form-id mirrors Semi for external DOM queries; scrolling uses the formEl
  // ref directly, so this is parity-only. Merged into rest so svelte-check
  // accepts the non-standard attribute name.
  const formAttrs = $derived({ ...rest, ...(id ? { 'x-form-id': id } : {}) });
</script>

<form
  bind:this={formEl}
  {...formAttrs}
  {id}
  class={cls}
  onsubmit={handleSubmit}
  onreset={handleReset}
>
  {@render (children as Snippet<[FormRenderArgs]>)?.({ formState, formApi: formApiWithScroll })}
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
    gap: var(--cd-spacing-base);
  }
  .cd-form__footer {
    display: flex;
    gap: var(--cd-spacing-base-tight);
  }
</style>
