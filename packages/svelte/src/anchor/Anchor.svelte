<!--
  Anchor — 锚点导航（严格对齐 Semi Anchor）。
  组合式 API（对齐 Semi）：children + <Anchor.Link>，无 links 数组公开 prop。
  <Anchor.Link> 挂载时向父级注册 href 描述符（构成嵌套树）并自渲染 DOM；Anchor 收集
  扁平化链接集做 scroll-spy，据激活链接标题的 offsetTop 定位滑轨条（对齐 Semi
  _setActiveSlide：linkNode.offsetTop → slideBarTop）。

  DOM 层级镜像 Semi（index.tsx render）：
    nav.cd-anchor[.cd-anchor-size-{size}]
      div.cd-anchor-slide.cd-anchor-slide-{railTheme}   (aria-hidden，绝对定位滑轨)
        span.cd-anchor-slide-bar.cd-anchor-slide-bar-{size}.cd-anchor-slide-bar-{railTheme}[.-active]
      div.cd-anchor-link-wrapper[role=list]
        <Anchor.Link 渲染的 .cd-anchor-link 树>

  受控/非受控（红线 #1）：defaultAnchor 初值，激活仅 onChange 通知，不回写。
  scroll-spy（红线 #3）：$effect 内命令式监听 getContainer()（缺省 window）的 scroll，
    rAF 节流，事件回调里读 getBoundingClientRect（非 render 期），cleanup 移除监听。
    尺寸/可见性感知：ResizeObserver 观测滚动容器，变化时复用同一套重算。
