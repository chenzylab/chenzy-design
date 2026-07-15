<!--
  ToastItem — 单条轻提示卡片，严格对齐 Semi Design（semi-ui/toast/toast.tsx + toast.scss）。
  DOM 结构镜像 Semi：
    div.cd-toast[.cd-toast-{type}][.cd-toast-light][.cd-toast-rtl]
       role=alert aria-label="{type} type" onmouseenter onmouseleave
      div.cd-toast-content
        {icon}   ← 自定义 icon 或类型内置图标 span.cd-toast-icon.cd-toast-icon-{type}
        span.cd-toast-content-text[style=max-width]
        div.cd-toast-close-button > IconButton  ← showClose（tertiary/borderless/small）
    stack 时外包 div.cd-toast-zero-height-wrapper（hover 展开靠容器给 height）。
  行为对齐 Semi foundation：mouseenter → clearCloseTimer（pause）；mouseleave → startCloseTimer（resume，从头计时）。
  类型 default 无内置图标（对齐 Semi iconMap 只含 warning/success/info/error）。
  依赖组件均已对齐 Semi：IconButton、IconTickCircle/IconInfoCircle/IconAlertTriangle/IconAlertCircle/IconClose。
  content/icon 支持 string 文本或 Snippet（对齐 Semi ReactNode）。
  a11y：role=alert（对齐 Semi）；关闭按钮 IconButton 带 ariaLabel。不抢焦点、不锁滚动。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { ToastItem, ToastType } from '@chenzy-design/core';
  import IconButton from '../iconbutton/IconButton.svelte';
  import {
    IconClose,
    IconTickCircle,
    IconInfoCircle,
    IconAlertTriangle,
    IconAlertCircle,
  } from '@chenzy-design/icons';
  import { useLocale } from '../locale-provider/index.js';

  interface Props {
    toast: ToastItem;
    /** 容器移除该 toast（对齐 Semi close → notifyWrapperToRemove）。 */
    onClose: (id: string) => void;
    /** hover 暂停定时器（对齐 Semi clearCloseTimer_）。 */
    onPause: (id: string) => void;
    /** 离开恢复定时器（对齐 Semi startCloseTimer_）。 */
    onResume: (id: string) => void;
    /** stack 展开态（对齐 Semi stackExpanded）：true 时卡片自测高度撑开 zero-height-wrapper。 */
    expanded?: boolean;
    /** 该卡片在列表中的位置（stack 折叠时的 3D 层叠位移，对齐 Semi positionInList）。 */
    reservedIndex?: number | undefined;
  }

  let { toast, onClose, onPause, onResume, expanded = false, reservedIndex = 0 }: Props = $props();
  const loc = useLocale();

  // 有内置图标的类型（对齐 Semi iconMap：warning/success/info/error）。default 无内置图标。
  const hasTypeIcon = $derived(
    toast.type === 'success' ||
      toast.type === 'info' ||
      toast.type === 'warning' ||
      toast.type === 'error',
  );
  // 自定义 icon（Snippet）优先；否则类型内置图标。default 且无自定义 → 不渲染图标。
  const customIcon = $derived(toast.icon as Snippet | undefined);
  const hasIcon = $derived(Boolean(customIcon) || hasTypeIcon);

  // content 双形态：Snippet（函数）走 {@render}，否则按 string 文本渲染。
  const contentIsSnippet = $derived(typeof toast.content === 'function');
  const contentSnippet = $derived(toast.content as Snippet | undefined);
  const contentText = $derived(contentIsSnippet ? '' : String(toast.content ?? ''));

  const isRtl = $derived(toast.direction === 'rtl');
  const textMaxWidth = $derived(
    typeof toast.textMaxWidth === 'number' ? `${toast.textMaxWidth}px` : toast.textMaxWidth,
  );

  // 卡片根元素 ref（stack 展开时自测高度撑开 zero-height-wrapper，对齐 Semi getComputedStyle(toastEle).height）。
  let toastEl = $state<HTMLDivElement | null>(null);
  // stack 展开态的实测高度（px）；折叠或非 stack 时为 0（对齐 Semi height: stackExpanded && ... || 0）。
  const expandedHeight = $derived.by(() => {
    if (!toast.stack || !expanded || !toastEl) return 0;
    return toastEl.getBoundingClientRect().height;
  });

  function handlePause() {
    onPause(toast.id);
  }
  function handleResume() {
    onResume(toast.id);
  }
  function handleClose() {
    onClose(toast.id);
  }
