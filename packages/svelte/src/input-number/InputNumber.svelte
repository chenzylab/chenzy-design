<!--
  InputNumber — 严格对齐 Semi Design inputNumber（复用已对齐的 Input，对齐 Semi InputNumber extends InputProps）。
  受约束的数值录入：内部复用 <Input>，经 rest 透传 role=spinbutton + aria-valuenow/min/max/valuetext
  落到原生 <input>，右侧 stacked 步进器（正常态外置 sibling、innerButtons 态作 Input suffix）。
  受控 / 非受控（value 显式提供即受控，只回调不回写）。
  DOM/class 对齐 Semi 连字符体系：
    外层容器 .cd-input-number（透明 flex，含 -size-{size}），边框/底色由 Input 承担
    步进器 .cd-input-number-suffix-btns（innerButtons → -inner）
    按钮 .cd-input-number-button + -button-up/-down（+ -not-allowed / -disabled）
  长按连续增减：按钮 mousedown 首延迟 pressTimeout 后以 pressInterval 间隔重复，up/leave/卸载清理。
  formatter/parser：自定义显示/解析（formatter 仅作用于非编辑态显示）。
  货币 / 科学计数法：仅失焦显示态套用；current/onChange/onNumberChange 的值始终是完整 number。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    useId,
    roundToPrecision,
    addNumberStep,
    formatWithLocale,
    useLiveAnnouncer,
  } from '@chenzy-design/core';
  import { IconChevronUp, IconChevronDown } from '@chenzy-design/icons';
  import { useLocale } from '../locale-provider/index.js';
  import Input from '../input/Input.svelte';
  import { getInputGroupContext } from '../input/context.js';

  type Size = 'small' | 'default' | 'large';
  type ValidateStatus = 'default' | 'error' | 'warning' | 'success';

  interface Props {
    value?: number | null;
    defaultValue?: number | null;
    min?: number;
    max?: number;
    step?: number;
    shiftStep?: number;
    precision?: number;
    size?: Size;
    disabled?: boolean;
    readonly?: boolean;
    /** 校验状态（对齐 Semi InputProps validateStatus，含 success）。 */
    validateStatus?: ValidateStatus;
    /** 步进按钮内嵌悬浮（hover/focus 显形，对齐 Semi innerButtons）。 */
    innerButtons?: boolean;
    /** 彻底隐藏步进按钮（对齐 Semi hideButtons）。 */
    hideButtons?: boolean;
    placeholder?: string;
    /** 输入框前置内容（如货币符号 ¥、单位）；传 Snippet 可自定义渲染。 */
    prefix?: string | Snippet;
    /** 内嵌标签（渲染在输入框内左侧，与 prefix 同槽，对齐 Semi insetLabel）。 */
    insetLabel?: Snippet | string;
    /** 内嵌标签容器 id（关联 aria，对齐 Semi insetLabelId）。 */
    insetLabelId?: string;
    /** 输入框后置内容（如单位 %、kg）；传 Snippet 可自定义渲染。 */
    suffix?: string | Snippet;
    name?: string;
    /** input 元素 id，关联外部 label；不传自动生成。 */
    id?: string;
    ariaLabel?: string;
    /** aria-labelledby：关联外部 label 元素（Form.Field 透传 labelId，对齐 Semi）。 */
    ariaLabelledby?: string;
    /** aria-describedby：关联 helpText / extraText（Form.Field 透传）。 */
    ariaDescribedby?: string;
    /** aria-errormessage：error 态关联错误信息容器（Form.Field 透传）。 */
    ariaErrormessage?: string;
    /** aria-required：必填语义（Form.Field required 透传）。 */
    ariaRequired?: boolean;
    /** 挂载自动聚焦（对齐 Semi autofocus）。 */
    autofocus?: boolean;
    /** 数字格式化 locale，传给内部 Intl（仅未提供 formatter 时生效）。 */
    locale?: string;
    /** 自定义显示格式化（仅非编辑态；对齐 Semi formatter）。 */
    formatter?: (n: number) => string;
    /** 自定义解析（与 formatter 对应；对齐 Semi parser）。 */
    parser?: (s: string) => number;
    /**
     * 值变化（对齐 Semi onChange）。货币/formatter 模式回显示字符串，其余回 number；
     * 空值回 null。携带原生 event（step/键盘/滚轮触发时为 undefined）。
     */
    onChange?: (value: number | string | null, e?: Event) => void;
    /** 携带 number 类型的变化回调（对齐 Semi onNumberChange，带 event）。 */
    onNumberChange?: (value: number | null, e?: Event) => void;
    /** 聚焦（对齐 Semi onFocus）。 */
    onFocus?: (e: FocusEvent) => void;
    /** 失焦（已完成 commit 归一化；对齐 Semi onBlur）。 */
    onBlur?: (e: FocusEvent) => void;
    /** 透传原生 keydown（对齐 Semi onKeyDown）。 */
    onKeyDown?: (e: KeyboardEvent) => void;
    /** 点击「+」按钮回调（对齐 Semi onUpClick，携带步进后值与鼠标事件）。 */
    onUpClick?: (value: number | null, e: MouseEvent) => void;
    /** 点击「-」按钮回调（对齐 Semi onDownClick，携带步进后值与鼠标事件）。 */
    onDownClick?: (value: number | null, e: MouseEvent) => void;
    /** 无边框模式（对齐 Semi InputProps borderless）。 */
    borderless?: boolean;
    /** 显示清除按钮（有值时出现 ×；对齐 Semi InputProps showClear）。 */
    showClear?: boolean;
    /** 自定义清除图标（对齐 Semi clearIcon）。 */
    clearIcon?: Snippet;
    /** 点击 +/- 按钮后保持输入框聚焦（对齐 Semi keepFocus，默认 false）。 */
    keepFocus?: boolean;
    /** focus() 命令式聚焦时是否阻止滚动（对齐 Semi preventScroll，默认 false）。 */
    preventScroll?: boolean;
    /** 长按后延迟多久开始连续触发（ms，对齐 Semi pressTimeout，默认 250）。 */
    pressTimeout?: number;
    /** 连续触发间隔（ms，对齐 Semi pressInterval，默认 250）。 */
    pressInterval?: number;
    /**
     * 失焦时大数值以科学计数法显示（对齐 Semi scientificNotation；聚焦编辑仍为完整数字）。
     * 传对象可自定义有效位阈值 threshold（默认 15）。
     */
    scientificNotation?: boolean | { threshold?: number };
    /** 货币展示（对齐 Semi currency）：true 按 localeCode 自动推断币种；字符串（'CNY'/'USD'）显式指定 ISO 4217 币种码。 */
    currency?: boolean | string;
    /** 货币显示形式：symbol（￥）/ code（CNY）/ name（人民币），默认 symbol（对齐 Semi currencyDisplay）。 */
    currencyDisplay?: 'symbol' | 'code' | 'name';
    /** 货币格式化 BCP-47 locale（'zh-CN'/'de-DE'）；未传回退 locale，再回退 'zh-CN'（对齐 Semi localeCode）。 */
    localeCode?: string;
    /** 是否显示货币符号/代码/名称；false 时仅千分位（style:'decimal'），供 prefix/suffix 自定义（对齐 Semi showCurrencySymbol，默认 true）。 */
    showCurrencySymbol?: boolean;
    /** 根元素自定义类名（对齐 Semi className）。 */
    class?: string;
    /** 根元素自定义内联样式（对齐 Semi style）。 */
    style?: string;
  }

  let {
    value = $bindable(),
    defaultValue = null,
    min = -Infinity,
    max = Infinity,
    step = 1,
    shiftStep = 10,
    precision,
    size: sizeProp,
    disabled: disabledProp,
    readonly = false,
    validateStatus = 'default',
    innerButtons = false,
    hideButtons = false,
    placeholder,
    prefix,
    insetLabel,
    insetLabelId,
    suffix,
    name,
    id,
    ariaLabel,
    ariaLabelledby,
    ariaDescribedby,
    ariaErrormessage,
    ariaRequired,
    autofocus = false,
    locale,
    formatter,
    parser,
    onChange,
    onNumberChange,
    onFocus,
    onBlur,
    onKeyDown,
    onUpClick,
    onDownClick,
    borderless = false,
    showClear = false,
    clearIcon,
    keepFocus = false,
    preventScroll = false,
    pressTimeout = 250,
    pressInterval = 250,
    scientificNotation = false,
    currency = false,
    currencyDisplay = 'symbol',
    localeCode,
    showCurrencySymbol = true,
    class: className,
    style,
  }: Props = $props();

  // InputGroup 组级默认（size/disabled）：显式 prop 始终优先，否则回退组级，再回退组件默认。
  const group = getInputGroupContext();
  const size = $derived<Size>(sizeProp ?? group?.size ?? 'default');
  const disabled = $derived<boolean>(disabledProp ?? group?.disabled ?? false);

  const loc = useLocale();
  // 单例 live region（polite）：值被 min/max 钳制（越界回弹）时播报实际生效值。
  const announcer = useLiveAnnouncer();
  // prefix 可传 string 或 Snippet；函数即视为 Snippet，字符串走内置 span 渲染。
  const prefixSnippet = $derived(typeof prefix === 'function' ? (prefix as Snippet) : undefined);
  const prefixText = $derived(typeof prefix === 'string' ? prefix : undefined);
  const suffixSnippet = $derived(typeof suffix === 'function' ? (suffix as Snippet) : undefined);
  const suffixText = $derived(typeof suffix === 'string' ? suffix : undefined);
  // 生成一次稳定回退 id（在 $derived 里调 useId 会每次产生新 id）。
  const autoId = useId('cd-input-number');
  const inputId = $derived(id ?? autoId);

  // Controlled when `value` prop is explicitly provided (incl. `null`).
  const isControlled = $derived(value !== undefined);
  let inner = $state<number | null>(getInitialValue());
  // Numeric source of truth (controlled value wins).
  const current = $derived(isControlled ? (value ?? null) : inner);

  // While editing, `editingText` holds the raw string the user typed (kept loose
  // so intermediate forms like "-" / "1." survive). When `null`, the field shows
  // the formatted `current`.
  let editingText = $state<string | null>(null);
  // 是否聚焦（编辑态）：科学计数法/货币仅在失焦显示态生效，聚焦时展示完整数字。
  let focused = $state(false);
  // 悬浮态：innerButtons 步进器仅在 hover/focus 时出现在 Input suffix（对齐 Semi renderSuffix）。
  let hovering = $state(false);
  const text = $derived(editingText ?? formatDisplay(current));

  // 科学计数法：启用与阈值派生（对象可自定义 threshold，默认 15）。
  const sciEnabled = $derived(!!scientificNotation);
  const sciThreshold = $derived(
    typeof scientificNotation === 'object' ? (scientificNotation.threshold ?? 15) : 15,
  );

  // --- 货币展示（对齐 Semi currency）---
  const currencyEnabled = $derived(currency !== false && currency !== undefined);
  const resolvedLocaleCode = $derived(localeCode ?? locale ?? 'zh-CN');
  const resolvedCurrencyCode = $derived.by(() => {
    if (typeof currency === 'string') return currency;
    return localeToCurrency(resolvedLocaleCode);
  });

  function getInitialValue(): number | null {
    return defaultValue ?? null;
  }

  // locale → ISO 4217 币种码映射（currency===true 时按 localeCode 推断）。
  function localeToCurrency(code: string): string {
    const lc = code.toLowerCase();
    const exact: Record<string, string> = {
      'zh-cn': 'CNY',
      'zh-tw': 'TWD',
      'en-us': 'USD',
      'en-gb': 'GBP',
      'ja-jp': 'JPY',
      'ko-kr': 'KRW',
      'vi-vn': 'VND',
      'ru-ru': 'RUB',
      'id-id': 'IDR',
      'ms-my': 'MYR',
      'th-th': 'THB',
      'tr-tr': 'TRY',
      'pt-br': 'BRL',
      'sv-se': 'SEK',
      'pl-pl': 'PLN',
    };
    if (exact[lc]) return exact[lc];
    const lang = lc.split('-')[0] ?? lc;
    const byLang: Record<string, string> = {
      de: 'EUR',
      fr: 'EUR',
      it: 'EUR',
      es: 'EUR',
      nl: 'EUR',
      ar: 'SAR',
      ro: 'RON',
      zh: 'CNY',
      ja: 'JPY',
      ko: 'KRW',
      ru: 'RUB',
      vi: 'VND',
    };
    return byLang[lang] ?? 'USD';
  }

  const atMin = $derived(current !== null && current <= min);
  const atMax = $derived(current !== null && current >= max);

  // aria-valuetext：存在 formatter / locale / currency 使显示值不同于裸数字时，向屏幕阅读器
  // 播报格式化后的可读文本。无格式化时省略，让 AT 直接读 valuenow。
  const ariaValueText = $derived.by<string | undefined>(() => {
    if (current === null) return undefined;
    if (!formatter && !locale && !currencyEnabled) return undefined;
    const display = formatDisplay(current);
    if (display === '' || display === String(current)) return undefined;
    return display;
  });

  function formatDisplay(n: number | null): string {
    if (n === null || Number.isNaN(n)) return '';
    // 货币展示：仅失焦显示态套用（聚焦编辑态展示纯数字，便于解析）。
    // currency 优先于科学计数法（对齐 Semi「currency 不支持 sci」）。
    if (currencyEnabled && !focused) {
      return new Intl.NumberFormat(resolvedLocaleCode, {
        style: showCurrencySymbol ? 'currency' : 'decimal',
        currency: resolvedCurrencyCode,
        currencyDisplay,
      }).format(n);
    }
    // 科学计数法：仅失焦显示态、且数量级达阈值时套用。
    if (sciEnabled && !focused && Math.abs(n) >= 10 ** sciThreshold) {
      return n.toExponential();
    }
    if (formatter) return formatter(n);
    if (locale) return formatWithLocale(n, locale);
    return String(n);
  }

  function parseText(t: string): number | null {
    const trimmed = t.trim();
    if (trimmed === '') return null;
    if (parser) {
      const n = parser(t);
      return Number.isNaN(n) ? null : n;
    }
    // 货币模式：剥离货币符号/代码/名称/千分位分隔符，仅保留数字、小数点、负号。
    if (currencyEnabled) {
      const cleaned = trimmed.replace(/[^\d.-]/g, '');
      const n = Number(cleaned);
      return Number.isNaN(n) ? null : n;
    }
    const n = Number(trimmed);
    return Number.isNaN(n) ? null : n;
  }

  function applyPrecision(n: number): number {
    return roundToPrecision(n, precision);
  }

  // 归一化：round → clamp 到 [min,max]（对齐 Semi：恒 clamp，无 strict 模式）。
  function normalize(n: number): number {
    const rounded = applyPrecision(n);
    const clamped = Math.min(max, Math.max(min, rounded));
    // 越界回弹：实际生效值与输入不同 → polite 播报生效值。
    if (clamped !== rounded && Number.isFinite(clamped)) {
      announcer.announce(loc().t('InputNumber.clampedAnnounce', { value: formatDisplay(clamped) }));
    }
    return clamped;
  }

  // onChange 值：货币/formatter 模式回显示字符串，其余回 number（对齐 Semi onChange 值语义）。
  function changeValueOf(n: number | null): number | string | null {
    if (n === null) return null;
    if (currencyEnabled || formatter) return formatDisplay(n);
    return n;
  }

  function commitValue(next: number | null, e?: Event) {
    // Controlled: never write the prop here; propagate only via callbacks.
    // Uncontrolled: keep local state in sync.
    if (!isControlled) inner = next;
    onChange?.(changeValueOf(next), e);
    onNumberChange?.(next, e);
  }

  const canClear = $derived(showClear && !disabled && !readonly && current !== null);

  // Input onChange 回 string：编辑态仅缓存原始文本，parse/clamp/commit 延后到失焦/Enter。
  function handleInputChange(v: string) {
    editingText = v;
  }

  // Input showClear 清除：直接 commit null 并复位编辑态（对齐 Semi 内置清除）。
  function handleClear() {
    commitValue(null);
    editingText = null;
    inputRef?.focus();
  }

  function commitFromText(e?: Event) {
    const raw = editingText ?? formatDisplay(current);
    editingText = null;
    const parsed = parseText(raw);
    if (parsed === null) {
      if (current !== null) commitValue(null, e);
      return;
    }
    const normalized = normalize(parsed);
    if (normalized !== current) commitValue(normalized, e);
  }

  function handleFocus(e: FocusEvent) {
    // 进入编辑态：科学计数法/货币退回完整数字显示（text 派生重算）。
    focused = true;
    onFocus?.(e);
  }

  function handleBlur(e: FocusEvent) {
    // 先清 focused：commitFromText 后 text 派生走显示态，失焦时才套科学计数法/货币。
    focused = false;
    commitFromText(e);
    onBlur?.(e);
  }

  // 步进：dir=±1，large 用 shiftStep。可选携带触发事件用于 up/down click 回调。
  function stepBy(dir: 1 | -1, large: boolean): number | null {
    if (disabled || readonly) return current;
    const delta = (large ? shiftStep : step) * dir;
    const base = current ?? (Number.isFinite(min) ? min : 0);
    const next = normalize(addNumberStep(base, delta));
    editingText = null;
    if (next !== current) commitValue(next);
    return next;
  }

  // --- 长按连续增减：首延迟 pressTimeout 后以 pressInterval 间隔重复，cleanup 清理 ---
  let holdTimer: ReturnType<typeof setTimeout> | undefined;
  let holdInterval: ReturnType<typeof setInterval> | undefined;

  function stopHold() {
    if (holdTimer !== undefined) {
      clearTimeout(holdTimer);
      holdTimer = undefined;
    }
    if (holdInterval !== undefined) {
      clearInterval(holdInterval);
      holdInterval = undefined;
    }
  }

  function startHold(dir: 1 | -1, e: MouseEvent) {
    // 始终阻止 mousedown 失焦（现有行为），keepFocus 进一步确保聚焦保持。
    preventBlurSteal(e);
    if (keepFocus) inputRef?.focus();
    if (disabled || readonly) return;
    const next = stepBy(dir, false);
    if (dir === 1) onUpClick?.(next, e);
    else onDownClick?.(next, e);
    holdTimer = setTimeout(() => {
      holdInterval = setInterval(() => stepBy(dir, false), pressInterval);
    }, pressTimeout);
  }

  // 组件卸载兜底清理定时器。
  $effect(() => stopHold);

  function handleKeydown(e: KeyboardEvent) {
    // 始终透传原生 keydown（便于扩展，如 Enter 提交表单）。
    onKeyDown?.(e);
    if (disabled || readonly) return;
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      stepBy(1, e.shiftKey);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      stepBy(-1, e.shiftKey);
    } else if (e.key === 'PageUp') {
      e.preventDefault();
      stepBy(1, true);
    } else if (e.key === 'PageDown') {
      e.preventDefault();
      stepBy(-1, true);
    } else if (e.key === 'Enter') {
      commitFromText(e);
    }
  }

  function preventBlurSteal(e: MouseEvent) {
    // Keep input focus when clicking stepper buttons.
    e.preventDefault();
  }

  // 内部 Input 组件实例引用（复用其命令式 focus/blur 方法）。
  let inputRef = $state<Input | undefined>(undefined);

  // 命令式 Methods（对齐 Semi）：委托内部 Input（其 focus 尊重自身 preventScroll）。
  export function focus(): void {
    inputRef?.focus();
  }
  export function blur(): void {
    inputRef?.blur();
  }

  // 步进器隐藏：hideButtons 或 innerButtons（innerButtons 靠 hover/focus 显形）。
  const showButtons = $derived(!hideButtons);
  // 正常态（非 inner、非 hidden）步进器外置为 Input 的兄弟节点；innerButtons 态作 Input 的 suffix。
  const showOuterButtons = $derived(showButtons && !innerButtons);
  // innerButtons 态：hover/focus 时步进器占据 Input suffix 槽。
  const showInnerButtons = $derived(innerButtons && showButtons && (hovering || focused));
  // 传给 Input 的 suffix：有内容（内嵌步进器 / 用户 suffix）才传 snippet，否则 undefined（不渲染空槽）。
  const passSuffix = $derived(showInnerButtons || suffix != null);
  // 传给 Input 的 prefix：仅在有值时传 snippet。
  const passPrefix = $derived(prefix != null);

  // 可选字符串属性经此聚合展开：值为 undefined 时键不出现，满足 Input 在 exactOptionalPropertyTypes
  // 下 `?: string`（不含 undefined）的严格约束。clearIcon 同理（Snippet | undefined）。
  const optionalAttrs = $derived({
    ...(placeholder !== undefined && { placeholder }),
    ...(name !== undefined && { name }),
    ...(ariaLabel !== undefined && { ariaLabel }),
    ...(ariaLabelledby !== undefined && { ariaLabelledby }),
    ...(ariaDescribedby !== undefined && { ariaDescribedby }),
    ...(ariaErrormessage !== undefined && { ariaErrormessage }),
    ...(ariaRequired !== undefined && { ariaRequired }),
    id: inputId,
  });

  const cls = $derived(
    [
      'cd-input-number',
      `cd-input-number-size-${size}`,
      validateStatus !== 'default' && `cd-input-number-${validateStatus}`,
      innerButtons && 'cd-input-number-inner',
      disabled && 'cd-input-number-disabled',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<div
  class={cls}
  {style}
  onmouseenter={() => (hovering = true)}
  onmouseleave={() => (hovering = false)}
  role="presentation"
>
  <Input
    bind:this={inputRef}
    role="spinbutton"
    inputmode="decimal"
    type="text"
    step={Number.isFinite(step) ? step : undefined}
    aria-valuenow={current ?? undefined}
    aria-valuetext={ariaValueText}
    aria-valuemin={Number.isFinite(min) ? min : undefined}
    aria-valuemax={Number.isFinite(max) ? max : undefined}
    aria-readonly={readonly || undefined}
    aria-disabled={disabled || undefined}
    {size}
    {disabled}
    {readonly}
    {...optionalAttrs}
    {validateStatus}
    {borderless}
    autoFocus={autofocus}
    {preventScroll}
    value={text}
    showClear={canClear}
    {...clearIcon !== undefined ? { clearIcon } : {}}
    onChange={handleInputChange}
    onClear={handleClear}
    onKeyDown={handleKeydown}
    onFocus={handleFocus}
    onBlur={handleBlur}
    {...passPrefix ? { prefix: prefixNode } : {}}
    {...passSuffix ? { suffix: suffixNode } : {}}
    {...insetLabel !== undefined ? { insetLabel } : {}}
    {...insetLabelId !== undefined ? { insetLabelId } : {}}
  />

  {#if showOuterButtons}
    <div class="cd-input-number-suffix-btns">
      {@render stepperButtons()}
    </div>
  {/if}
</div>

<!-- prefix：Snippet 直渲，字符串包 span（对齐 Semi renderPrefix 同槽）。 -->
{#snippet prefixNode()}
  {#if prefixSnippet}
    {@render prefixSnippet()}
  {:else if prefixText != null}
    <span class="cd-input-number-affix cd-input-number-prefix">{prefixText}</span>
  {/if}
{/snippet}

<!--
  Input suffix（对齐 Semi renderSuffix）：innerButtons 态渲染步进器；
  否则渲染用户 suffix（string 包 span，Snippet 直渲）。正常态步进器不在此，见外置 sibling。
-->
{#snippet suffixNode()}
  {#if showInnerButtons}
    <div class="cd-input-number-suffix-btns cd-input-number-suffix-btns-inner">
      {@render stepperButtons()}
    </div>
  {:else if suffixSnippet}
    {@render suffixSnippet()}
  {:else if suffixText != null}
    <span class="cd-input-number-affix cd-input-number-suffix">{suffixText}</span>
  {/if}
{/snippet}

<!-- 步进上/下按钮（对齐 Semi renderButtons）：正常态外置、innerButtons 态作 Input suffix。 -->
{#snippet stepperButtons()}
  <span
    class="cd-input-number-button cd-input-number-button-up"
    class:cd-input-number-button-up-not-allowed={disabled || readonly || atMax}
    class:cd-input-number-button-up-disabled={disabled}
    role="button"
    tabindex="-1"
    aria-label={loc().t('InputNumber.increase')}
    aria-disabled={disabled || readonly || atMax || undefined}
    onmousedown={(e) => startHold(1, e)}
    onmouseup={stopHold}
    onmouseleave={stopHold}
  >
    <IconChevronUp size="extra-small" />
  </span>
  <span
    class="cd-input-number-button cd-input-number-button-down"
    class:cd-input-number-button-down-not-allowed={disabled || readonly || atMin}
    class:cd-input-number-button-down-disabled={disabled}
    role="button"
    tabindex="-1"
    aria-label={loc().t('InputNumber.decrease')}
    aria-disabled={disabled || readonly || atMin || undefined}
    onmousedown={(e) => startHold(-1, e)}
    onmouseup={stopHold}
    onmouseleave={stopHold}
  >
    <IconChevronDown size="extra-small" />
  </span>
{/snippet}

<style>
  /* 外层容器 —— 对齐 Semi .semi-input-number：透明 inline-flex，边框/底色由内部 Input 承担。 */
  .cd-input-number {
    display: inline-flex;
    align-items: center;
    box-sizing: border-box;
    inline-size: 100%;
    position: relative;
  }
  /* innerButtons：步进器绝对定位于内嵌右内侧，需容器建立定位上下文。 */
  .cd-input-number-inner {
    position: relative;
  }

  /* prefix/suffix affix（字符串态）—— 对齐 Semi：text-2，nowrap，不换行。 */
  .cd-input-number-affix {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
    color: var(--cd-color-text-2);
    white-space: nowrap;
    user-select: none;
  }

  /* --- 步进器：对齐 Semi inputNumber-suffix-btns（列布局，外框描边，两按钮各占 50%） --- */
  .cd-input-number-suffix-btns {
    display: inline-flex;
    flex-direction: column;
    flex: 0 0 auto;
    box-sizing: border-box;
    block-size: var(--cd-height-input-number-button-default);
    margin-inline-start: var(--cd-spacing-input-number-button-marginleft);
    border: var(--cd-width-input-number-button-border) solid
      var(--cd-color-input-number-button-border-default);
    border-radius: var(--cd-radius-input-number);
    background: var(--cd-color-input-number-button-bg-default);
  }
  .cd-input-number-size-small .cd-input-number-suffix-btns {
    block-size: var(--cd-height-input-number-button-small);
  }
  .cd-input-number-size-large .cd-input-number-suffix-btns {
    block-size: var(--cd-height-input-number-button-large);
  }
  .cd-input-number-button {
    block-size: 50%;
    inline-size: var(--cd-width-input-number-button);
    padding: 0;
    margin: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    border-radius: 0;
    color: var(--cd-color-input-number-button-text-default);
  }
  .cd-input-number-button-up:not(.cd-input-number-button-up-not-allowed):hover,
  .cd-input-number-button-down:not(.cd-input-number-button-down-not-allowed):hover {
    cursor: pointer;
    background: var(--cd-color-input-number-button-bg-hover);
  }
  .cd-input-number-button-up:not(.cd-input-number-button-up-not-allowed):active,
  .cd-input-number-button-down:not(.cd-input-number-button-down-not-allowed):active {
    cursor: pointer;
    background: var(--cd-color-input-number-button-bg-active);
  }
  .cd-input-number-button-up.cd-input-number-button-up-disabled,
  .cd-input-number-button-down.cd-input-number-button-down-disabled {
    background: var(--cd-color-input-number-button-bg-disabled);
    color: var(--cd-color-input-number-button-text-disabled);
  }
  .cd-input-number-button-up.cd-input-number-button-up-not-allowed,
  .cd-input-number-button-down.cd-input-number-button-down-not-allowed {
    cursor: not-allowed;
  }

  /* --- innerButtons：步进器内嵌 Input suffix 槽，hover/focus 时条件渲染（对齐 Semi suffix-btns-inner） --- */
  .cd-input-number-suffix-btns-inner {
    margin-inline-start: var(--cd-spacing-input-number-button-inner-marginleft);
    border-radius: var(--cd-radius-input-number-inner);
    overflow: hidden;
    block-size: var(--cd-height-input-number-button-inner-default);
  }
  .cd-input-number-size-small .cd-input-number-suffix-btns-inner {
    block-size: var(--cd-height-input-number-button-inner-small);
  }
  .cd-input-number-size-large .cd-input-number-suffix-btns-inner {
    block-size: var(--cd-height-input-number-button-inner-large);
  }
</style>
