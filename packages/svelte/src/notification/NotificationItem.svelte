<!--
  NotificationItem — 单条通知卡片（notice），严格对齐 Semi Design（semi-ui/notification/notice.tsx）。
  DOM 结构镜像 Semi：
    div.cd-notification-notice[.cd-notification-notice-{type}][.cd-notification-notice-light]
       [.cd-notification-notice-rtl][.cd-notification-notice-icon-show]
       role=alert aria-labelledby=titleID onmouseenter onmouseleave onclick
      <div>{icon}</div>                                   ← 类型图标 / 自定义 icon
        div.cd-notification-notice-icon.cd-notification-notice-{type}
      div.cd-notification-notice-inner
        div.cd-notification-notice-content-wrapper
          div.cd-notification-notice-title  (id=titleID)  ← title
          div.cd-notification-notice-content              ← content
        IconButton.cd-notification-notice-icon-close      ← showClose（tertiary/borderless/small）
  行为对齐 Semi foundation：
    mouseenter → pause（clearCloseTimer）；mouseleave → resume（重新完整计时）。
    关闭按钮点击：先 onCloseClick(id) 再通知容器移除（对齐 notice.close → onCloseClick + notifyWrapperToRemove）。
  依赖组件均已对齐 Semi：IconButton、IconTickCircle/IconInfoCircle/IconAlertTriangle/IconAlertCircle/IconClose。
  title/content/icon 支持 string 文本或 Snippet（对齐 Semi ReactNode）。
  a11y：role=alert（对齐 Semi）；title 经 useId 关联 aria-labelledby；关闭按钮 IconButton 带 ariaLabel。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useId } from '@chenzy-design/core';
  import type { NotificationItem, NotificationType } from '@chenzy-design/core';
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
    item: NotificationItem;
    /** 容器移除该通知（对齐 Semi close → notifyWrapperToRemove）。 */
    onClose: (id: string) => void;
    onPause: (id: string) => void;
    onResume: (id: string) => void;
  }

  let { item, onClose, onPause, onResume }: Props = $props();
  const loc = useLocale();

  const titleId = useId('cd-notification-title');

  // 有默认图标的类型（对齐 Semi types.includes(type) → icon-show）。default 无内置图标。
  const withDefaultIcon = $derived(
    item.type === 'success' ||
      item.type === 'info' ||
      item.type === 'warning' ||
      item.type === 'error',
  );
  // 自定义 icon（Snippet）优先；否则类型内置图标。两者皆无（default 且无自定义）→ 不渲染图标区。
  const customIcon = $derived(item.icon as Snippet | undefined);
  const hasIcon = $derived(Boolean(customIcon) || withDefaultIcon);
  // Semi wrapper 的 icon-show class：仅当 type 属于内置类型集合（含 default）时加。
  const iconShow = $derived(
    item.type === 'success' ||
      item.type === 'info' ||
      item.type === 'warning' ||
      item.type === 'error' ||
      item.type === 'default',
  );

  const isRtl = $derived(item.direction === 'rtl');

  // title/content 双形态：Snippet（函数）走 {@render}，否则按 string 文本渲染。
  const titleIsSnippet = $derived(typeof item.title === 'function');
  const contentIsSnippet = $derived(typeof item.content === 'function');
  const titleSnippet = $derived(item.title as Snippet | undefined);
  const contentSnippet = $derived(item.content as Snippet | undefined);
  const titleText = $derived(titleIsSnippet ? '' : String(item.title ?? ''));
  const contentText = $derived(contentIsSnippet ? '' : String(item.content ?? ''));
  const hasTitle = $derived(titleIsSnippet || titleText !== '');
  const hasContent = $derived(contentIsSnippet || contentText !== '');

  function handlePause() {
    onPause(item.id);
  }
  function handleResume() {
    onResume(item.id);
  }
  function handleClick(e: MouseEvent) {
    item.onClick?.(e);
  }
  function handleCloseClick() {
    item.onCloseClick?.(item.id);
    onClose(item.id);
  }
</script>

