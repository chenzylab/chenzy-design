<!--
  FileCard — 单个上传文件项渲染（严格对齐 Semi upload/fileCard.tsx 分层）。
  靠 listType 分 renderPic（picture 照片墙）/ renderFile（list 文本卡片）双分支。
  组件调用其它组件而非裸元素：Button（移除/替换）、Spin（validating）、
  Progress circle（照片墙上传中）、Typography.Text（文件名 ellipsis + showTooltip）。
  三个手写 svg：ErrorSvg（照片墙失败角标）、DirectorySvg（文件条替换）、ReplaceSvg（照片墙替换）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useLocale } from '../locale-provider/index.js';
  import { Button } from '../button/index.js';
  import { Progress } from '../progress/index.js';
  import { Spin } from '../spin/index.js';
  import { Tooltip } from '../tooltip/index.js';
  import { Text } from '../typography/index.js';
  import type { EllipsisShowTooltip } from '../typography/TypographyBase.svelte';
  import { IconAlertCircle, IconClose, IconClear, IconFile, IconRefresh } from '@chenzy-design/icons';
  import type {
    UploadFileItem,
    UploadListType,
    UploadShowTooltip,
    RenderFileItemProps,
    RenderPictureCloseProps,
  } from './types.js';

  interface Props {
    item: UploadFileItem;
    index: number;
    listType: UploadListType;
    disabled: boolean;
    showRetry: boolean;
    showReplace: boolean;
    showPicInfo: boolean;
    /** 缩略图地址（picture 缩略图 / list 预览盒），undefined 表示占位。 */
    url?: string;
    /** 是否显示缩略图预览（对齐 Semi preview）：false 时用文件图标占位。 */
    preview: boolean;
    picWidth?: number | string;
    picHeight?: number | string;
    showTooltip: UploadShowTooltip;
    /** 卡片自定义 style（合并 itemStyle + picWidth/picHeight）。 */
    style?: string;
    onRemove: () => void;
    onRetry: () => void;
    onReplace: () => void;
    onPreviewClick?: () => void;
    /** 自定义缩略图整体（picture）。 */
    renderThumbnail?: Snippet<[RenderFileItemProps]>;
    /** 自定义缩略图内容（list 预览盒 / picture）。 */
    previewFile?: Snippet<[RenderFileItemProps]>;
    /** 自定义照片墙信息浮层。 */
    renderPicInfo?: Snippet<[RenderFileItemProps]>;
    /** 自定义照片墙 hover 预览图标。 */
    renderPicPreviewIcon?: Snippet<[RenderFileItemProps]>;
    /** 自定义照片墙关闭按钮。 */
    renderPicClose?: Snippet<[RenderPictureCloseProps]>;
    /** 自定义文件条操作区（list）。 */
    renderFileOperation?: Snippet<[RenderFileItemProps]>;
  }

  let {
    item,
    index,
    listType,
    disabled,
    showRetry,
    showReplace,
    showPicInfo,
    url,
    preview,
    picWidth,
    picHeight,
    showTooltip,
    style,
    onRemove,
    onRetry,
    onReplace,
    onPreviewClick,
    renderThumbnail,
    previewFile,
    renderPicInfo,
    renderPicPreviewIcon,
    renderPicClose,
    renderFileOperation,
  }: Props = $props();

  const loc = useLocale();

  // 图片加载失败回退（对齐 Semi fileCard state.fallbackPreview）：缩略图 <img> onerror 后改用文件图标占位。
  let fallbackPreview = $state(false);
  function handleImageError() {
    fallbackPreview = true;
  }
  // item 变更时复位回退态。
  $effect(() => {
    void item.uid;
    fallbackPreview = false;
  });

  // Semi getFileSize（严格对齐 utils.ts）：<1KB → KB(2dec)；1KB..1MB → KB(1dec)；>=1MB → MB(1dec)。
  const byteKB = 1024;
  const byteMB = 1048576;
  function getFileSize(n: number): string {
    if (n < byteKB) return `${(n / byteKB).toFixed(2)}KB`;
    if (n < byteMB) return `${(n / byteKB).toFixed(1)}KB`;
    return `${(n / byteMB).toFixed(1)}MB`;
  }

  // 归一 showTooltip 到 Typography.Text 的 EllipsisShowTooltip 形态（对齐 Semi ShowTooltip）。
  // boolean 直接透传；对象态透传 type/opts/renderTooltip——三者签名与 Text 一致，renderTooltip
  // 为位置参数 (fullText, trigger)（对齐 Semi (content, children)），直接桥接不降级。
  const ellipsisShowTooltip = $derived.by<boolean | EllipsisShowTooltip>(() => {
    if (typeof showTooltip === 'boolean') return showTooltip;
    const cfg: EllipsisShowTooltip = {};
    if (showTooltip.type !== undefined) cfg.type = showTooltip.type;
    if (showTooltip.opts !== undefined) cfg.opts = showTooltip.opts as NonNullable<EllipsisShowTooltip['opts']>;
    if (showTooltip.renderTooltip !== undefined) cfg.renderTooltip = showTooltip.renderTooltip;
    return cfg;
  });

  const fileSize = $derived(getFileSize(item.size));
  // validateMessage 优先级：item.validateMessage → item.error → uploadFail 默认 locale.fail（对齐 Semi）。
  const validateMessage = $derived(
    item.validateMessage ??
      item.error ??
      (item.status === 'uploadFail' ? loc().t('Upload.fail') : undefined),
  );

  // 状态派生（对齐 Semi）。
  const showProgress = $derived(
    item.status === 'uploading' && item.percent !== 100 && item.percent !== undefined,
  );
  const showRetryBtn = $derived(item.status === 'uploadFail' && (item.showRetry ?? showRetry));
  const showReplaceBtn = $derived(item.status === 'success' && (item.showReplace ?? showReplace));
  const showPreview = $derived(item.status === 'success' && !(item.showReplace ?? showReplace));
  const isFail = $derived(item.status === 'validateFail' || item.status === 'uploadFail');
  const isValidating = $derived(item.status === 'validating');

  // 组装 render 家族入参（对齐 Semi fileCardProps）。
  const renderProps = $derived<RenderFileItemProps>({
    ...item,
    index,
    listType,
    disabled,
    showRetry,
    showReplace,
    showPicInfo,
    onRemove,
    onRetry,
    onReplace,
    ...(onPreviewClick ? { onPreviewClick } : {}),
  });

  const customThumbnail = $derived(typeof renderThumbnail === 'function');

  // 事件包装：阻止冒泡到卡片 onPreviewClick（对齐 Semi onRemove/onReplace/onRetry stopPropagation）。
  function handleRemove(e: MouseEvent) {
    e.stopPropagation();
    onRemove();
  }
  function handleReplace(e: MouseEvent) {
    e.stopPropagation();
    onReplace();
  }
  function handleRetry(e: MouseEvent) {
    e.stopPropagation();
    onRetry();
  }
  // 卡片根 onPreviewClick 键盘触发（Enter/Space）。
  function handleRootKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPreviewClick?.();
    }
  }
  // 内层 div role=button（重试/替换/关闭）键盘触发。
  function keydownActivate(e: KeyboardEvent, fn: () => void) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      fn();
    }
  }