-->
<script lang="ts" module>
  export { ANCHOR_COLLECTOR_KEY, ANCHOR_CONTEXT_KEY } from './context.js';
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { setContext, tick } from 'svelte';
  import type {
    AnchorLinkNode,
    AnchorShowTooltip,
    AnchorTooltipConfig,
    AnchorRailTheme,
    AnchorSize,
  } from './types.js';
  import {
    nextRovingIndex,
    rovingKeyFromEvent,
    createResizeObserver,
    type Placement,
  } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import {
    ANCHOR_COLLECTOR_KEY,
    ANCHOR_CONTEXT_KEY,
    type AnchorCollector,
    type AnchorContext,
  } from './context.js';

  interface Props {
    /** 滚动时动态展示下一级锚点（对齐 Semi）；默认 false（全展开）。 */
    autoCollapse?: boolean;
    /** 根类名（对齐 Semi className；本库惯例用 class）。 */
    class?: string;
    /** 默认高亮锚点 href（对齐 Semi defaultAnchor，1.20.0）。 */
    defaultAnchor?: string;
    /** 指定滚动容器（对齐 Semi getContainer）；缺省 window。 */
    getContainer?: () => HTMLElement | Window | null;
    /** 组件 max-height，超出显示滚动条（对齐 Semi）；数字转 px。 */
    maxHeight?: string | number;
    /** 组件 max-width，超出 ellipsis（对齐 Semi）；数字转 px。 */
    maxWidth?: string | number;
    /** 滚动内容距容器顶部达到偏移量时触发 Link 切换（对齐 Semi）。 */
    offsetTop?: number;
    /** Tooltip 显示位置（对齐 Semi position）；仅 showTooltip 时生效。 */
    position?: Placement;
    /** 滑轨主题：primary（默认）/ tertiary / muted（对齐 Semi railTheme）。 */
    railTheme?: AnchorRailTheme;
    /** 是否开启滚动动画（对齐 Semi scrollMotion）；默认 false。reduced-motion 强制即时。 */
    scrollMotion?: boolean;
    /**
     * 文字缩略时是否显示 Tooltip 及配置（对齐 Semi showTooltip）。
     * boolean | { type: 'tooltip' | 'popover'; opts }；true 等价 { type: 'tooltip' }。
     */
    showTooltip?: AnchorShowTooltip;
    /** 锚点尺寸：small / default（默认，对齐 Semi size）。 */
    size?: AnchorSize;
    /** 根节点自定义内联样式（对齐 Semi style）。 */
    style?: string;
    /** 锚点滚动时距顶部偏移量（对齐 Semi targetOffset，1.9.0）；缺省继承 offsetTop 语义为 0。 */
    targetOffset?: number;
    /** 改变锚点回调（对齐 Semi：currentLink/previousLink 为 href 字符串）。 */
    onChange?: (currentLink: string, previousLink: string) => void;
    /** 点击锚点回调（对齐 Semi：event + currentLink href 字符串）。 */
    onClick?: (event: MouseEvent, currentLink: string) => void;
    /** 根 nav aria-label（对齐 Semi aria-label）；缺省走 locale。 */
    'aria-label'?: string;
    /** 组合式子项（<Anchor.Link>）。 */
    children?: Snippet;
  }

  let {
    autoCollapse = false,
    class: className,
    defaultAnchor = '',
    getContainer,
    maxHeight = '750px',
    maxWidth = '200px',
    offsetTop = 0,
    position,
    railTheme = 'primary',
    scrollMotion = false,
    showTooltip = false,
    size = 'default',
    style,
    targetOffset = 0,
    onChange,
    onClick,
    'aria-label': ariaLabel,
    children,
  }: Props = $props();

  const loc = useLocale();

  // showTooltip 归一化（对齐 Semi）：true→{type:'tooltip'}；false→null（不装）。
  const tip = $derived<AnchorTooltipConfig | null>(
    showTooltip === true ? { type: 'tooltip' } : showTooltip || null,
  );

  // --- 组合式子项收集（<Anchor.Link>）---
  // 普通数组承接注册（非 $state，避免子项 init push 触发反应自循环）。
  let declared: AnchorLinkNode[] = [];
  // 唯一反应量：子项挂载后异步 bump，触发一次链接树重建。
  let revision = $state(0);
  let bumpScheduled = false;

  const collector: AnchorCollector = {
    add: (link: AnchorLinkNode) => {
      declared.push(link);
      return link;
    },
    bump: () => {
      if (bumpScheduled) return;
      bumpScheduled = true;
      queueMicrotask(() => {
        bumpScheduled = false;
        revision += 1;
      });
    },
    level: 1,
  };
  setContext<AnchorCollector>(ANCHOR_COLLECTOR_KEY, collector);

  // 链接树（重建依赖 revision）；浅拷贝确保下游收到新引用而重派生。
  const linkTree = $derived.by<AnchorLinkNode[]>(() => {
    const r = revision;
    return r >= 0 ? declared.slice() : [];
  });

  // 深度优先扁平化（纯函数）。scroll-spy 与初始激活只关心线性集合。
  function flatten(items: AnchorLinkNode[]): AnchorLinkNode[] {
    const out: AnchorLinkNode[] = [];
    for (const item of items) {
      out.push(item);
      if (item.children.length) out.push(...flatten(item.children));
    }
    return out;
  }
  const flatLinks = $derived<AnchorLinkNode[]>(flatten(linkTree));

  // childMap：每个 href → 其所有后代 href 集合（对齐 Semi _getLinkToMap）。
  function buildChildMap(
    items: AnchorLinkNode[],
    ancestors: string[],
    map: Record<string, Set<string>>,
  ): void {
    for (const item of items) {
      if (!(item.href in map)) map[item.href] = new Set();
      for (const anc of ancestors) map[anc]?.add(item.href);
      if (item.children.length) {
        ancestors.push(item.href);
        buildChildMap(item.children, ancestors, map);
        ancestors.pop();
      }
    }
  }
  const childMap = $derived.by<Record<string, Set<string>>>(() => {
    const map: Record<string, Set<string>> = {};
    buildChildMap(linkTree, [], map);
    return map;
  });

  // --- 受控无（Semi Anchor 无 value prop，仅 defaultAnchor 初值 + 内部 state）---
  // defaultAnchor 仅取初值（对齐 Semi，运行时改由内部 state 管理），静态读取预期无害。
  // svelte-ignore state_referenced_locally
  let activeHref = $state<string>(defaultAnchor);
  let previousHref = '';

  function setActive(href: string, notify = true) {
    if (href === activeHref) return;
    const prev = activeHref;
    activeHref = href;
    previousHref = prev;
    if (notify) onChange?.(href, prev);
  }

  // getContainer 参照系（对齐 Semi getContainerBoundingTop）。
  function resolveContainer(): HTMLElement | Window {
    const c = getContainer?.();
    return c ?? window;
  }
  function getReferenceTop(): number {
    const c = resolveContainer();
    return 'getBoundingClientRect' in c ? c.getBoundingClientRect().top : 0;
  }

  // 命令式算当前激活 href（对齐 Semi handleScroll：取最后一个越过阈值的 section）。
  function computeActiveHref(): string {
    const refTop = getReferenceTop();
    let best = '';
    let bestTop = -Infinity;
    for (const link of flatLinks) {
      let el: Element | null = null;
      try {
        el = document.querySelector(link.href);
      } catch {
        el = null;
      }
      if (!el) continue;
      const top = el.getBoundingClientRect().top - refTop - offsetTop;
      if (top < 0 && top > bestTop) {
        bestTop = top;
        best = link.href;
      }
    }
    return best;
  }

  function prefersReducedMotion(): boolean {
    return (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  // --- scroll-spy（红线 #3）：$effect 内命令式监听 + rAF 节流 ---
  let clickLock = false;
  $effect(() => {
    if (typeof window === 'undefined') return;
    const target = resolveContainer();
    let frame = 0;

    function onScroll() {
      if (clickLock) return;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const href = computeActiveHref();
        if (href) setActive(href);
      });
    }

    target.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const observed: HTMLElement | null =
      (getContainer?.() as HTMLElement | null) ??
      (typeof document !== 'undefined' ? document.documentElement : null);
    const ro =
      observed && 'getBoundingClientRect' in (observed as object)
        ? createResizeObserver({ box: 'content-box', onResize: () => onScroll() })
        : null;
    if (observed && ro && 'observe' in ro) ro.observe(observed);

    return () => {
      target.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
      ro?.disconnect();
    };
  });

  // 点击 / Space 激活主体：滚动 + setActive + notifyClick（对齐 Semi handleClick + _scrollIntoView）。
  function scrollToHref(href: string) {
    let el: Element | null = null;
    try {
      el = document.querySelector(href);
    } catch {
      el = null;
    }
    if (!el) return;
    const smooth = scrollMotion && !prefersReducedMotion();
    const offset = targetOffset || offsetTop;
    const c = getContainer?.();
    if (c && 'getBoundingClientRect' in c) {
      const delta =
        el.getBoundingClientRect().top - c.getBoundingClientRect().top - offset;
      c.scrollTo({ top: c.scrollTop + delta, behavior: smooth ? 'smooth' : 'auto' });
    } else {
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
    }
  }

  function activate(href: string, e?: MouseEvent) {
    setActive(href);
    // 点击后短暂锁 scroll-spy，避免平滑滚动过程覆盖点击选中（对齐 Semi clickLink）。
    clickLock = true;
    setTimeout(() => {
      clickLock = false;
    }, 200);
    scrollToHref(href);
    if (e) onClick?.(e, href);
  }

  // --- roving tabindex（a11y §6）：链接列表单一 Tab 停靠点 ---
  let rootEl = $state<HTMLElement | null>(null);
  let focusedHref = $state<string | null>(null);
  const focusableLinks = $derived<AnchorLinkNode[]>(
    flatLinks.filter((l) => !l.disabled),
  );

  function linkTabindex(href: string, disabled?: boolean): 0 | -1 {
    if (disabled) return -1;
    return (focusedHref ?? focusableLinks[0]?.href) === href ? 0 : -1;
  }

  function focusHref(href: string) {
    focusedHref = href;
    rootEl
      ?.querySelector<HTMLElement>(`[data-anchor-href="${CSS.escape(href)}"]`)
      ?.focus();
  }

  function onLinkKeydown(e: KeyboardEvent, href: string) {
    const intent = rovingKeyFromEvent(e.key);
    if (intent) {
      e.preventDefault();
      const idx = focusableLinks.findIndex((l) => l.href === href);
      const next = nextRovingIndex(idx, focusableLinks.length, intent, false);
      const nextHref = focusableLinks[next]?.href;
      if (nextHref != null) focusHref(nextHref);
      return;
    }
    if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      const nextHref = (
        e.key === 'Home'
          ? focusableLinks[0]
          : focusableLinks[focusableLinks.length - 1]
      )?.href;
      if (nextHref != null) focusHref(nextHref);
      return;
    }
    if (e.key === ' ') {
      e.preventDefault();
      activate(href);
    }
  }

  // --- 滑轨条定位（对齐 Semi _setActiveSlide：激活链接标题 offsetTop → slideBarTop）---
  const titleNodes = new Map<string, HTMLElement>();
  let slideBarTop = $state(0);
  let scrollHeight = $state('100%');

  function registerTitleNode(href: string, node: HTMLElement | null) {
    if (node) titleNodes.set(href, node);
    else titleNodes.delete(href);
  }

  // 激活变更 / 链接树变更时重算滑轨条位置与滑轨高度。
  $effect(() => {
    void activeHref;
    void linkTree;
    void tick().then(() => {
      const node = titleNodes.get(activeHref);
      slideBarTop = node ? node.offsetTop : 0;
      const wrapper = rootEl?.querySelector<HTMLElement>('.cd-anchor-link-wrapper');
      if (wrapper) scrollHeight = `${wrapper.scrollHeight}px`;
    });
  });

  // defaultAnchor 初始滚动（对齐 Semi componentDidMount：handleClick(null, defaultAnchor, false)）。
  $effect(() => {
    if (defaultAnchor) {
      void tick().then(() => scrollToHref(defaultAnchor));
    }
  });

  // 拆分 position 供浮层（Popover 用 side+align；Tooltip 用整串）。
  const posGetter = () => position;

  // 提供共享上下文给 <Anchor.Link>。
  const ctx: AnchorContext = {
    getActiveHref: () => activeHref,
    getTooltip: () => tip,
    getPosition: posGetter,
    getSize: () => size,
    getAutoCollapse: () => autoCollapse,
    getChildMap: () => childMap,
    onLinkClick: (e, href) => {
      e.preventDefault();
      activate(href, e);
    },
    onLinkKeydown,
    onLinkFocus: (href) => {
      focusedHref = href;
    },
    getLinkTabindex: linkTabindex,
    registerTitleNode,
    getShowTooltip: () => showTooltip,
  };
  setContext<AnchorContext>(ANCHOR_CONTEXT_KEY, ctx);

  // 数字转 px（对齐 Semi maxHeight/maxWidth 数字入参）。
  function toCssLength(v: string | number): string {
    return typeof v === 'number' ? `${v}px` : v;
  }
  const rootStyle = $derived.by(() => {
    const parts = [
      `max-height:${toCssLength(maxHeight)}`,
      `max-width:${toCssLength(maxWidth)}`,
    ];
    if (style) parts.push(style);
    return parts.join(';');
  });

  const hasActive = $derived(Boolean(activeHref));
