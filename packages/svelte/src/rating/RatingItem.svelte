<!--
  RatingItem — 单颗评分星（严格对齐 Semi rating/item.tsx）。
  li.cd-rating-star > div.cd-rating-star-wrapper > first(半星层，allowHalf 且非空项时渲染) + second(整星层)。
  两层各 role="radio"（roving tabindex，由父组件 Rating.svelte 依据 value 计算 tabindex）。
  index==count 为空评分项（size 强制 0，承载「0 分」焦点/停靠点，不渲染可见内容）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { IconStar } from '@chenzy-design/icons';

  type Size = 'small' | 'default' | number;
  type CharCtx = { index: number; value: number };
  type Character = string | Snippet<[CharCtx]>;

  interface Props {
    index: number;
    count: number;
    prefixCls: string;
    allowHalf: boolean;
    value: number;
    disabled: boolean;
    character?: Character | undefined;
    focused: boolean;
    size: Size;
    ariaLabelPrefix: string;
    'aria-describedby'?: string | undefined;
    onHover: (index: number, e: MouseEvent & { currentTarget: HTMLElement }) => void;
    onClick: (index: number, e: MouseEvent | KeyboardEvent, currentTarget: HTMLElement) => void;
    onFocus?: ((e: FocusEvent) => void) | undefined;
    onBlur?: ((e: FocusEvent) => void) | undefined;
  }

  let {
    index,
    count,
    prefixCls,
    allowHalf,
    value,
    disabled,
    character,
    size,
    ariaLabelPrefix,
    'aria-describedby': ariaDescribedby,
    onHover,
    onClick,
    onFocus,
    onBlur,
  }: Props = $props();

  const isSnippet = (c: unknown): c is Snippet<[CharCtx]> => typeof c === 'function';

  let firstStarEl = $state<HTMLElement | undefined>(undefined);
  let secondStarEl = $state<HTMLElement | undefined>(undefined);
  let liEl = $state<HTMLLIElement | undefined>(undefined);

  export function getDomNode(): HTMLLIElement | undefined {
    return liEl;
  }

  /** 命令式聚焦本项对应星（对齐 Semi item.tsx starFocus）：half 步进落在半星则聚焦 first，否则 second。 */
  export function starFocus(preventScroll?: boolean): void {
    const opts = preventScroll === undefined ? undefined : { preventScroll };
    if (value - index === 0.5) {
      firstStarEl?.focus(opts);
    } else {
      secondStarEl?.focus(opts);
    }
  }

  const starValue = $derived(index + 1);
  const diff = $derived(starValue - value);
  const isHalf = $derived(allowHalf && diff < 1 && diff > 0);
  const firstWidth = $derived(1 - diff);
  const isFull = $derived(starValue <= value);
  const isCustomSize = $derived(typeof size === 'number');
  const isEmpty = $derived(index === count);
  const sizeClass = $derived(!isCustomSize ? `${prefixCls}-${size}` : undefined);
  const sizeStyle = $derived(
    isCustomSize ? `width:${size}px;height:${size}px;font-size:${size}px` : undefined,
  );
  const iconSize = $derived(isCustomSize ? 'inherit' : size === 'small' ? 'default' : 'extra-large');

  const starCls = $derived(
    [prefixCls, isHalf && `${prefixCls}-half`, isFull && `${prefixCls}-full`, sizeClass]
      .filter(Boolean)
      .join(' '),
  );
  const starWrapCls = $derived(
    [`${prefixCls}-wrapper`, disabled && `${prefixCls}-disabled`].filter(Boolean).join(' '),
  );

  const ariaSetSize = $derived(allowHalf ? count * 2 + 1 : count + 1);

  function handleClick(e: MouseEvent, currentTarget: HTMLElement) {
    if (disabled) return;
    onClick(index, e, currentTarget);
  }
  function handleHover(e: MouseEvent & { currentTarget: HTMLElement }) {
    if (disabled) return;
    onHover(index, e);
  }
  function handleKeydown(e: KeyboardEvent, currentTarget: HTMLElement) {
    if (e.key === 'Enter') onClick(index, e, currentTarget);
  }
