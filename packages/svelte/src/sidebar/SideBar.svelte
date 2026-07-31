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
  import SideBarFileItem from './SideBarFileItem.svelte';
  import CodeHighlight from '../code-highlight/CodeHighlight.svelte';
  import JsonViewer from '../json-viewer/JsonViewer.svelte';
  import Button from '../button/Button.svelte';
  import { IconCopyStroked } from '@chenzy-design/icons';
  import type { SideBarOption, SideBarMode, SideBarDetailContent } from './types.js';
  import type { SideBarImageUploadOptions } from './file-extensions.js';

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
    /** 详情内容（按 mode 渲染）。传了则完全接管，不再走内置 code/file 渲染。 */
    renderDetailContent?: Snippet<[SideBarMode]>;
    /** 详情头部（按 mode 渲染，返回按钮之后）。 */
    renderDetailHeader?: Snippet<[SideBarMode, SideBarDetailContent | undefined]>;
    /** 详情区域的内容（对齐 Semi detailContent）：mode='code' 走代码渲染，'file' 走富文本渲染。 */
    detailContent?: SideBarDetailContent;
    /** 文件内容是否可编辑（对齐 Semi fileEditable）。 */
    fileEditable?: boolean;
    /** 图片上传相关配置（对齐 Semi imgUploadProps，透传 FileItem）。 */
    imgUploadProps?: SideBarImageUploadOptions;
    /** 文件内容变更回调（对齐 Semi onFileContentChange）。 */
    onFileContentChange?: ((content: string) => void) | undefined;
    /** 详情内容复制回调（对齐 Semi onDetailContentCopy）。 */
    onDetailContentCopy?: ((e: MouseEvent, content: string, res: boolean) => void) | undefined;
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
    detailContent,
    fileEditable = true,
    imgUploadProps,
    onFileContentChange,
    onDetailContentCopy,
    onBackWard,
    class: className,
    style,
  }: Props = $props();

  const loc = useLocale();

  const isMain = $derived(mode === 'main');

  // 详情内容复制（对齐 Semi handleCopyDetailContent）：复制 detailContent.content，
  // 成功后就地提示（Semi 用 Toast，本库用按钮态文案，避免命令式 Toast 脱离 context），
  // 并把 (event, content, 是否成功) 回传 onDetailContentCopy。
  let copied = $state(false);
  let copyTimer: ReturnType<typeof setTimeout> | undefined;
  async function handleCopyDetail(e: MouseEvent): Promise<void> {
    const content = detailContent?.content ?? '';
    let ok = false;
    try {
      await navigator.clipboard?.writeText(content);
      ok = true;
    } catch {
      ok = false;
    }
    if (ok) {
      copied = true;
      clearTimeout(copyTimer);
      copyTimer = setTimeout(() => (copied = false), 2000);
    }
    onDetailContentCopy?.(e, content, ok);
  }

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
    <div class="cd-sidebar-main">
      {@render renderMainContent?.(activeKey)}
    </div>
  {:else}
    <div class="cd-sidebar-detail-header">
      <button
        type="button"
        class="cd-sidebar-back"
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
        <div class="cd-sidebar-detail-header-content">
          {@render renderDetailHeader(mode, detailContent)}
        </div>
      {:else if detailContent}
        <!--
          对齐 Semi renderHeader（semi-ui/sidebar/index.tsx:131-150）：
          左侧 返回按钮 + detailContent.name，右侧复制按钮（IconCopyStroked）。
        -->
        <span class="cd-sidebar-detail-header-title">{detailContent.name ?? ''}</span>
        <Button
          class="cd-sidebar-detail-header-copy"
          theme="borderless"
          type="tertiary"
          aria-label={copied ? loc().t('SideBar.copySuccess') : loc().t('SideBar.copy')}
          onclick={handleCopyDetail}
        >
          <IconCopyStroked />
        </Button>
      {/if}
    </div>
    <div class="cd-sidebar-detail">
      <!--
        对齐 Semi renderDetail：renderDetailContent 优先完全接管；
        否则 mode='code' 走 CodeHighlight / JsonViewer，'file' 走 FileItem（可编辑富文本）。
      -->
      {#if renderDetailContent}
        {@render renderDetailContent(mode)}
      {:else if mode === 'code' && detailContent}
        {#if detailContent.isJson}
          <JsonViewer value={detailContent.content ?? ''} height="100%" />
        {:else}
          <CodeHighlight
            code={detailContent.content ?? ''}
            language={detailContent.language ?? 'markup'}
          />
        {/if}
      {:else if mode === 'file' && detailContent}
        <!-- exactOptionalPropertyTypes：可选 prop 不能显式传 undefined，故条件展开。 -->
        <SideBarFileItem
          content={detailContent.content ?? ''}
          editable={fileEditable}
          onContentChange={onFileContentChange ?? (() => {})}
          {...imgUploadProps ? { imgUploadProps } : {}}
        />
      {/if}
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
  .cd-sidebar-main,
  .cd-sidebar-detail {
    flex: 1;
    min-block-size: 0;
    overflow: auto;
  }
  .cd-sidebar-detail-header {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: var(--cd-spacing-tight, 8px);
    padding: var(--cd-sidebar-header-padding);
    border-block-end: 1px solid var(--cd-sidebar-border);
  }
  .cd-sidebar-detail-header-content {
    flex: 1;
    min-inline-size: 0;
  }
  /* 对齐 Semi -detail-header：左侧标题占满、右侧复制按钮靠边（Semi 用 left/right 两个 span）。 */
  .cd-sidebar-detail-header-title {
    flex: 1;
    min-inline-size: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .cd-sidebar-back {
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
  .cd-sidebar-back:hover:not(:disabled) {
    background: var(--cd-sidebar-back-hover-bg);
  }
  .cd-sidebar-back:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  .cd-sidebar-back:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  /* RTL：返回箭头方向翻转。 */
  :global(.cd-rtl) .cd-sidebar-back svg {
    transform: scaleX(-1);
  }
</style>
