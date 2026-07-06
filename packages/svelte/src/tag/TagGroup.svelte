<!--
  TagGroup — see specs/components/show/TagGroup.spec.md
  一组 Tag 成组渲染；超过 maxTagCount 折叠剩余为「+N」标签，
  hover/点击在 Popover 弹层内展示被折叠的 Tag。数据驱动（tagList）或子元素（children）两种用法。
  复用本库 Tag / Popover。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useLocale } from '../locale-provider/index.js';
  import Tag from './Tag.svelte';
  import Popover from '../popover/Popover.svelte';

  type TagSize = 'small' | 'default' | 'large';
  type AvatarShape = 'circle' | 'square';

  /** 单个 Tag 的数据项（tagList 用法）。透传给 Tag 的常用 props 子集。 */
  interface TagItem {
    /** 稳定标识（列表 key / onTagClose 回传） */
    tagKey?: string | number;
    /** 纯文本内容（同时作为 closable 关闭按钮的无障碍名） */
    children?: string;
    color?: 'grey' | 'primary' | 'success' | 'warning' | 'danger';
    type?: 'light' | 'solid' | 'ghost';
    closable?: boolean;
    disabled?: boolean;
    avatarSrc?: string;
    /** 其余任意 Tag prop 透传 */
    [key: string]: unknown;
  }

  interface Props {
    /** 数据驱动的标签数据（与 children 二选一） */
    tagList?: TagItem[];
    /** 最多展示的标签数，超出折叠为 +N */
    maxTagCount?: number;
    /** 直接指定折叠数量（覆盖自动计算，用于外部已知总数场景） */
    restCount?: number;
    /** 标签尺寸（透传各 Tag） */
    size?: TagSize;
    /** 标签内头像形状（透传） */
    avatarShape?: AvatarShape;
    /** +N 是否 hover 弹层展示剩余 */
    showPopover?: boolean;
    /** 弹层透传（复用本库 Popover） */
    popoverProps?: Record<string, unknown>;
    /** 关闭某标签回调（回传该项 tagKey 与索引） */
    onTagClose?: (tagKey: string | number | undefined, index: number) => void;
    /** 鼠标进入 +N 回调 */
    onPlusNMouseEnter?: () => void;
    /** 透传根类名 */
    class?: string;
    /** 透传根内联样式 */
    style?: string;
    /** 子 Tag（与 tagList 二选一） */
    children?: Snippet;
  }

  let {
    tagList,
    maxTagCount,
    restCount,
    size = 'default',
    avatarShape,
    showPopover = true,
    popoverProps,
    onTagClose,
    onPlusNMouseEnter,
    class: className,
    style,
    children,
  }: Props = $props();

  const loc = useLocale();

  // 数据驱动模式下的可见 / 折叠划分。
  const list = $derived(tagList ?? []);
  const hasList = $derived(tagList !== undefined);

  // 可见数量：有 maxTagCount 且列表更长时截断，否则全展示。
  const visibleCount = $derived(
    maxTagCount !== undefined && list.length > maxTagCount ? maxTagCount : list.length,
  );

  const visibleTags = $derived(list.slice(0, visibleCount));
  const restTags = $derived(list.slice(visibleCount));

  // 折叠计数：restCount 显式覆盖，否则按截断数量。
  const nCount = $derived(
    restCount !== undefined ? restCount : list.length - visibleCount,
  );
  const showN = $derived(nCount > 0);

  const restLabel = $derived(loc().t('TagGroup.restTagsAriaLabel', { count: nCount }));

  const rootCls = $derived(['cd-taggroup', className].filter(Boolean).join(' '));

  // 透传给每个 Tag 的公共 props（条件 spread，避免显式 undefined 触发 exactOptionalPropertyTypes）。
  function tagCommon(): Record<string, unknown> {
    const p: Record<string, unknown> = { size };
    if (avatarShape !== undefined) p.avatarShape = avatarShape;
    return p;
  }

  // 从数据项剥离非 Tag prop（children 文本 / tagKey）后透传给 Tag，
  // 避免 children:string 与 Tag 的 children:Snippet 冲突。
  // 条件写入 tagText（exactOptionalPropertyTypes：不显式传 undefined）：
  // children 为字符串时派生关闭按钮无障碍名。
  function tagProps(item: TagItem): Record<string, unknown> {
    const { children: text, tagKey: _k, ...rest } = item;
    if (typeof text === 'string' && text !== '') rest.tagText = text;
    return rest;
  }

  function handleClose(item: TagItem, index: number) {
    onTagClose?.(item.tagKey, index);
  }
</script>

<div class={rootCls} {style} role="group">
  {#if hasList}
    {#each visibleTags as item, i (item.tagKey ?? i)}
      <Tag
        {...tagCommon()}
        {...tagProps(item)}
        onClose={() => handleClose(item, i)}
      >
        {item.children ?? ''}
      </Tag>
    {/each}
  {:else if children}
    {@render children()}
  {/if}

  {#if showN}
    {#if showPopover && restTags.length > 0}
      <Popover trigger="hover" {...(popoverProps ?? {})}>
        {#snippet contentSlot()}
          <div class="cd-taggroup__rest" role="group" aria-label={restLabel}>
            {#each restTags as item, i (item.tagKey ?? `rest-${i}`)}
              <Tag {...tagCommon()} {...tagProps(item)}>{item.children ?? ''}</Tag>
            {/each}
          </div>
        {/snippet}
        {@render plusN()}
      </Popover>
    {:else}
      {@render plusN()}
    {/if}
  {/if}
</div>

{#snippet plusN()}
  <span
    class="cd-taggroup__plus"
    role="button"
    tabindex="0"
    aria-label={restLabel}
    onmouseenter={onPlusNMouseEnter}
  >
    <Tag {...tagCommon()} color="grey">+{nCount}</Tag>
  </span>
{/snippet}

<style>
  .cd-taggroup {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--cd-taggroup-gap);
  }
  .cd-taggroup__plus {
    display: inline-flex;
    cursor: default;
    border-radius: var(--cd-border-radius-small);
  }
  .cd-taggroup__plus:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-taggroup__rest {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--cd-taggroup-gap);
    max-inline-size: 240px;
  }
</style>
