<!--
  Avatar.Group — overlapping row of avatars.
  Two modes:
    1. data-driven `items` → supports maxCount collapse into a "+M" avatar
       (collapse is a pure derived computation, no DOM measurement).
    2. free-form `children` snippet → custom overlapping avatars, no collapse.
  Group-level shape/size are shared to child Avatars via context; each child's
  own prop still wins (red line: child override > group > standalone default).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import Avatar from './Avatar.svelte';
  import { useLocale } from '../locale-provider/index.js';
  import {
    setAvatarGroupContext,
    type AvatarShape,
    type AvatarSizeEnum,
  } from './context.js';

  /** One member when using the data-driven `items` API. */
  export interface AvatarGroupItem {
    src?: string;
    srcset?: string;
    alt?: string;
    color?: 'auto' | string;
    /** text/initials fallback content */
    content?: string;
  }

  interface Props {
    /** data-driven members; enables maxCount collapse */
    items?: AvatarGroupItem[];
    /** show at most N avatars, the rest collapse into a "+M" avatar */
    maxCount?: number;
    /** shared shape for all child avatars (child prop overrides) */
    shape?: AvatarShape;
    /** shared size for all child avatars (child prop overrides) */
    size?: AvatarSizeEnum | number;
    /** overlap distance between adjacent avatars in px */
    overlapFrom?: number;
    /** click handler for the "+M" overflow avatar */
    onMore?: () => void;
    /** 自定义溢出头像渲染，参数为 {overlapList, count}。 */
    renderMore?: Snippet<[{ overlapList: AvatarGroupItem[]; count: number }]>;
    /** free-form avatars when not using `items` */
    children?: Snippet;
  }

  let {
    items,
    maxCount,
    shape,
    size,
    overlapFrom = 8,
    onMore,
    renderMore,
    children,
  }: Props = $props();

  const loc = useLocale();

  // share group config with descendant Avatars across the context boundary
  setAvatarGroupContext({
    getShape: () => shape,
    getSize: () => size,
  });

  // pure collapse computation — slice visible items and count the rest.
  const list = $derived(items ?? []);
  const overlapList = $derived(list.slice(limit));
  const limit = $derived(
    typeof maxCount === 'number' && maxCount >= 0 ? maxCount : list.length,
  );
  const visible = $derived(list.slice(0, limit));
  const restCount = $derived(Math.max(0, list.length - visible.length));

  const groupStyle = $derived(`--cd-avatar-overlap:${overlapFrom}px`);
</script>

<div class="cd-avatar-group" style={groupStyle} role="group">
  {#if items}
    {#each visible as item, i (i)}
      {@const { content, color, ...rest } = item}
      <span class="cd-avatar-group__item">
        <Avatar {...rest} color={color ?? 'grey'}>
          {#if content}{content}{/if}
        </Avatar>
      </span>
    {/each}
    {#if restCount > 0}
      <span class="cd-avatar-group__item">
        {#if renderMore}
          {@render renderMore({ overlapList, count: restCount })}
        {:else if onMore}
          <button type="button" class="cd-avatar-group__more-btn" onclick={onMore}>
            <Avatar color="grey" alt={loc().t('Avatar.moreAlt', { count: restCount })}>+{restCount}</Avatar>
          </button>
        {:else}
          <Avatar color="grey" alt={loc().t('Avatar.moreAlt', { count: restCount })}>+{restCount}</Avatar>
        {/if}
      </span>
    {/if}
  {:else if children}
    {@render children()}
  {/if}
</div>

<style>
  .cd-avatar-group {
    display: inline-flex;
    align-items: center;
  }
  /* later avatars overlap (and sit above) the previous ones */
  .cd-avatar-group :global(.cd-avatar),
  .cd-avatar-group__item {
    position: relative;
  }
  .cd-avatar-group > :global(.cd-avatar:not(:first-child)),
  .cd-avatar-group__item:not(:first-child) {
    margin-inline-start: calc(-1 * var(--cd-avatar-overlap, 8px));
  }
  /* ring so overlapping avatars read as separated */
  .cd-avatar-group > :global(.cd-avatar),
  .cd-avatar-group__item :global(.cd-avatar) {
    box-shadow: 0 0 0 2px var(--cd-color-bg-0);
  }
  .cd-avatar-group__item :global(.cd-avatar) {
    display: inline-flex;
  }
  .cd-avatar-group__more-btn {
    display: inline-flex;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
    border-radius: var(--cd-radius-full);
  }
  .cd-avatar-group__more-btn:focus-visible {
    outline: 2px solid var(--cd-color-primary);
    outline-offset: 2px;
  }
</style>