</script>

<li
  class={starCls}
  style={sizeStyle}
  data-index={index}
  data-empty={isEmpty ? '' : undefined}
  bind:this={liEl}
>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div
    class={starWrapCls}
    role="presentation"
    onclick={disabled ? undefined : (e) => handleClick(e, e.currentTarget as HTMLElement)}
    onkeydown={disabled ? undefined : (e) => handleKeydown(e, e.currentTarget as HTMLElement)}
    onmousemove={disabled ? undefined : (e) => handleHover(e as MouseEvent & { currentTarget: HTMLElement })}
  >
    {#if allowHalf && !isEmpty}
      <div
        bind:this={firstStarEl}
        class="{prefixCls}-first cd-rating-no-focus"
        data-star="first"
        role="radio"
        aria-checked={value === index + 0.5}
        aria-posinset={2 * index + 1}
        aria-setsize={ariaSetSize}
        aria-disabled={disabled || undefined}
        aria-label={`${index + 0.5} ${ariaLabelPrefix}s`}
        aria-labelledby={ariaDescribedby}
        aria-describedby={ariaDescribedby}
        tabindex={!disabled && value === index + 0.5 ? 0 : -1}
        style={`width:${firstWidth * 100}%`}
        onfocus={onFocus}
        onblur={onBlur}
      >
        {#if typeof character === 'string'}
          <span class="cd-rating-char">{character}</span>
        {:else if isSnippet(character)}
          {@render character({ index, value })}
        {:else}
          <IconStar size={iconSize} style="display:block" aria-hidden="true" />
        {/if}
      </div>
    {/if}
    <div
      bind:this={secondStarEl}
      class="{prefixCls}-second cd-rating-no-focus"
      data-star="second"
      role="radio"
      aria-checked={isEmpty ? value === 0 : value === index + 1}
      aria-posinset={allowHalf ? 2 * (index + 1) : index + 1}
      aria-setsize={ariaSetSize}
      aria-disabled={disabled || undefined}
      aria-label={`${isEmpty ? 0 : index + 1} ${ariaLabelPrefix}${index === 0 ? '' : 's'}`}
      aria-labelledby={ariaDescribedby}
      aria-describedby={ariaDescribedby}
      tabindex={!disabled && (value === index + 1 || (isEmpty && value === 0)) ? 0 : -1}
      onfocus={isEmpty && !disabled ? onFocus : undefined}
      onblur={isEmpty && !disabled ? onBlur : undefined}
    >
      {#if isEmpty}
        <!-- 空项不渲染可见内容，仅作 0 分焦点/radio 停靠点 -->
      {:else if typeof character === 'string'}
        <span class="cd-rating-char">{character}</span>
      {:else if isSnippet(character)}
        {@render character({ index, value })}
      {:else}
        <IconStar size={iconSize} style="display:block" aria-hidden="true" />
      {/if}
    </div>
  </div>
</li>

<style>
  /* 结构与 token 挂点对齐 Semi rating.scss（.cd-rating-star 层级）。本组件模板自渲染这些
     元素，选择器保持 scoped（非 :global），仅父组件 Rating.svelte 跨组件命中时才需 :global()。 */
  .cd-rating-star {
    position: relative;
    display: inline-block;
    margin: 0;
    padding: 0;
    color: inherit;
    cursor: pointer;
    transition: all 0.5s;
    transform: scale(var(--cd-transform-scale-rating));
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

  /* first/second 星层：不参与根 focus 环（对齐 Semi .semi-rating-no-focus）。 */
  .cd-rating-no-focus {
    outline: none;
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

  /* —— RTL（对齐 Semi rating/rtl.scss）——
     星之间的间距换边；半星遮罩 star-first 是绝对定位的左半块，
     RTL 下要贴到右侧（否则半星显示在错误的一半）。 */
  :global(.cd-rtl) .cd-rating-star:not(:last-child) {
    margin-right: 0;
    margin-left: var(--cd-spacing-rating-item-marginright);
  }
  :global(.cd-rtl) .cd-rating-star-first {
    left: auto;
    right: 0;
  }
</style>
