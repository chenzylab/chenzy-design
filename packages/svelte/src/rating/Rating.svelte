<!--
  Rating — 评分（破坏性对齐 Semi Design semi-ui/rating）。
  架构对齐 Semi：<ul> 根 + 每颗星一个 <li class="cd-rating-star">，li 内 wrapper > first(半星层) + second(整星层)，
  两层各 role="radio"（roving tabindex），非根 role="slider"。额外渲染 index==count 的空评分项（size 0）
  承载「0 分」焦点。半星靠 first 层定宽裁剪 + 定位叠放（对齐 item.tsx）。
  键盘：仅方向键（→/↑ 加、←/↓ 减，RTL 镜像；对齐 Semi foundation.handleKeyDown，无 Home/End/数字键超集）。
  tooltips：复用本库 Tooltip（trigger="custom" + visible 由 hoverValue 联动，对齐 Semi index.tsx:296-303）。
  受控：value 受控只回调不回写（controlled-props-no-bind-no-writeback）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { tick } from 'svelte';
  import { IconStar } from '@chenzy-design/icons';
  import { useLocale } from '../locale-provider/index.js';
  import Tooltip from '../tooltip/Tooltip.svelte';

  type Size = 'small' | 'default' | number;
  type CharCtx = { index: number; value: number };
  // 自定义字符：字符串（统一字符）或 Snippet（按 {index,value} 渲染节点）。对齐 Semi ReactNode。
  type Character = string | Snippet<[CharCtx]>;

  interface Props {
    value?: number;
    defaultValue?: number;
    count?: number;
    allowHalf?: boolean;
    allowClear?: boolean;
    /** 自定义字符/图标：字符串 或 带 {index,value} 的 Snippet。不传则默认星形。 */
    character?: Character;
    size?: Size;
    disabled?: boolean;
    /** 逐项提示文案（复用 Tooltip 浮层），长度应等于 count。 */
    tooltips?: string[];
    /** 挂载时聚焦（对齐 Semi autoFocus）。 */
    autoFocus?: boolean;
    /** 根元素 id。 */
    id?: string;
    /** 根 tabIndex（对齐 Semi，默认 -1；根仅作 focus 转发容器，实际焦点落在星 radio 上）。 */
    tabIndex?: number;
    style?: string;
    class?: string;
    /** autoFocus / focus() 聚焦时是否阻止滚动（对齐 Semi preventScroll）。 */
    preventScroll?: boolean;
    // —— aria 直传（对齐 Semi index.tsx:17-22） ——
    'aria-label'?: string;
    'aria-labelledby'?: string;
    'aria-describedby'?: string;
    'aria-errormessage'?: string;
    'aria-invalid'?: boolean;
    'aria-required'?: boolean;
    onChange?: (value: number) => void;
    onHoverChange?: (value: number) => void;
    onClick?: (e: MouseEvent | KeyboardEvent, index: number) => void;
    onFocus?: (e: FocusEvent) => void;
    onBlur?: (e: FocusEvent) => void;
    onKeyDown?: (e: KeyboardEvent) => void;
  }

  let {
    value = undefined,
    defaultValue = 0,
    count = 5,
    allowHalf = false,
    allowClear = true,
    character,
    size = 'default',
    disabled = false,
    tooltips,
    autoFocus = false,
    id,
    tabIndex = -1,
    style,
    class: className,
    preventScroll,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    'aria-errormessage': ariaErrormessage,
    'aria-invalid': ariaInvalid,
    'aria-required': ariaRequired,
    onChange,
    onHoverChange,
    onClick,
    onFocus,
    onBlur,
    onKeyDown,
  }: Props = $props();

  const loc = useLocale();

  const isSnippet = (c: unknown): c is Snippet<[CharCtx]> => typeof c === 'function';

  const isControlled = $derived(value !== undefined);
  // 非受控初值：函数包裹读取，避免 state_referenced_locally 告警。
  const getInitialValue = () => defaultValue;
  let inner = $state(getInitialValue());
  const current = $derived(isControlled ? (value ?? 0) : inner);

  // hoverValue：纯本地预览，undefined = 无 hover（对齐 Semi state.hoverValue）。
  let hoverValue = $state<number | undefined>(undefined);
  const displayValue = $derived(hoverValue === undefined ? current : hoverValue);

  // 空评分项聚焦可见态（对齐 Semi emptyStarFocusVisible），仅供根 focus 环。
  let emptyStarFocusVisible = $state(false);

  const minStep = $derived(allowHalf ? 0.5 : 1);

  const isCustomSize = $derived(typeof size === 'number');
  const sizePx = $derived(typeof size === 'number' ? `${size}px` : undefined);
  const sizeClass = $derived(typeof size === 'number' ? undefined : `cd-rating-star-${size}`);

  // aria 前缀：aria-label > 字符串 character > 'star'（对齐 Semi getAriaLabelPrefix）。
  const ariaLabelPrefix = $derived(
    ariaLabel ?? (typeof character === 'string' ? character : 'star'),
  );
  const rootAriaLabel = $derived(
    ariaLabel ??
      loc().t('Rating.valueText', {
        value: loc().formatNumber(current),
        count: loc().formatNumber(count),
      }),
  );

  function commit(next: number) {
    if (!isControlled) inner = next;
    onChange?.(next);
    announce(next);
  }

  // 值变更播报 live region（命令式写入，render 期只读 $state）。
  let announceText = $state('');
  function announce(next: number) {
    announceText = '';
    queueMicrotask(() => {
      announceText =
        next === 0
          ? loc().t('Rating.cleared')
          : loc().t('Rating.valueText', {
              value: loc().formatNumber(next),
              count: loc().formatNumber(count),
            });
    });
  }

  // 指针落在星左/右半 → 半星判定（对齐 foundation.getStarValue）。
  function starValueAt(index: number, e: { currentTarget: HTMLElement; clientX: number }): number {
    let v = index + 1;
    if (allowHalf) {
      const rect = e.currentTarget.getBoundingClientRect();
      const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
      const offset = e.clientX - rect.left;
      const leftHalf = offset < rect.width / 2;
      if (rtl ? !leftHalf : leftHalf) v -= 0.5;
    }
    return v;
  }

  function handleHover(index: number, e: MouseEvent & { currentTarget: HTMLElement }) {
    if (disabled) return;
    const next = starValueAt(index, e);
    if (next !== hoverValue) {
      hoverValue = next;
      onHoverChange?.(next);
    }
  }

  function handleLeave() {
    if (disabled) return;
    // 移出：hoverValue 复位 undefined，回调 undefined（对齐 Semi handleMouseLeave/notifyHoverChange）。
    hoverValue = undefined;
    onHoverChange?.(undefined as unknown as number);
  }

  function handleClick(index: number, e: MouseEvent & { currentTarget: HTMLElement }) {
    if (disabled) return;
    const next = starValueAt(index, e);
    const isReset = allowClear ? next === current : false;
    commit(isReset ? 0 : next);
    onClick?.(e, index);
    hoverValue = undefined;
  }

  // 空项（index==count）回车/点击 → 置 0。
  function handleEmptyActivate(e: MouseEvent | KeyboardEvent) {
    if (disabled) return;
    commit(0);
    onClick?.(e, count);
    hoverValue = undefined;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (disabled) return;
    const rtl = rootEl ? getComputedStyle(rootEl).direction === 'rtl' : false;
    const step = minStep;
    let temp: number | undefined;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      temp = current + (rtl ? -step : step);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      temp = current + (rtl ? step : -step);
    }
    if (temp === undefined) return;
    let next: number;
    if (temp > count) next = 0;
    else if (temp < 0) next = count;
    else next = temp;
    e.preventDefault();
    hoverValue = undefined;
    commit(next);
    tick().then(() => focusStarFor(next));
  }

  // —— 焦点管理（roving tabindex）——
  let rootEl = $state<HTMLUListElement | undefined>(undefined);

  // 定位到某分值对应的可聚焦 radio 元素并聚焦（对齐 Semi changeFocusStar）。
  function focusStarFor(v: number) {
    if (!rootEl) return;
    const index = Math.ceil(v) - 1;
    const opts = preventScroll === undefined ? undefined : { preventScroll };
    if (index < 0) {
      // 0 分 → 空项的 second 星。
      const el = rootEl.querySelector<HTMLElement>(`[data-empty] [data-star="second"]`);
      el?.focus(opts);
    } else {
      const isHalf = v * 10 % 10 === 5;
      const star = allowHalf && isHalf ? 'first' : 'second';
      const el = rootEl.querySelector<HTMLElement>(`[data-index="${index}"] [data-star="${star}"]`);
      el?.focus(opts);
    }
  }

  /** 命令式聚焦（对齐 Semi focus()）：聚焦当前分值对应星，空态聚焦空项。 */
  export function focus(): void {
    if (disabled) return;
    focusStarFor(current);
  }

  /** 命令式失焦（对齐 Semi blur()）。 */
  export function blur(): void {
    if (disabled) return;
    (rootEl?.querySelector<HTMLElement>(':focus') ?? document.activeElement as HTMLElement | null)?.blur?.();
  }

  // autoFocus：挂载后聚焦一次（对齐 Semi foundation.init）。
  $effect(() => {
    if (autoFocus && !disabled && rootEl) {
      tick().then(() => focusStarFor(current));
    }
  });

  // 每颗星填充：0 空 / 0.5 半 / 1 满（基于 displayValue，含 hover 预览）。
  function fillFor(index: number): number {
    const starValue = index + 1;
    const diff = starValue - displayValue;
    if (diff <= 0) return 1;
    if (allowHalf && diff < 1) return 0.5;
    return 0;
  }

  // —— IconStar 尺寸映射（对齐 item.tsx:176）——
  const iconSize = $derived(
    isCustomSize ? 'inherit' : size === 'small' ? 'default' : 'extra-large',
  );

  // tooltip 联动：hoverValue-1 === index 时显示该项 tooltip（对齐 index.tsx:298）。
  function tipVisible(index: number): boolean {
    return hoverValue !== undefined && hoverValue - 1 === index;
  }
