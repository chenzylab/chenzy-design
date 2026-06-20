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
    'var(--cd-color-yellow-6)',
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

  function handleError() {
    failed = true;
  }
</script>

<span
  class={cls}
  style={rootStyle || undefined}
  role={showImage ? undefined : 'img'}
  aria-label={showImage ? undefined : ariaLabel}
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
</span>

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
