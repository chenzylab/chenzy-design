<!--
  Rating — 评分（破坏性对齐 Semi Design semi-ui/rating：index.tsx 主组件 + item.tsx 拆到 RatingItem.svelte）。
  架构对齐 Semi：<ul> 根 + 每颗星一个 RatingItem（<li class="cd-rating-star">，li 内 wrapper > first(半星层) +
  second(整星层)），两层各 role="radio"（roving tabindex），非根 role="slider"。额外渲染 index==count 的空评分项
  （size 0）承载「0 分」焦点。半星靠 first 层定宽裁剪 + 定位叠放（对齐 item.tsx）。
  键盘：仅方向键（→/↑ 加、←/↓ 减，RTL 镜像；对齐 Semi foundation.handleKeyDown，无 Home/End/数字键超集）。
  tooltips：复用本库 Tooltip（trigger="custom" + visible 由 hoverValue 联动，外包 span.cd-rating-star-outer，
  对齐 Semi index.tsx:296-303）。
  受控：value 受控只回调不回写（controlled-props-no-bind-no-writeback）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { tick } from 'svelte';
  import { useLocale } from '../locale-provider/index.js';
  import Tooltip from '../tooltip/Tooltip.svelte';
  import RatingItem from './RatingItem.svelte';

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
  // 根是否处于 focus 状态（对齐 Semi state.focused，经 adapter.notifyFocus/notifyBlur/notifyKeyDown
  // 维护；透传给每个 RatingItem 但 Semi item.tsx 自身未消费，属死 prop，本库忠实保留占位对齐）。
  let focused = $state(false);

  const minStep = $derived(allowHalf ? 0.5 : 1);

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
  function starValueAt(index: number, currentTarget: HTMLElement, clientX: number): number {
    let v = index + 1;
    if (allowHalf) {
      const rect = currentTarget.getBoundingClientRect();
      const rtl = getComputedStyle(currentTarget).direction === 'rtl';
      const offset = clientX - rect.left;
      const leftHalf = offset < rect.width / 2;
      if (rtl ? !leftHalf : leftHalf) v -= 0.5;
    }
    return v;
  }

  // 空项（index==count）无需半星判定，转发到统一的 click 处理（对齐 Semi getStarValue 的 index==count 分支）。
  function handleHover(index: number, e: MouseEvent & { currentTarget: HTMLElement }) {
    if (disabled) return;
    const next = starValueAt(index, e.currentTarget, e.clientX);
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

  function handleClick(index: number, e: MouseEvent | KeyboardEvent, currentTarget: HTMLElement) {
    if (disabled) return;
    if (index === count) {
      // 空项：回车/点击 → 置 0（对齐 Semi index.tsx onClick 对空项的处理）。
      commit(0);
      onClick?.(e, count);
      hoverValue = undefined;
      return;
    }
    const clientX = 'clientX' in e ? e.clientX : 0;
    const next = starValueAt(index, currentTarget, clientX);
    const isReset = allowClear ? next === current : false;
    commit(isReset ? 0 : next);
    onClick?.(e, index);
    hoverValue = undefined;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (disabled) return;
    focused = false;
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

  // —— 焦点管理（roving tabindex，对齐 Semi this.stars[index] / saveRef）——
  let rootEl = $state<HTMLUListElement | undefined>(undefined);
  const stars = $state<Record<number, RatingItem | undefined>>({});

  // 定位到某分值对应的可聚焦 radio 元素并聚焦（对齐 Semi adapter.focus / changeFocusStar）。
  function focusStarFor(v: number) {
    const index = Math.ceil(v) - 1;
    const star = stars[index < 0 ? count : index];
    star?.starFocus(preventScroll);
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

  // tooltip 联动：hoverValue-1 === index 时显示该项 tooltip（对齐 index.tsx:298）。
  function tipVisible(index: number): boolean {
    return hoverValue !== undefined && hoverValue - 1 === index;
  }

  // 空评分项（0 分）键盘聚焦可见态：仅 :focus-visible 时点亮根 outline（对齐 Semi foundation.handleStarFocusVisible）。
  function handleStarFocusVisible(e: FocusEvent) {
    const target = e.target as HTMLElement | null;
    if (target?.matches(':focus-visible')) emptyStarFocusVisible = true;
  }
  function handleStarBlur(_e: FocusEvent) {
    if (emptyStarFocusVisible) emptyStarFocusVisible = false;
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
  {style}
  aria-label={rootAriaLabel}
  aria-labelledby={ariaLabelledby}
  aria-describedby={ariaDescribedby}
  aria-errormessage={ariaErrormessage}
  aria-invalid={ariaInvalid}
  aria-required={ariaRequired}
  tabindex={disabled ? -1 : tabIndex}
  onmouseleave={handleLeave}
  onfocus={(e) => {
    focused = true;
    onFocus?.(e);
  }}
  onblur={(e) => {
    focused = false;
    onBlur?.(e);
  }}
  onkeydown={(e) => {
    handleKeydown(e);
    onKeyDown?.(e);
  }}
>
  {#each Array(count + 1) as _, i (i)}
    {@const isEmpty = i === count}
    {#snippet star()}
      <RatingItem
        bind:this={stars[i]}
        index={i}
        {count}
        prefixCls="cd-rating-star"
        {allowHalf}
        value={displayValue}
        {disabled}
        {character}
        {focused}
        size={isEmpty ? 0 : size}
        {ariaLabelPrefix}
        aria-describedby={ariaDescribedby}
        onHover={disabled ? () => {} : (idx, e) => handleHover(idx, e)}
        onClick={disabled ? () => {} : (idx, e, currentTarget) => handleClick(idx, e, currentTarget)}
        onFocus={disabled || count !== i ? undefined : (e) => handleStarFocusVisible(e)}
        onBlur={disabled || count !== i ? undefined : (e) => handleStarBlur(e)}
      />
    {/snippet}

    {#if tooltips && !isEmpty}
      <Tooltip trigger="custom" visible={tipVisible(i)} content={tooltips[i] ?? ''}>
        <span class="cd-rating-star-outer">{@render star()}</span>
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
  .cd-rating-disabled {
    cursor: default;
  }
  /* 子组件 RatingItem.svelte 渲染的 .cd-rating-star，跨组件命中需 :global()（对齐 Semi
     .semi-rating-disabled .semi-rating-star 规则，Radio/RadioInner 拆分同一模式）。 */
  .cd-rating-disabled :global(.cd-rating-star) {
    cursor: default;
  }
  .cd-rating-disabled :global(.cd-rating-star):hover {
    transform: scale(1);
  }

  /* tooltip 包裹层（对齐 Semi index.tsx:301 span.semi-rating-star-outer）。 */
  .cd-rating-star-outer {
    display: inline-flex;
    width: fit-content;
    height: fit-content;
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

  /* —— RTL（对齐 Semi rating/rtl.scss）——
     星间距/半星遮罩换边规则随 DOM 迁移到 RatingItem.svelte（该组件模板自渲染这些元素）；
     此处仅保留根节点 direction。 */
  :global(.cd-rtl) .cd-rating {
    direction: rtl;
  }
</style>
