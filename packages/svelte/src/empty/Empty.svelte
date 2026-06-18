<!--
  Empty — see specs/components/show/Empty.spec.md
  基础子集: 内置预设插画 (noData/noResult/error) + 标题 + 描述 + 动作 slot。
  TODO(延后): URL 外部图、horizontal layout、responsive 收缩、
    construction/success/noAccess 全套插画。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  type EmptyImage = 'noData' | 'noResult' | 'error';
  type Size = 'small' | 'default' | 'large';

  interface Props {
    image?: EmptyImage;
    title?: string;
    description?: string;
    size?: Size;
    class?: string;
    children?: Snippet;
    imageSlot?: Snippet;
  }

  let {
    image = 'noData',
    title,
    description,
    size = 'default',
    class: className = '',
    children,
    imageSlot,
  }: Props = $props();

  // TODO(i18n): 接 locale 包 Empty.* 文案
  const defaultTitles: Record<EmptyImage, string> = {
    noData: '暂无数据',
    noResult: '无搜索结果',
    error: '加载失败',
  };

  const resolvedTitle = $derived(title ?? defaultTitles[image]);

  const cls = $derived(
    ['cd-empty', `cd-empty--${size}`, className].filter(Boolean).join(' '),
  );
</script>

<div class={cls}>
  <div class="cd-empty__image" aria-hidden="true">
    {#if imageSlot}
      {@render imageSlot()}
    {:else if image === 'noData'}
      <svg viewBox="0 0 64 64" width="64" height="64" focusable="false">
        <rect
          x="12"
          y="16"
          width="40"
          height="32"
          rx="3"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        />
        <line x1="20" y1="26" x2="44" y2="26" stroke="currentColor" stroke-width="2" />
        <line x1="20" y1="34" x2="44" y2="34" stroke="currentColor" stroke-width="2" />
      </svg>
    {:else if image === 'noResult'}
      <svg viewBox="0 0 64 64" width="64" height="64" focusable="false">
        <circle
          cx="28"
          cy="28"
          r="14"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        />
        <line x1="38" y1="38" x2="50" y2="50" stroke="currentColor" stroke-width="2" />
      </svg>
    {:else}
      <svg viewBox="0 0 64 64" width="64" height="64" focusable="false">
        <path
          d="M32 12 56 52H8L32 12Z"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linejoin="round"
        />
        <line x1="32" y1="28" x2="32" y2="40" stroke="currentColor" stroke-width="2" />
        <circle cx="32" cy="46" r="1.5" fill="currentColor" />
      </svg>
    {/if}
  </div>

  {#if resolvedTitle}
    <p class="cd-empty__title">{resolvedTitle}</p>
  {/if}

  {#if description}
    <p class="cd-empty__description">{description}</p>
  {/if}

  {#if children}
    <div class="cd-empty__footer">
      {@render children()}
    </div>
  {/if}
</div>

<style>
  .cd-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--cd-empty-gap);
    text-align: center;
  }
  .cd-empty__image {
    display: inline-flex;
    color: var(--cd-empty-image-color);
  }
  .cd-empty--small .cd-empty__image :global(svg) {
    inline-size: 48px;
    block-size: 48px;
  }
  .cd-empty--large .cd-empty__image :global(svg) {
    inline-size: 80px;
    block-size: 80px;
  }
  .cd-empty__title {
    margin: 0;
    color: var(--cd-empty-title-color);
  }
  .cd-empty__description {
    margin: 0;
    color: var(--cd-empty-desc-color);
  }
  .cd-empty__footer {
    margin-block-start: var(--cd-empty-gap);
  }
</style>
