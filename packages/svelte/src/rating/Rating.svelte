<!--
  Rating — see specs/components/input/Rating.spec.md
  Star rating with half-star, hover preview, keyboard. APG slider pattern.
  Controlled / uncontrolled; variation only via onChange. hoverValue is local-only.
-->
<script lang="ts">
  type Size = 'small' | 'default' | 'large' | number;
  type Status = 'default' | 'warning' | 'error';

  interface Props {
    value?: number;
    defaultValue?: number;
    count?: number;
    allowHalf?: boolean;
    allowClear?: boolean;
    size?: Size;
    disabled?: boolean;
    readonly?: boolean;
    status?: Status;
    name?: string;
    ariaLabel?: string;
    onChange?: (v: number) => void;
  }

  let {
    value = $bindable(),
    defaultValue = 0,
    count = 5,
    allowHalf = false,
    allowClear = true,
    size = 'default',
    disabled = false,
    readonly = false,
    status = 'default',
    name,
    ariaLabel,
    onChange,
  }: Props = $props();

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

  function commit(next: number) {
    // Controlled: never write the prop; propagate via onChange only.
    if (!isControlled) inner = next;
    onChange?.(next);
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
    hoverValue = valueAt(index, isLeftHalf(e));
  }

  function handleLeave() {
    hoverValue = null;
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
      default:
        return;
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

  const valueText = $derived(`${current} / ${count}`);
</script>

<div
  class={cls}
  role="slider"
  aria-label={ariaLabel}
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
      role="presentation"
      onmousemove={(e) => handleMove(i, e)}
      onclick={(e) => handleClick(i, e)}
    >
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
    </span>
  {/each}
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
  @media (prefers-reduced-motion: reduce) {
    .cd-rating__fg {
      transition: none;
    }
  }
</style>
