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
  import { IconClose, IconCopyStroked } from '@chenzy-design/icons';
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
    /** 自定义单个 Option 渲染（对齐 Semi renderOptionItem，透传给 SideBarOptions）。 */
    renderOptionItem?:
      | Snippet<[{ option: SideBarOption; onChange: (e: Event, key: string) => void }]>
      | undefined;
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
    renderOptionItem,
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

  // Semi 在根节点上按 mode 打 -main / -detail 标记（index.tsx:163-164），
  // 供外部按视图定制样式。本库原来根节点只有 cd-sidebar，没有任何 mode 标记。
  const rootCls = $derived(
    ['cd-sidebar', isMain ? 'cd-sidebar-main' : 'cd-sidebar-detail', className]
      .filter(Boolean)
      .join(' '),
  );
  const backLabel = $derived(loc().t('SideBar.back'));
</script>

<div class={rootCls} {style}>
  {#if isMain}
    <!-- Semi renderMain：-main-content-wrapper 包住「options + -main-content」两部分
         （index.tsx:75-80）。本库原来没有外层 wrapper，内层也叫 -main 而非 -main-content。 -->
    <div class="cd-sidebar-main-content-wrapper">
      {#if options.length > 0}
        <SideBarOptions {options} {activeKey} {onActiveOptionChange} {renderOptionItem} />
      {/if}
      <div class="cd-sidebar-main-content">
        {@render renderMainContent?.(activeKey)}
      </div>
    </div>
  {:else}
    {#if renderDetailHeader}
      <!-- Semi renderHeader 里 renderDetailHeader 有返回值就直接 return（index.tsx:127-130），
           整个头部由消费方接管、连返回按钮一起替换。本库原来只是把它包进
           -detail-header-content 里、外面仍保留自绘返回按钮，等于替换不彻底。 -->
      {@render renderDetailHeader(mode, detailContent)}
    {:else}
      <!--
        对齐 Semi renderHeader（semi-ui/sidebar/index.tsx:131-150）：
        左右两个 span 分组——左 [关闭按钮 + 标题]，右 [复制按钮]。
        本库原来没有 -left/-right 分组，且返回按钮是手写 svg（Semi 用 IconClose + Button）。
      -->
      <div class="cd-sidebar-detail-header">
        <span class="cd-sidebar-detail-header-left">
          <Button
            class="cd-sidebar-back"
            theme="borderless"
            type="tertiary"
            aria-label={backLabel}
            disabled={backPending}
            onclick={handleBack}
          >
            <IconClose />
          </Button>
          <span class="cd-sidebar-detail-header-title">{detailContent?.name ?? ''}</span>
        </span>
        <span class="cd-sidebar-detail-header-right">
          <Button
            class="cd-sidebar-detail-header-copy"
            theme="borderless"
            type="tertiary"
            aria-label={copied ? loc().t('SideBar.copySuccess') : loc().t('SideBar.copy')}
            onclick={handleCopyDetail}
          >
            <IconCopyStroked />
          </Button>
        </span>
      </div>
    {/if}
    <!-- 这层是本库自有：Semi renderDetail 直接返回 CodeItem / FileItem，没有外层 div
         （它的滚动由 Container 承担）。本库需要一层做 flex/滚动，故保留，
         但改名 -detail-content——原名 -detail 与 Semi 根节点的 mode 标记同名，会撞。 -->
    <div class="cd-sidebar-detail-content">
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
  /* Semi &-main-content-wrapper：竖向 flex 占满高（index.tsx 的 renderMain）。 */
  .cd-sidebar-main-content-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-block-size: 0;
  }

  /* Semi &-main-content：12px 内边距 + 自身滚动。 */
  .cd-sidebar-main-content {
    padding: var(--cd-sidebar-main-content-padding);
    height: 100%;
    box-sizing: border-box;
    overflow: auto;
    min-block-size: 0;
  }

  .cd-sidebar-detail-content {
    flex: 1;
    min-block-size: 0;
    overflow: auto;
  }

  /* Semi 只在 &-detail 作用域下给编辑器区加内边距（sidebar.scss:606-610）。
     -file-editor 渲染在 SideBarFileItem 子组件里，需 :global 打洞。 */
  .cd-sidebar-detail-content :global(.cd-sidebar-file-editor) {
    flex: 1;
    overflow: auto;
    padding: var(--cd-sidebar-detail-file-editor-padding-y)
      var(--cd-sidebar-detail-file-editor-padding-x);
  }

  /* Semi &-detail-header：左右两组 space-between（本库原来是「标题 flex:1 撑开」）。 */
  .cd-sidebar-detail-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
    color: var(--cd-sidebar-detail-header-text);
    padding: var(--cd-sidebar-detail-header-padding);
  }

  .cd-sidebar-detail-header-left {
    display: flex;
    flex-direction: row;
    column-gap: var(--cd-sidebar-detail-header-left-column-gap);
    align-items: center;
    min-inline-size: 0;
  }

  .cd-sidebar-detail-header-right {
    display: flex;
    flex-direction: row;
    column-gap: var(--cd-sidebar-detail-header-right-column-gap);
    align-items: center;
  }

  /* Semi @include font-size-header-6 + bold（连带 line-height，见 semi-font-size-mixin 记忆）。 */
  .cd-sidebar-detail-header-title {
    font-size: var(--cd-font-size-header-6);
    line-height: 24px;
    font-weight: var(--cd-font-weight-bold);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
