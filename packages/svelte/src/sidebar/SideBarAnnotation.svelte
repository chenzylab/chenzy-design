<!--
  SideBarAnnotation — 参考来源/引用溯源折叠列表（P2）。see specs/components/show/SideBar.spec.md §4/§6/§9。
  外层复用 SideBarContainer 浮层壳（透传全部 Container props），内部用本库 Collapse 渲染 info 分组：
  每个分组是一个可折叠面板（header 带书本图标 + aria-expanded 由 Collapse.Panel 落实），
  展开区渲染 video/text 引用卡片。renderItem 可整条覆盖默认卡片。

  受控 activeKey（红线 #1）：作为 Collapse 的 activeKey 透传，展开变更只经 onChange 回调通知，
  不回写 prop（Collapse 内部有非受控兜底）。

  a11y（spec §6）：
  - 折叠头部 aria-expanded 由 Collapse.Panel 提供（本组件不重复）。
  - 可点击卡片（url 存在或有 onClick）用原生 <button>（role=button 隐含 + 键盘 Enter/Space + focus 环）。
  - video 时长 / text 序号有本地化可访问文本（视觉标签 aria-hidden，button aria-label 走 i18n）。
  - duration 走 locale 数值格式化为 mm:ss（RTL 由 CSS 逻辑属性天然镜像）。

  §9.3 effect 循环规避：本组件无自建订阅器/声明式收集，展开态完全交给 Collapse（其内部
  已按红线用 SvelteSet 本地态 + 纯派生），卡片点击是普通事件处理，不写自身 render 依赖的 $state。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Collapse } from '../collapse/index.js';
  import { useLocale } from '../locale-provider/index.js';
  import SideBarContainer from './SideBarContainer.svelte';
  import type {
    SideBarAnnotationGroup,
    SideBarAnnotationItem,
  } from './types.js';

  interface Props {
    // —— Content props（对齐 Semi ContentProps）——
    /** 分组数组：每组一个折叠面板，含 header/key/annotations。 */
    info?: SideBarAnnotationGroup[];
    /** 展开的分组 key（受控，不回写；string 或 string[]）。 */
    activeKey?: string | string[] | undefined;
    /** 展开变更回调（透传 Collapse onChange，参数为当前展开 key 数组）。 */
    onChange?: (keys: string[]) => void;
    /** 点击某条引用回调（url 存在则先在新窗口打开来源，再触发）。 */
    onClick?: (e: Event, item: SideBarAnnotationItem) => void;
    /** 自定义单条渲染（覆盖默认 video/text 卡片）。 */
    renderItem?: Snippet<[SideBarAnnotationItem]>;

    // —— Container props（透传 SideBarContainer，Annotation 继承 Container）——
    /** 是否可见（受控，不回写；仅经 onCancel 通知）。 */
    visible?: boolean;
    /** 标题（默认走 i18n annotationTitle）。 */
    title?: string | Snippet;
    /** 关闭回调。 */
    onCancel?: (e: Event) => void;
    /** 动画结束后触发。 */
    afterVisibleChange?: (v: boolean) => void;
    /** 展开/收起动画。默认 true。 */
    motion?: boolean;
    /** 宽度可拖拽。默认 true。 */
    resizable?: boolean;
    /** 最小宽度。默认 150。 */
    minWidth?: string | number;
    /** 最大宽度。 */
    maxWidth?: string | number;
    /** 默认尺寸。 */
    defaultSize?: { width?: string | number; height?: string | number };
    /** 显示关闭按钮。默认 true。 */
    showClose?: boolean;
    /** 自定义头部（覆盖 title + 关闭按钮）。 */
    renderHeader?: Snippet;
    /** 面板自定义类名。 */
    class?: string;
    /** 面板自定义内联样式。 */
    style?: string;
  }

  let {
    info = [],
    activeKey,
    onChange,
    onClick,
    renderItem,
    visible,
    title,
    onCancel,
    afterVisibleChange,
    motion,
    resizable,
    minWidth,
    maxWidth,
    defaultSize,
    showClose,
    renderHeader,
    class: className,
    style,
  }: Props = $props();

  const loc = useLocale();

  // 标题默认取 i18n；使用方传入则覆盖。
  const resolvedTitle = $derived<string | Snippet>(
    title ?? loc().t('SideBar.annotationTitle'),
  );

  const emptyText = $derived(loc().t('SideBar.annotationEmpty'));
  const isEmpty = $derived(info.length === 0);

  // duration（秒）→ mm:ss，分钟数用 locale 数值格式化（保持整数），秒补零。
  function formatDuration(seconds: number): string {
    const total = Math.max(0, Math.floor(seconds));
    const m = Math.floor(total / 60);
    const s = total % 60;
    const mm = loc().formatNumber(m, { minimumIntegerDigits: 2, useGrouping: false });
    const ss = loc().formatNumber(s, { minimumIntegerDigits: 2, useGrouping: false });
    return `${mm}:${ss}`;
  }

  function durationLabel(seconds: number): string {
    return loc().t('SideBar.videoDuration', { duration: formatDuration(seconds) });
  }

  function orderLabel(order: number): string {
    return loc().t('SideBar.citationOrder', { order });
  }

  // 单条点击：url 存在先在新窗口打开来源；再触发条目级 onClick，最后分组级 onClick。
  function handleItemClick(e: Event, item: SideBarAnnotationItem): void {
    if (item.url && typeof window !== 'undefined') {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }
    item.onClick?.(e, item);
    onClick?.(e, item);
  }

  // 卡片是否可交互（可点击）：有 url 或有任意 onClick。
  function isInteractive(item: SideBarAnnotationItem): boolean {
    return Boolean(item.url) || Boolean(item.onClick) || Boolean(onClick);
  }

  // 收集「已定义」的键值，避免 exactOptionalPropertyTypes 下把显式 undefined
  // 透传给不接受 undefined 的下游 props（SideBarContainer / Collapse）。
  // 返回类型剥去每个值的 undefined 分支（键仍可缺省），使 spread 满足下游 Props。
  function definedOnly<T extends Record<string, unknown>>(
    obj: T,
  ): { [K in keyof T]?: Exclude<T[K], undefined> } {
    const out: { [K in keyof T]?: Exclude<T[K], undefined> } = {};
    for (const key of Object.keys(obj) as (keyof T)[]) {
      const v = obj[key];
      if (v !== undefined) out[key] = v as Exclude<T[typeof key], undefined>;
    }
    return out;
  }

  // 透传给 SideBarContainer 的 Container props（title 已解析默认值，故始终有值）。
  const containerProps = $derived(
    definedOnly({
      visible,
      onCancel,
      afterVisibleChange,
      motion,
      resizable,
      minWidth,
      maxWidth,
      defaultSize,
      showClose,
      renderHeader,
      style,
    }),
  );

  // 透传给 Collapse 的展开态 props（受控 activeKey / onChange，未定义则走非受控兜底）。
  const collapseProps = $derived(definedOnly({ activeKey, onChange }));
