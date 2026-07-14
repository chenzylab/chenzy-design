<!--
  Banner — 通知横幅，严格对齐 Semi Design（semi-ui/banner/index.tsx）。
  DOM 结构镜像 Semi：
    div.cd-banner.cd-banner-{type}.cd-banner-full|in-container[.cd-banner-bordered] role=alert
      div.cd-banner-content-wrapper
        div.cd-banner-content
          div.cd-banner-icon            ← icon !== null
          div.cd-banner-content-body
            <Typography.Title  class=cd-banner-title  heading=5 component=div>   ← title
            <Typography.Paragraph class=cd-banner-description component=div>      ← description
        <IconButton class=cd-banner-close theme=borderless size=small type=tertiary> ← closeIcon !== null
      div.cd-banner-extra               ← children
  依赖组件均已对齐 Semi：Typography.Title/Paragraph、IconButton、IconClose/IconAlertTriangle/IconInfoCircle/IconTickCircle/IconAlertCircle。
  行为对齐 Semi foundation：内部 visible 状态，remove() 先 notifyClose(onClose) 再 setVisible(false)；关闭后不再渲染。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Title, Paragraph } from '../typography/index.js';
  import IconButton from '../iconbutton/IconButton.svelte';
  import {
    IconClose,
    IconAlertTriangle,
    IconInfoCircle,
    IconTickCircle,
    IconAlertCircle,
  } from '@chenzy-design/icons';
  import { useLocale } from '../locale-provider/index.js';

  type Type = 'info' | 'success' | 'danger' | 'warning';

  interface Props {
    /** 类型，支持 info / success / danger / warning。 */
    type?: Type;
    /** 是否为全屏模式。 */
    fullMode?: boolean;
    /** 是否展示边框，仅在非全屏模式下有效。 */
    bordered?: boolean;
    /** 标题（string 文本）。titleSnippet 优先。 */
    title?: string;
    /** 描述内容（string 文本）。descriptionSnippet 优先。 */
    description?: string;
    /** 自定义 icon 片段；传 null 不显示 icon。 */
    icon?: Snippet | null;
    /** 自定义关闭 icon 片段；传 null 不显示关闭按钮。 */
    closeIcon?: Snippet | null;
    /** 自定义渲染内容（对齐 Semi children，渲染在 extra 区）。 */
    children?: Snippet;
    /** 自定义标题片段，覆盖 title（对齐 Semi title 传 ReactNode）。 */
    titleSnippet?: Snippet;
    /** 自定义描述片段，覆盖 description（对齐 Semi description 传 ReactNode）。 */
    descriptionSnippet?: Snippet;
    /** 关闭时的回调函数。 */
    onClose?: (e: MouseEvent) => void;
    /** 根元素类名。 */
    class?: string;
    /** 根元素内联样式。 */
    style?: string;
  }

  let {
    type = 'info',
    fullMode = true,
    bordered = false,
    title = '',
    description = '',
    icon,
    closeIcon,
    children,
    titleSnippet,
    descriptionSnippet,
    onClose,
    class: className = '',
    style,
  }: Props = $props();

  const loc = useLocale();

  // 对齐 Semi foundation：内部 visible 状态；removeBanner = notifyClose(onClose) → setVisible(false)。
  let visible = $state(true);

  function remove(e: MouseEvent) {
    e?.stopPropagation();
    onClose?.(e);
    visible = false;
  }

  const hasTitle = $derived(titleSnippet !== undefined || title.length > 0);
  const hasDescription = $derived(descriptionSnippet !== undefined || description.length > 0);

  // icon: undefined → 默认语义图标；null → 不显示；snippet → 自定义。
  const showIcon = $derived(icon !== null);
  // closeIcon: null → 不显示关闭按钮。
  const showClose = $derived(closeIcon !== null);

  const rootClass = $derived(
    [
      'cd-banner',
      `cd-banner-${type}`,
      fullMode ? 'cd-banner-full' : 'cd-banner-in-container',
      !fullMode && bordered && 'cd-banner-bordered',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

{#snippet defaultCloseIcon()}
  <IconClose aria-hidden="true" />
{/snippet}

{#snippet defaultIcon(t: Type)}
  {#if t === 'warning'}
    <IconAlertTriangle size="large" aria-label="warning" />
  {:else if t === 'success'}
    <IconTickCircle size="large" aria-label="success" />
  {:else if t === 'danger'}
    <IconAlertCircle size="large" aria-label="danger" />
  {:else}
    <IconInfoCircle size="large" aria-label="info" />
  {/if}
{/snippet}

{#if visible}
  <div class={rootClass} {style} role="alert">
    <div class="cd-banner-content-wrapper">
      <div class="cd-banner-content">
        {#if showIcon}
          <div class="cd-banner-icon">
            {#if icon}
              {@render icon()}
            {:else}
              {@render defaultIcon(type)}
            {/if}
          </div>
        {/if}
        <div class="cd-banner-content-body">
          {#if hasTitle}
            <Title heading={5} class="cd-banner-title" component="div">
              {#if titleSnippet}
                {@render titleSnippet()}
              {:else}
                {title}
              {/if}
            </Title>
          {/if}
          {#if hasDescription}
            <Paragraph class="cd-banner-description" component="div">
              {#if descriptionSnippet}
                {@render descriptionSnippet()}
              {:else}
                {description}
              {/if}
            </Paragraph>
          {/if}
        </div>
      </div>
      {#if showClose}
        <IconButton
          class="cd-banner-close"
          theme="borderless"
          size="small"
          type="tertiary"
          ariaLabel={loc().t('Banner.closeButtonAriaLabel')}
          onclick={remove}
          icon={closeIcon ?? defaultCloseIcon}
        />
      {/if}
    </div>
    {#if children}
      <div class="cd-banner-extra">
        {@render children()}
      </div>
    {/if}
  </div>
{/if}

<style>
  /* 对齐 semi-foundation/banner/banner.scss */
  .cd-banner {
    padding: var(--cd-spacing-banner-paddingy) var(--cd-spacing-banner-paddingx);
  }

  .cd-banner-content-wrapper {
    display: flex;
    flex-direction: row;
  }

  .cd-banner-description {
    margin: 0;
  }

  .cd-banner .cd-banner-content-wrapper .cd-banner-content {
    display: flex;
    flex: 1;
  }

  /* in-container（非全屏）：圆角 + 标题/描述纵向堆叠 */
  .cd-banner-in-container {
    border-radius: var(--cd-radius-banner);
  }
  .cd-banner-in-container .cd-banner-content-wrapper .cd-banner-content .cd-banner-content-body {
    flex: 1;
  }
  .cd-banner-in-container
    .cd-banner-content-wrapper
    .cd-banner-content
    .cd-banner-content-body
    :global(.cd-banner-title + .cd-banner-description) {
    margin-top: var(--cd-spacing-banner-title-description-margintop);
  }

  /* full（全屏）：内容居中，icon 与 content-body 垂直居中 */
  .cd-banner-full .cd-banner-content-wrapper .cd-banner-content {
    justify-content: center;
  }
  .cd-banner-full .cd-banner-content-wrapper .cd-banner-icon,
  .cd-banner-full .cd-banner-content-wrapper .cd-banner-content-body {
    display: flex;
    align-items: center;
  }

  .cd-banner :global(.cd-banner-close) {
    margin-left: var(--cd-spacing-banner-closebtn-marginleft);
    height: var(--cd-height-banner-closebtn);
    width: var(--cd-width-banner-closebtn);
  }

  .cd-banner-extra {
    margin-top: var(--cd-spacing-banner-extra-margintop);
  }

  .cd-banner-icon {
    display: flex;
    margin-right: var(--cd-spacing-banner-icon-marginright);
  }

  /* —— 四语义色（对齐 Semi variables.scss） —— */
  .cd-banner-info {
    background-color: var(--cd-color-banner-info-bg-default);
    color: var(--cd-color-banner-info-text-default);
  }
  .cd-banner-info.cd-banner-bordered {
    border: var(--cd-width-banner-border) solid var(--cd-color-banner-info-border-default);
  }

  .cd-banner-warning {
    background-color: var(--cd-color-banner-warning-bg-default);
    color: var(--cd-color-banner-warning-text-default);
  }
  .cd-banner-warning.cd-banner-bordered {
    border: var(--cd-width-banner-border) solid var(--cd-color-banner-warning-border-default);
  }

  .cd-banner-success {
    background-color: var(--cd-color-banner-success-bg-default);
    color: var(--cd-color-banner-success-text-default);
  }
  .cd-banner-success.cd-banner-bordered {
    border: var(--cd-width-banner-border) solid var(--cd-color-banner-success-border-default);
  }

  .cd-banner-danger {
    background-color: var(--cd-color-banner-danger-bg-default);
    color: var(--cd-color-banner-danger-text-default);
  }
  .cd-banner-danger.cd-banner-bordered {
    border: var(--cd-width-banner-border) solid var(--cd-color-banner-danger-border-default);
  }

  /* RTL（对齐 Semi rtl.scss） */
  :global([dir='rtl']) .cd-banner {
    direction: rtl;
  }
  :global([dir='rtl']) .cd-banner :global(.cd-banner-close) {
    margin-left: 0;
    margin-right: var(--cd-spacing-banner-closebtn-marginleft);
  }
  :global([dir='rtl']) .cd-banner-icon {
    margin-right: 0;
    margin-left: var(--cd-spacing-banner-icon-marginright);
  }
</style>
