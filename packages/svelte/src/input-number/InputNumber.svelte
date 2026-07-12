<!--
  InputNumber — see specs/components/input/InputNumber.spec.md
  Constrained numeric input: native <input inputmode="decimal"> + stacked steppers.
  Controlled / uncontrolled (same pattern as Input). Variation only via onChange.
  长按连续增减：按钮 mousedown 首延迟 400ms 后以 60ms 间隔重复，up/leave/卸载清理。
  formatter/parser：自定义显示/解析（formatter 仅作用于非编辑态显示）。
  mouseWheel/selectOnFocus/autofocus 命令式监听挂在 action 上并 cleanup（红线 #3）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    useId,
    clampWithMode,
    boundaryHitOf,
    roundToPrecision,
    addNumberStep,
    formatWithLocale,
    useLiveAnnouncer,
    type BoundaryMode,
  } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';

  type Size = 'small' | 'default' | 'large';
  type Status = 'default' | 'warning' | 'error';
  type ControlsPosition = 'right' | 'sides';

  interface Props {
    value?: number | null;
    defaultValue?: number | null;
    min?: number;
    max?: number;
    step?: number;
    shiftStep?: number;
    precision?: number;
    /** 越界处理：clamp 钳制 / strict 拒绝回滚 */
    boundaryMode?: BoundaryMode;
    size?: Size;
    disabled?: boolean;
    readonly?: boolean;
    status?: Status;
    controls?: boolean;
    /** 步进按钮布局：right 右侧 stacked / sides 两侧 */
    controlsPosition?: ControlsPosition;
    /** 步进按钮内嵌悬浮（hover/focus 显形） */
    innerButtons?: boolean;
    keyboard?: boolean;
    /** 聚焦时滚轮步进 */
    mouseWheel?: boolean;
    placeholder?: string;
    /** 输入框前置内容（如货币符号 ¥、单位）；传 Snippet 可自定义渲染 */
    prefix?: string | Snippet;
    /** 输入框后置内容（如单位 %、kg）；传 Snippet 可自定义渲染 */
    suffix?: string | Snippet;
    name?: string;
    /** input 元素 id，关联外部 label；不传自动生成 */
    id?: string;
    ariaLabel?: string;
    /** 挂载自动聚焦 */
    autofocus?: boolean;
    /** 聚焦时全选文本 */
    selectOnFocus?: boolean;
    /** 数字格式化 locale，传给内部 Intl（仅未提供 formatter 时生效） */
    locale?: string;
    /** 自定义显示格式化（仅非编辑态） */
    formatter?: (n: number) => string;
    /** 自定义解析（与 formatter 对应） */
    parser?: (s: string) => number;
    onChange?: (v: number | null) => void;
    /** 触达/试图越过边界 */
    onBoundaryHit?: (e: { boundary: 'min' | 'max'; value: number }) => void;
    /** 任一步进动作完成（按钮 / 键盘 / 滚轮） */
    onStep?: (e: {
      value: number;
      direction: 'up' | 'down';
      source: 'button' | 'keyboard' | 'wheel';
    }) => void;
    /** 聚焦 */
    onFocus?: (e: FocusEvent) => void;
    /** 失焦（已完成 commit 归一化） */
    onBlur?: (e: FocusEvent) => void;
    /** 透传原生 keydown（便于扩展，如 Enter 提交表单） */
    onKeydown?: (e: KeyboardEvent) => void;
    /** 无边框模式 */
    borderless?: boolean;
    /** 显示清除按钮（有值时出现 ×） */
    showClear?: boolean;
    /** 自定义清除图标 */
    clearIcon?: Snippet;
    /** 点击 +/- 按钮后保持输入框聚焦（默认 false） */
    keepFocus?: boolean;
    /** 携带 number 类型的变化回调（区别于 onChange 返回 number | null） */
    onNumberChange?: (value: number | null) => void;
    /** focus() 命令式聚焦时是否阻止滚动（对齐 Semi，默认 false） */
    preventScroll?: boolean;
    /** 彻底隐藏步进按钮（对齐 Semi；优先级高于 controls） */
    hideButtons?: boolean;
    /** 长按后延迟多久开始连续触发（ms，对齐 Semi，默认 250） */
    pressTimeout?: number;
    /** 连续触发间隔（ms，对齐 Semi，默认 250） */
    pressInterval?: number;
    /** 失焦时大数值以科学计数法显示（对齐 Semi；聚焦编辑仍为完整数字）。
     * 传对象可自定义有效位阈值 threshold（默认 15）。 */
    scientificNotation?: boolean | { threshold?: number };
    /** 货币展示（对齐 Semi）：true 按 localeCode 自动推断币种；字符串（如 'CNY'/'USD'）显式指定 ISO 4217 币种码。 */
    currency?: boolean | string;
    /** 货币显示形式：symbol（￥）/ code（CNY）/ name（人民币），默认 symbol。 */
    currencyDisplay?: 'symbol' | 'code' | 'name';
    /** 货币格式化 BCP-47 locale（如 'zh-CN'/'de-DE'）；未传回退 locale，再回退 'zh-CN'。 */
    localeCode?: string;
    /** 是否显示货币符号/代码/名称；false 时仅千分位（style:'decimal'），供用户自定义 prefix/suffix。默认 true。 */
    showCurrencySymbol?: boolean;
    /** 根元素自定义类名（透传，叠加在内置 class 之后，对齐 Semi className）。 */
    class?: string;
    /** 根元素自定义内联样式（透传，对齐 Semi style）。 */
    style?: string;
  }

  let {
    value = $bindable(),
    defaultValue = null,
    min = -Infinity,
    max = Infinity,
    step = 1,
    shiftStep,
    precision,
    boundaryMode = 'clamp',
    size = 'default',
    disabled = false,
    readonly = false,
    status = 'default',
    controls = true,
    controlsPosition = 'right',
    innerButtons = false,
    keyboard = true,
    mouseWheel = false,
    placeholder,
    prefix,
    suffix,
    name,
    id,
    ariaLabel,
    autofocus = false,
    selectOnFocus = false,
    locale,
    formatter,
    parser,
    onChange,
    onBoundaryHit,
    onStep,
    onFocus,
    onBlur,
    onKeydown,
    borderless = false,
    showClear = false,
    clearIcon,
    keepFocus = false,
    onNumberChange,
    preventScroll = false,
    hideButtons = false,
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
  // 单例 live region（polite）：值被 min/max 钳制（越界回弹）时播报实际生效值（红线 #3：命令式）。
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
  // the formatted `current` — no $effect needed, so external value changes flow
  // straight through the derived display.
  let editingText = $state<string | null>(null);
  // 是否聚焦（编辑态）：科学计数法仅在失焦显示态生效，聚焦时展示完整数字。
  let focused = $state(false);
  const text = $derived(editingText ?? formatDisplay(current));

  const effectiveShiftStep = $derived(shiftStep ?? step * 10);

  // 科学计数法：启用与阈值派生（对象可自定义 threshold，默认 15）。
  const sciEnabled = $derived(!!scientificNotation);
  const sciThreshold = $derived(
    typeof scientificNotation === 'object' ? (scientificNotation.threshold ?? 15) : 15,
  );

  // --- 货币展示（对齐 Semi currency）---
  // 启用条件：currency 非 false/undefined（true 或币种码字符串）。
  const currencyEnabled = $derived(currency !== false && currency !== undefined);
  // 格式化 locale：localeCode 优先 → 组件 locale → 'zh-CN'。
  const resolvedLocaleCode = $derived(localeCode ?? locale ?? 'zh-CN');
  // 币种码：字符串直接用；currency===true 时按 locale 前缀映射到 ISO 4217，缺省回退 USD。
  const resolvedCurrencyCode = $derived.by(() => {
    if (typeof currency === 'string') return currency;
    return localeToCurrency(resolvedLocaleCode);
  });

  function getInitialValue(): number | null {
    return defaultValue ?? null;
  }

  // locale → ISO 4217 币种码映射（currency===true 时按 localeCode 推断）。
  // 精确匹配优先，再按语言前缀匹配，最后回退 USD。
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

  // aria-valuetext：当存在 formatter / locale 使显示值不同于裸数字时，向屏幕阅读器
  // 播报格式化后的可读文本（如「1,234」「¥1,200」）。无格式化时省略，让 AT 直接读 valuenow。
  const ariaValueText = $derived.by<string | undefined>(() => {
    if (current === null) return undefined;
    if (!formatter && !locale) return undefined;
    const display = formatDisplay(current);
    if (display === '' || display === String(current)) return undefined;
    return display;
  });

  function formatDisplay(n: number | null): string {
    if (n === null || Number.isNaN(n)) return '';
    // 货币展示：仅失焦显示态套用（聚焦编辑态展示纯数字，便于解析）。
    // currency 优先于科学计数法 —— 同时传时 currency 生效、sci 被忽略（对齐 Semi「currency 不支持 sci」）。
    // 仅影响显示；current / onChange / onNumberChange 的值仍是完整 number。
    if (currencyEnabled && !focused) {
      // showCurrencySymbol=false → decimal（仅千分位，不显示符号/代码/名称，供用户自定义 prefix/suffix）。
      // currency 模式由 Intl 决定小数位（如 JPY 0 位、CNY 2 位）。
      return new Intl.NumberFormat(resolvedLocaleCode, {
        style: showCurrencySymbol ? 'currency' : 'decimal',
        currency: resolvedCurrencyCode,
        currencyDisplay,
      }).format(n);
    }
    // 科学计数法：仅失焦显示态、且数量级达阈值时套用（聚焦编辑态展示完整数字）。
    // 仅影响显示；current / onChange / onNumberChange 的值仍是完整 number。
    if (sciEnabled && !focused && Math.abs(n) >= 10 ** sciThreshold) {
      return n.toExponential();
    }
    if (formatter) return formatter(n);
    // 未提供 formatter 时：仅当显式传入 locale 才走 Intl，否则保持现状 String(n)。
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
    // 货币模式：即便聚焦态通常已展示纯数字，仍保险剥离货币符号/代码/名称/千分位分隔符，
    // 仅保留数字、小数点、负号（编辑基准是标准 '.' 小数点，故足够）。
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

  // 归一化：round → clamp/strict。strict 越界返回 null（表示拒绝，调用方回滚）。
  // 同时上报 boundaryHit。
  function normalize(n: number): number | null {
    const rounded = applyPrecision(n);
    const hit = boundaryHitOf(rounded, min, max);
    if (hit) onBoundaryHit?.({ boundary: hit, value: rounded });
    const clamped = clampWithMode(rounded, min, max, boundaryMode);
    // clamp 模式越界回弹：实际生效值与输入不同 → polite 播报生效值（strict 模式返回 null 拒绝，不播）。
    if (hit && clamped !== null && clamped !== rounded) {
      announcer.announce(loc().t('InputNumber.clampedAnnounce', { value: formatDisplay(clamped) }));
    }
    return clamped;
  }

  function commitValue(next: number | null) {
    // Controlled: never write the prop here; propagate only via onChange.
    // Uncontrolled: keep local state in sync. (Avoids the value->onChange->value loop.)
    if (!isControlled) inner = next;
    onChange?.(next);
    onNumberChange?.(next);
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

  function commitFromText() {
    const raw = editingText ?? formatDisplay(current);
    editingText = null;
    const parsed = parseText(raw);
    if (parsed === null) {
      if (current !== null) commitValue(null);
      return;
    }
    const normalized = normalize(parsed);
    // strict 越界：normalize 返回 null → 拒绝写入，回滚到 current 显示。
    // 受控值未变（不会触发重渲染回填 input），故命令式把 DOM 值还原为当前显示串。
    if (normalized === null) {
      restoreDisplay();
      return;
    }
    if (normalized !== current) commitValue(normalized);
  }

  function handleBlur(e: FocusEvent) {
    // 先清 focused：commitFromText 后 text 派生走显示态，失焦时才套科学计数法。
    focused = false;
    commitFromText();
    // commit 归一化后再上报失焦（spec：blur 时已完成 commit）。
    onBlur?.(e);
  }

  function stepBy(dir: 1 | -1, large: boolean, source: 'button' | 'keyboard' | 'wheel') {
    if (disabled || readonly) return;
    const delta = (large ? effectiveShiftStep : step) * dir;
    const base = current ?? (Number.isFinite(min) ? min : 0);
    const next = normalize(addNumberStep(base, delta));
    editingText = null;
    // strict 越界回滚：保持 current。
    if (next === null) return;
    if (next !== current) commitValue(next);
    // 步进动作完成上报（即便钳制后值未变也算一次步进尝试，但仅在落到有效值时触发）。
    onStep?.({ value: next, direction: dir === 1 ? 'up' : 'down', source });
  }

  // --- 长按连续增减：首延迟 400ms 后以 60ms 间隔重复，cleanup 清理（红线 #3）---
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
    stepBy(dir, false, 'button');
    holdTimer = setTimeout(() => {
      holdInterval = setInterval(() => stepBy(dir, false, 'button'), pressInterval);
    }, pressTimeout);
  }

  // 组件卸载兜底清理定时器。
  $effect(() => stopHold);

  function handleKeydown(e: KeyboardEvent) {
    // 始终透传原生 keydown（即便 keyboard 关闭/禁用，便于使用方扩展，如 Enter 提交表单）。
    onKeydown?.(e);
    if (!keyboard || disabled || readonly) return;
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      stepBy(1, e.shiftKey, 'keyboard');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      stepBy(-1, e.shiftKey, 'keyboard');
    } else if (e.key === 'PageUp') {
      e.preventDefault();
      stepBy(1, true, 'keyboard');
    } else if (e.key === 'PageDown') {
      e.preventDefault();
      stepBy(-1, true, 'keyboard');
    } else if (e.key === 'Enter') {
      commitFromText();
    }
  }

  function preventBlurSteal(e: MouseEvent) {
    // Keep input focus when clicking stepper buttons.
    e.preventDefault();
  }

  // --- 命令式监听：autofocus / selectOnFocus / mouseWheel + cleanup（红线 #3）---
  let inputEl: HTMLInputElement | undefined;

  // 命令式 Methods（对齐 Semi）：focus() 尊重 preventScroll prop（默认 false）。
  // 注意：内部 autofocus/keepFocus/clear 的 focus 仍用 preventScroll:true，保持既有行为。
  export function focus(): void {
    inputEl?.focus({ preventScroll });
  }
  export function blur(): void {
    inputEl?.blur();
  }

  // 受控值未变时（如 strict 越界拒绝），Svelte 不会重渲染 input.value，需命令式还原。
  function restoreDisplay() {
    if (inputEl) inputEl.value = formatDisplay(current);
  }

  function inputActions(node: HTMLInputElement) {
    inputEl = node;
    if (autofocus && !disabled) {
      // 推迟到下一帧，确保挂载后 DOM 已就绪、避免抢占 SSR hydration。
      requestAnimationFrame(() => node.focus());
    }

    function handleFocus(e: FocusEvent) {
      // 进入编辑态：科学计数法退回完整数字显示（text 派生重算）。
      focused = true;
      onFocus?.(e);
      // 推迟到下一帧：浏览器在 focus 后才放置默认光标，立即 select 会被覆盖。
      if (selectOnFocus) requestAnimationFrame(() => node.select());
    }

    // 滚轮步进：仅聚焦时响应，passive=false 以便 preventDefault 阻止页面滚动。
    function onWheel(e: WheelEvent) {
      if (!mouseWheel || disabled || readonly) return;
      if (document.activeElement !== node) return;
      e.preventDefault();
      stepBy(e.deltaY < 0 ? 1 : -1, e.shiftKey, 'wheel');
    }

    node.addEventListener('focus', handleFocus);
    node.addEventListener('wheel', onWheel, { passive: false });

    return {
      destroy() {
        node.removeEventListener('focus', handleFocus);
        node.removeEventListener('wheel', onWheel);
        if (inputEl === node) inputEl = undefined;
      },
    };
  }

  const cls = $derived(
    [
      'cd-input-number',
      `cd-input-number--${size}`,
      `cd-input-number--${status}`,
      `cd-input-number--controls-${controlsPosition}`,
      innerButtons && 'cd-input-number--inner',
      prefix != null && 'cd-input-number--has-prefix',
      suffix != null && 'cd-input-number--has-suffix',
      disabled && 'cd-input-number--disabled',
      borderless && 'cd-input-number--borderless',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<div class={cls} {style} aria-invalid={status === 'error' || undefined}>
  {#if prefix != null}
    <span class="cd-input-number__affix cd-input-number__prefix">
      {#if prefixSnippet}{@render prefixSnippet()}{:else}{prefix}{/if}
    </span>
  {/if}

  <input
    use:inputActions
    class="cd-input-number__native"
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
    aria-invalid={status === 'error' || undefined}
    aria-disabled={disabled || undefined}
    aria-readonly={readonly || undefined}
    oninput={handleInput}
    onblur={handleBlur}
    onkeydown={handleKeydown}
  />

  {#if suffix != null}
    <span class="cd-input-number__affix cd-input-number__suffix">
      {#if suffixSnippet}{@render suffixSnippet()}{:else}{suffix}{/if}
    </span>
  {/if}

  {#if canClear}
    <button
      type="button"
      class="cd-input-number__clear"
      tabindex="-1"
      aria-label={loc().t('InputNumber.clear')}
      onmousedown={(e) => e.preventDefault()}
      onclick={clearValue}
    >
      {#if clearIcon}
        {@render clearIcon()}
      {:else}
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
          <path
            fill="currentColor"
            d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm2.5 9.1-1.4 1.4L8 9.4 6.5 11l-1.4-1.4L6.6 8 5.1 6.5 6.5 5.1 8 6.6 9.5 5.1l1.4 1.4L9.4 8l1.1 1.1Z"
          />
        </svg>
      {/if}
    </button>
  {/if}

  {#if controls && !hideButtons}
    <span class="cd-input-number__actions">
      <button
        type="button"
        class="cd-input-number__action cd-input-number__increment"
        tabindex="-1"
        aria-label={loc().t('InputNumber.increase')}
        disabled={disabled || readonly || atMax}
        onmousedown={(e) => startHold(1, e)}
        onmouseup={stopHold}
        onmouseleave={stopHold}
      >
        <svg viewBox="0 0 16 16" width="10" height="10" aria-hidden="true" focusable="false">
          <path fill="currentColor" d="M8 4 3 10h10L8 4Z" />
        </svg>
      </button>
      <button
        type="button"
        class="cd-input-number__action cd-input-number__decrement"
        tabindex="-1"
        aria-label={loc().t('InputNumber.decrease')}
        disabled={disabled || readonly || atMin}
        onmousedown={(e) => startHold(-1, e)}
        onmouseup={stopHold}
        onmouseleave={stopHold}
      >
        <svg viewBox="0 0 16 16" width="10" height="10" aria-hidden="true" focusable="false">
          <path fill="currentColor" d="M3 6h10L8 12 3 6Z" />
        </svg>
      </button>
    </span>
  {/if}
</div>

<style>
  .cd-input-number {
    display: inline-flex;
    align-items: stretch;
    inline-size: 100%;
    block-size: var(--cd-height-input-default);
    background: var(--cd-input-color-bg);
    color: var(--cd-input-color-text);
    border: 1px solid var(--cd-input-border);
    border-radius: var(--cd-input-radius);
    font-size: var(--cd-input-font-size);
    overflow: hidden;
    transition: border-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-input-number--small {
    block-size: var(--cd-height-input-small);
    font-size: var(--cd-font-size-small);
  }
  .cd-input-number--large {
    block-size: var(--cd-height-input-large);
    font-size: var(--cd-font-size-header-6);
  }
  .cd-input-number:focus-within {
    border-color: var(--cd-input-border-active);
    box-shadow: var(--cd-focus-ring);
  }
  .cd-input-number--warning {
    border-color: var(--cd-input-border-warning);
  }
  .cd-input-number--error {
    border-color: var(--cd-input-border-error);
  }
  .cd-input-number--disabled {
    background: var(--cd-color-fill-0);
    color: var(--cd-color-text-3);
    cursor: not-allowed;
  }
  .cd-input-number--borderless {
    border-color: transparent;
    background: transparent;
    box-shadow: none;
  }
  .cd-input-number--borderless:focus-within {
    border-color: transparent;
    box-shadow: none;
  }
  .cd-input-number__clear {
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
  .cd-input-number__clear:hover {
    color: var(--cd-color-text-0);
  }
  .cd-input-number__clear:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-input-number__native {
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
  .cd-input-number--has-prefix .cd-input-number__native {
    padding-inline-start: var(--cd-spacing-extra-tight);
  }
  .cd-input-number--has-suffix .cd-input-number__native {
    padding-inline-end: var(--cd-spacing-extra-tight);
  }
  .cd-input-number__native::placeholder {
    color: var(--cd-input-color-placeholder);
  }
  .cd-input-number__affix {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
    color: var(--cd-color-text-2);
    white-space: nowrap;
    user-select: none;
  }
  .cd-input-number__prefix {
    padding-inline-start: var(--cd-input-padding-x);
  }
  .cd-input-number__suffix {
    padding-inline-end: var(--cd-input-padding-x);
  }
  .cd-input-number__native:disabled {
    cursor: not-allowed;
  }
  /* 步进器：对齐 Semi inputNumber，实底 bg-2 按钮 + 描边 + small 圆角，按钮间留 1px 缝 */
  .cd-input-number__actions {
    display: flex;
    flex-direction: column;
    flex: 0 0 auto;
    inline-size: var(--cd-input-number-step-width);
    gap: var(--cd-width-input-number-button-border); /* Semi button-border 1px 缝 */
    margin-inline-start: var(--cd-spacing-input-number-button-marginleft); /* Semi button-marginLeft */
  }
  .cd-input-number__action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 1 1 50%;
    min-block-size: 0;
    padding: 0;
    border: var(--cd-width-input-number-button-border) solid var(--cd-input-number-step-border);
    border-radius: var(--cd-input-number-step-radius);
    background: var(--cd-input-number-step-bg);
    color: var(--cd-input-number-step-color);
    cursor: pointer;
    transition:
      background-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard),
      border-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-input-number__action:hover:not(:disabled) {
    background: var(--cd-input-number-step-bg-hover);
    border-color: var(--cd-color-input-number-button-border-hover);
  }
  .cd-input-number__action:active:not(:disabled) {
    background: var(--cd-input-number-step-bg-active);
  }
  .cd-input-number__action:disabled {
    color: var(--cd-input-number-step-color-disabled);
    background: var(--cd-input-number-step-bg-disabled);
    cursor: not-allowed;
  }
  /* --- controlsPosition="sides"：减/输入/加 横向排布，按钮分居两侧 --- */
  .cd-input-number--controls-sides {
    position: relative;
  }
  .cd-input-number--controls-sides .cd-input-number__actions {
    flex-direction: row;
    inline-size: auto;
    border-inline-start: none;
    order: 2;
  }
  .cd-input-number--controls-sides .cd-input-number__decrement {
    order: 0;
    border-block-end: none;
    border-inline-end: 1px solid var(--cd-input-border);
  }
  .cd-input-number--controls-sides .cd-input-number__increment {
    order: 3;
    border-block-end: none;
    border-inline-start: 1px solid var(--cd-input-border);
  }
  .cd-input-number--controls-sides .cd-input-number__native {
    order: 1;
    text-align: center;
  }
  .cd-input-number--controls-sides .cd-input-number__action {
    inline-size: var(--cd-spacing-loose, 28px);
  }
  /* sides 布局：前缀紧贴减号右、后缀紧贴加号左，包裹中央输入。 */
  .cd-input-number--controls-sides .cd-input-number__prefix {
    order: 1;
  }
  .cd-input-number--controls-sides .cd-input-number__suffix {
    order: 1;
  }

  /* --- innerButtons：按钮悬浮于右内侧，hover/focus 显形 --- */
  .cd-input-number--inner {
    position: relative;
  }
  .cd-input-number--inner .cd-input-number__actions {
    position: absolute;
    inset-block: 1px;
    inset-inline-end: 1px;
    border-inline-start: none;
    background: var(--cd-input-color-bg);
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-input-number--inner:hover .cd-input-number__actions,
  .cd-input-number--inner:focus-within .cd-input-number__actions {
    opacity: 1;
    pointer-events: auto;
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-input-number,
    .cd-input-number__action,
    .cd-input-number--inner .cd-input-number__actions {
      transition: none;
    }
  }
</style>
