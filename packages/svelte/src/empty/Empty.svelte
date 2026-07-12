<!--
  Empty — 镜像 Semi Design Empty（semi-ui/empty/index.tsx + semi-foundation/empty/empty.scss）。
  DOM 同构：.cd-empty(flex) > .cd-empty-image + .cd-empty-content(title/description/footer)。
  image / darkModeImage 接受插画节点(Snippet) | { id?; viewBox?; url? } SVG 对象 | URL 字符串。
  darkModeImage 存在时监听 data-theme（对齐 Semi 监听 body theme-mode）在暗色下切换插画。
  title 用 Typography.Title（有图 heading=4；无图 heading=6 + fontWeight 400），description 为 div。
  layout：vertical（默认）| horizontal。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import Title from '../typography/Title.svelte';

  type Layout = 'vertical' | 'horizontal';
  /** 与 Semi 一致的 SVG 精灵引用对象 */
  interface SVGNode {
    id?: string;
    viewBox?: string;
    url?: string;
  }

  interface Props {
    /** 布局方式，支持 vertical / horizontal */
    layout?: Layout;
    /** 占位图内联样式（作用于 .cd-empty-image） */
    imageStyle?: string;
    /** 标题 */
    title?: string;
    /** 内容描述 */
    description?: string;
    /** 占位图：插画节点(image slot) | SVG 精灵对象 | 图片 URL 字符串 */
    image?: SVGNode | (string & {});
    /** 暗色模式占位图，响应 data-theme 变化 */
    darkModeImage?: SVGNode | (string & {});
    /** 根节点附加类名 */
    class?: string;
    /** 根节点内联样式 */
    style?: string;
    /** 动作区（footer） */
    children?: Snippet;
    /** 自定义插画节点（等价 Semi image 传 ReactNode） */
    imageSlot?: Snippet;
    /** 暗色自定义插画节点 */
    darkModeImageSlot?: Snippet;
  }

  let {
    layout = 'vertical',
    imageStyle,
    title,
    description,
    image,
    darkModeImage,
    class: className = '',
    style,
    children,
    imageSlot,
    darkModeImageSlot,
  }: Props = $props();

  // —— 暗色探测：仅在提供 darkModeImage/darkModeImageSlot 时挂载观察，对齐 Semi 仅 darkModeImage 时监听。
  const hasDark = $derived(!!darkModeImage || !!darkModeImageSlot);
  let isDark = $state(false);

  function readDark(): boolean {
    if (typeof document === 'undefined') return false;
    const el = document.querySelector('[data-theme]') ?? document.documentElement;
    return el.getAttribute('data-theme') === 'dark';
  }

  $effect(() => {
    if (!hasDark) return;
    isDark = readDark();
    const observer = new MutationObserver(() => {
      isDark = readDark();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
      subtree: true,
    });
    if (document.body) {
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['data-theme'],
      });
    }
    return () => observer.disconnect();
  });

  // 当前生效的插画来源（暗色优先），对齐 Semi imgSrc 解析。
  const activeSlot = $derived(isDark && darkModeImageSlot ? darkModeImageSlot : imageSlot);
  const activeImage = $derived(isDark && darkModeImage ? darkModeImage : image);

  const isStringImage = $derived(typeof activeImage === 'string');
  const svgNode = $derived(
    activeImage && typeof activeImage === 'object' && 'id' in activeImage
      ? (activeImage as SVGNode)
      : undefined,
  );
  // 是否存在任意插画节点（决定 title heading 档位，对齐 Semi imageNode 真值分支）。
  const hasImageNode = $derived(!!activeSlot || isStringImage || !!svgNode);

  const alt = $derived(typeof description === 'string' ? description : 'empty');

  const wrapperCls = $derived(
    ['cd-empty', `cd-empty-${layout}`, className].filter(Boolean).join(' '),
  );
</script>

<div class={wrapperCls} {style}>
  <div class="cd-empty-image" style={imageStyle}>
    {#if activeSlot}
      {@render activeSlot()}
    {:else if isStringImage}
      <img {alt} src={activeImage as string} />
    {:else if svgNode}
      <svg viewBox={svgNode.viewBox} aria-hidden="true">
        <use href={`#${svgNode.id}`} />
      </svg>
    {/if}
  </div>
  <div class="cd-empty-content">
    {#if title}
      {#if hasImageNode}
        <Title heading={4} class="cd-empty-title">{title}</Title>
      {:else}
        <Title heading={6} weight={400} class="cd-empty-title">{title}</Title>
      {/if}
    {/if}
    {#if description}
      <div class="cd-empty-description">{description}</div>
    {/if}
    {#if children}
      <div class="cd-empty-footer">{@render children()}</div>
    {/if}
  </div>
</div>

<style>
  /* 镜像 semi-foundation/empty/empty.scss */
  .cd-empty {
    display: flex;
  }
  .cd-empty-image {
    display: flex;
    justify-content: center;
    user-select: none;
    -webkit-user-drag: none;
    pointer-events: none;
  }

  .cd-empty-vertical {
    align-items: center;
    flex-direction: column;
  }
  .cd-empty-vertical .cd-empty-content {
    margin-top: var(--cd-spacing-empty-content-vertical-margintop);
  }
  /* .cd-empty-title 落在子组件 Title 渲染的元素上，需 :global 穿透（限定在 .cd-empty 作用域内）；
     description/footer 为本组件元素但相邻选择器另一端是 global title，故整段末尾用 :global。 */
  .cd-empty-vertical :global(.cd-empty-title),
  .cd-empty-vertical :global(.cd-empty-description) {
    text-align: center;
  }

  .cd-empty-horizontal .cd-empty-content {
    margin-left: var(--cd-spacing-empty-content-horizontal-marginleft);
  }

  .cd-empty :global(.cd-empty-title.cd-empty-title) {
    display: block;
    font-weight: var(--cd-font-empty-title-fontweight);
  }
  .cd-empty :global(.cd-empty-title + .cd-empty-description) {
    margin-top: var(--cd-spacing-empty-title-margintop);
  }
  .cd-empty-description {
    color: var(--cd-color-empty-description-text-default);
  }
  .cd-empty-footer {
    margin-top: var(--cd-spacing-empty-footer-margintop);
  }

  /* RTL：镜像 semi-foundation/empty/rtl.scss */
  :global([dir='rtl']) .cd-empty {
    direction: rtl;
  }
  :global([dir='rtl']) .cd-empty-horizontal .cd-empty-content {
    margin-left: auto;
    margin-right: var(--cd-spacing-empty-content-horizontal-marginleft);
  }
</style>
