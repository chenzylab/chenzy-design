<!--
  Avatar — see specs/components/show/Avatar.spec.md
  Display atom: image with text fallback, status dot, color hashing.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getAvatarGroupContext, type AvatarShape, type AvatarSizeEnum } from './context.js';

  type AvatarStatus = 'default' | 'warning' | 'error';

  // 预设 16 档语义色板（对齐 Semi avatar COLOR 枚举，去掉无对应色板的 white）。
  type AvatarPaletteColor =
    | 'amber'
    | 'blue'
    | 'cyan'
    | 'green'
    | 'grey'
    | 'indigo'
    | 'light-blue'
    | 'light-green'
    | 'lime'
    | 'orange'
    | 'pink'
    | 'purple'
    | 'red'
    | 'teal'
    | 'violet'
    | 'yellow';

  // border 呼吸描边环配置（对齐 Semi border={{ color?, motion? }}）。
  type AvatarBorder = boolean | { color?: string; motion?: boolean };

  const PALETTE_COLORS: readonly AvatarPaletteColor[] = [
    'amber',
    'blue',
    'cyan',
    'green',
    'grey',
    'indigo',
    'light-blue',
    'light-green',
    'lime',
    'orange',
    'pink',
    'purple',
    'red',
    'teal',
    'violet',
    'yellow',
  ];

  interface Props {
    src?: string;
    srcset?: string;
    alt?: string;
    shape?: AvatarShape;
    size?: AvatarSizeEnum | number;
    /**
     * 头像背景色：
     * - `'auto'` 按文字哈希从预设调色板取色；
     * - 16 档语义色名（amber/blue/cyan/…/grey，默认 grey）走预设色板 token；
     * - 任意 CSS 色值（如 `#f00`）内联为背景。
     */
    color?: 'auto' | AvatarPaletteColor | (string & {});
    /**
     * 呼吸描边环：`true` 用默认主色；对象可定制 `color` 与开启 `motion` 呼吸动画。
     */
    border?: AvatarBorder;
    status?: AvatarStatus;
    dot?: boolean;
    dotColor?: string;
    gap?: number;
    /** 可交互：跳转链接，渲染为 <a>（优先于 onClick 的 button 语义）。 */
    href?: string;
    /** 链接 target（仅 href 时生效）。 */
    target?: string;
    /** 可交互：点击回调；无 href 时根元素取 role=button + 键盘 Enter/Space 激活。 */
    onClick?: (event: MouseEvent | KeyboardEvent) => void;
    /** hover 时显示的遮罩层 Snippet。 */
    hoverMask?: Snippet;
    /** 右下角绝对定位标记 Snippet（如在线状态徽标）。 */
    bottomSlot?: Snippet;
    /** 右上角绝对定位标记 Snippet。 */
    topSlot?: Snippet;
    /** 额外传给 img 标签的属性（如 loading、decoding 等）。 */
    imgAttr?: Record<string, string>;
    /** img 加载失败回调。 */
    onError?: (e: Event) => void;
    /** 附加类名（合并到根元素，对齐 Semi className）。 */
    class?: string;
    /** 内联样式（合并到根元素 style，优先级高于内部派生样式，对齐 Semi style）。 */
    style?: string;
    children?: Snippet;
  }

  let {
    src,
    srcset,
    alt,
    shape: shapeProp,
    size: sizeProp,
    color = 'grey',
    border = false,
    status = 'default',
    dot = false,
    dotColor,
    gap = 3,
    href,
    target,
    onClick,
    hoverMask,
    bottomSlot,
    topSlot,
    imgAttr,
    onError,
    class: className,
    style: styleProp,
    children,
  }: Props = $props();

  // Avatar.Group may provide shared shape/size; the child's own prop wins,
  // falling back to the group's value, then the standalone default.
  const group = getAvatarGroupContext();
  const shape = $derived(shapeProp ?? group?.getShape() ?? 'circle');
  const size = $derived(sizeProp ?? group?.getSize() ?? 'default');

  // image load failure → fall back to text/children
  let failed = $state(false);
  const showImage = $derived(!!src && !failed);

  // text fallback: alt's first character (uppercased)
  const fallbackText = $derived(alt ? alt.trim().charAt(0).toUpperCase() : '');

  const sizeIsNumber = $derived(typeof size === 'number');

  const palette = [
    'var(--cd-color-blue-5)',
    'var(--cd-color-green-5)',
    'var(--cd-color-orange-6)',
    'var(--cd-color-red-5)',
    'var(--cd-color-primary)',
  ];

  function hashString(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i += 1) {
      h = (h << 5) - h + s.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }

  const autoColor = $derived(palette[hashString(fallbackText || 'cd') % palette.length]);

  // color 归类：预设 16 档语义色名（含 grey）→ 走 CSS class 消费色板 token；
  // 'auto' → 哈希取色；其余任意字面量 → 内联背景。
  const isPaletteColor = $derived(
    color !== 'auto' && (PALETTE_COLORS as readonly string[]).includes(color),
  );

  // resolved inline background: 'auto' → hashed palette color；语义色名走 class（不内联）；
  // 其余显式色值内联。
  const bgColor = $derived(
    color === 'auto' ? autoColor : isPaletteColor ? undefined : color,
  );

  const dotBg = $derived(
    dotColor ??
      (status === 'error'
        ? 'var(--cd-color-danger)'
        : status === 'warning'
          ? 'var(--cd-color-warning)'
          : 'var(--cd-color-success)'),
  );

  const cls = $derived(
    [
      'cd-avatar',
      `cd-avatar--${shape}`,
      !sizeIsNumber && `cd-avatar--${size}`,
      // 语义色板：图片头像不上色（与 Semi 一致）。
      isPaletteColor && !showImage && `cd-avatar--${color}`,
      // 外部附加类名（对齐 Semi className），置于末尾便于覆盖。
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  // 呼吸描边环（对齐 Semi border prop）：归一化为对象；motion 时渲染动画环。
  const hasBorder = $derived(border !== false && border != null);
  const borderColor = $derived(
    typeof border === 'object' ? border.color : undefined,
  );
  const borderMotion = $derived(typeof border === 'object' ? border.motion === true : false);
  const borderStyle = $derived(borderColor ? `border-color:${borderColor}` : undefined);

  const rootStyle = $derived(
    [
      sizeIsNumber ? `inline-size:${size}px;block-size:${size}px` : '',
      bgColor ? `background:${bgColor}` : '',
      sizeIsNumber ? `font-size:${Math.round((size as number) / 2.4)}px` : '',
      // 外部内联样式（对齐 Semi style），置于末尾，优先级高于内部派生样式。
      styleProp ?? '',
    ]
      .filter(Boolean)
      .join(';'),
  );

  const textStyle = $derived(gap !== 0 ? `padding-inline:${gap}px` : '');
  const ariaLabel = $derived(alt ?? fallbackText ?? undefined);

  // 可交互语义（spec §6）：href→<a>；仅 onClick→role=button + tabindex=0 + 键盘激活；
  // 纯展示头像不可聚焦。纯派生（红线 #2，render 期只读）。
  const isLink = $derived(href != null);
  const isButton = $derived(!isLink && onClick != null);
  const interactive = $derived(isLink || isButton);
  // 根元素标签：链接 a，可点击但非链接保持 span（role=button），纯展示 span。
  const rootTag = $derived(isLink ? 'a' : 'span');

  function handleError(e: Event) {
    failed = true;
    onError?.(e);
  }

  function handleClick(event: MouseEvent) {
    onClick?.(event);
  }

  // role=button 时键盘 Enter/Space 激活（<a> 由原生处理，不接管）。
  function handleKeydown(event: KeyboardEvent) {
    if (!isButton) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.(event);
    }
  }
</script>

<!--
  根元素：可交互时为 <a>（href）或带 role=button 的 <span>（onClick），并进入 Tab 序列；
  纯展示时为 <span>，文字/图标头像取 role=img（避免逐字读缩写）。
  交互根统一用 aria-label 命名（图片头像 alt 已在 <img>，文字头像取 ariaLabel）。
-->
{#snippet avatarBody()}
  <svelte:element
    this={rootTag}
    class={[cls, interactive && 'cd-avatar--interactive'].filter(Boolean).join(' ')}
    style={rootStyle || undefined}
    href={isLink ? href : undefined}
    target={isLink ? target : undefined}
    role={isButton ? 'button' : !interactive && !showImage ? 'img' : undefined}
    tabindex={isButton ? 0 : undefined}
    aria-label={interactive ? ariaLabel : showImage ? undefined : ariaLabel}
    onclick={interactive ? handleClick : undefined}
    onkeydown={isButton ? handleKeydown : undefined}
  >
    {#if showImage}
      <img
        class="cd-avatar__img"
        {src}
        {srcset}
        {alt}
        {...(imgAttr ?? {})}
        onerror={handleError}
      />
    {:else if children}
      <span class="cd-avatar__text" style={textStyle || undefined}>{@render children()}</span>
    {:else if fallbackText}
      <span class="cd-avatar__text" style={textStyle || undefined}>{fallbackText}</span>
    {/if}

    {#if hoverMask}
      <span class="cd-avatar__hover-mask" aria-hidden="true">{@render hoverMask()}</span>
    {/if}

    {#if topSlot}
      <span class="cd-avatar__slot cd-avatar__slot--top" aria-hidden="true">{@render topSlot()}</span>
    {/if}

    {#if dot}
      <span class="cd-avatar__dot" style="background:{dotBg}" aria-hidden="true"></span>
    {/if}

    {#if bottomSlot}
      <span class="cd-avatar__slot cd-avatar__slot--bottom" aria-hidden="true">{@render bottomSlot()}</span>
    {/if}
  </svelte:element>
{/snippet}

{#if hasBorder}
  <!--
    呼吸描边环：外层不裁剪的 relative 包裹，环用绝对定位置于头像外侧（消费 additionalBorder token）；
    motion 时额外叠一圈 animated 环做呼吸扩散（对齐 Semi additionalBorder-animated）。
  -->
  <span class="cd-avatar-wrapper">
    {@render avatarBody()}
    <span
      class={['cd-avatar__border', `cd-avatar__border--${shape}`].join(' ')}
      style={borderStyle}
      aria-hidden="true"
    ></span>
    {#if borderMotion}
      <span
        class={['cd-avatar__border', 'cd-avatar__border--animated', `cd-avatar__border--${shape}`].join(' ')}
        style={borderStyle}
        aria-hidden="true"
      ></span>
    {/if}
  </span>
{:else}
  {@render avatarBody()}
{/if}

<style>
  .cd-avatar {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    inline-size: var(--cd-avatar-size-default);
    block-size: var(--cd-avatar-size-default);
    background: var(--cd-avatar-bg);
    color: var(--cd-avatar-color);
    border-radius: var(--cd-avatar-radius);
    overflow: hidden;
    user-select: none;
    font-weight: var(--cd-font-weight-medium);
    line-height: 1;
    vertical-align: middle;
  }
  .cd-avatar--circle {
    border-radius: var(--cd-border-radius-full);
  }
  /* 可交互头像：指针手势 + 可见焦点环（<a> 还需重置文字装饰/继承色）。 */
  .cd-avatar--interactive {
    cursor: pointer;
    text-decoration: none;
    color: var(--cd-avatar-color);
  }
  .cd-avatar--interactive:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-avatar--extra-small {
    inline-size: var(--cd-avatar-size-extra-small);
    block-size: var(--cd-avatar-size-extra-small);
    font-size: var(--cd-font-size-small);
  }
  .cd-avatar--small {
    inline-size: var(--cd-avatar-size-small);
    block-size: var(--cd-avatar-size-small);
    font-size: var(--cd-font-size-small);
  }
  .cd-avatar--default {
    inline-size: var(--cd-avatar-size-default);
    block-size: var(--cd-avatar-size-default);
    font-size: var(--cd-font-size-regular);
  }
  .cd-avatar--medium {
    inline-size: var(--cd-avatar-size-medium);
    block-size: var(--cd-avatar-size-medium);
    font-size: var(--cd-font-size-header-6);
  }
  .cd-avatar--large {
    inline-size: var(--cd-avatar-size-large);
    block-size: var(--cd-avatar-size-large);
    font-size: var(--cd-font-size-header-6);
  }
  .cd-avatar--extra-large {
    inline-size: var(--cd-avatar-size-extra-large);
    block-size: var(--cd-avatar-size-extra-large);
    font-size: var(--cd-font-size-header-4);
  }
  .cd-avatar__img {
    inline-size: 100%;
    block-size: 100%;
    object-fit: cover;
    display: block;
  }
  .cd-avatar__text {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
  }
  .cd-avatar__dot {
    position: absolute;
    inset-block-end: 0;
    inset-inline-end: 0;
    inline-size: 25%;
    block-size: 25%;
    min-inline-size: 6px;
    min-block-size: 6px;
    border-radius: var(--cd-border-radius-full);
    box-shadow: 0 0 0 2px var(--cd-color-bg-0);
  }
  .cd-avatar__hover-mask {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--cd-color-mask);
    color: var(--cd-color-text-inverse);
    opacity: 0;
    transition: opacity 0.15s ease;
    border-radius: inherit;
  }
  .cd-avatar:hover .cd-avatar__hover-mask {
    opacity: 1;
  }
  .cd-avatar__slot {
    position: absolute;
    inset-inline-end: 0;
    display: inline-flex;
  }
  .cd-avatar__slot--top {
    inset-block-start: 0;
  }
  .cd-avatar__slot--bottom {
    inset-block-end: 0;
  }

  /* ============ 预设 16 档语义色板（对齐 Semi：bg=<color>-3, text=white）============ */
  .cd-avatar--amber {
    background: var(--cd-avatar-amber-bg);
    color: var(--cd-avatar-palette-text);
  }
  .cd-avatar--blue {
    background: var(--cd-avatar-blue-bg);
    color: var(--cd-avatar-palette-text);
  }
  .cd-avatar--cyan {
    background: var(--cd-avatar-cyan-bg);
    color: var(--cd-avatar-palette-text);
  }
  .cd-avatar--green {
    background: var(--cd-avatar-green-bg);
    color: var(--cd-avatar-palette-text);
  }
  .cd-avatar--grey {
    background: var(--cd-avatar-grey-bg);
    color: var(--cd-avatar-palette-text);
  }
  .cd-avatar--indigo {
    background: var(--cd-avatar-indigo-bg);
    color: var(--cd-avatar-palette-text);
  }
  .cd-avatar--light-blue {
    background: var(--cd-avatar-light-blue-bg);
    color: var(--cd-avatar-palette-text);
  }
  .cd-avatar--light-green {
    background: var(--cd-avatar-light-green-bg);
    color: var(--cd-avatar-palette-text);
  }
  .cd-avatar--lime {
    background: var(--cd-avatar-lime-bg);
    color: var(--cd-avatar-palette-text);
  }
  .cd-avatar--orange {
    background: var(--cd-avatar-orange-bg);
    color: var(--cd-avatar-palette-text);
  }
  .cd-avatar--pink {
    background: var(--cd-avatar-pink-bg);
    color: var(--cd-avatar-palette-text);
  }
  .cd-avatar--purple {
    background: var(--cd-avatar-purple-bg);
    color: var(--cd-avatar-palette-text);
  }
  .cd-avatar--red {
    background: var(--cd-avatar-red-bg);
    color: var(--cd-avatar-palette-text);
  }
  .cd-avatar--teal {
    background: var(--cd-avatar-teal-bg);
    color: var(--cd-avatar-palette-text);
  }
  .cd-avatar--violet {
    background: var(--cd-avatar-violet-bg);
    color: var(--cd-avatar-palette-text);
  }
  .cd-avatar--yellow {
    background: var(--cd-avatar-yellow-bg);
    color: var(--cd-avatar-palette-text);
  }

  /* ============ 呼吸描边环（对齐 Semi additionalBorder）============ */
  .cd-avatar-wrapper {
    position: relative;
    display: inline-flex;
    inline-size: fit-content;
    vertical-align: middle;
  }
  /* 环置于头像外侧：负偏移 = 描边宽 + 间距；消费 additionalBorder token。 */
  .cd-avatar__border {
    position: absolute;
    inset: calc(-1 * (var(--cd-avatar-additional-border-width) + var(--cd-avatar-additional-border-gap)));
    border: var(--cd-avatar-additional-border-width) solid var(--cd-avatar-additional-border-color);
    box-sizing: border-box;
    pointer-events: none;
  }
  .cd-avatar__border--circle {
    border-radius: var(--cd-border-radius-full);
  }
  .cd-avatar__border--square {
    border-radius: var(--cd-avatar-radius);
  }
  /* motion 呼吸：透明度淡出 + 轻微放大，无限循环（对齐 Semi keyframes）。 */
  .cd-avatar__border--animated {
    animation: cd-avatar-breathe var(--cd-avatar-additional-border-duration) linear infinite;
  }
  @keyframes cd-avatar-breathe {
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
  @media (prefers-reduced-motion: reduce) {
    .cd-avatar__border--animated {
      animation: none;
    }
  }
</style>
