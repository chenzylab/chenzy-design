<!--
  SideBarAnnotationContent — 参考来源/引用溯源折叠列表的纯内容层（P2）。
  对齐 Semi annotation/content.tsx 的 Content（Annotation.AnnotationContent 静态属性）：
  不含浮层壳，可脱离 SideBarContainer 独立使用（例如嵌入 SideBar 的 renderMainContent）。
  see specs/components/show/SideBar.spec.md §4/§6/§9。

  用本库 Collapse 渲染 info 分组：每个分组是一个可折叠面板（header 带书本图标 +
  aria-expanded 由 Collapse.Panel 落实），展开区渲染 video/text 引用卡片。
  renderItem 可整条覆盖默认卡片。

  受控 activeKey（红线 #1）：作为 Collapse 的 activeKey 透传，展开变更只经 onChange 回调通知，
  不回写 prop（Collapse 内部有非受控兜底）。

  a11y（spec §6）：
  - 折叠头部 aria-expanded 由 Collapse.Panel 提供（本组件不重复）。
  - 卡片对齐 Semi annotation/item.tsx：恒用 <div onClick>（不区分有无 url，Semi 没有
    「静态不可点击卡片」这个分支，也不用 button——键盘可达性 Semi 本身就没有）。
  - video 时长 / text 序号有本地化可访问文本（视觉标签 aria-hidden，aria-label 走 i18n）。
  - duration 走 locale 数值格式化为 mm:ss（RTL 由 CSS 逻辑属性天然镜像）。

  §9.3 effect 循环规避：本组件无自建订阅器/声明式收集，展开态完全交给 Collapse（其内部
  已按红线用 SvelteSet 本地态 + 纯派生），卡片点击是普通事件处理，不写自身 render 依赖的 $state。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Collapse } from '../collapse/index.js';
  import { IconBookOpenStroked, IconPlay } from '@chenzy-design/icons';
  import { useLocale } from '../locale-provider/index.js';
  import type { SideBarAnnotationGroup, SideBarAnnotationItem } from './types.js';

  interface Props {
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
    /** 根自定义类名。 */
    class?: string;
    /** 根自定义内联样式。 */
    style?: string;
  }

  let {
    info = [],
    activeKey,
    onChange,
    onClick,
    renderItem,
    class: className,
    style,
  }: Props = $props();

  const loc = useLocale();

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
  // 对齐 Semi annotation/item.tsx：VideoItem/Item 恒用同一种可点击结构渲染，不管有没有
  // url 都调用 onClick——Semi 没有"静态不可点击卡片"这个分支，本库原先按 isInteractive
  // 自造了 button/静态 div 两条渲染路径，已收紧为单一结构（用 button 而非 Semi 的裸
  // div+onClick，只是把交互元素换成语义化按钮以保留键盘可达性，不是新增功能分支）。
  function handleItemClick(e: Event, item: SideBarAnnotationItem): void {
    if (item.url && typeof window !== 'undefined') {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }
    item.onClick?.(e, item);
    onClick?.(e, item);
  }

  // 收集「已定义」的键值，避免 exactOptionalPropertyTypes 下把显式 undefined
  // 透传给不接受 undefined 的下游 props（Collapse）。
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

  // 透传给 Collapse 的展开态 props（受控 activeKey / onChange，未定义则走非受控兜底）。
  const collapseProps = $derived(definedOnly({ activeKey, onChange }));

  // Semi content.tsx 只用 -content 等带后缀的类挂内容元素，裸 ANNOTATION 类只在
  // annotation/index.tsx（Container 面板）出现，content 层根节点不挂它。
  const rootCls = $derived(className);
</script>

