<!--
  TagGroup — 严格对齐 Semi semi-ui/tag/group.tsx。
  一组 Tag 成组渲染；超过 maxTagCount 折叠剩余为「+N」标签，
  showPopover 时 hover 在 Popover（showArrow / trigger=hover / position=top）弹层展示被折叠的 Tag。
  数据驱动（tagList）或 mode='custom'（tagList 直接是 Tag 节点数组）两种用法。复用本库 Tag / Popover。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useLocale } from '../locale-provider/index.js';
  import Tag from './Tag.svelte';
  import Popover from '../popover/Popover.svelte';

  type TagSize = 'small' | 'default' | 'large';
  type AvatarShape = 'circle' | 'square';

  /** 单个 Tag 的数据项（tagList 普通用法）。透传给 Tag 的常用 props 子集。 */
  interface TagItem {
    tagKey?: string | number;
    children?: string;
    color?: string;
    type?: 'light' | 'solid' | 'ghost';
    closable?: boolean;
    avatarSrc?: string;
    size?: TagSize;
    avatarShape?: AvatarShape;
    onClose?: (tagChildren: unknown, e: unknown, tagKey: string | number | undefined) => void;
    [key: string]: unknown;
  }

  interface Props {
    /** 数据驱动的标签数据（对齐 Semi tagList）。mode='custom' 时元素为 Tag 节点 Snippet */
    tagList?: TagItem[];
    /** 最大数量限制，超出后显示为 +N（对齐 Semi maxTagCount） */
    maxTagCount?: number;
    /** 直接指定折叠数量（对齐 Semi restCount，覆盖自动计算） */
    restCount?: number;
    /** 标签尺寸，透传各 Tag（对齐 Semi size） */
    size?: TagSize;
    /** 标签内头像形状，透传（对齐 Semi avatarShape） */
    avatarShape?: AvatarShape;
    /** hover 到 +N 时是否通过 Popover 展示剩余（对齐 Semi showPopover，默认 false） */
    showPopover?: boolean;
    /** 弹层透传（对齐 Semi popoverProps） */
    popoverProps?: Record<string, unknown>;
    /** 删除 TagGroup 中的 Tag 回调（对齐 Semi onTagClose(tagChildren, e, tagKey)） */
    onTagClose?: (
      tagChildren: unknown,
      e: unknown,
      tagKey: string | number | undefined,
    ) => void;
    /** 鼠标进入 +N 回调（对齐 Semi onPlusNMouseEnter） */
    onPlusNMouseEnter?: (e: MouseEvent) => void;
    /** 透传根类名（对齐 Semi className） */
    class?: string;
    /** 透传根内联样式（对齐 Semi style） */
    style?: string;
  }

  let {
    tagList = [],
    maxTagCount,
    restCount,
    size = 'default',
    avatarShape,
    showPopover = false,
    popoverProps,
    onTagClose,
    onPlusNMouseEnter,
    class: className,
    style,
  }: Props = $props();

  const loc = useLocale();

  // 折叠计数（对齐 Semi renderMergeTags：n = restCount ?? tagList.length - maxTagCount）。
  const n = $derived(
    restCount !== undefined ? restCount : (maxTagCount !== undefined ? tagList.length - maxTagCount : 0),
  );
  // 可见 / 折叠划分（对齐 Semi：normalTags=slice(0,maxTagCount)、restTags=slice(maxTagCount)）。
  const normalTags = $derived(
    maxTagCount !== undefined ? tagList.slice(0, maxTagCount) : tagList,
  );
  const restTags = $derived(
    maxTagCount !== undefined ? tagList.slice(maxTagCount) : [],
  );
  const showN = $derived(maxTagCount !== undefined && n > 0);

  const restLabel = $derived(loc().t('TagGroup.restTagsAriaLabel', { count: n }));

  const rootCls = $derived(
    ['cd-tag-group', maxTagCount !== undefined && 'cd-tag-group--max', `cd-tag-group--${size}`, className]
      .filter(Boolean)
      .join(' '),
  );

  // 透传给每个 Tag 的公共 props（对齐 Semi renderAllTags：size / avatarShape / tagKey 补全）。
  function tagProps(item: TagItem, i: number): Record<string, unknown> {
    const { children: _c, tagKey, onClose: _o, ...rest } = item;
    const p: Record<string, unknown> = { ...rest };
    if (p.size === undefined) p.size = size;
    if (p.avatarShape === undefined && avatarShape !== undefined) p.avatarShape = avatarShape;
    p.tagKey = tagKey ?? (typeof item.children === 'string' ? item.children : i);
    return p;
  }

  function handleClose(item: TagItem, e: unknown) {
    const key = item.tagKey ?? (typeof item.children === 'string' ? item.children : undefined);
    item.onClose?.(item.children, e, key);
    onTagClose?.(item.children, e, key);
  }
</script>

<div class={rootCls} {style}>
  {#each normalTags as item, i (item.tagKey ?? i)}
    <Tag {...tagProps(item, i)} onClose={(_c, e) => handleClose(item, e)}>
      {item.children ?? ''}
    </Tag>
  {/each}

  {#if showN}
    {#if showPopover}
      <Popover showArrow trigger="hover" position="top" autoAdjustOverflow {...(popoverProps ?? {})}>
        {#snippet content()}
          <div class="cd-tag-rest-group-popover" role="group" aria-label={restLabel}>
            {#each restTags as item, i (item.tagKey ?? `rest-${i}`)}
              <Tag {...tagProps(item, i)}>{item.children ?? ''}</Tag>
            {/each}
          </div>
        {/snippet}
        {@render nTag()}
      </Popover>
    {:else}
      {@render nTag()}
    {/if}
  {/if}
</div>

<!-- +N 标签：对齐 Semi renderNTag（closable=false、color=grey、透明底、size 跟随组） -->
{#snippet nTag()}
  <span
    class="cd-tag-group__n"
    onmouseenter={onPlusNMouseEnter}
    role="presentation"
  >
    <Tag {size} color="grey" ariaLabel={restLabel} style="background-color: transparent;">+{n}</Tag>
  </span>
{/snippet}

<style>
  /* —— 组容器（对齐 Semi .semi-tag-group）—— */
  .cd-tag-group {
    display: block;
    height: auto;
  }
  .cd-tag-group :global(.cd-tag) {
    margin-bottom: 0;
    margin-right: var(--cd-tag-group-margin-right);
  }
  /* 折叠模式高度（对齐 Semi &-max.&-group-small/large = tag 高 + 2px）—— */
  .cd-tag-group--max.cd-tag-group--small,
  .cd-tag-group--max.cd-tag-group--default {
    height: calc(var(--cd-tag-height-small) + 2px);
  }
  .cd-tag-group--max.cd-tag-group--large {
    height: calc(var(--cd-tag-height-large) + 2px);
  }

  .cd-tag-group__n {
    display: inline-flex;
  }

  /* —— 折叠弹层内的标签（对齐 Semi .semi-tag-rest-group-popover）—— */
  .cd-tag-rest-group-popover {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
  }
  .cd-tag-rest-group-popover :global(.cd-tag) {
    margin-right: var(--cd-tag-group-margin-right);
    margin-bottom: 0;
  }
  .cd-tag-rest-group-popover :global(.cd-tag:last-of-type) {
    margin-right: 0;
  }
</style>