</script>

<SideBarContainer
  {...containerProps}
  title={resolvedTitle}
  class={['cd-sidebar-annotation', className].filter(Boolean).join(' ')}
>
  {#if isEmpty}
    <div class="cd-sidebar-annotation-empty">{emptyText}</div>
  {:else}
    <Collapse {...collapseProps}>
      {#each info as group (group.key)}
        {#snippet panelHead()}
          <span class="cd-sidebar-annotation-group-header">
            <svg
              class="cd-sidebar-annotation-group-icon"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2.5 3A1.5 1.5 0 0 1 4 1.5h3.5v11H4A1.5 1.5 0 0 0 2.5 14V3ZM13.5 3A1.5 1.5 0 0 0 12 1.5H8.5v11H12A1.5 1.5 0 0 1 13.5 14V3Z"
                stroke="currentColor"
                stroke-width="1.2"
                stroke-linejoin="round"
              />
            </svg>
            <span class="cd-sidebar-annotation-group-title">{group.header}</span>
          </span>
        {/snippet}
        <Collapse.Panel itemKey={group.key} head={panelHead}>
          <div class="cd-sidebar-annotation-content">
            {#each group.annotations as item, index (index)}
              {#if renderItem}
                {@render renderItem(item)}
              {:else if isInteractive(item)}
                <button
                  type="button"
                  class="cd-sidebar-annotation-item cd-sidebar-annotation-item-{item.type ??
                    'text'}"
                  onclick={(e) => handleItemClick(e, item)}
                >
                  {@render cardBody(item)}
                </button>
              {:else}
                <div
                  class="cd-sidebar-annotation-item cd-sidebar-annotation-item-{item.type ??
                    'text'} cd-sidebar-annotation-item-static"
                >
                  {@render cardBody(item)}
                </div>
              {/if}
            {/each}
          </div>
        </Collapse.Panel>
      {/each}
    </Collapse>
  {/if}
</SideBarContainer>

{#snippet cardBody(item: SideBarAnnotationItem)}
  {#if item.type === 'video'}
    <div class="cd-sidebar-annotation-item-video-img-wrapper">
      {#if item.img}
        <img
          class="cd-sidebar-annotation-item-video-img"
          src={item.img}
          alt={item.title ?? ''}
        />
      {/if}
      <svg
        class="cd-sidebar-annotation-item-video-play"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="11" fill="rgba(0,0,0,0.45)" />
        <path d="M10 8l6 4-6 4V8Z" fill="#fff" />
      </svg>
      {#if typeof item.duration === 'number'}
        <span
          class="cd-sidebar-annotation-item-video-duration"
          aria-label={durationLabel(item.duration)}
        >
          <span aria-hidden="true">{formatDuration(item.duration)}</span>
        </span>
      {/if}
    </div>
    <div class="cd-sidebar-annotation-content">
      {#if item.title}
        <div class="cd-sidebar-annotation-item-title">{item.title}</div>
      {/if}
      {@render cardFooter(item)}
    </div>
  {:else}
    {#if item.title}
      <div class="cd-sidebar-annotation-item-title">{item.title}</div>
    {/if}
    {#if item.detail}
      <div class="cd-sidebar-annotation-item-text-detail">{item.detail}</div>
    {/if}
    {@render cardFooter(item)}
  {/if}
{/snippet}

{#snippet cardFooter(item: SideBarAnnotationItem)}
  {#if item.logo || item.siteName || typeof item.order === 'number'}
    <div class="cd-sidebar-annotation-item-footer">
      {#if item.logo}
        <img
          class="cd-sidebar-annotation-item-footer-logo"
          src={item.logo}
          alt=""
          aria-hidden="true"
        />
      {/if}
      {#if item.siteName}
        <span class="cd-sidebar-annotation-item-footer-text">{item.siteName}</span>
      {/if}
      {#if typeof item.order === 'number'}
        <span
          class="cd-sidebar-annotation-item-footer-order"
          aria-label={orderLabel(item.order)}
        >
          <span aria-hidden="true">{item.order}</span>
        </span>
      {/if}
    </div>
  {/if}
{/snippet}

<style>
  .cd-sidebar-annotation-empty {
    padding: var(--cd-spacing-base, 16px) 0;
    color: var(--cd-color-text-2);
    font-size: var(--cd-font-size-small);
    text-align: center;
  }
  .cd-sidebar-annotation-group-header {
    display: inline-flex;
    align-items: center;
    gap: var(--cd-spacing-tight, 8px);
    min-inline-size: 0;
  }
  .cd-sidebar-annotation-group-icon {
    flex-shrink: 0;
    color: var(--cd-color-text-2);
  }
  .cd-sidebar-annotation-group-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .cd-sidebar-annotation-content {
    display: flex;
    flex-direction: column;
    gap: var(--cd-sidebar-annotation-content-gap);
    padding-block: var(--cd-spacing-tight, 8px);
  }
  .cd-sidebar-annotation-item {
    box-sizing: border-box;
    display: flex;
    inline-size: 100%;
    flex-direction: column;
    gap: var(--cd-spacing-tight, 8px);
    padding: var(--cd-sidebar-annotation-text-padding-y) var(--cd-sidebar-annotation-text-padding-x);
    border: 1px solid var(--cd-sidebar-annotation-card-border);
    border-radius: var(--cd-sidebar-annotation-card-radius);
    background: var(--cd-sidebar-annotation-card-bg);
    color: inherit;
    font: inherit;
    text-align: start;
    cursor: pointer;
  }
  .cd-sidebar-annotation-item-video {
    flex-direction: row;
    align-items: flex-start;
  }
  /* 本库自有：非交互（无来源链接）的卡片。Semi 的 -item-text 是「文本内容块」，
     语义不同，故这里用 -item-static 区分，不复用那个名字。 */
  .cd-sidebar-annotation-item-static {
    cursor: default;
  }
  button.cd-sidebar-annotation-item:hover {
    background: var(--cd-sidebar-annotation-card-bg-hover);
  }
  button.cd-sidebar-annotation-item:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-sidebar-annotation-item-video-img-wrapper {
    position: relative;
    flex-shrink: 0;
    inline-size: 96px;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    border-radius: var(--cd-border-radius-small);
    background: var(--cd-sidebar-annotation-cover-bg);
  }
  .cd-sidebar-annotation-item-video-img {
    inline-size: 100%;
    block-size: 100%;
    object-fit: cover;
  }
  .cd-sidebar-annotation-item-video-play {
    position: absolute;
    inset-block-start: 50%;
    inset-inline-start: 50%;
    transform: translate(-50%, -50%);
  }
  .cd-sidebar-annotation-item-video-duration {
    position: absolute;
    inset-block-end: 4px;
    inset-inline-end: 4px;
    padding: 0 4px;
    border-radius: var(--cd-border-radius-small);
    background: var(--cd-sidebar-annotation-video-duration-bg);
    color: var(--cd-sidebar-annotation-video-duration-text);
    font-size: 11px;
    /* Semi sidebar.scss:333 @include font-size-small → 16px */
    line-height: var(--cd-line-height-small);
  }
  .cd-sidebar-annotation-content {
    flex: 1;
    min-inline-size: 0;
    display: flex;
    flex-direction: column;
    gap: var(--cd-spacing-tight, 8px);
  }
  .cd-sidebar-annotation-item-title {
    overflow: hidden;
    color: var(--cd-sidebar-annotation-video-title-text);
    font-size: var(--cd-font-size-regular);
    font-weight: var(--cd-font-weight-medium, 500);
    /* Semi sidebar.scss:338 @include font-size-regular → 20px */
    line-height: var(--cd-line-height-regular);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .cd-sidebar-annotation-item-text-detail {
    overflow: hidden;
    color: var(--cd-sidebar-annotation-detail-color);
    font-size: var(--cd-sidebar-annotation-detail-size);
    /* Semi sidebar.scss:271 @include font-size-small → 16px */
    line-height: var(--cd-line-height-small);
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
  }
  /* gap 改用 Semi 的 $spacing-sidebar_annotation_footer-columnGap（4px；本库原为 6px）。 */
  .cd-sidebar-annotation-item-footer {
    display: flex;
    align-items: center;
    column-gap: var(--cd-sidebar-annotation-footer-column-gap);
    min-inline-size: 0;
    color: var(--cd-sidebar-annotation-footer-color);
    font-size: var(--cd-font-size-small);
  }
  /* logo 宽高/字号改用 Semi 值（14px；本库原为 16px）。 */
  .cd-sidebar-annotation-item-footer-logo {
    flex-shrink: 0;
    font-size: var(--cd-sidebar-annotation-footer-logo-font-size);
    inline-size: var(--cd-sidebar-annotation-footer-logo);
    block-size: var(--cd-sidebar-annotation-footer-logo);
    border-radius: var(--cd-border-radius-small);
    object-fit: cover;
  }
  .cd-sidebar-annotation-item-footer-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  /* 尺寸/内边距/圆角改用 Semi 值（16px / 0 2px / 8px；本库原来是 18px / 0 5px / 9px、
     字号 11px 也是自造）。字号走 font-size-small（Semi 该处 @include font-size-small）。 */
  .cd-sidebar-annotation-item-footer-order {
    box-sizing: border-box;
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    margin-inline-start: auto;
    min-inline-size: var(--cd-sidebar-annotation-footer-order-min-width);
    block-size: var(--cd-height-sidebar-annotation-footer-order);
    padding: var(--cd-sidebar-annotation-footer-order-padding-y)
      var(--cd-sidebar-annotation-footer-order-padding-x);
    border-radius: var(--cd-radius-sidebar-annotation-footer-order);
    background: var(--cd-sidebar-annotation-order-bg);
    color: var(--cd-sidebar-annotation-order-color);
    font-size: var(--cd-font-size-small);
    line-height: 16px;
  }
</style>
