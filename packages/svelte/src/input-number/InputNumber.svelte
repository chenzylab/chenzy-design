<!--
  InputNumber — 严格对齐 Semi Design inputNumber。
  受约束的数值录入：native <input inputmode="decimal"> role=spinbutton + 右侧 stacked 步进器。
  受控 / 非受控（value 显式提供即受控，只回调不回写）。
  DOM/class 对齐 Semi 连字符体系：
    根 .cd-input-number（含 -size-{size}）
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
  import { IconClear, IconChevronUp, IconChevronDown } from '@chenzy-design/icons';
  import { useLocale } from '../locale-provider/index.js';

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
    /** 输入框后置内容（如单位 %、kg）；传 Snippet 可自定义渲染。 */
    suffix?: string | Snippet;
    name?: string;
    /** input 元素 id，关联外部 label；不传自动生成。 */
    id?: string;
    ariaLabel?: string;
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
    size = 'default',
    disabled = false,
    readonly = false,
    validateStatus = 'default',
    innerButtons = false,
    hideButtons = false,
    placeholder,
    prefix,
    suffix,
    name,
    id,
    ariaLabel,
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

  const loc = useLocale();
  // 单例 live region（polite）：值被 min/max 钳制（越界回弹）时播报实际生效值。
  const announcer = useLiveAnnouncer();
  // prefix/suffix 可传 string 或 Snippet；函数即视为 Snippet。
  const prefixSnippet = $derived(typeof prefix === 'function' ? (prefix as Snippet) : undefined);
  const suffixSnippet = $derived(typeof suffix === 'function' ? (suffix as Snippet) : undefined);
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

  function clearValue() {
    commitValue(null);
    editingText = null;
    inputEl?.focus({ preventScroll: true });
  }

  const canClear = $derived(showClear && !disabled && !readonly && current !== null);

  function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
    editingText = e.currentTarget.value;
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
    if (keepFocus && inputEl) inputEl.focus({ preventScroll: true });
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

  let inputEl: HTMLInputElement | undefined;

  // 命令式 Methods（对齐 Semi）：focus() 尊重 preventScroll prop（默认 false）。
  export function focus(): void {
    inputEl?.focus({ preventScroll });
  }
  export function blur(): void {
    inputEl?.blur();
  }

  function inputActions(node: HTMLInputElement) {
    inputEl = node;
    if (autofocus && !disabled) {
      // 推迟到下一帧，确保挂载后 DOM 已就绪、避免抢占 SSR hydration。
      requestAnimationFrame(() => node.focus());
    }

    function handleFocus(e: FocusEvent) {
      // 进入编辑态：科学计数法/货币退回完整数字显示（text 派生重算）。
      focused = true;
      onFocus?.(e);
    }

    node.addEventListener('focus', handleFocus);

    return {
      destroy() {
        node.removeEventListener('focus', handleFocus);
        if (inputEl === node) inputEl = undefined;
      },
    };
  }

  // 步进器隐藏：hideButtons 或 innerButtons（innerButtons 靠 CSS hover/focus 显形）。
  const showButtons = $derived(!hideButtons);

  const cls = $derived(
    [
      'cd-input-number',
      `cd-input-number-size-${size}`,
      validateStatus !== 'default' && `cd-input-number-${validateStatus}`,
      innerButtons && 'cd-input-number-inner',
      prefix != null && 'cd-input-number-has-prefix',
      suffix != null && 'cd-input-number-has-suffix',
      disabled && 'cd-input-number-disabled',
      borderless && 'cd-input-number-borderless',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<div class={cls} {style} aria-invalid={validateStatus === 'error' || undefined}>
  {#if prefix != null}
    <span class="cd-input-number-affix cd-input-number-prefix">
      {#if prefixSnippet}{@render prefixSnippet()}{:else}{prefix}{/if}
    </span>
  {/if}

  <input
    use:inputActions
    class="cd-input-number-input"
    type="text"
    inputmode="decimal"
    role="spinbutton"
    id={inputId}
    {name}
    {disabled}
    {readonly}
    {placeholder}
    value={text}
    aria-label={ariaLabel}
    aria-valuenow={current ?? undefined}
    aria-valuetext={ariaValueText}
    aria-valuemin={Number.isFinite(min) ? min : undefined}
    aria-valuemax={Number.isFinite(max) ? max : undefined}
    aria-invalid={validateStatus === 'error' || undefined}
    aria-disabled={disabled || undefined}
    aria-readonly={readonly || undefined}
    oninput={handleInput}
    onblur={handleBlur}
    onkeydown={handleKeydown}
  />

  {#if suffix != null}
    <span class="cd-input-number-affix cd-input-number-suffix">
      {#if suffixSnippet}{@render suffixSnippet()}{:else}{suffix}{/if}
    </span>
  {/if}

  {#if canClear}
    <button
      type="button"
      class="cd-input-number-clearbtn"
      tabindex="-1"
      aria-label={loc().t('InputNumber.clear')}
      onmousedown={(e) => e.preventDefault()}
      onclick={clearValue}
    >
      {#if clearIcon}
        {@render clearIcon()}
      {:else}
        <IconClear />
      {/if}
    </button>
  {/if}

  {#if showButtons}
    <div class="cd-input-number-suffix-btns" class:cd-input-number-suffix-btns-inner={innerButtons}>
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
    </div>
  {/if}
</div>

<style>
  .cd-input-number {
    display: inline-flex;
    align-items: center;
    box-sizing: border-box;
    inline-size: 100%;
    block-size: var(--cd-height-input-default);
    background: var(--cd-input-color-bg);
    color: var(--cd-input-color-text);
    border: 1px solid var(--cd-input-border);
    border-radius: var(--cd-input-radius);
    font-size: var(--cd-input-font-size);
    padding-inline-end: var(--cd-spacing-input-number-button-marginleft);
    transition: border-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-input-number-size-small {
    block-size: var(--cd-height-input-small);
    font-size: var(--cd-font-size-small);
  }
  .cd-input-number-size-large {
    block-size: var(--cd-height-input-large);
    font-size: var(--cd-font-size-header-6);
  }
  .cd-input-number:focus-within {
    border-color: var(--cd-input-border-active);
    box-shadow: var(--cd-focus-ring);
  }
  .cd-input-number-warning {
    border-color: var(--cd-input-border-warning);
  }
  .cd-input-number-error {
    border-color: var(--cd-input-border-error);
  }
  .cd-input-number-disabled {
    background: var(--cd-color-fill-0);
    color: var(--cd-color-text-3);
    cursor: not-allowed;
  }
  .cd-input-number-borderless {
    border-color: transparent;
    background: transparent;
    box-shadow: none;
  }
  .cd-input-number-borderless:focus-within {
    border-color: transparent;
    box-shadow: none;
  }
  .cd-input-number-clearbtn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    padding: 0;
    padding-inline-end: var(--cd-spacing-extra-tight);
    border: none;
    background: transparent;
    color: var(--cd-color-text-2);
    cursor: pointer;
    border-radius: var(--cd-border-radius-small);
  }
  .cd-input-number-clearbtn:hover {
    color: var(--cd-color-text-0);
  }
  .cd-input-number-clearbtn:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-input-number-input {
    flex: 1 1 auto;
    inline-size: 100%;
    min-inline-size: 0;
    margin: 0;
    padding-inline: var(--cd-input-padding-x);
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    outline: none;
  }
  /* 有前/后缀时，由 affix 承担该侧边距，避免双重留白。 */
  .cd-input-number-has-prefix .cd-input-number-input {
    padding-inline-start: var(--cd-spacing-extra-tight);
  }
  .cd-input-number-has-suffix .cd-input-number-input {
    padding-inline-end: var(--cd-spacing-extra-tight);
  }
  .cd-input-number-input::placeholder {
    color: var(--cd-input-color-placeholder);
  }
  .cd-input-number-affix {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
    color: var(--cd-color-text-2);
    white-space: nowrap;
    user-select: none;
  }
  .cd-input-number-prefix {
    padding-inline-start: var(--cd-input-padding-x);
  }
  .cd-input-number-suffix {
    padding-inline-end: var(--cd-input-padding-x);
  }
  .cd-input-number-input:disabled {
    cursor: not-allowed;
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

  /* --- innerButtons：步进器内嵌右内侧，hover/focus 显形（对齐 Semi suffix-btns-inner） --- */
  .cd-input-number-inner {
    position: relative;
  }
  .cd-input-number-suffix-btns-inner {
    margin-inline-start: var(--cd-spacing-input-number-button-inner-marginleft);
    border-radius: var(--cd-radius-input-number-inner);
    overflow: hidden;
  }
  .cd-input-number-size-small .cd-input-number-suffix-btns-inner {
    block-size: var(--cd-height-input-number-button-inner-small);
  }
  .cd-input-number-size-large .cd-input-number-suffix-btns-inner {
    block-size: var(--cd-height-input-number-button-inner-large);
  }
  .cd-input-number-inner .cd-input-number-suffix-btns {
    position: absolute;
    inset-block: 1px;
    inset-inline-end: 1px;
    block-size: var(--cd-height-input-number-button-inner-default);
    background: var(--cd-input-color-bg);
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-input-number-inner:hover .cd-input-number-suffix-btns,
  .cd-input-number-inner:focus-within .cd-input-number-suffix-btns {
    opacity: 1;
    pointer-events: auto;
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-input-number,
    .cd-input-number-inner .cd-input-number-suffix-btns {
      transition: none;
    }
  }
</style>
