<!--
  SideBar — AI 侧边信息栏主壳（P1）。see specs/components/show/SideBar.spec.md §4.1。
  按 mode 路由：mode='main' 渲染顶部 Options 图标 tab 组 + renderMainContent(activeKey)；
  mode 非 main（detail）渲染 renderDetailHeader + 返回按钮（onBackWard，可异步）+ renderDetailContent(mode)。
  detail 里 code/file 的具体渲染留给 P4/P5，本阶段只做 renderDetailContent 自定义路径 + 路由骨架。
  受控 activeKey（红线 #1）：不回写，仅经 onActiveOptionChange 通知。返回按钮异步：await onBackWard
  期间禁用防重复触发。P0 Container 浮层壳/可伸缩/焦点管理由使用方外包 <SideBarContainer>（分层解耦）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useLocale } from '../locale-provider/index.js';
  import SideBarOptions from './SideBarOptions.svelte';
  import type { SideBarOption, SideBarMode } from './types.js';

  interface Props {
    /** 展示模式。main 主视图，其余详情视图。默认 'main'。 */
    mode?: SideBarMode;
    /** 主视图激活 option key。 */
    activeKey?: string;
    /** 顶部图标 tab 组。 */
    options?: SideBarOption[];
    /** option 切换回调（受控，不回写 activeKey）。 */
    onActiveOptionChange?: ((e: Event, key: string) => void) | undefined;
    /** 主视图内容（按 activeKey 渲染）。 */
    renderMainContent?: Snippet<[string | undefined]>;
    /** 详情内容（按 mode 渲染）。 */
    renderDetailContent?: Snippet<[SideBarMode]>;
    /** 详情头部（按 mode 渲染，返回按钮之后）。 */
    renderDetailHeader?: Snippet<[SideBarMode]>;
    /** 详情返回主视图（可异步）。 */
    onBackWard?: ((e: Event, mode: SideBarMode) => void | Promise<void>) | undefined;
    /** 根自定义类名。 */
    class?: string;
    /** 根自定义内联样式。 */
    style?: string;
  }

  let {
    mode = 'main',
    activeKey,
    options = [],
    onActiveOptionChange,
    renderMainContent,
    renderDetailContent,
    renderDetailHeader,
    onBackWard,
    class: className,
    style,
  }: Props = $props();

  const loc = useLocale();

  const isMain = $derived(mode === 'main');

  // 返回按钮异步态：await onBackWard 期间禁用防重复触发（红线 #1：不改 mode，由使用方切换）。
  let backPending = $state(false);
  async function handleBack(e: Event): Promise<void> {
    if (backPending) return;
    const ret = onBackWard?.(e, mode);
    if (ret instanceof Promise) {
      backPending = true;
      try {
        await ret;
      } finally {
        backPending = false;
      }
    }
  }

  const rootCls = $derived(['cd-sidebar', className].filter(Boolean).join(' '));
  const backLabel = $derived(loc().t('SideBar.back'));
</script>

<div class={rootCls} {style}>
  {#if isMain}
    {#if options.length > 0}
      <SideBarOptions {options} {activeKey} {onActiveOptionChange} />
    {/if}
    <div class="cd-sidebar__main">
      {@render renderMainContent?.(activeKey)}
    </div>
  {:else}
    <div class="cd-sidebar__detail-header">
      <button
        type="button"
        class="cd-sidebar__back"
        aria-label={backLabel}
        disabled={backPending}
        onclick={handleBack}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M10 3L5 8l5 5"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      {#if renderDetailHeader}
        <div class="cd-sidebar__detail-header-content">
          {@render renderDetailHeader(mode)}
        </div>
      {/if}
    </div>
    <div class="cd-sidebar__detail">
      {@render renderDetailContent?.(mode)}
    </div>
  {/if}
</div>

<style>
  .cd-sidebar {
    display: flex;
    flex-direction: column;
    block-size: 100%;
    min-block-size: 0;
    color: var(--cd-sidebar-color);
  }
  .cd-sidebar__main,
  .cd-sidebar__detail {
    flex: 1;
    min-block-size: 0;
    overflow: auto;
  }
  .cd-sidebar__detail-header {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: var(--cd-spacing-tight, 8px);
    padding: var(--cd-sidebar-header-padding);
    border-block-end: 1px solid var(--cd-sidebar-border);
  }
  .cd-sidebar__detail-header-content {
    flex: 1;
    min-inline-size: 0;
  }
  .cd-sidebar__back {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    inline-size: 28px;
    block-size: 28px;
    padding: 0;
    border: none;
    border-radius: var(--cd-sidebar-close-radius);
    background: transparent;
    color: var(--cd-sidebar-back-color);
    cursor: pointer;
  }
  .cd-sidebar__back:hover:not(:disabled) {
    background: var(--cd-sidebar-back-hover-bg);
  }
  .cd-sidebar__back:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  .cd-sidebar__back:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  /* RTL：返回箭头方向翻转。 */
  :global([dir='rtl']) .cd-sidebar__back svg {
    transform: scaleX(-1);
  }
</style>