</script>

<nav
  bind:this={rootEl}
  class="cd-anchor cd-anchor-size-{size} {className ?? ''}"
  style={rootStyle}
  aria-label={ariaLabel ?? loc().t('Anchor.ariaLabel')}
>
  <div
    aria-hidden="true"
    class="cd-anchor-slide cd-anchor-slide-{railTheme}"
    style="height:{scrollHeight}"
  >
    <span
      class="cd-anchor-slide-bar cd-anchor-slide-bar-{size} cd-anchor-slide-bar-{railTheme}"
      class:cd-anchor-slide-bar-active={hasActive}
      style="top:{slideBarTop}px"
    ></span>
  </div>
  <div class="cd-anchor-link-wrapper" role="list">
    {#if children}{@render children()}{/if}
  </div>
</nav>

<style>
  .cd-anchor {
    display: block;
    position: relative;
    overflow-y: auto;
    overflow-x: hidden;
    font-size: var(--cd-font-size-regular, 14px);
  }
  .cd-anchor-size-small {
    font-size: var(--cd-font-size-small, 12px);
  }

  /* --- 滑轨 slide（绝对定位，镜像 Semi .semi-anchor-slide）--- */
  .cd-anchor-slide {
    position: absolute;
    inset-inline-start: var(--cd-spacing-anchor-slide-left);
    inset-block-start: var(--cd-spacing-anchor-slide-top);
    height: 100%;
  }
  /* 滑轨底轨（Semi &::before）：贯穿整条的浅色轨道。 */
  .cd-anchor-slide::before {
    position: absolute;
    display: block;
    width: var(--cd-width-anchor-slide-default);
    height: 100%;
    background-color: var(--cd-color-anchor-slide-default-bg-default);
    border-radius: var(--cd-radius-anchor-slide);
    content: ' ';
  }
  /* muted 主题隐藏滑轨（对齐 Semi &-muted { display:none }）。 */
  .cd-anchor-slide-muted {
    display: none;
  }
  /* 滑轨条 slide-bar：激活时据 offsetTop 绝对定位（Semi .semi-anchor-slide-bar）。 */
  .cd-anchor-slide-bar {
    display: none;
    position: absolute;
    inset-block-start: 0;
    width: var(--cd-width-anchor-slide-default);
    border-radius: var(--cd-radius-anchor-slide);
  }
  .cd-anchor-slide-bar-active {
    display: inline-block;
  }
  .cd-anchor-slide-bar-default {
    height: calc(
      var(--cd-height-anchor-slide-default) + 2 *
        var(--cd-spacing-anchor-slide-default-y)
    );
  }
  .cd-anchor-slide-bar-small {
    height: calc(
      var(--cd-height-anchor-slide-small) + 2 *
        var(--cd-spacing-anchor-slide-small-y)
    );
  }
  .cd-anchor-slide-bar-primary {
    background-color: var(--cd-color-anchor-slide-primary-bg-active);
  }
  .cd-anchor-slide-bar-tertiary {
    background-color: var(--cd-color-anchor-slide-tertiary-bg-active);
  }
  /* muted 无滑轨条（Semi 该主题 slide 整体 display:none，slide-bar 亦不显）。 */

  /* link-wrapper：链接列表容器（Semi .semi-anchor-link-wrapper）。
     对齐 Semi：wrapper 本身无 padding（Semi $spacing-anchor_link-paddingLeft 是孤儿变量，
     从未被任何 scss 消费；链接缩进由 Anchor.Link 的 paddingLeft: 8*level 内联提供）。 */
  .cd-anchor-link-wrapper {
    display: block;
  }
</style>
