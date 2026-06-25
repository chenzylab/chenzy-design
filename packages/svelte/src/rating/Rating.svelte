<!--
  Rating — see specs/components/input/Rating.spec.md
  Star rating with half-star, hover preview, keyboard. APG slider pattern.
  Controlled / uncontrolled; variation only via onChange. hoverValue is local-only.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useId } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';

  type Size = 'small' | 'default' | 'large' | number;
  type Status = 'default' | 'warning' | 'error';
  type ItemState = 'empty' | 'half' | 'full';
  type CharCtx = { index: number; state: ItemState; value: number };
  // 自定义字符：字符串（统一字符）或 Snippet（按 {index,state,value} 渲染不同节点，
  // 取代 spec 中的 (index,state)=>node 函数形式——Svelte 5 用带参 Snippet 表达）。
  type Character = string | Snippet<[CharCtx]>;

  interface Props {
    value?: number;
    defaultValue?: number;
    count?: number;
    allowHalf?: boolean;
    allowClear?: boolean;
    /** 自定义字符/图标：字符串 或 带 {index,state,value} 的 Snippet。不传则默认星形。 */
    character?: Character;
    size?: Size;
    disabled?: boolean;
    readonly?: boolean;
    status?: Status;
    /** 逐项提示文案（native title），长度应等于 count。 */
    tooltips?: string[];
    /** 挂载时聚焦。 */
    autoFocus?: boolean;
    name?: string;
    /** 根元素 id，关联 aria；不传自动生成。 */
    id?: string;
    ariaLabel?: string;
    onChange?: (v: number) => void;
    onHoverChange?: (v: number) => void;
  }

  let {
    value = $bindable(),
    defaultValue = 0,
    count = 5,
    allowHalf = false,
    allowClear = true,
    character,
    size = 'default',
    disabled = false,
    readonly = false,
    status = 'default',
    tooltips,
    autoFocus = false,
    name,
    id,
    ariaLabel,
    onChange,
    onHoverChange,
  }: Props = $props();

  const loc = useLocale();
  const autoId = useId('cd-rating');
  const rootId = $derived(id ?? autoId);

  const isSnippet = (c: unknown): c is Snippet<[CharCtx]> => typeof c === 'function';

  const isControlled = $derived(value !== undefined);
  let inner = $state(getInitialValue());
  const current = $derived(isControlled ? (value ?? 0) : inner);

  function getInitialValue(): number {
    return defaultValue;
  }

  // hoverValue is purely local preview state; null means "no hover".
  let hoverValue = $state<number | null>(null);
  const displayValue = $derived(hoverValue ?? current);

  const interactive = $derived(!disabled && !readonly);
  const minStep = $derived(allowHalf ? 0.5 : 1);

  const sizePx = $derived(typeof size === 'number' ? `${size}px` : undefined);
  const sizeClass = $derived(typeof size === 'number' ? 'cd-rating--custom' : `cd-rating--${size}`);

  // Per-star fill: 0 = empty, 0.5 = half, 1 = full.
  function fillFor(index: number): number {
    const starValue = index + 1;
    if (displayValue >= starValue) return 1;
    if (displayValue >= starValue - 0.5) return 0.5;
    return 0;
  }

  // 三态语义（供 character Snippet 上下文）：纯派生函数（红线 #2）。
  function stateFor(index: number): ItemState {
    const fill = fillFor(index);
    return fill === 1 ? 'full' : fill === 0.5 ? 'half' : 'empty';
  }

  function commit(next: number) {
    // Controlled: never write the prop; propagate via onChange only.
    if (!isControlled) inner = next;
    onChange?.(next);
    announce(next);
  }

  // 值变更播报 live region（命令式写入，render 期只读 $state）。
  let announceText = $state('');
  function announce(next: number) {
    announceText = '';
    queueMicrotask(() => {
      announceText = next === 0 ? loc().t('Rating.cleared') : textFor(next);
    });
  }

  function valueAt(index: number, isHalf: boolean): number {
    return allowHalf && isHalf ? index + 0.5 : index + 1;
  }

  function isLeftHalf(e: { currentTarget: HTMLElement; clientX: number }): boolean {
    if (!allowHalf) return false;
    const rect = e.currentTarget.getBoundingClientRect();
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const offset = e.clientX - rect.left;
    const leftHalf = offset < rect.width / 2;
    return rtl ? !leftHalf : leftHalf;
  }

  function handleMove(index: number, e: MouseEvent & { currentTarget: HTMLElement }) {
    if (!interactive) return;
    const next = valueAt(index, isLeftHalf(e));
    if (next !== hoverValue) {
      hoverValue = next;
      onHoverChange?.(next);
    }
  }

  function handleLeave() {
    if (hoverValue !== null) {
      hoverValue = null;
      // 移出复位至当前 value（spec：hoverChange 移出时为当前 value）。
      onHoverChange?.(current);
    }
  }

  function handleClick(index: number, e: MouseEvent & { currentTarget: HTMLElement }) {
    if (!interactive) return;
    const next = valueAt(index, isLeftHalf(e));
    if (allowClear && next === current) {
      commit(0);
    } else {
      commit(next);
    }
    hoverValue = null;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!interactive) return;
    let next = current;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        next = Math.min(count, current + minStep);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        next = Math.max(0, current - minStep);
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = count;
        break;
      case 'Delete':
      case 'Backspace':
        if (allowClear) next = 0;
        break;
      default: {
        // 数字键 1–9：直接定位到对应整数分值（钳到 [1, count]）。
        if (e.key >= '1' && e.key <= '9') {
          const n = Number(e.key);
          if (n <= count) next = n;
          else return;
        } else {
          return;
        }
      }
    }
    e.preventDefault();
    if (next !== current) commit(next);
  }

  const cls = $derived(
    [
      'cd-rating',
      sizeClass,
      `cd-rating--${status}`,
      disabled && 'cd-rating--disabled',
      readonly && 'cd-rating--readonly',
    ]
      .filter(Boolean)
      .join(' '),
  );

  // aria-valuetext / 播报文案：i18n + Intl 数字格式（红线 #2 纯派生）。
  function textFor(v: number): string {
    if (v === 0) return loc().t('Rating.unrated');
    return loc().t('Rating.valueText', {
      value: loc().formatNumber(v),
      count: loc().formatNumber(count),
    });
  }
  const valueText = $derived(textFor(current));
  const resolvedAriaLabel = $derived(ariaLabel ?? loc().t('Rating.ariaLabel'));

  // 单项 title：tooltips[index]（长度可不足，缺省为 undefined）。
  function titleFor(index: number): string | undefined {
    return tooltips?.[index];
  }

  let rootEl: HTMLDivElement | undefined;
  // autoFocus：命令式聚焦一次（红线 #3，SSR 安全）。
  $effect(() => {
    if (autoFocus && rootEl && interactive) rootEl.focus();
  });
