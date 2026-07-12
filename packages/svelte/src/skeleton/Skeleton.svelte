<!--
  Skeleton — 骨架屏容器，镜像 Semi semi-ui/skeleton/index.tsx。
  loading=true 渲染 <div class="cd-skeleton">{placeholder}</div>；否则渲染 children。
  active 仅挂根容器类 cd-skeleton--active，经后代选择器作用到骨架块（对齐 Semi，不用 context）。
  本组件的 <style> 以 :global 承载全部骨架块样式（镜像 Semi skeleton.scss 单一全局样式表），
  故原子子组件（Avatar/Image/Title/Button/Paragraph）只输出裸 DOM + 类名，样式统一在此定义。
  loading 受控不回写：仅由父级 prop 驱动，组件内部不修改。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    /** 为 true 时显示占位元素，反之显示子组件。对齐 Semi，默认 true。 */
    loading?: boolean;
    /** 是否展示 shimmer 动画效果。对齐 Semi，默认 false。 */
    active?: boolean;
    /** 加载等待时的占位元素。 */
    placeholder?: Snippet;
    /** 真实内容。 */
    children?: Snippet;
    /** 容器类名，对齐 Semi className。 */
    class?: string;
    /** 容器内联样式，对齐 Semi style。 */
    style?: string;
  }

  let {
    loading = true,
    active = false,
    placeholder,
    children,
    class: className,
    style,
  }: Props = $props();

  const cls = $derived(
    ['cd-skeleton', active && 'cd-skeleton--active', className]
      .filter(Boolean)
      .join(' '),
  );
</script>

{#if loading}
  <div class={cls} {style}>
    {@render placeholder?.()}
  </div>
{:else}
  {@render children?.()}
{/if}

<style>
  /* —— 镜像 Semi semi-foundation/skeleton/skeleton.scss（全局，跨原子子组件后代选择器生效） —— */

  /* 基础块底色 + 圆角（avatar / image / title / button） */
  :global(.cd-skeleton-avatar),
  :global(.cd-skeleton-image),
  :global(.cd-skeleton-title),
  :global(.cd-skeleton-button) {
    background: var(--cd-color-skeleton-default-bg-default);
    border-radius: var(--cd-radius-skeleton-item);
  }

  /* Avatar 形状 */
  :global(.cd-skeleton-avatar-circle) {
    border-radius: 50%;
  }
  :global(.cd-skeleton-avatar-extra-extra-small) {
    width: var(--cd-width-skeleton-avatar-extra-extra-small);
    height: var(--cd-width-skeleton-avatar-extra-extra-small);
  }
  :global(.cd-skeleton-avatar-extra-small) {
    width: var(--cd-width-skeleton-avatar-extra-small);
    height: var(--cd-width-skeleton-avatar-extra-small);
  }
  :global(.cd-skeleton-avatar-small) {
    width: var(--cd-width-skeleton-avatar-small);
    height: var(--cd-width-skeleton-avatar-small);
  }
  :global(.cd-skeleton-avatar-medium) {
    width: var(--cd-width-skeleton-avatar-medium);
    height: var(--cd-width-skeleton-avatar-medium);
  }
  :global(.cd-skeleton-avatar-large) {
    width: var(--cd-width-skeleton-avatar-large);
    height: var(--cd-width-skeleton-avatar-large);
  }
  :global(.cd-skeleton-avatar-extra-large) {
    width: var(--cd-width-skeleton-avatar-extra-large);
    height: var(--cd-width-skeleton-avatar-extra-large);
  }

  /* Paragraph：ul + li，首行 100%、末行 60%，其余 100%，行下 margin */
  :global(.cd-skeleton-paragraph) {
    margin: 0;
    padding: 0;
    list-style-type: none;
  }
  :global(.cd-skeleton-paragraph li) {
    background: var(--cd-color-skeleton-default-bg-default);
    border-radius: var(--cd-radius-skeleton-li);
    width: 100%;
    height: var(--cd-height-skeleton-li);
    margin-bottom: var(--cd-spacing-skeleton-li-marginbottom);
  }
  :global(.cd-skeleton-paragraph li:last-child) {
    width: 60%;
    margin-bottom: 0;
  }
  :global(.cd-skeleton-paragraph li:first-child) {
    width: 100%;
  }

  /* Title */
  :global(.cd-skeleton-title) {
    width: 100%;
    height: var(--cd-height-skeleton-title);
  }

  /* Button */
  :global(.cd-skeleton-button) {
    width: var(--cd-width-skeleton-button);
    height: var(--cd-height-skeleton-button);
  }

  /* Image */
  :global(.cd-skeleton-image) {
    width: 100%;
    height: 100%;
  }

  /* active shimmer：根容器类经后代选择器作用到各块（对齐 Semi 渐变 25% / 44% / 88%） */
  :global(.cd-skeleton--active .cd-skeleton-avatar),
  :global(.cd-skeleton--active .cd-skeleton-image),
  :global(.cd-skeleton--active .cd-skeleton-title),
  :global(.cd-skeleton--active .cd-skeleton-button),
  :global(.cd-skeleton--active .cd-skeleton-paragraph li) {
    background: linear-gradient(
      90deg,
      var(--cd-color-skeleton-default-bg-default) 25%,
      var(--cd-color-skeleton-loading-gradient-bg-active) 44%,
      var(--cd-color-skeleton-default-bg-default) 88%
    );
    background-size: 400% 100%;
    animation: cd-skeleton-loading
      var(--cd-animation-duration-skeleton-highlight)
      var(--cd-animation-function-skeleton-highlight) infinite;
    animation-fill-mode: forwards;
  }

  @keyframes cd-skeleton-loading {
    0% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0 50%;
    }
  }

  /* RTL：镜像 Semi rtl.scss */
  :global([dir='rtl'] .cd-skeleton) {
    direction: rtl;
  }
</style>
