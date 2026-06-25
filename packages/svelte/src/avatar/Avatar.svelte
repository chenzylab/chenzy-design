<!--
  Avatar — see specs/components/show/Avatar.spec.md
  Display atom: image with text fallback, status dot, color hashing.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getAvatarGroupContext, type AvatarShape, type AvatarSizeEnum } from './context.js';

  type AvatarStatus = 'default' | 'warning' | 'error';

  interface Props {
    src?: string;
    srcset?: string;
    alt?: string;
    shape?: AvatarShape;
    size?: AvatarSizeEnum | number;
    color?: 'auto' | string;
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
    children?: Snippet;
  }

  let {
    src,
    srcset,
    alt,
    shape: shapeProp,
    size: sizeProp,
    color = 'grey',
    status = 'default',
    dot = false,
    dotColor,
    gap = 3,
    href,
    target,
    onClick,
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

  // resolved background: 'auto' → hashed palette color; explicit color → inline value
  const bgColor = $derived(
    color === 'auto' ? autoColor : color === 'grey' ? undefined : color,
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
    ]
      .filter(Boolean)
      .join(' '),
  );

  const rootStyle = $derived(
    [
      sizeIsNumber ? `inline-size:${size}px;block-size:${size}px` : '',
      bgColor ? `background:${bgColor}` : '',
      sizeIsNumber ? `font-size:${Math.round((size as number) / 2.4)}px` : '',
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

  function handleError() {
    failed = true;
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
      onerror={handleError}
    />
  {:else if children}
    <span class="cd-avatar__text" style={textStyle || undefined}>{@render children()}</span>
  {:else if fallbackText}
    <span class="cd-avatar__text" style={textStyle || undefined}>{fallbackText}</span>
  {/if}

  {#if dot}
    <span class="cd-avatar__dot" style="background:{dotBg}" aria-hidden="true"></span>
  {/if}
</svelte:element>

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
    border-radius: var(--cd-radius-full);
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
    font-size: var(--cd-font-size-1);
  }
  .cd-avatar--small {
    inline-size: var(--cd-avatar-size-small);
    block-size: var(--cd-avatar-size-small);
    font-size: var(--cd-font-size-1);
  }
  .cd-avatar--default {
    inline-size: var(--cd-avatar-size-default);
    block-size: var(--cd-avatar-size-default);
    font-size: var(--cd-font-size-2);
  }
  .cd-avatar--large {
    inline-size: var(--cd-avatar-size-large);
    block-size: var(--cd-avatar-size-large);
    font-size: var(--cd-font-size-3);
  }
  .cd-avatar--extra-large {
    inline-size: var(--cd-avatar-size-extra-large);
    block-size: var(--cd-avatar-size-extra-large);
    font-size: var(--cd-font-size-4);
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
    border-radius: var(--cd-radius-full);
    box-shadow: 0 0 0 2px var(--cd-color-bg-0);
  }
</style>