<div class={rootCls} {style}>
  <!-- Semi content.tsx：info 为空时就是一个空 Collapse（无 panel），没有空态提示——
       本库原来自造了 isEmpty 分支渲染提示文案，Semi 没有这个分支，已移除。
       clickHeaderToExpand={false}：header 是纯展示（图标+标题），点击只能靠折叠箭头触发，
       避免大面积可点区域和内部卡片点击冲突。
       class="cd-sidebar-collapse"：真机 DOM 核实 Semi 根节点是
       "semi-collapse semi-sidebar-collapse"（本库原来只挂裸 Collapse，没叠这个变体类），
       &-collapse 作用域的 item border/圆角/margin-bottom 覆盖因此完全没生效——
       跟 CodeContent/FileContent 是同一套覆盖，只是这里没有 -code/-file 二级变体。 -->
  <Collapse class="cd-sidebar-collapse" clickHeaderToExpand={false} {...collapseProps}>
    {#each info as group (group.key)}
      {#snippet panelHead()}
        <span class="cd-sidebar-annotation-group-header">
          <!-- Semi 用具名 IconBookOpenStroked（annotation/content.tsx），本库原为手写 svg。 -->
          <IconBookOpenStroked class="cd-sidebar-annotation-group-icon" />
          <span class="cd-sidebar-annotation-group-title">{group.header}</span>
        </span>
      {/snippet}
      <Collapse.Panel itemKey={group.key} head={panelHead}>
        <div class="cd-sidebar-annotation-content">
          {#each group.annotations as item, index (index)}
            {#if renderItem}
              {@render renderItem(item)}
            {:else}
              <!-- 对齐 Semi annotation/item.tsx：VideoItem/Item 恒用 <div onClick>，
                   不用 button。 -->
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <div
                class="cd-sidebar-annotation-item cd-sidebar-annotation-item-{item.type ??
                  'text'}"
                onclick={(e) => handleItemClick(e, item)}
              >
                {@render cardBody(item)}
              </div>
            {/if}
          {/each}
        </div>
      </Collapse.Panel>
    {/each}
  </Collapse>
</div>

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
      <!-- Semi 用具名 IconPlay 直接当圆形播放按钮（annotation/item.tsx + sidebar.scss
           &-play.#{$prefix}-icon：border+background+border-radius:50% 全挂在图标类上，
           不是额外包一层）。本库原为手写 svg 圆形背景+三角形。 -->
      <IconPlay class="cd-sidebar-annotation-item-video-play" aria-hidden="true" />
      {#if typeof item.duration === 'number'}
        <!-- role="img" 让 aria-label 在裸 span 上合法（axe aria-prohibited-attr）。 -->
        <span
          class="cd-sidebar-annotation-item-video-duration"
          role="img"
          aria-label={durationLabel(item.duration)}
        >
          <span aria-hidden="true">{formatDuration(item.duration)}</span>
        </span>
      {/if}
    </div>
    <!-- Semi 把 video 卡的「标题 + 页脚」包在 -item-video-content 里（annotation/item.tsx:45）。
         本库原来复用了 -annotation-content，而那个类在分组网格上另有其义，
         两处同名导致 style 段出现两个同名规则块、后者静默覆盖前者。 -->
    <div class="cd-sidebar-annotation-item-video-content">
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
        <!-- role="img" 让 aria-label 在裸 span 上合法（axe aria-prohibited-attr）。 -->
        <span
          class="cd-sidebar-annotation-item-footer-order"
          role="img"
          aria-label={orderLabel(item.order)}
        >
          <span aria-hidden="true">{item.order}</span>
        </span>
      {/if}
    </div>
  {/if}
{/snippet}

<style>
  /* 对齐 Semi sidebar.scss:372-422（&-collapse 作用域，同 SideBarCodeContent/
     SideBarFileContent）：真机 DOM 核实 Annotation 的 Collapse 根节点同样带
     semi-sidebar-collapse 类（本库之前挂 class="cd-sidebar-collapse" 前完全没有
     这套覆盖），sidebar 场景下 Collapse 面板是独立卡片观感——每项 border+圆角+
     非末项 margin-bottom，展开时内容区顶部再叠一条 border-top；header 覆盖
     padding/margin/font-weight。
     整条选择器必须用 :global() 包裹（不能只包内层）：class="cd-sidebar-collapse"
     是作为 prop 传给 <Collapse>，落地在 Collapse.svelte 自己的根节点上，那个节点
     只带 Collapse 自身的 scope hash，不带 SideBarAnnotationContent 的——半 global
     写法（同 SideBarCodeContent 的 .cd-sidebar-collapse.cd-sidebar-collapse 前缀）
     会被编译器悄悄追加本组件 scope class，选择器永远不命中，规则全部静默失效。
     两个 class 重复只为拉高 specificity 到 0,0,3,0，压过 Collapse.svelte 默认样式。
     Annotation 没有 -code/-file 二级变体，故不需要 content padding 覆盖。 */
  :global(.cd-sidebar-collapse.cd-sidebar-collapse .cd-collapse-item) {
    border: var(--cd-width-sidebar-collapse-item-border) solid
      var(--cd-color-sidebar-collapse-item-border);
    border-radius: var(--cd-radius-sidebar-collapse-item);
  }
  :global(.cd-sidebar-collapse.cd-sidebar-collapse .cd-collapse-item:not(:last-child)) {
    margin-block-end: var(--cd-sidebar-collapse-item-margin-bottom);
  }
  :global(.cd-sidebar-collapse.cd-sidebar-collapse .cd-collapse-header) {
    padding: var(--cd-sidebar-collapse-header-padding-y) var(--cd-sidebar-collapse-header-padding-x);
    margin: 0;
    font-weight: var(--cd-font-weight-regular);
  }
  :global(
    .cd-sidebar-collapse.cd-sidebar-collapse .cd-collapse-item-active .cd-collapsible-wrapper
  ) {
    border-block-start: var(--cd-width-sidebar-collapse-item-content-border-top) solid
      var(--cd-color-sidebar-collapse-item-content-border-top);
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
  /* 对齐 Semi sidebar.scss:194-200：flex-wrap 双列网格，非纵向堆叠
     （本库原来写成 column，video 卡片就全部纵向铺满而非两列并排）。 */
  .cd-sidebar-annotation-content {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: var(--cd-sidebar-annotation-content-gap);
    inline-size: 100%;
  }
  .cd-sidebar-annotation-item {
    box-sizing: border-box;
    cursor: pointer;
    color: inherit;
    font: inherit;
    text-align: start;
  }
  /* 对齐 Semi sidebar.scss:255-274：text 卡片占满一整行、无边框/圆角/背景
     （本库原来把 video 专属的卡片视觉误挂到公共基类上，text 卡片也带了边框）。 */
  .cd-sidebar-annotation-item-text {
    inline-size: 100%;
    display: flex;
    flex-direction: column;
    row-gap: var(--cd-sidebar-annotation-content-gap);
    padding: var(--cd-sidebar-annotation-text-padding-y) var(--cd-sidebar-annotation-text-padding-x);
  }
  /* 对齐 Semi sidebar.scss:276-282：只有 video 卡片有边框/圆角，宽度固定为
     (100% - gap) / 2 形成双列。本库原来还多加了 display:flex row，把纵向卡片
     错做成左右并排——Semi 这里是普通块级 div，图片 wrapper 与 content 纵向堆叠。 */
  .cd-sidebar-annotation-item-video {
    inline-size: calc((100% - var(--cd-sidebar-annotation-content-gap)) / 2);
    border: var(--cd-width-sidebar-annotation-video-border) solid
      var(--cd-color-sidebar-annotation-video-border);
    border-radius: var(--cd-sidebar-annotation-video);
    overflow: hidden;
    box-sizing: border-box;
  }
  /* 对齐 Semi sidebar.scss:299-303：宽度撑满卡片、固定高度 107px
     （本库原来是 96px 定宽 + aspect-ratio:16/9，尺寸公式完全不同）。 */
  .cd-sidebar-annotation-item-video-img-wrapper {
    position: relative;
    inline-size: 100%;
    block-size: var(--cd-sidebar-annotation-video-img-wrapper);
    overflow: hidden;
    background: var(--cd-sidebar-annotation-cover-bg);
  }
  .cd-sidebar-annotation-item-video-img {
    inline-size: 100%;
    block-size: 100%;
    object-fit: cover;
  }
  /* Semi 播放按钮贴图片右上角（sidebar.scss:305-320 top/right 6px），本库原来错误地
     居中在图片正中。IconPlay 本身即是圆形按钮：边框/背景/圆角/尺寸/字号全挂在图标类上。 */
  :global(.cd-sidebar-annotation-item-video-play) {
    position: absolute;
    inset-block-start: var(--cd-sidebar-annotation-video-play-top);
    inset-inline-end: var(--cd-sidebar-annotation-video-play-right);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: var(--cd-sidebar-annotation-video-play);
    block-size: var(--cd-sidebar-annotation-video-play);
    border: 1px solid var(--cd-color-bg-0);
    border-radius: 50%;
    background: var(--cd-color-text-2);
    color: var(--cd-color-bg-0);
    font-size: var(--cd-sidebar-annotation-video-play-icon-font-size);
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
  /* 对齐 Semi sidebar.scss:283-288：四边 padding 不对称（bottom 12px，其余 8px），
     本库原来完全没设置 padding（content 贴着卡片边缘）。 */
  .cd-sidebar-annotation-item-video-content {
    display: flex;
    flex-direction: column;
    row-gap: var(--cd-sidebar-annotation-content-gap);
    padding: var(--cd-sidebar-annotation-video-content-padding-top)
      var(--cd-sidebar-annotation-video-content-padding-right)
      var(--cd-sidebar-annotation-video-content-padding-bottom)
      var(--cd-sidebar-annotation-video-content-padding-left);
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
  /* 对齐 Semi sidebar.scss:290-292：video 卡片标题固定高度 40px
     （覆盖通用 line-clamp 的自然撑高，本库原来缺这条覆盖规则）。 */
  .cd-sidebar-annotation-item-video .cd-sidebar-annotation-item-title {
    block-size: var(--cd-sidebar-annotation-video-item-title);
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