</script>

<!--
  svelte-ignore a11y_no_noninteractive_element_interactions, a11y_no_noninteractive_tabindex,
  a11y_role_supports_aria_props_implicit
-->
<ul
  bind:this={rootEl}
  {id}
  class={['cd-rating', disabled && 'cd-rating-disabled', emptyStarFocusVisible && 'cd-rating-focus', className]
    .filter(Boolean)
    .join(' ')}
  style={[sizePx ? `--cd-rating-size-active: ${sizePx}` : '', style ?? ''].filter(Boolean).join(';') || undefined}
  aria-label={rootAriaLabel}
  aria-labelledby={ariaLabelledby}
  aria-describedby={ariaDescribedby}
  aria-errormessage={ariaErrormessage}
  aria-invalid={ariaInvalid}
  aria-required={ariaRequired}
  tabindex={disabled ? -1 : tabIndex}
  onmouseleave={handleLeave}
  onfocus={(e) => onFocus?.(e)}
  onblur={(e) => onBlur?.(e)}
  onkeydown={(e) => {
    handleKeydown(e);
    onKeyDown?.(e);
  }}
>
  {#each Array(count + 1) as _, i (i)}
    {@const isEmpty = i === count}
    {@const fill = fillFor(i)}
    {@const isHalf = fill === 0.5}
    {@const isFull = fill === 1}
    {@const starValue = i + 1}
    {@const firstWidth = Math.max(0, Math.min(1, 1 - (starValue - displayValue))) * 100}
    {@const ariaSetSize = allowHalf ? count * 2 + 1 : count + 1}
    {#snippet star()}
      <li
        class={['cd-rating-star', !isCustomSize && !isEmpty && sizeClass, isHalf && 'cd-rating-star-half', isFull && 'cd-rating-star-full']
          .filter(Boolean)
          .join(' ')}
        data-index={i}
        data-empty={isEmpty ? '' : undefined}
        style={isCustomSize && !isEmpty ? `width:${sizePx};height:${sizePx};font-size:${sizePx}` : undefined}
      >
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div
          class={['cd-rating-star-wrapper', disabled && 'cd-rating-star-disabled'].filter(Boolean).join(' ')}
          role="presentation"
          onmousemove={disabled || isEmpty ? undefined : (e) => handleHover(i, e)}
          onclick={disabled ? undefined : isEmpty ? (e) => handleEmptyActivate(e) : (e) => handleClick(i, e)}
        >
          {#if allowHalf && !isEmpty}
            <!-- 半星层（first）：定宽裁剪，role=radio -->
            <div
              class="cd-rating-star-first cd-rating-no-focus"
              data-star="first"
              role="radio"
              aria-checked={current === i + 0.5}
              aria-posinset={2 * i + 1}
              aria-setsize={ariaSetSize}
              aria-disabled={disabled || undefined}
              aria-label={`${i + 0.5} ${ariaLabelPrefix}s`}
              tabindex={!disabled && current === i + 0.5 ? 0 : -1}
              style={`width:${firstWidth}%`}
            >
              {#if typeof character === 'string'}
                <span class="cd-rating-char">{character}</span>
              {:else if isSnippet(character)}
                {@render character({ index: i, value: displayValue })}
              {:else}
                <IconStar size={iconSize} style="display:block" aria-hidden="true" />
              {/if}
            </div>
          {/if}
          <!-- 整星层（second）：role=radio；空项承载 0 分焦点 -->
          <div
            class="cd-rating-star-second cd-rating-no-focus"
            data-star="second"
            role="radio"
            aria-checked={isEmpty ? current === 0 : current === i + 1}
            aria-posinset={allowHalf ? 2 * (i + 1) : i + 1}
            aria-setsize={ariaSetSize}
            aria-disabled={disabled || undefined}
            aria-label={`${isEmpty ? 0 : i + 1} ${ariaLabelPrefix}${i === 0 && !isEmpty ? '' : 's'}`}
            tabindex={!disabled && ((current === i + 1) || (isEmpty && current === 0)) ? 0 : -1}
            onkeydown={isEmpty
              ? (e) => {
                  if (e.key === 'Enter') handleEmptyActivate(e);
                }
              : undefined}
          >
            {#if isEmpty}
              <!-- 空项不渲染可见内容，仅作 0 分焦点/radio 停靠点 -->
            {:else if typeof character === 'string'}
              <span class="cd-rating-char">{character}</span>
            {:else if isSnippet(character)}
              {@render character({ index: i, value: displayValue })}
            {:else}
              <IconStar size={iconSize} style="display:block" aria-hidden="true" />
            {/if}
          </div>
        </div>
      </li>
    {/snippet}

    {#if tooltips && !isEmpty}
      <Tooltip trigger="custom" visible={tipVisible(i)} content={tooltips[i] ?? ''}>
        {@render star()}
      </Tooltip>
    {:else}
      {@render star()}
    {/if}
  {/each}
</ul>

<!-- 值变更播报 live region：视觉隐藏，仅供辅助技术读取。 -->
<div class="cd-rating-sr-live" role="status" aria-live="polite" aria-atomic="true">
  {announceText}
</div>

<style>
  /* 结构与 token 挂点对齐 Semi rating.scss。 */
  .cd-rating {
    display: inline-block;
    margin: var(--cd-spacing-rating-margin);
    padding: var(--cd-spacing-rating-padding);
    color: var(--cd-color-rating-icon-active);
    list-style: none;
    outline: none;
    border-radius: 3px;
    cursor: pointer;
  }
  .cd-rating-focus {
    outline: var(--cd-width-rating-outline-focus) solid var(--cd-color-rating-outline-focus);
  }
  .cd-rating-no-focus {
    outline: none;
  }
  .cd-rating-disabled {
    cursor: default;
  }
  .cd-rating-disabled .cd-rating-star {
    cursor: default;
  }
  .cd-rating-disabled .cd-rating-star:hover {
    transform: scale(1);
  }

  .cd-rating-star {
    position: relative;
    display: inline-block;
    margin: 0;
    padding: 0;
    color: inherit;
    cursor: pointer;
    transition: all 0.5s;
  }
  .cd-rating-star:not(:last-child) {
    margin-right: var(--cd-spacing-rating-item-marginright);
  }
  .cd-rating-star > div:hover,
  .cd-rating-star > div:focus {
    transform: scale(1.1);
  }
  .cd-rating-star > div.cd-rating-star-disabled {
    transform: none;
  }

  .cd-rating-star-small {
    width: var(--cd-width-rating-item-small);
    height: var(--cd-width-rating-item-small);
    font-size: var(--cd-font-rating-item-small-fontsize);
  }
  .cd-rating-star-default {
    width: var(--cd-width-rating-item-default);
    height: var(--cd-width-rating-item-default);
    font-size: var(--cd-font-rating-item-default-fontsize);
  }

  .cd-rating-star-wrapper {
    position: relative;
    overflow: hidden;
    border-radius: 3px;
    width: 100%;
    height: 100%;
  }

  .cd-rating-star-first,
  .cd-rating-star-second {
    transition: color var(--cd-transition-duration-rating-color) var(--cd-transition-function-rating-color)
      var(--cd-transition-delay-rating-color);
    color: var(--cd-color-rating-bg-default);
    user-select: none;
  }
  .cd-rating-star-first {
    position: absolute;
    top: 0;
    left: 0;
    width: 50%;
    height: 100%;
    overflow: hidden;
    opacity: 0;
  }
  .cd-rating-star-half .cd-rating-star-first,
  .cd-rating-star-half .cd-rating-star-second {
    opacity: 1;
  }
  .cd-rating-star-half .cd-rating-star-first,
  .cd-rating-star-full .cd-rating-star-second {
    color: inherit;
  }

  /* 自定义字符（字符串）：以文本撑满星位居中。 */
  .cd-rating-char {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    line-height: 1;
    white-space: nowrap;
  }

  /* 视觉隐藏但对辅助技术可见。 */
  .cd-rating-sr-live {
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
</style>