{#snippet defaultTypeIcon(type: NotificationType)}
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

<!--
  对齐 Semi：notice 根 div 承载 onClick（通知点击回调）+ mouseenter/leave（hover 暂停定时器）。
  这是 Semi notice.tsx 的既有契约（div + onClick + onMouseEnter/Leave），非交互增强，
  故显式忽略「非交互元素挂事件」与「click 需键盘处理」两条 a11y 规则（关闭动作已由可聚焦的
  IconButton 承载，键盘用户可 Tab 到关闭按钮操作）。
-->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
  class="cd-notification-notice cd-notification-notice-{item.type}"
  class:cd-notification-notice-light={item.theme === 'light'}
  class:cd-notification-notice-rtl={isRtl}
  class:cd-notification-notice-icon-show={iconShow}
  role="alert"
  aria-labelledby={hasTitle ? titleId : undefined}
  onmouseenter={handlePause}
  onmouseleave={handleResume}
  onclick={handleClick}
>
  <div>
    {#if hasIcon}
      <div class="cd-notification-notice-icon cd-notification-notice-{item.type}">
        {#if customIcon}
          {@render customIcon()}
        {:else}
          {@render defaultTypeIcon(item.type)}
        {/if}
      </div>
    {/if}
  </div>
  <div class="cd-notification-notice-inner">
    <div class="cd-notification-notice-content-wrapper">
      {#if hasTitle}
        <div class="cd-notification-notice-title" id={titleId}>
          {#if titleIsSnippet && titleSnippet}{@render titleSnippet()}{:else}{titleText}{/if}
        </div>
      {/if}
      {#if hasContent}
        <div class="cd-notification-notice-content">
          {#if contentIsSnippet && contentSnippet}{@render contentSnippet()}{:else}{contentText}{/if}
        </div>
      {/if}
    </div>
    {#if item.showClose}
      <IconButton
        class="cd-notification-notice-icon-close"
        type="tertiary"
        theme="borderless"
        size="small"
        ariaLabel={loc().t('Notification.closeText')}
        icon={closeIcon}
        onclick={handleCloseClick}
      />
    {/if}
  </div>
</div>

{#snippet closeIcon()}
  <IconClose />
{/snippet}

<style>
  /* —— 卡片容器（对齐 Semi .semi-notification-notice）—— */
  .cd-notification-notice {
    box-shadow: var(--cd-shadow-elevated);
    border-radius: var(--cd-radius-notification-notice);
    padding-top: var(--cd-spacing-notification-notice-paddingtop);
    padding-right: var(--cd-spacing-notification-notice-paddingright);
    padding-bottom: var(--cd-spacing-notification-notice-paddingbottom);
    padding-left: var(--cd-spacing-notification-notice-paddingleft);
    margin: var(--cd-spacing-notification-notice-margin);
    width: var(--cd-width-notification-notice);
    min-width: var(--cd-width-notification-notice-minwidth);
    background-color: var(--cd-color-notification-bg-default);
    position: relative;
    display: flex;
    pointer-events: auto;
    box-sizing: border-box;
  }

  /* —— 类型图标（对齐 Semi .semi-notification-notice-icon）—— */
  .cd-notification-notice-icon {
    width: var(--cd-width-notification-notice-icon);
    font-size: var(--cd-font-size-header-6);
    line-height: 22px;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    height: 100%;
    margin-right: var(--cd-spacing-notification-notice-icon-marginright);
  }

  .cd-notification-notice-info .cd-notification-notice-icon {
    color: var(--cd-color-notification-info-icon);
  }
  .cd-notification-notice-warning .cd-notification-notice-icon {
    color: var(--cd-color-notification-warning-icon);
  }
  .cd-notification-notice-error .cd-notification-notice-icon {
    color: var(--cd-color-notification-danger-icon);
  }
  .cd-notification-notice-success .cd-notification-notice-icon {
    color: var(--cd-color-notification-success-icon);
  }

  /* —— 多色填充样式 light（对齐 Semi .semi-notification-notice-light）——
     叠加层 = ambient-bg（bg-0）打底 + light-bg 线性渐变覆盖 + 类型描边。 */
  .cd-notification-notice-light.cd-notification-notice-warning {
    background-image: linear-gradient(
      0deg,
      var(--cd-color-notification-warning-light-bg),
      var(--cd-color-notification-warning-light-bg)
    );
    background-color: var(--cd-color-notification-ambient-bg);
    border: var(--cd-width-notification-notice-border) solid
      var(--cd-color-notification-warning-light-border);
  }
  .cd-notification-notice-light.cd-notification-notice-success {
    background-image: linear-gradient(
      0deg,
      var(--cd-color-notification-success-light-bg),
      var(--cd-color-notification-success-light-bg)
    );
    background-color: var(--cd-color-notification-ambient-bg);
    border: var(--cd-width-notification-notice-border) solid
      var(--cd-color-notification-success-light-border);
  }
  .cd-notification-notice-light.cd-notification-notice-info,
  .cd-notification-notice-light.cd-notification-notice-default {
    background-image: linear-gradient(
      0deg,
      var(--cd-color-notification-info-light-bg),
      var(--cd-color-notification-info-light-bg)
    );
    background-color: var(--cd-color-notification-ambient-bg);
    border: var(--cd-width-notification-notice-border) solid
      var(--cd-color-notification-info-light-border);
  }
  .cd-notification-notice-light.cd-notification-notice-error {
    background-image: linear-gradient(
      0deg,
      var(--cd-color-notification-danger-light-bg),
      var(--cd-color-notification-danger-light-bg)
    );
    background-color: var(--cd-color-notification-ambient-bg);
    border: var(--cd-width-notification-notice-border) solid
      var(--cd-color-notification-danger-light-border);
  }

  /* —— 标题（对齐 Semi .semi-notification-notice-title）—— */
  .cd-notification-notice-title {
    font-size: var(--cd-font-size-header-6);
    line-height: 22px;
    font-weight: var(--cd-font-notification-notice-title-fontweight);
    color: var(--cd-color-notification-title-text);
    margin-bottom: var(--cd-spacing-notification-notice-title-marginbottom);
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  /* —— 内层（对齐 Semi .semi-notification-notice-inner）—— */
  .cd-notification-notice-inner {
    display: flex;
    width: 100%;
    min-width: 0;
  }

  /* —— 内容包裹（对齐 Semi .semi-notification-notice-content-wrapper）—— */
  .cd-notification-notice-content-wrapper {
    flex: 1 1 auto;
    margin-right: var(--cd-spacing-notification-notice-content-wrapper-marginright);
    min-width: 0;
  }

  /* —— 内容（对齐 Semi .semi-notification-notice-content）—— */
  .cd-notification-notice-content {
    font-size: var(--cd-font-size-regular);
    line-height: 20px;
    font-weight: var(--cd-font-notification-notice-content-fontweight);
    color: var(--cd-color-notification-content-text);
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  /* —— 关闭按钮（对齐 Semi .semi-notification-notice-icon-close）—— */
  .cd-notification-notice :global(.cd-notification-notice-icon-close) {
    height: var(--cd-width-icon-extra-large);
  }
  .cd-notification-notice :global(.cd-notification-notice-icon-close .cd-icon-close),
  .cd-notification-notice :global(.cd-notification-notice-icon-close) {
    color: var(--cd-color-notification-closebtn-icon);
  }

  /* —— RTL（对齐 Semi rtl.scss）——
     Semi 主 scss padding 已用非对称，rtl 下 padding-right/left 互换。 */
  .cd-notification-notice-rtl {
    direction: rtl;
    padding-right: var(--cd-spacing-notification-notice-paddingleft);
    padding-left: var(--cd-spacing-notification-notice-paddingright);
  }
  .cd-notification-notice-rtl .cd-notification-notice-icon {
    margin-right: 0;
    margin-left: var(--cd-spacing-notification-notice-icon-marginright);
  }
  .cd-notification-notice-rtl .cd-notification-notice-content-wrapper {
    margin-right: 0;
    margin-left: var(--cd-spacing-notification-notice-content-wrapper-marginright);
  }
</style>