</script>

<!-- 手写 svg（对齐 Semi fileCard.tsx，此处 Semi 就手写，非具名图标）。 -->
{#snippet errorSvg()}
  <svg focusable="false" aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="7.99992" cy="7.99992" r="6.66667" fill="white" />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M15.3332 8.00008C15.3332 12.0502 12.0499 15.3334 7.99984 15.3334C3.94975 15.3334 0.666504 12.0502 0.666504 8.00008C0.666504 3.94999 3.94975 0.666748 7.99984 0.666748C12.0499 0.666748 15.3332 3.94999 15.3332 8.00008ZM8.99984 11.6667C8.99984 11.1145 8.55212 10.6667 7.99984 10.6667C7.44755 10.6667 6.99984 11.1145 6.99984 11.6667C6.99984 12.219 7.44755 12.6667 7.99984 12.6667C8.55212 12.6667 8.99984 12.219 8.99984 11.6667ZM7.99984 3.33341C7.27573 3.33341 6.7003 3.94171 6.74046 4.66469L6.94437 8.33495C6.97549 8.89513 7.4388 9.33341 7.99984 9.33341C8.56087 9.33341 9.02419 8.89513 9.05531 8.33495L9.25921 4.66469C9.29938 3.94171 8.72394 3.33341 7.99984 3.33341Z"
      fill="#F93920"
    />
  </svg>
{/snippet}

{#snippet directorySvg()}
  <svg focusable="false" aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M6 17V7.58824C6 7.26336 6.26863 7 6.6 7H10.5L12 8.76471H16.05C16.3814 8.76471 16.65 9.02806 16.65 9.35294V11.1176H7.5L6 17ZM6 17L7.44375 11.1176H18L16.8 17L6 17Z"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
{/snippet}

{#snippet replaceSvg()}
  <svg focusable="false" aria-hidden="true" width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="14" cy="14" r="14" fill="#16161A" fill-opacity="0.6" />
    <path d="M9 10.25V18.25L10.25 13.25H17.875V11.75C17.875 11.4739 17.6511 11.25 17.375 11.25H14L12.75 9.75H9.5C9.22386 9.75 9 9.97386 9 10.25Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M18 18.25L19 13.25H10.2031L9 18.25H18Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
{/snippet}

{#snippet closeIcon()}<IconClose />{/snippet}
{#snippet directoryIcon()}{@render directorySvg()}{/snippet}

{#if listType === 'picture'}
  <!-- ============ renderPic：照片墙缩略图卡片（对齐 Semi renderPic） ============ -->
  {@const showRetryPic = item.status === 'uploadFail' && (item.showRetry ?? showRetry)}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    role="listitem"
    class="cd-upload-picture-file-card"
    class:cd-upload-picture-file-card-preview-fallback={fallbackPreview}
    class:cd-upload-picture-file-card-disabled={disabled}
    class:cd-upload-picture-file-card-show-pointer={onPreviewClick !== undefined}
    class:cd-upload-picture-file-card-error={item.status === 'uploadFail'}
    class:cd-upload-picture-file-card-uploading={showProgress}
    class:cd-upload-picture-file-card-custom-thumbnail={customThumbnail && picHeight && picWidth}
    {style}
    onclick={onPreviewClick}
    onkeydown={onPreviewClick ? handleRootKeydown : undefined}
  >
    {#if customThumbnail}
      {@render renderThumbnail?.(renderProps)}
    {:else if !fallbackPreview && url}
      <img src={url} alt={item.name} onerror={handleImageError} style={style} />
    {:else}
      <IconFile size="large" />
    {/if}

    {#if showProgress}
      <Progress percent={item.percent ?? 0} type="circle" size="small" orbitStroke="#FFF" aria-label="uploading file progress" />
    {/if}

    {#if showRetryPic}
      <!-- 重试（对齐 Semi picture-file-card-retry）：div role=button + IconRefresh。 -->
      <div role="button" tabindex="0" aria-label={loc().t('Upload.retry')} class="cd-upload-picture-file-card-retry" onclick={handleRetry} onkeydown={(e) => keydownActivate(e, onRetry)}>
        <IconRefresh class="cd-upload-picture-file-card-icon-retry" />
      </div>
    {/if}

    {#if showReplaceBtn}
      <!-- 替换（对齐 Semi picture-file-card-replace）：Tooltip 包裹 + ReplaceSvg。 -->
      <Tooltip content={loc().t('Upload.replace')} trigger="hover" position="top" showArrow={false}>
        <div role="button" tabindex="0" aria-label={loc().t('Upload.replace')} class="cd-upload-picture-file-card-replace" onclick={handleReplace} onkeydown={(e) => keydownActivate(e, onReplace)}>
          {@render replaceSvg()}
        </div>
      </Tooltip>
    {/if}

    {#if showPreview}
      <!-- 预览热区（对齐 Semi picture-file-card-preview）：renderPicPreviewIcon 容器。 -->
      <div class="cd-upload-picture-file-card-preview">
        {#if renderPicPreviewIcon}{@render renderPicPreviewIcon(renderProps)}{/if}
      </div>
    {/if}

    {#if showPicInfo}
      <!-- 图片信息浮层（对齐 Semi picture-file-card-pic-info）：渐变条 + 序号。 -->
      {#if renderPicInfo}
        {@render renderPicInfo(renderProps)}
      {:else}
        <div class="cd-upload-picture-file-card-pic-info">{index + 1}</div>
      {/if}
    {/if}

    {#if !disabled}
      <!-- 关闭（对齐 Semi picture-file-card-close）：renderPicClose 或 div role=button + IconClear。 -->
      {#if renderPicClose}
        {@render renderPicClose({ className: 'cd-upload-picture-file-card-close', remove: onRemove })}
      {:else}
        <div role="button" tabindex="0" aria-label={loc().t('Upload.remove')} class="cd-upload-picture-file-card-close" onclick={handleRemove} onkeydown={(e) => keydownActivate(e, onRemove)}>
          <IconClear class="cd-upload-picture-file-card-icon-close" />
        </div>
      {/if}
    {/if}

    {#if isValidating && validateMessage}
      <Tooltip content={validateMessage} trigger="hover" position="bottom">
        <span class="cd-upload-picture-file-card-icon-loading"><Spin size="small" /></span>
      </Tooltip>
    {:else if isFail && validateMessage}
      <Tooltip content={validateMessage} trigger="hover" position="bottom">
        <div class="cd-upload-picture-file-card-icon-error">{@render errorSvg()}</div>
      </Tooltip>
    {/if}
  </div>
{:else if listType === 'list'}
  <!-- ============ renderFile：文本文件卡片（对齐 Semi renderFile） ============ -->
  {@const showPlaceholder = !preview || !url || fallbackPreview}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    role="listitem"
    class="cd-upload-file-card"
    class:cd-upload-file-card-fail={isFail}
    class:cd-upload-file-card-show-pointer={onPreviewClick !== undefined}
    {style}
    onclick={onPreviewClick}
    onkeydown={onPreviewClick ? handleRootKeydown : undefined}
  >
    <div class="cd-upload-file-card-preview" class:cd-upload-file-card-preview-placeholder={showPlaceholder}>
      {#if previewFile}
        {@render previewFile(renderProps)}
      {:else if preview && !fallbackPreview && url}
        <img src={url} alt={item.name} onerror={handleImageError} />
      {:else}
        <IconFile size="large" />
      {/if}
    </div>
    <div class="cd-upload-file-card-info-main">
      <div class="cd-upload-file-card-info-main-text">
        <Text class="cd-upload-file-card-info-name" ellipsis={{ showTooltip: ellipsisShowTooltip }}>{item.name}</Text>
        <span>
          <span class="cd-upload-file-card-info-size">{fileSize}</span>
          {#if showReplaceBtn}
            <Tooltip content={loc().t('Upload.replace')} trigger="hover" position="top" showArrow={false}>
              <span class="cd-upload-tooltip-children-wrapper cd-upload-file-card-replace">
                <Button onclick={handleReplace} type="tertiary" theme="borderless" size="small" ariaLabel={loc().t('Upload.replace')} icon={directoryIcon} />
              </span>
            </Tooltip>
          {/if}
        </span>
      </div>
      {#if showProgress}
        <Progress percent={item.percent ?? 0} style="width: 100%" aria-label="uploading file progress" />
      {/if}
      <div class="cd-upload-file-card-info-main-control">
        <span class="cd-upload-file-card-info-validate-message">
          {#if isValidating && validateMessage}
            <Spin size="small" wrapperClassName="cd-upload-file-card-icon-loading" />{validateMessage}
          {:else if validateMessage}
            <IconAlertCircle class="cd-upload-file-card-icon-error" />{validateMessage}
          {/if}
        </span>
        {#if showRetryBtn}
          <span role="button" tabindex="0" class="cd-upload-file-card-info-retry" onclick={handleRetry} onkeydown={(e) => keydownActivate(e, onRetry)}>{loc().t('Upload.retry')}</span>
        {/if}
      </div>
    </div>
    {#if renderFileOperation}
      {@render renderFileOperation(renderProps)}
    {:else}
      <Button onclick={handleRemove} type="tertiary" theme="borderless" size="small" ariaLabel={loc().t('Upload.remove')} icon={closeIcon} class="cd-upload-file-card-close" />
    {/if}
  </div>
{/if}

<style>
  /* ============ 文本文件卡片（对齐 Semi upload.scss file-card 段） ============ */
  .cd-upload-tooltip-children-wrapper {
    display: inline-flex;
    inline-size: fit-content;
    block-size: fit-content;
    vertical-align: middle;
  }
  .cd-upload-file-card {
    border-radius: var(--cd-radius-upload-file-card);
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    block-size: var(--cd-height-upload-file-card);
    inline-size: var(--cd-width-upload-file-card);
    background-color: var(--cd-color-upload-card-bg);
    cursor: pointer;
  }
  .cd-upload-file-card:hover {
    background-color: var(--cd-color-upload-card-bg-hover);
  }
  .cd-upload-file-card-preview {
    block-size: var(--cd-height-upload-file-card-preview);
    inline-size: var(--cd-width-upload-file-card-preview);
    color: var(--cd-color-upload-preview-icon);
    margin: var(--cd-spacing-upload-file-card-preview-margin);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--cd-radius-upload-file-card-preview);
    flex-shrink: 0;
    overflow: hidden;
  }
  .cd-upload-file-card-preview :global(img) {
    inline-size: var(--cd-width-upload-file-card-preview-img);
    block-size: var(--cd-width-upload-file-card-preview-img);
    object-fit: cover;
  }
  .cd-upload-file-card-preview-placeholder {
    background-color: var(--cd-color-upload-file-card-preview-placeholder-bg);
    color: var(--cd-color-upload-file-card-preview-placeholder-text);
  }
  .cd-upload-file-card-show-pointer {
    cursor: pointer;
  }
  .cd-upload-file-card-info-main {
    display: flex;
    flex-wrap: wrap;
    flex: 1;
    min-inline-size: 0;
  }
  .cd-upload-file-card-info-main-text {
    display: flex;
    align-items: center;
    flex-basis: 100%;
    min-inline-size: 0;
  }
  .cd-upload-file-card-info-main-control {
    display: flex;
  }
  .cd-upload-file-card-info-main :global(.cd-upload-file-card-info-name) {
    inline-size: 0;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline-block;
    font-size: var(--cd-font-size-regular);
    font-weight: var(--cd-font-upload-file-card-info-name-fontweight);
    color: var(--cd-color-upload-text);
  }
  .cd-upload-file-card-info-size {
    font-size: var(--cd-font-size-small);
    font-weight: var(--cd-font-upload-file-card-info-size-fontweight);
    margin-inline-start: var(--cd-spacing-upload-file-card-info-size-marginleft);
    color: var(--cd-color-upload-assist-text);
    margin-block-start: 1px;
  }
  .cd-upload-file-card-replace {
    display: inline-flex;
    margin-inline-start: var(--cd-spacing-tight);
    color: var(--cd-color-text-2);
  }
  .cd-upload-file-card-info-validate-message {
    font-size: var(--cd-font-size-small);
    display: flex;
    align-items: center;
    color: var(--cd-color-upload-text);
  }
  .cd-upload-file-card-info-retry {
    font-size: var(--cd-font-size-small);
    color: var(--cd-color-upload-retry-text);
    cursor: pointer;
    margin-inline-start: var(--cd-spacing-upload-file-card-info-retry-marginleft);
  }
  .cd-upload-file-card-info-main :global(.cd-progress) {
    flex-basis: 100%;
    margin-block-start: var(--cd-spacing-upload-file-card-info-progress-margintop);
  }
  .cd-upload-file-card :global(.cd-upload-file-card-close) {
    margin-inline-start: var(--cd-spacing-upload-file-card-close-marginleft);
    margin-inline-end: var(--cd-spacing-upload-file-card-close-marginright);
    flex-shrink: 0;
  }
  .cd-upload-file-card :global(.cd-upload-file-card-icon-loading),
  .cd-upload-file-card :global(.cd-upload-file-card-icon-error) {
    font-size: var(--cd-width-upload-file-card-icon);
    margin-inline-end: var(--cd-spacing-upload-file-card-icon-marginright);
  }
  .cd-upload-file-card :global(.cd-upload-file-card-icon-error) {
    position: relative;
    inset-block-start: var(--cd-spacing-upload-picture-file-card-icon-error-top);
  }
  .cd-upload-file-card :global(.cd-upload-file-card-icon-loading) {
    line-height: 0;
  }
  .cd-upload-file-card-fail {
    background-color: var(--cd-color-upload-card-fail-bg);
  }
  .cd-upload-file-card-fail:hover {
    background-color: var(--cd-color-upload-card-fail-bg-hover);
  }
  .cd-upload-file-card-fail .cd-upload-file-card-info-validate-message {
    color: var(--cd-color-upload-file-card-fail-info-text);
  }

  /* ============ 照片墙缩略图卡片（对齐 Semi upload.scss picture-file-card 段） ============ */
  .cd-upload-picture-file-card {
    display: flex;
    align-items: center;
    justify-content: center;
    block-size: var(--cd-height-upload-file-pic-card);
    inline-size: var(--cd-width-upload-file-pic-card);
    border-radius: var(--cd-radius-upload-picture-file-card-img);
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
  }
  .cd-upload-picture-file-card :global(img) {
    block-size: var(--cd-width-upload-picture-file-card-img);
    inline-size: var(--cd-width-upload-picture-file-card-img);
    object-fit: cover;
    border-radius: var(--cd-radius-upload-picture-file-card-img);
  }
  .cd-upload-picture-file-card-close {
    visibility: hidden;
    display: inline-flex;
    position: absolute;
    inset-block-start: var(--cd-spacing-upload-picture-file-card-close-top);
    inset-inline-end: var(--cd-spacing-upload-picture-file-card-close-right);
    border-radius: var(--cd-radius-upload-picture-file-card-close);
    cursor: pointer;
    z-index: 3;
  }
  .cd-upload-picture-file-card :global(.cd-upload-picture-file-card-icon-close) {
    font-size: var(--cd-width-upload-picture-file-card-close);
    color: var(--cd-color-upload-picture-file-card-close-icon);
  }
  .cd-upload-picture-file-card::before {
    visibility: hidden;
    background-color: var(--cd-color-upload-picture-file-card-hover-bg);
    content: '';
    position: absolute;
    inset: 0;
  }
  .cd-upload-picture-file-card-retry {
    visibility: hidden;
    background-color: var(--cd-color-upload-file-card-retry-bg);
    inline-size: var(--cd-width-upload-file-card-retry);
    block-size: var(--cd-width-upload-file-card-retry);
    position: absolute;
    inset-block-start: 50%;
    inset-inline-start: 50%;
    transform: translate(-50%, -50%);
    color: var(--cd-color-upload-file-card-retry-text);
    border-radius: var(--cd-radius-upload-file-card-retry);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 3;
  }
  .cd-upload-picture-file-card :global(.cd-upload-picture-file-card-icon-retry) {
    transform: scale(-1, 1);
    font-size: var(--cd-width-upload-file-card-retry-icon);
  }
  .cd-upload-picture-file-card-replace {
    visibility: hidden;
    display: inline-flex;
    position: absolute;
    cursor: pointer;
    inset-block-start: 50%;
    inset-inline-start: 50%;
    color: var(--cd-color-upload-replace-text);
    transform: translate3d(-50%, -50%, 0);
    z-index: 3;
  }
  .cd-upload-picture-file-card-preview {
    visibility: hidden;
    display: inline-flex;
    position: absolute;
    cursor: pointer;
    inset-block-start: 50%;
    inset-inline-start: 50%;
    transform: translate3d(-50%, -50%, 0);
    color: var(--cd-color-upload-picture-preview-icon);
    z-index: 2;
  }
  .cd-upload-picture-file-card-preview-fallback {
    background-color: var(--cd-color-upload-pic-add-bg);
    border: var(--cd-width-upload-picture-add-border) var(--cd-color-upload-border);
    color: var(--cd-color-upload-icon);
    border-radius: var(--cd-radius-upload-picture-add);
  }
  .cd-upload-picture-file-card-pic-info {
    display: inline-flex;
    box-sizing: border-box;
    justify-content: space-between;
    align-items: center;
    position: absolute;
    inline-size: 100%;
    block-size: 24px;
    padding: 0 10px;
    inset-block-end: 0;
    inset-inline-start: 0;
    color: var(--cd-color-upload-picture-file-card-pic-info-text);
    font-size: var(--cd-font-upload-picture-file-card-pic-info-fontsize);
    font-weight: var(--cd-font-upload-picture-file-card-pic-info-fontweight);
    background: linear-gradient(0deg, rgba(22, 22, 26, 0.3) 0%, rgba(22, 22, 26, 0) 77.08%);
  }
  .cd-upload-picture-file-card-icon-loading,
  .cd-upload-picture-file-card-icon-error {
    position: absolute;
    inset-block-end: var(--cd-spacing-upload-picture-file-card-loading-error-bottom);
    inset-inline-end: var(--cd-spacing-upload-picture-file-card-loading-error-right);
    color: var(--cd-color-upload-picture-file-card-loading-error-icon);
    z-index: 2;
  }
  .cd-upload-picture-file-card-icon-loading {
    font-size: var(--cd-width-upload-picture-file-card-loading-icon);
  }
  .cd-upload-picture-file-card-show-pointer {
    cursor: pointer;
  }
  .cd-upload-picture-file-card-error {
    border: 1px solid var(--cd-color-upload-picture-file-card-error-border);
    outline: 1px solid var(--cd-color-upload-picture-file-card-error-border);
  }
  .cd-upload-picture-file-card:hover::before {
    visibility: visible;
  }
  .cd-upload-picture-file-card:hover .cd-upload-picture-file-card-close,
  .cd-upload-picture-file-card:hover .cd-upload-picture-file-card-replace,
  .cd-upload-picture-file-card:hover .cd-upload-picture-file-card-retry,
  .cd-upload-picture-file-card:hover .cd-upload-picture-file-card-preview {
    visibility: visible;
  }
  .cd-upload-picture-file-card-uploading::before {
    visibility: visible;
  }
  .cd-upload-picture-file-card :global(.cd-progress-circle) {
    position: absolute;
    inset-block-start: 50%;
    inset-inline-start: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
  }
  .cd-upload-picture-file-card-disabled {
    cursor: not-allowed;
  }
</style>
