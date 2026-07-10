<!--
  Avatar — 展示原子：图片 / 文字降级，circle|square，7 档尺寸，16 档语义色 + white。
  1:1 对齐 Semi avatar/index.tsx（结构、类名、行为、slot/border/contentMotion 均对齐）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';
  import TopSlotSvg from './TopSlotSvg.svelte';
  import {
    getAvatarGroupContext,
    type AvatarShape,
    type AvatarSizeEnum,
    type AvatarColor,
    type AvatarBorder,
    type AvatarTopSlot,
    type AvatarBottomSlot,
  } from './context.js';

  // 7 档枚举尺寸（对齐 Semi strings.SIZE）；其余走内联 width/height。
  const SIZE_ENUM: readonly AvatarSizeEnum[] = [
    'extra-extra-small',
    'extra-small',
    'small',
    'default',
    'medium',
    'large',
    'extra-large',
  ];

  interface Props {
    src?: string;
    srcSet?: string;
    alt?: string;
    shape?: AvatarShape;
    /** 7 档枚举或合法 width 值（如 "10px" / 数字按 px）。 */
    size?: AvatarSizeEnum | number | string;
    /** 16 档语义色名 + white，默认 grey；也可用 style 自定义 background/color。 */
    color?: AvatarColor;
    /** 额外边框：true 用默认主色环；对象可定制 color 并用 motion 开启呼吸动画。 */
    border?: AvatarBorder;
    /** 头像内容区域动效（对齐 Semi contentMotion）。 */
    contentMotion?: boolean;
    /** 字符头像距左右两侧的像素（用于 JS 缩放测量）。 */
    gap?: number;
    /** hover 时头像内容覆盖层（对齐 Semi hoverMask，无默认样式）。 */
    hoverMask?: Snippet;
    /** 顶部 Slot 配置（对齐 Semi topSlot；仅 circle 且枚举尺寸生效）。 */
    topSlot?: AvatarTopSlot;
    /** 底部 Slot 配置（对齐 Semi bottomSlot；仅枚举尺寸生效）。 */
    bottomSlot?: AvatarBottomSlot;
    /** 额外传给 img 标签的原生属性。 */
    imgAttr?: Record<string, unknown>;
    /** 图片加载失败回调；返回 false 关闭默认 fallback（对齐 Semi onError）。 */
    onError?: () => boolean | void;
    /** 单击回调；提供时头像可聚焦并响应键盘 Enter（对齐 Semi onClick）。 */
    onClick?: (e: MouseEvent | KeyboardEvent) => void;
    onMouseEnter?: (e: MouseEvent) => void;
    onMouseLeave?: (e: MouseEvent) => void;
    /** 附加类名（合并到根元素，对齐 Semi className）。 */
    class?: string;
    /** 内联样式（合并到根元素，对齐 Semi style）。 */
    style?: string;
    children?: Snippet;
  }

  let {
    src,
    srcSet,
    alt,
    shape: shapeProp,
    size: sizeProp,
    color = 'grey',
    border = false,
    contentMotion = false,
    gap = 3,
    hoverMask,
    topSlot,
    bottomSlot,
    imgAttr,
    onError,
    onClick,
    onMouseEnter,
    onMouseLeave,
    class: className,
    style: styleProp,
    children,
  }: Props = $props();

  // 组级 size/shape 强制覆盖子（对齐 Semi cloneElement({size, shape})）。
  const group = getAvatarGroupContext();
  const shape = $derived(group?.getShape() ?? shapeProp ?? 'circle');
  const size = $derived(group?.getSize() ?? sizeProp ?? 'medium');

  // 图片加载失败 → 降级文字/children。
  let imgExist = $state(true);
  const isImg = $derived(!!src && imgExist);

  const sizeIsEnum = $derived(
    typeof size === 'string' && (SIZE_ENUM as readonly string[]).includes(size),
  );
  const sizeClass = $derived(sizeIsEnum ? (size as string) : undefined);

  const clickable = $derived(onClick != null);

  // JS 缩放自适应（对齐 Semi changeScale）：测量容器与文字实际渲染宽度算 scale。
  let avatarNode = $state<HTMLElement>();
  let scale = $state(1);

  function changeScale() {
    const node = avatarNode;
    const stringNode = node?.firstElementChild as HTMLElement | undefined;
    const nodeWidth = node?.offsetWidth ?? 0;
    const stringNodeWidth = stringNode?.offsetWidth ?? 0;
    if (nodeWidth !== 0 && stringNodeWidth !== 0 && gap * 2 < nodeWidth) {
      scale = nodeWidth - gap * 2 > stringNodeWidth ? 1 : (nodeWidth - gap * 2) / stringNodeWidth;
    }
  }

  // 尺寸/gap/文字内容变化时重新测量（对齐 Semi：只在文字头像上测量）。
  // 读 textContent 让 children 文字变化也能触发重算（DOM 已更新后测量实际宽度）。
  $effect(() => {
    void size;
    void gap;
    void avatarNode?.textContent;
    if (!isImg) untrack(() => changeScale());
  });

  let focusVisible = $state(false);
  let hovering = $state(false);

  function handleError() {
    const flag = onError ? onError() : undefined;
    if (flag !== false) imgExist = false;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      onClick?.(event);
      event.preventDefault();
    } else if (event.key === 'Escape') {
      (event.target as HTMLElement)?.blur();
    }
  }

  function handleFocus(event: FocusEvent) {
    try {
      if ((event.target as HTMLElement)?.matches(':focus-visible')) focusVisible = true;
    } catch {
      /* 浏览器不支持 :focus-visible，忽略 */
    }
  }
  function handleBlur() {
    focusVisible = false;
  }

  function handleEnter(e: MouseEvent) {
    hovering = true;
    onMouseEnter?.(e);
  }
  function handleLeave(e: MouseEvent) {
    hovering = false;
    onMouseLeave?.(e);
  }

  const isWrap = $derived(!!bottomSlot || !!topSlot || border !== false);

  // 根元素类名（对齐 Semi avatarCls）。
  const avatarCls = $derived(
    [
      'cd-avatar',
      `cd-avatar-${shape}`,
      sizeClass && `cd-avatar-${sizeClass}`,
      // 图片头像不上色；white 也是一档色。
      color && !isImg && `cd-avatar-${color}`,
      isImg && 'cd-avatar-image',
      focusVisible && 'cd-avatar-focus',
      contentMotion && 'cd-avatar-animated',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  // 内联尺寸（非枚举尺寸）+ 外部 style。
  const customStyle = $derived(
    [
      !sizeIsEnum ? `width:${typeof size === 'number' ? `${size}px` : size}` : '',
      !sizeIsEnum ? `height:${typeof size === 'number' ? `${size}px` : size}` : '',
      styleProp ?? '',
    ]
      .filter(Boolean)
      .join(';'),
  );

  const additionalBorderColor = $derived(
    typeof border === 'object' && border?.color ? border.color : undefined,
  );
  const borderMotion = $derived(typeof border === 'object' && border?.motion === true);

  // Slot 仅在这 6 档枚举尺寸生效（对齐 Semi 白名单，排除 extra-extra-small）。
  const SLOT_SIZES: readonly string[] = [
    'extra-small',
    'small',
    'default',
    'medium',
    'large',
    'extra-large',
  ];
  const slotSizeOk = $derived(typeof size === 'string' && SLOT_SIZES.includes(size));
  const showTopSlot = $derived(!!topSlot && slotSizeOk && shape === 'circle');
  const showBottomSlot = $derived(!!bottomSlot && slotSizeOk);

  // clickable 时 alt 前缀（对齐 Semi `clickable Avatar: ...`）。
  const imgAlt = $derived(clickable ? `clickable Avatar: ${alt ?? ''}` : alt);
  const labelAlt = $derived(clickable ? `clickable Avatar: ${alt ?? ''}` : alt);
</script>

{#snippet content()}
  {#if isImg}
    <!-- clickable 头像的图片可聚焦并响应键盘（对齐 Semi a11yFocusProps） -->
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <img
      alt={imgAlt}
      {src}
      srcset={srcSet}
      class={clickable ? 'cd-avatar-no-focus-visible' : undefined}
      tabindex={clickable ? 0 : undefined}
      onerror={handleError}
      onkeydown={clickable ? handleKeydown : undefined}
      onfocus={clickable ? handleFocus : undefined}
      onblur={clickable ? handleBlur : undefined}
      {...imgAttr ?? {}}
    />
  {:else if children}
    <span class="cd-avatar-content" style="transform:scale({scale})">
      <!-- clickable 文字头像可聚焦并响应键盘（对齐 Semi a11yFocusProps） -->
      <!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
      <span
        class={['cd-avatar-label', clickable && 'cd-avatar-no-focus-visible']
          .filter(Boolean)
          .join(' ')}
        role="img"
        aria-label={labelAlt || undefined}
        tabindex={clickable ? 0 : undefined}
        onkeydown={clickable ? handleKeydown : undefined}
        onfocus={clickable ? handleFocus : undefined}
        onblur={clickable ? handleBlur : undefined}
      >{@render children()}</span>
    </span>
  {/if}
{/snippet}

{#snippet avatarEl()}
  <!-- 根元素点击/hover 转发（对齐 Semi；键盘由内部可聚焦 img/label 承担） -->
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <span
    bind:this={avatarNode}
    class={avatarCls}
    style={isWrap ? undefined : customStyle || undefined}
    onclick={isWrap ? undefined : onClick}
    onmouseenter={isWrap ? undefined : handleEnter}
    onmouseleave={isWrap ? undefined : handleLeave}
  >
    {@render content()}
    {#if hovering && hoverMask}
      <div class="cd-avatar-hover">{@render hoverMask()}</div>
    {/if}
  </span>
{/snippet}

{#snippet borderRing(animated: boolean)}
  <span
    class={[
      'cd-avatar-additionalBorder',
      `cd-avatar-additionalBorder-${sizeClass ?? 'medium'}`,
      `cd-avatar-${shape}`,
      animated && 'cd-avatar-additionalBorder-animated',
    ]
      .filter(Boolean)
      .join(' ')}
    style={additionalBorderColor ? `border-color:${additionalBorderColor}` : undefined}
    aria-hidden="true"
  ></span>
{/snippet}

{#snippet borderedAvatar()}
  <div class="cd-avatar-border-wrapper" style={customStyle || undefined}>
    {@render avatarEl()}
    {@render borderRing(false)}
    {#if borderMotion}{@render borderRing(true)}{/if}
  </div>
{/snippet}

{#snippet topSlotEl()}
  {#if topSlot?.render}
    {@render (topSlot.render as Snippet)()}
  {:else if topSlot}
    <div
      class={['cd-avatar-top_slot-wrapper', topSlot.className, contentMotion && 'cd-avatar-animated']
        .filter(Boolean)
        .join(' ')}
      style={topSlot.style}
    >
      <div class={`cd-avatar-top_slot-bg cd-avatar-top_slot-bg-${sizeClass}`}>
        <div class={`cd-avatar-top_slot-bg-svg cd-avatar-top_slot-bg-svg-${sizeClass}`}>
          <TopSlotSvg gradientStart={topSlot.gradientStart} gradientEnd={topSlot.gradientEnd} />
        </div>
      </div>
      <div class="cd-avatar-top_slot">
        <div
          class={`cd-avatar-top_slot-content cd-avatar-top_slot-content-${sizeClass}`}
          style={topSlot.textColor ? `color:${topSlot.textColor}` : undefined}
        >
          {#if typeof topSlot.text === 'function'}{@render (topSlot.text as Snippet)()}{:else}{topSlot.text}{/if}
        </div>
      </div>
    </div>
  {/if}
{/snippet}

{#snippet bottomSlotEl()}
  {#if bottomSlot?.render}
    {@render (bottomSlot.render as Snippet)()}
  {:else if bottomSlot}
    {@const bshape = bottomSlot.shape ?? 'circle'}
    <div class="cd-avatar-bottom_slot" style={bottomSlot.style}>
      <span
        class={[
          `cd-avatar-bottom_slot-shape_${bshape}`,
          `cd-avatar-bottom_slot-shape_${bshape}-${sizeClass}`,
          bottomSlot.className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={[
          bottomSlot.bgColor && `background-color:${bottomSlot.bgColor}`,
          bottomSlot.textColor && `color:${bottomSlot.textColor}`,
        ]
          .filter(Boolean)
          .join(';') || undefined}
      >
        {#if typeof bottomSlot.text === 'function'}{@render (bottomSlot.text as Snippet)()}{:else}{bottomSlot.text}{/if}
      </span>
    </div>
  {/if}
{/snippet}

{#if isWrap}
  <!-- Slot/border 包裹层：事件挂 wrapper（对齐 Semi shouldWrap 分支） -->
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <span
    class="cd-avatar-wrapper"
    style={customStyle || undefined}
    onclick={onClick}
    onmouseenter={handleEnter}
    onmouseleave={handleLeave}
  >
    {#if border !== false}{@render borderedAvatar()}{:else}{@render avatarEl()}{/if}
    {#if showTopSlot}{@render topSlotEl()}{/if}
    {#if showBottomSlot}{@render bottomSlotEl()}{/if}
  </span>
{:else}
  {@render avatarEl()}
{/if}

<style>
  .cd-avatar {
    position: relative;
    display: inline-flex;
    overflow: hidden;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    text-align: center;
    vertical-align: middle;
    background: var(--cd-avatar-bg);
    color: var(--cd-avatar-color);
    user-select: none;
    box-sizing: border-box;
  }
  .cd-avatar:focus-visible,
  .cd-avatar-focus {
    outline: var(--cd-avatar-outline-width) solid var(--cd-avatar-outline-color);
  }
  .cd-avatar-no-focus-visible:focus-visible {
    outline: none;
  }
  .cd-avatar :global(.cd-avatar-label) {
    display: flex;
    align-items: center;
    font-size: var(--cd-font-size-regular);
    font-weight: var(--cd-font-weight-bold);
  }
  .cd-avatar-content {
    user-select: none;
  }

  /* ============ 7 档尺寸（1:1 对齐 Semi）============ */
  .cd-avatar-extra-extra-small {
    width: var(--cd-avatar-size-extra-extra-small);
    height: var(--cd-avatar-size-extra-extra-small);
    border-radius: var(--cd-avatar-radius-extra-extra-small);
  }
  .cd-avatar-extra-extra-small .cd-avatar-content {
    transform-origin: center;
    transform: scale(0.8);
  }
  .cd-avatar-extra-extra-small :global(.cd-avatar-label) {
    font-size: var(--cd-avatar-font-extra-extra-small-size);
    line-height: var(--cd-avatar-font-extra-extra-small-lineheight);
  }
  .cd-avatar-extra-small {
    width: var(--cd-avatar-size-extra-small);
    height: var(--cd-avatar-size-extra-small);
    border-radius: var(--cd-avatar-radius-extra-small);
  }
  .cd-avatar-extra-small .cd-avatar-content {
    transform-origin: center;
    transform: scale(0.8);
  }
  .cd-avatar-extra-small :global(.cd-avatar-label) {
    font-size: var(--cd-avatar-font-extra-small-size);
    line-height: var(--cd-avatar-font-extra-small-lineheight);
  }
  .cd-avatar-small {
    width: var(--cd-avatar-size-small);
    height: var(--cd-avatar-size-small);
    border-radius: var(--cd-avatar-radius-small);
  }
  .cd-avatar-small :global(.cd-avatar-label) {
    font-size: var(--cd-avatar-font-small-size);
  }
  .cd-avatar-default {
    width: var(--cd-avatar-size-default);
    height: var(--cd-avatar-size-default);
    border-radius: var(--cd-avatar-radius-default);
  }
  .cd-avatar-default :global(.cd-avatar-label) {
    font-size: var(--cd-avatar-font-default-size);
  }
  .cd-avatar-medium {
    width: var(--cd-avatar-size-medium);
    height: var(--cd-avatar-size-medium);
    border-radius: var(--cd-avatar-radius-medium);
  }
  .cd-avatar-medium :global(.cd-avatar-label) {
    font-size: var(--cd-avatar-font-medium-size);
  }
  .cd-avatar-large {
    width: var(--cd-avatar-size-large);
    height: var(--cd-avatar-size-large);
    border-radius: var(--cd-avatar-radius-large);
  }
  .cd-avatar-large :global(.cd-avatar-label) {
    font-size: var(--cd-avatar-font-large-size);
  }
  .cd-avatar-extra-large {
    width: var(--cd-avatar-size-extra-large);
    height: var(--cd-avatar-size-extra-large);
    border-radius: var(--cd-avatar-radius-extra-large);
  }
  .cd-avatar-extra-large :global(.cd-avatar-label) {
    font-size: var(--cd-avatar-font-extra-large-size);
    line-height: var(--cd-avatar-font-extra-large-lineheight);
  }

  .cd-avatar-circle {
    border-radius: var(--cd-border-radius-full);
  }
  .cd-avatar-image {
    background-color: transparent;
  }
  .cd-avatar > img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .cd-avatar-hover {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
  .cd-avatar:hover {
    cursor: pointer;
  }

  /* ============ 16 档语义色板 + white（bg=<color>-3, text=white）============ */
  .cd-avatar-amber {
    background-color: var(--cd-avatar-amber-bg);
    color: var(--cd-avatar-palette-text);
  }
  .cd-avatar-blue {
    background-color: var(--cd-avatar-blue-bg);
    color: var(--cd-avatar-palette-text);
  }
  .cd-avatar-cyan {
    background-color: var(--cd-avatar-cyan-bg);
    color: var(--cd-avatar-palette-text);
  }
  .cd-avatar-green {
    background-color: var(--cd-avatar-green-bg);
    color: var(--cd-avatar-palette-text);
  }
  .cd-avatar-grey {
    background-color: var(--cd-avatar-grey-bg);
    color: var(--cd-avatar-palette-text);
  }
  .cd-avatar-indigo {
    background-color: var(--cd-avatar-indigo-bg);
    color: var(--cd-avatar-palette-text);
  }
  .cd-avatar-light-blue {
    background-color: var(--cd-avatar-light-blue-bg);
    color: var(--cd-avatar-palette-text);
  }
  .cd-avatar-light-green {
    background-color: var(--cd-avatar-light-green-bg);
    color: var(--cd-avatar-palette-text);
  }
  .cd-avatar-lime {
    background-color: var(--cd-avatar-lime-bg);
    color: var(--cd-avatar-palette-text);
  }
  .cd-avatar-orange {
    background-color: var(--cd-avatar-orange-bg);
    color: var(--cd-avatar-palette-text);
  }
  .cd-avatar-pink {
    background-color: var(--cd-avatar-pink-bg);
    color: var(--cd-avatar-palette-text);
  }
  .cd-avatar-purple {
    background-color: var(--cd-avatar-purple-bg);
    color: var(--cd-avatar-palette-text);
  }
  .cd-avatar-red {
    background-color: var(--cd-avatar-red-bg);
    color: var(--cd-avatar-palette-text);
  }
  .cd-avatar-teal {
    background-color: var(--cd-avatar-teal-bg);
    color: var(--cd-avatar-palette-text);
  }
  .cd-avatar-violet {
    background-color: var(--cd-avatar-violet-bg);
    color: var(--cd-avatar-palette-text);
  }
  .cd-avatar-yellow {
    background-color: var(--cd-avatar-yellow-bg);
    color: var(--cd-avatar-palette-text);
  }
  .cd-avatar-white {
    background-color: var(--cd-avatar-white-bg);
    color: var(--cd-avatar-palette-text);
  }

  /* ============ 额外边框（呼吸环）============ */
  .cd-avatar-border-wrapper {
    position: relative;
    display: inline-flex;
  }
  .cd-avatar-additionalBorder {
    border-style: solid;
    border-color: var(--cd-avatar-additional-border-color);
    display: inline-block;
    box-sizing: border-box;
    position: absolute;
    border-width: var(--cd-avatar-additional-border-width);
    top: calc(-1 * var(--cd-avatar-additional-border-width) - var(--cd-avatar-additional-border-gap));
    left: calc(
      -1 * var(--cd-avatar-additional-border-width) - var(--cd-avatar-additional-border-gap)
    );
    pointer-events: none;
  }
  .cd-avatar-additionalBorder-extra-extra-small {
    width: calc(
      var(--cd-avatar-size-extra-extra-small) + 2 * var(--cd-avatar-additional-border-gap) + 2 *
        var(--cd-avatar-additional-border-width)
    );
    height: calc(
      var(--cd-avatar-size-extra-extra-small) + 2 * var(--cd-avatar-additional-border-gap) + 2 *
        var(--cd-avatar-additional-border-width)
    );
  }
  .cd-avatar-additionalBorder-extra-small {
    width: calc(
      var(--cd-avatar-size-extra-small) + 2 * var(--cd-avatar-additional-border-gap) + 2 *
        var(--cd-avatar-additional-border-width)
    );
    height: calc(
      var(--cd-avatar-size-extra-small) + 2 * var(--cd-avatar-additional-border-gap) + 2 *
        var(--cd-avatar-additional-border-width)
    );
  }
  .cd-avatar-additionalBorder-small {
    width: calc(
      var(--cd-avatar-size-small) + 2 * var(--cd-avatar-additional-border-gap) + 2 *
        var(--cd-avatar-additional-border-width)
    );
    height: calc(
      var(--cd-avatar-size-small) + 2 * var(--cd-avatar-additional-border-gap) + 2 *
        var(--cd-avatar-additional-border-width)
    );
  }
  .cd-avatar-additionalBorder-default {
    width: calc(
      var(--cd-avatar-size-default) + 2 * var(--cd-avatar-additional-border-gap) + 2 *
        var(--cd-avatar-additional-border-width)
    );
    height: calc(
      var(--cd-avatar-size-default) + 2 * var(--cd-avatar-additional-border-gap) + 2 *
        var(--cd-avatar-additional-border-width)
    );
  }
  .cd-avatar-additionalBorder-medium {
    width: calc(
      var(--cd-avatar-size-medium) + 2 * var(--cd-avatar-additional-border-gap) + 2 *
        var(--cd-avatar-additional-border-width)
    );
    height: calc(
      var(--cd-avatar-size-medium) + 2 * var(--cd-avatar-additional-border-gap) + 2 *
        var(--cd-avatar-additional-border-width)
    );
  }
  .cd-avatar-additionalBorder-large {
    width: calc(
      var(--cd-avatar-size-large) + 2 * var(--cd-avatar-additional-border-gap) + 2 *
        var(--cd-avatar-additional-border-width)
    );
    height: calc(
      var(--cd-avatar-size-large) + 2 * var(--cd-avatar-additional-border-gap) + 2 *
        var(--cd-avatar-additional-border-width)
    );
  }
  .cd-avatar-additionalBorder-extra-large {
    width: calc(
      var(--cd-avatar-size-extra-large) + 2 * var(--cd-avatar-additional-border-gap) + 2 *
        var(--cd-avatar-additional-border-width)
    );
    height: calc(
      var(--cd-avatar-size-extra-large) + 2 * var(--cd-avatar-additional-border-gap) + 2 *
        var(--cd-avatar-additional-border-width)
    );
  }
  /* 方形描边环圆角随尺寸；圆形统一 full */
  .cd-avatar-square.cd-avatar-additionalBorder-extra-extra-small {
    border-radius: var(--cd-avatar-radius-extra-extra-small);
  }
  .cd-avatar-square.cd-avatar-additionalBorder-extra-small {
    border-radius: var(--cd-avatar-radius-extra-small);
  }
  .cd-avatar-square.cd-avatar-additionalBorder-small {
    border-radius: var(--cd-avatar-radius-small);
  }
  .cd-avatar-square.cd-avatar-additionalBorder-default {
    border-radius: var(--cd-avatar-radius-default);
  }
  .cd-avatar-square.cd-avatar-additionalBorder-medium {
    border-radius: var(--cd-avatar-radius-medium);
  }
  .cd-avatar-square.cd-avatar-additionalBorder-large {
    border-radius: var(--cd-avatar-radius-large);
  }
  .cd-avatar-square.cd-avatar-additionalBorder-extra-large {
    border-radius: var(--cd-avatar-radius-extra-large);
  }
  .cd-avatar-circle.cd-avatar-additionalBorder {
    border-radius: var(--cd-border-radius-full);
  }
  .cd-avatar-additionalBorder-animated {
    animation: cd-avatar-additionalBorder var(--cd-avatar-additional-border-duration) linear infinite;
  }
  .cd-avatar-animated {
    animation: cd-avatar-content var(--cd-avatar-content-motion-duration) linear infinite;
  }
  @keyframes cd-avatar-additionalBorder {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    100% {
      border-width: 0;
      opacity: 0;
      transform: scale(var(--cd-avatar-additional-border-scale-end));
    }
  }
  @keyframes cd-avatar-content {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(var(--cd-avatar-content-motion-scale-middle));
    }
    100% {
      transform: scale(1);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-avatar-additionalBorder-animated,
    .cd-avatar-animated {
      animation: none;
    }
  }

  /* ============ Wrapper + Slots ============ */
  .cd-avatar-wrapper {
    position: relative;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    width: fit-content;
  }
  .cd-avatar-top_slot-bg {
    position: absolute;
    display: flex;
    justify-content: center;
    border-radius: 50%;
    overflow: hidden;
  }
  .cd-avatar-top_slot-bg-small {
    width: var(--cd-avatar-size-small);
    height: var(--cd-avatar-size-small);
  }
  .cd-avatar-top_slot-bg-default {
    width: var(--cd-avatar-size-default);
    height: var(--cd-avatar-size-default);
  }
  .cd-avatar-top_slot-bg-medium {
    width: var(--cd-avatar-size-medium);
    height: var(--cd-avatar-size-medium);
  }
  .cd-avatar-top_slot-bg-large {
    width: var(--cd-avatar-size-large);
    height: var(--cd-avatar-size-large);
  }
  .cd-avatar-top_slot-bg-extra-large {
    width: var(--cd-avatar-size-extra-large);
    height: var(--cd-avatar-size-extra-large);
  }
  .cd-avatar-top_slot-bg-svg {
    position: absolute;
  }
  .cd-avatar-top_slot-bg-svg-small {
    top: var(--cd-avatar-top-slot-small-shift);
    scale: var(--cd-avatar-top-slot-small-scale);
  }
  .cd-avatar-top_slot-bg-svg-default {
    top: var(--cd-avatar-top-slot-default-shift);
    scale: var(--cd-avatar-top-slot-default-scale);
  }
  .cd-avatar-top_slot-bg-svg-medium {
    top: var(--cd-avatar-top-slot-medium-shift);
    scale: var(--cd-avatar-top-slot-medium-scale);
  }
  .cd-avatar-top_slot-bg-svg-large {
    top: var(--cd-avatar-top-slot-large-shift);
    scale: var(--cd-avatar-top-slot-large-scale);
  }
  .cd-avatar-top_slot-bg-svg-extra-large {
    top: var(--cd-avatar-top-slot-extra-large-shift);
    scale: var(--cd-avatar-top-slot-extra-large-scale);
  }
  .cd-avatar-top_slot-wrapper {
    position: absolute;
    display: flex;
    justify-content: center;
  }
  .cd-avatar-top_slot {
    color: var(--cd-avatar-top-slot-text);
    font-weight: var(--cd-font-weight-bold);
  }
  .cd-avatar-top_slot-content {
    user-select: none;
    position: relative;
    line-height: normal;
  }
  .cd-avatar-top_slot-content-small {
    font-size: var(--cd-avatar-top-slot-small-size);
    margin-top: var(--cd-avatar-top-slot-small-margintop);
  }
  .cd-avatar-top_slot-content-default {
    font-size: var(--cd-avatar-top-slot-default-size);
    margin-top: var(--cd-avatar-top-slot-default-margintop);
  }
  .cd-avatar-top_slot-content-medium {
    font-size: var(--cd-avatar-top-slot-medium-size);
    margin-top: var(--cd-avatar-top-slot-medium-margintop);
  }
  .cd-avatar-top_slot-content-large {
    font-size: var(--cd-avatar-top-slot-large-size);
    margin-top: var(--cd-avatar-top-slot-large-margintop);
  }
  .cd-avatar-top_slot-content-extra-large {
    font-size: var(--cd-avatar-top-slot-extra-large-size);
    margin-top: var(--cd-avatar-top-slot-extra-large-margintop);
  }

  .cd-avatar-bottom_slot {
    color: var(--cd-avatar-bottom-slot-text);
    position: absolute;
    cursor: pointer;
    bottom: calc(var(--cd-avatar-additional-border-gap) + var(--cd-avatar-additional-border-width));
    transform: translateY(50%);
    user-select: none;
  }
  .cd-avatar-bottom_slot-shape_circle {
    display: flex;
    justify-content: center;
    align-items: center;
    background: var(--cd-avatar-bottom-slot-bg);
    border-radius: var(--cd-border-radius-full);
    line-height: normal;
  }
  .cd-avatar-bottom_slot-shape_circle-extra-small {
    width: var(--cd-avatar-bottom-slot-circle-extra-small);
    height: var(--cd-avatar-bottom-slot-circle-extra-small);
    font-size: var(--cd-avatar-bottom-slot-extra-small-size);
  }
  .cd-avatar-bottom_slot-shape_circle-small {
    width: var(--cd-avatar-bottom-slot-circle-small);
    height: var(--cd-avatar-bottom-slot-circle-small);
    font-size: var(--cd-avatar-bottom-slot-small-size);
  }
  .cd-avatar-bottom_slot-shape_circle-default {
    width: var(--cd-avatar-bottom-slot-circle-default);
    height: var(--cd-avatar-bottom-slot-circle-default);
    font-size: var(--cd-avatar-bottom-slot-default-size);
  }
  .cd-avatar-bottom_slot-shape_circle-medium {
    width: var(--cd-avatar-bottom-slot-circle-medium);
    height: var(--cd-avatar-bottom-slot-circle-medium);
    font-size: var(--cd-avatar-bottom-slot-medium-size);
  }
  .cd-avatar-bottom_slot-shape_circle-large {
    width: var(--cd-avatar-bottom-slot-circle-large);
    height: var(--cd-avatar-bottom-slot-circle-large);
    font-size: var(--cd-avatar-bottom-slot-large-size);
  }
  .cd-avatar-bottom_slot-shape_circle-extra-large {
    width: var(--cd-avatar-bottom-slot-circle-extra-large);
    height: var(--cd-avatar-bottom-slot-circle-extra-large);
    font-size: var(--cd-avatar-bottom-slot-extra-large-size);
  }
  .cd-avatar-bottom_slot-shape_square {
    display: flex;
    justify-content: center;
    align-items: center;
    background: var(--cd-avatar-bottom-slot-bg);
    border-radius: var(--cd-avatar-bottom-slot-square-radius);
    padding: var(--cd-avatar-bottom-slot-square-paddingy)
      var(--cd-avatar-bottom-slot-square-paddingx);
    font-weight: var(--cd-font-weight-bold);
    border-style: solid;
    border-color: var(--cd-avatar-bottom-slot-square-border);
    border-width: var(--cd-avatar-bottom-slot-square-border-width);
  }
  .cd-avatar-bottom_slot-shape_square-extra-small {
    font-size: var(--cd-avatar-bottom-slot-extra-small-size);
  }
  .cd-avatar-bottom_slot-shape_square-small {
    font-size: var(--cd-avatar-bottom-slot-small-size);
  }
  .cd-avatar-bottom_slot-shape_square-default {
    font-size: var(--cd-avatar-bottom-slot-default-size);
  }
  .cd-avatar-bottom_slot-shape_square-medium {
    font-size: var(--cd-avatar-bottom-slot-medium-size);
  }
  .cd-avatar-bottom_slot-shape_square-large {
    font-size: var(--cd-avatar-bottom-slot-large-size);
  }
  .cd-avatar-bottom_slot-shape_square-extra-large {
    font-size: var(--cd-avatar-bottom-slot-extra-large-size);
  }

  /* ============ RTL（1:1 对齐 Semi avatar/rtl.scss）============ */
  :global([dir='rtl']) .cd-avatar {
    direction: rtl;
  }
  /* 小档 content 在 RTL 下仍保持 scale(0.8)（对齐 Semi，避免 direction 影响缩放表现） */
  :global([dir='rtl']) .cd-avatar-extra-extra-small .cd-avatar-content,
  :global([dir='rtl']) .cd-avatar-extra-small .cd-avatar-content {
    transform: scale(0.8);
  }
  /* hover 遮罩镜像 */
  :global([dir='rtl']) .cd-avatar-hover {
    left: auto;
    right: 0;
  }
</style>