</script>

<div
  bind:this={rootEl}
  id={rootId}
  class={cls}
  role="slider"
  aria-label={resolvedAriaLabel}
  aria-valuenow={current}
  aria-valuemin={0}
  aria-valuemax={count}
  aria-valuetext={valueText}
  aria-disabled={disabled || undefined}
  aria-readonly={readonly || undefined}
  aria-invalid={status === 'error' || undefined}
  tabindex={interactive ? 0 : -1}
  style={sizePx ? `--cd-rating-size-active: ${sizePx}` : undefined}
  onkeydown={handleKeydown}
  onmouseleave={handleLeave}
>
  {#if name}<input type="hidden" {name} value={current} />{/if}

  {#each Array(count) as _, i (i)}
    {@const fill = fillFor(i)}
    <span
      class="cd-rating__star"
      class:cd-rating__star--full={fill === 1}
      class:cd-rating__star--half={fill === 0.5}
      class:cd-rating__star--char={character !== undefined}
      role="presentation"
      title={titleFor(i)}
      onmousemove={(e) => handleMove(i, e)}
      onclick={(e) => handleClick(i, e)}
    >
      {#if typeof character === 'string'}
        <!-- 自定义字符（字符串）：双层裁剪，与星形同结构。 -->
        <span class="cd-rating__icon cd-rating__icon--bg cd-rating__text">{character}</span>
        <span class="cd-rating__fg" style={`inline-size: ${fill * 100}%`}>
          <span class="cd-rating__icon cd-rating__icon--fg cd-rating__text">{character}</span>
        </span>
      {:else if isSnippet(character)}
        <!-- 自定义 Snippet：调用方按 {index,state,value} 自渲染（含半态）。 -->
        {@render character({ index: i, state: stateFor(i), value: displayValue })}
      {:else}
        <svg class="cd-rating__icon cd-rating__icon--bg" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 2.5 14.9 8.4 21.4 9.3 16.7 13.9 17.8 20.4 12 17.3 6.2 20.4 7.3 13.9 2.6 9.3 9.1 8.4 12 2.5Z"
          />
        </svg>
        <span class="cd-rating__fg" style={`inline-size: ${fill * 100}%`}>
          <svg class="cd-rating__icon cd-rating__icon--fg" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 2.5 14.9 8.4 21.4 9.3 16.7 13.9 17.8 20.4 12 17.3 6.2 20.4 7.3 13.9 2.6 9.3 9.1 8.4 12 2.5Z"
            />
          </svg>
        </span>
      {/if}
    </span>
  {/each}
</div>

<!-- 值变更播报 live region：视觉隐藏，仅供辅助技术读取（render 期只读 $state）。 -->
<div class="cd-rating__sr-live" role="status" aria-live="polite" aria-atomic="true">
  {announceText}
</div>

<style>
  .cd-rating {
    display: inline-flex;
    align-items: center;
    gap: var(--cd-rating-gap);
    color: var(--cd-rating-color-inactive);
    cursor: pointer;
    outline: none;
  }
  .cd-rating:focus-visible {
    box-shadow: var(--cd-focus-ring);
    border-radius: var(--cd-radius-1);
  }
  .cd-rating--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .cd-rating--readonly {
    cursor: default;
  }
  .cd-rating__star {
    position: relative;
    display: inline-flex;
    inline-size: var(--cd-rating-size-default);
    block-size: var(--cd-rating-size-default);
    color: var(--cd-rating-color-inactive);
  }
  .cd-rating--small .cd-rating__star {
    inline-size: var(--cd-rating-size-small);
    block-size: var(--cd-rating-size-small);
  }
  .cd-rating--large .cd-rating__star {
    inline-size: var(--cd-rating-size-large);
    block-size: var(--cd-rating-size-large);
  }
  .cd-rating--custom .cd-rating__star {
    inline-size: var(--cd-rating-size-active);
    block-size: var(--cd-rating-size-active);
  }
  .cd-rating__icon {
    inline-size: 100%;
    block-size: 100%;
    display: block;
  }
  .cd-rating__fg {
    position: absolute;
    inset-block: 0;
    inset-inline-start: 0;
    block-size: 100%;
    inline-size: 0;
    overflow: hidden;
    color: var(--cd-rating-color-active);
    transition: color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-rating__icon--fg {
    inline-size: var(--cd-rating-size-default);
    block-size: 100%;
  }
  .cd-rating--small .cd-rating__icon--fg {
    inline-size: var(--cd-rating-size-small);
  }
  .cd-rating--large .cd-rating__icon--fg {
    inline-size: var(--cd-rating-size-large);
  }
  .cd-rating--custom .cd-rating__icon--fg {
    inline-size: var(--cd-rating-size-active);
  }
  .cd-rating--warning .cd-rating__fg {
    color: var(--cd-color-warning);
  }
  .cd-rating--error .cd-rating__fg {
    color: var(--cd-color-danger);
  }
  /* 自定义字符（字符串）：以文本承载，撑满星位，垂直水平居中。 */
  .cd-rating__text {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: 100%;
    block-size: 100%;
    font-size: var(--cd-rating-size-default);
    line-height: 1;
    white-space: nowrap;
  }
  .cd-rating--small .cd-rating__text {
    font-size: var(--cd-rating-size-small);
  }
  .cd-rating--large .cd-rating__text {
    font-size: var(--cd-rating-size-large);
  }
  .cd-rating--custom .cd-rating__text {
    font-size: var(--cd-rating-size-active);
  }
  /* 视觉隐藏但对辅助技术可见（不可用 display:none / visibility:hidden）。 */
  .cd-rating__sr-live {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-rating__fg {
      transition: none;
    }
  }
</style>
