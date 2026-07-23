<!--
  Badge — 对齐 Semi Design Badge。
  在宿主元素角落展示 count/dot 徽标；count 为节点时直接渲染（custom）；无 children 时独立使用（block）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  type BadgeType = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'warning' | 'success';
  type BadgeTheme = 'solid' | 'light' | 'inverted';
  type BadgePosition = 'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom';

  interface Props {
    /** 徽标内容；数字/字符串按 overflowCount 处理，Snippet 时直接渲染（custom）。 */
    count?: number | string | Snippet;
    /** 不展示数字，显示小圆点（优先于 count）。 */
    dot?: boolean;
    /** 徽标类型（语义色）。 */
    type?: BadgeType;
    /** 徽标主题。 */
    theme?: BadgeTheme;
    /** 徽标位置（相对宿主四角）。 */
    position?: BadgePosition;
    /** 数字溢出阈值，超过显示 `${overflowCount}+`。 */
    overflowCount?: number;
    /** 徽标内容区域自定义样式（等价 Semi countStyle；style 优先）。 */
    countStyle?: string;
    /** 徽标内容区域自定义类名（等价 Semi countClassName）。 */
    countClass?: string;
    /** 徽标内容区域内联样式（等价 Semi style，优先于 countStyle）。 */
    style?: string;
    /** 根节点自定义类名。 */
    class?: string;
    onClick?: (e: MouseEvent) => void;
    onMouseEnter?: (e: MouseEvent) => void;
    onMouseLeave?: (e: MouseEvent) => void;
    /** 宿主子元素。 */
    children?: Snippet;
  }

  let {
    count,
    dot = false,
    type = 'primary',
    theme = 'solid',
    position,
    overflowCount,
    countStyle,
    countClass,
    style,
    class: className,
    onClick,
    onMouseEnter,
    onMouseLeave,
    children,
  }: Props = $props();

  // count 为 Snippet（节点）时视为 custom：不套用 type/theme 语义样式，直接渲染。
  const isSnippet = $derived(typeof count === 'function');
  const custom = $derived(count != null && isSnippet);
  const showBadge = $derived(count != null);

  // 数字溢出格式化（对齐 Semi：overflowCount && overflowCount < count → `${overflowCount}+`）。
  const content = $derived.by(() => {
    if (typeof count === 'number') {
      return overflowCount && overflowCount < count ? `${overflowCount}+` : `${count}`;
    }
    return count;
  });

  // count 为 Snippet 时的渲染句柄（isSnippet 保证类型）。
  const countSnippet = $derived(isSnippet ? (count as Snippet) : undefined);

  const resolvedPosition = $derived(position ?? 'rightTop');

  const wrapperCls = $derived(
    [
      countClass,
      !custom && `cd-badge-${type}`,
      !custom && `cd-badge-${theme}`,
      resolvedPosition && children && `cd-badge-${resolvedPosition}`,
      !children && 'cd-badge-block',
      dot && 'cd-badge-dot',
      !dot && !custom && showBadge && 'cd-badge-count',
      custom && 'cd-badge-custom',
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<span
  class={['cd-badge', className].filter(Boolean).join(' ')}
  onclick={onClick}
  onmouseenter={onMouseEnter}
  onmouseleave={onMouseLeave}
  role="presentation"
>
  {@render children?.()}
  <span class={wrapperCls} style={style || countStyle}>
    {#if dot}
      <!-- dot only -->
    {:else if countSnippet}
      {@render countSnippet()}
    {:else}
      {content}
    {/if}
  </span>
</span>

<style>
  .cd-badge {
    position: relative;
    display: inline-block;
  }

  .cd-badge-dot {
    box-sizing: border-box;
    width: var(--cd-width-badge-dot);
    height: var(--cd-height-badge-dot);
    border-radius: var(--cd-radius-badge-dot);
    background-color: var(--cd-color-badge-default-bg-default);
    border: var(--cd-width-badge-border) var(--cd-color-badge-default-border-default) solid;
    z-index: var(--cd-z-badge);
  }

  .cd-badge-count {
    box-sizing: border-box;
    height: var(--cd-height-badge-count);
    min-width: var(--cd-height-badge-count);
    border-radius: calc(var(--cd-height-badge-count) * 0.5);
    padding: var(--cd-spacing-badge-count-paddingy) var(--cd-spacing-badge-count-paddingx);
    background-color: var(--cd-color-badge-default-bg-default);
    border: var(--cd-width-badge-border) var(--cd-color-badge-default-border-default) solid;
    z-index: var(--cd-z-badge);
    text-align: center;
    font-size: var(--cd-font-size-small);
    /* 配套 Semi @include font-size-small 的 line-height:16px，等于内容区高度
       (18-2×1border)，让数字精确垂直居中；缺此会继承 body 21px 致数字偏上。 */
    line-height: var(--cd-line-height-small);
    font-weight: var(--cd-font-weight-regular);
    color: var(--cd-color-badge-default-text-default);
  }

  .cd-badge-rightTop {
    position: absolute;
    top: 0;
    inset-inline-end: 0;
    transform: translate(50%, -50%);
    transform-origin: 100% 0%;
  }
  .cd-badge-rightBottom {
    position: absolute;
    inset-inline-end: 0;
    bottom: 0;
    transform: translate(50%, 50%);
    transform-origin: 100% 0%;
  }
  .cd-badge-leftTop {
    position: absolute;
    top: 0;
    inset-inline-start: 0;
    transform: translate(-50%, -50%);
    transform-origin: 100% 0%;
  }
  .cd-badge-leftBottom {
    position: absolute;
    bottom: 0;
    inset-inline-start: 0;
    transform: translate(-50%, 50%);
    transform-origin: 100% 0%;
  }

  /* RTL：镜像水平平移（inset-inline 已处理锚点，transform 的 x 需翻向） */
  :global([dir='rtl']) .cd-badge-rightTop,
  :global([dir='rtl']) .cd-badge-rightBottom {
    transform: translate(-50%, var(--cd-badge-ty));
  }
  :global([dir='rtl']) .cd-badge-leftTop,
  :global([dir='rtl']) .cd-badge-leftBottom {
    transform: translate(50%, var(--cd-badge-ty));
  }
  .cd-badge-rightTop,
  .cd-badge-leftTop {
    --cd-badge-ty: -50%;
  }
  .cd-badge-rightBottom,
  .cd-badge-leftBottom {
    --cd-badge-ty: 50%;
  }

  .cd-badge-custom {
    display: flex;
  }

  .cd-badge-block {
    position: static;
    display: inline-block;
  }

  /* ── type × theme ── */
  .cd-badge-primary.cd-badge-solid {
    background-color: var(--cd-color-badge-primary-solid-bg-default);
    color: var(--cd-color-white);
  }
  .cd-badge-primary.cd-badge-light {
    background-color: var(--cd-color-badge-primary-light-bg-default);
    color: var(--cd-color-badge-primary-light-text-default);
  }
  .cd-badge-primary.cd-badge-inverted {
    color: var(--cd-color-badge-primary-inverted-text-default);
  }

  .cd-badge-secondary.cd-badge-solid {
    background-color: var(--cd-color-badge-secondary-solid-bg-default);
    color: var(--cd-color-white);
  }
  .cd-badge-secondary.cd-badge-light {
    background-color: var(--cd-color-badge-secondary-light-bg-default);
    color: var(--cd-color-badge-secondary-light-text-default);
  }
  .cd-badge-secondary.cd-badge-inverted {
    color: var(--cd-color-badge-secondary-inverted-text-default);
  }

  .cd-badge-tertiary.cd-badge-solid {
    background-color: var(--cd-color-badge-tertiary-solid-bg-default);
    color: var(--cd-color-white);
  }
  .cd-badge-tertiary.cd-badge-light {
    background-color: var(--cd-color-badge-tertiary-light-bg-default);
    color: var(--cd-color-badge-tertiary-light-text-default);
  }
  .cd-badge-tertiary.cd-badge-inverted {
    color: var(--cd-color-badge-tertiary-inverted-text-default);
  }

  .cd-badge-danger.cd-badge-solid {
    background-color: var(--cd-color-badge-danger-solid-bg-default);
    color: var(--cd-color-white);
  }
  .cd-badge-danger.cd-badge-light {
    background-color: var(--cd-color-badge-danger-light-bg-default);
    color: var(--cd-color-badge-danger-light-text-default);
  }
  .cd-badge-danger.cd-badge-inverted {
    color: var(--cd-color-badge-danger-inverted-text-default);
  }

  .cd-badge-warning.cd-badge-solid {
    background-color: var(--cd-color-badge-warning-solid-bg-default);
    color: var(--cd-color-white);
  }
  .cd-badge-warning.cd-badge-light {
    background-color: var(--cd-color-badge-warning-light-bg-default);
    color: var(--cd-color-badge-warning-light-text-default);
  }
  .cd-badge-warning.cd-badge-inverted {
    color: var(--cd-color-badge-warning-inverted-text-default);
  }

  .cd-badge-success.cd-badge-solid {
    background-color: var(--cd-color-badge-success-solid-bg-default);
    color: var(--cd-color-white);
  }
  .cd-badge-success.cd-badge-light {
    background-color: var(--cd-color-badge-success-light-bg-default);
    color: var(--cd-color-badge-success-light-text-default);
  }
  .cd-badge-success.cd-badge-inverted {
    color: var(--cd-color-badge-success-inverted-text-default);
  }
</style>
