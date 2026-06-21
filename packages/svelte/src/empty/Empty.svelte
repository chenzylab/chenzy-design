<!--
  Empty — see specs/components/show/Empty.spec.md
  内置预设插画 (noData/noResult/error/construction/success/noAccess)
  | 外部图片 URL | 自定义 snippet
  + 标题 + 描述 + 动作 slot。layout=vertical|horizontal，responsive 窄容器收缩。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useLocale } from '../locale-provider/index.js';

  type EmptyImage =
    | 'noData'
    | 'noResult'
    | 'error'
    | 'construction'
    | 'success'
    | 'noAccess';
  type Size = 'small' | 'default' | 'large';
  type Layout = 'vertical' | 'horizontal';

  interface Props {
    /** 内置预设名，或外部图片 URL（非预设字符串按 URL 渲染 <img>） */
    image?: EmptyImage | (string & {});
    title?: string;
    description?: string;
    size?: Size;
    /** 排布方向；horizontal 在窄容器自动降级为 vertical（需 responsive） */
    layout?: Layout;
    /** 是否启用容器宽度自适应收缩（CSS 容器查询，纯样式） */
    responsive?: boolean;
    class?: string;
    children?: Snippet;
    imageSlot?: Snippet;
  }

  let {
    image = 'noData',
    title,
    description,
    size = 'default',
    layout = 'vertical',
    responsive = true,
    class: className = '',
    children,
    imageSlot,
  }: Props = $props();

  const loc = useLocale();

  const presets = [
    'noData',
    'noResult',
    'error',
    'construction',
    'success',
    'noAccess',
  ] as const;
  // 纯派生：image 是否为内置预设；否则按外部图片 URL 处理。
  const isPreset = $derived(
    (presets as readonly string[]).includes(image),
  );

  const defaultTitles = $derived<Record<EmptyImage, string>>({
    noData: loc().t('Empty.noData'),
    noResult: loc().t('Empty.noResult'),
    error: loc().t('Empty.error'),
    construction: loc().t('Empty.construction'),
    success: loc().t('Empty.success'),
    noAccess: loc().t('Empty.noAccess'),
  });

  const resolvedTitle = $derived(
    title ?? (isPreset ? defaultTitles[image as EmptyImage] : undefined),
  );

  const cls = $derived(
    [
      'cd-empty',
      `cd-empty--${size}`,
      responsive && 'cd-empty--responsive',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );
  // 内层承载 flex 布局方向；root 仅作 CSS 容器（容器查询只能影响后代）
  const layoutCls = $derived(`cd-empty__layout cd-empty__layout--${layout}`);
</script>

<div class={cls}>
  <div class={layoutCls}>
  <div class="cd-empty__image" aria-hidden={isPreset ? 'true' : undefined}>
    {#if imageSlot}
      {@render imageSlot()}
    {:else if !isPreset}
      <img
        class="cd-empty__img"
        src={image}
        alt={resolvedTitle ?? ''}
        loading="lazy"
      />
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
    {:else if image === 'construction'}
      <svg viewBox="0 0 64 64" width="64" height="64" focusable="false">
        <path
          d="M10 48 24 18l3 6-11 24Z"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linejoin="round"
        />
        <path
          d="M54 48 40 18l-3 6 11 24Z"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linejoin="round"
        />
        <line x1="24" y1="18" x2="40" y2="18" stroke="currentColor" stroke-width="2" />
        <line x1="8" y1="48" x2="56" y2="48" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    {:else if image === 'success'}
      <svg viewBox="0 0 64 64" width="64" height="64" focusable="false">
        <circle
          cx="32"
          cy="32"
          r="20"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        />
        <path
          d="M22 33 29 40 43 25"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    {:else if image === 'noAccess'}
      <svg viewBox="0 0 64 64" width="64" height="64" focusable="false">
        <rect
          x="18"
          y="30"
          width="28"
          height="20"
          rx="3"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        />
        <path
          d="M24 30v-6a8 8 0 0 1 16 0v6"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
        <circle cx="32" cy="38" r="2" fill="currentColor" />
        <line x1="32" y1="40" x2="32" y2="44" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
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

  {#if resolvedTitle || description || children}
    <div class="cd-empty__content">
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
  {/if}
  </div>
</div>

<style>
  /* root 仅负责作 CSS 查询容器（responsive 时）；布局在内层 __layout */
  .cd-empty--responsive {
    container-type: inline-size;
  }
  .cd-empty__layout {
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
  .cd-empty__content {
    display: flex;
    flex-direction: column;
    align-items: inherit;
    gap: var(--cd-empty-gap);
  }
  .cd-empty__img {
    display: block;
    inline-size: 64px;
    block-size: auto;
    object-fit: contain;
  }
  .cd-empty--small .cd-empty__image :global(svg),
  .cd-empty--small .cd-empty__img {
    inline-size: 48px;
    block-size: 48px;
  }
  .cd-empty--large .cd-empty__image :global(svg),
  .cd-empty--large .cd-empty__img {
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

  /* horizontal：插画在前、文案在后，左右排列并垂直居中 */
  .cd-empty__layout--horizontal {
    flex-direction: row;
    align-items: center;
    justify-content: center;
    text-align: start;
  }
  /* horizontal 下文案列左对齐 */
  .cd-empty__layout--horizontal .cd-empty__content {
    align-items: flex-start;
  }

  /* 响应式收缩：root 容器窄于断点时插画变小，horizontal 降级为 vertical。
     容器查询只作用于后代，故查询 root、命中内层 __layout */
  @container (max-width: 320px) {
    .cd-empty--responsive .cd-empty__layout--horizontal {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .cd-empty--responsive .cd-empty__layout--horizontal .cd-empty__content {
      align-items: center;
    }
    .cd-empty--responsive .cd-empty__image :global(svg),
    .cd-empty--responsive .cd-empty__img {
      inline-size: 48px;
      block-size: 48px;
    }
  }
</style>