</script>

{#snippet typeIcon(type: ToastType)}
  {#if type === 'success'}
    <IconTickCircle size="large" />
  {:else if type === 'info'}
    <IconInfoCircle size="large" />
  {:else if type === 'warning'}
    <IconAlertTriangle size="large" />
  {:else if type === 'error'}
    <IconAlertCircle size="large" />
  {/if}
{/snippet}

{#snippet card()}
  <!--
    对齐 Semi toast.tsx：根 div 承载 role=alert + mouseenter/leave（hover 暂停定时器）。
    这是 Semi 既有契约（div + onMouseEnter/Leave），非交互增强，故忽略「非交互元素挂事件」规则
    （关闭动作由可聚焦的 IconButton 承载，键盘用户可 Tab 操作）。
  -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    bind:this={toastEl}
    class="cd-toast cd-toast-{toast.type}"
    class:cd-toast-light={toast.theme === 'light'}
    class:cd-toast-rtl={isRtl}
    role="alert"
    aria-label="{toast.type} type"
    style:transform={toast.stack ? `translate3d(0,0,${reservedIndex * -10}px)` : undefined}
    onmouseenter={handlePause}
    onmouseleave={handleResume}
  >
    <div class="cd-toast-content">
      {#if hasIcon}
        <span class="cd-toast-icon cd-toast-icon-{toast.type}">
          {#if customIcon}
            {@render customIcon()}
          {:else}
            {@render typeIcon(toast.type)}
          {/if}
        </span>
      {/if}
      <span class="cd-toast-content-text" style:max-width={textMaxWidth}>
        {#if contentIsSnippet && contentSnippet}{@render contentSnippet()}{:else}{contentText}{/if}
      </span>
      {#if toast.showClose}
        <div class="cd-toast-close-button">
          <IconButton
            type="tertiary"
            theme="borderless"
            size="small"
            ariaLabel={loc().t('Toast.close')}
            icon={closeIcon}
            onclick={handleClose}
          />
        </div>
      {/if}
    </div>
  </div>
{/snippet}

{#snippet closeIcon()}
  <IconClose />
{/snippet}

{#if toast.stack}
  <div class="cd-toast-zero-height-wrapper" style:height={expandedHeight ? `${expandedHeight}px` : '0'}>
    {@render card()}
  </div>
{:else}
  {@render card()}
{/if}

<style>
  /* —— 卡片根（对齐 Semi .semi-toast，仅 pointer-events 与类型/多色修饰）—— */
  .cd-toast {
    pointer-events: none;
  }

  /* —— 内容卡片（对齐 Semi .semi-toast-content）——
     阴影/字号来自全局 mixin（Semi @include shadow-elevated / font-size-regular）。 */
  .cd-toast-content {
    pointer-events: all;
    box-shadow: var(--cd-shadow-elevated);
    font-size: var(--cd-font-size-regular);
    background-color: var(--cd-color-toast-bg-default);
    border-radius: var(--cd-radius-toast-content);
    padding: var(--cd-spacing-toast-content-paddingtop) var(--cd-spacing-toast-content-paddingright)
      var(--cd-spacing-toast-content-paddingbottom) var(--cd-spacing-toast-content-paddingleft);
    display: inline-flex;
    align-items: flex-start;
    justify-content: center;
    margin: var(--cd-spacing-toast-content-margin);
    font-weight: var(--cd-font-toast-content-fontweight);
    color: var(--cd-color-toast-text-default);
    box-sizing: border-box;
  }

  /* —— 关闭按钮（对齐 Semi .semi-toast-content .semi-toast-close-button）—— */
  .cd-toast-content .cd-toast-close-button {
    margin-top: var(--cd-spacing-toast-content-close-btn-margintop);
    height: var(--cd-width-icon-large);
  }

  /* —— 内容文本（对齐 Semi .semi-toast-content-text）—— */
  .cd-toast-content .cd-toast-content-text {
    margin-left: var(--cd-spacing-toast-content-text-marginleft);
    margin-right: var(--cd-spacing-toast-content-text-marginright);
    text-align: left;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  /* —— 类型图标颜色（对齐 Semi .semi-toast-icon-{type}）—— */
  .cd-toast-icon {
    display: inline-flex;
    align-items: center;
    flex: none;
  }
  .cd-toast-icon-warning {
    color: var(--cd-color-toast-warning-icon);
  }
  .cd-toast-icon-success {
    color: var(--cd-color-toast-success-icon);
  }
  .cd-toast-icon-info {
    color: var(--cd-color-toast-info-icon);
  }
  .cd-toast-icon-error {
    color: var(--cd-color-toast-danger-icon);
  }

  /* —— 多色填充样式 light（对齐 Semi .semi-toast-light）—— */
  .cd-toast-light.cd-toast-warning .cd-toast-content {
    background-color: var(--cd-color-toast-warning-light-bg);
    border: var(--cd-width-toast-light-border) solid var(--cd-color-toast-warning-light-border);
  }
  .cd-toast-light.cd-toast-warning .cd-toast-icon-warning {
    color: var(--cd-color-toast-warning-light-icon);
  }
  .cd-toast-light.cd-toast-success .cd-toast-content {
    background-color: var(--cd-color-toast-success-light-bg);
    border: var(--cd-width-toast-light-border) solid var(--cd-color-toast-success-light-border);
  }
  .cd-toast-light.cd-toast-success .cd-toast-icon-success {
    color: var(--cd-color-toast-success-light-icon);
  }
  .cd-toast-light.cd-toast-info .cd-toast-content {
    background-color: var(--cd-color-toast-info-light-bg);
    border: var(--cd-width-toast-light-border) solid var(--cd-color-toast-info-light-border);
  }
  .cd-toast-light.cd-toast-info .cd-toast-icon-info {
    color: var(--cd-color-toast-info-light-icon);
  }
  .cd-toast-light.cd-toast-error .cd-toast-content {
    background-color: var(--cd-color-toast-danger-light-bg);
    border: var(--cd-width-toast-light-border) solid var(--cd-color-toast-danger-light-border);
  }
  .cd-toast-light.cd-toast-error .cd-toast-icon-error {
    color: var(--cd-color-toast-danger-light-icon);
  }

  /* —— stack 零高包裹（对齐 Semi .semi-toast-zero-height-wrapper）——
     动画常量对齐 Semi animation.scss（组件级，非全局 token，字面直连）。 */
  .cd-toast-zero-height-wrapper {
    transition: all 300ms cubic-bezier(0.22, 0.57, 0.02, 1.2);
    perspective-origin: center var(--cd-spacing-toast-perspective-originy);
    perspective: var(--cd-spacing-toast-perspective);
    height: 0;
    overflow: visible;
  }

  /* —— RTL（对齐 Semi rtl.scss：文本对齐右、左右外边距互换）—— */
  .cd-toast-rtl {
    direction: rtl;
  }
  .cd-toast-rtl .cd-toast-content-text {
    text-align: right;
    margin-left: var(--cd-spacing-toast-content-text-marginright);
    margin-right: var(--cd-spacing-toast-content-text-marginleft);
  }
</style>
