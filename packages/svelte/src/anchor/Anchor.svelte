<!--
  Anchor — see specs/components/navigation/Anchor.spec.md
  基础子集: vertical 链接列表、scroll-spy 激活高亮、点击平滑滚动、ink 滑块。
  受控/非受控 (红线 #1: 不回写 value, 仅 onChange)。
  scroll-spy (红线 #3): $effect 内命令式 addEventListener('scroll')，rAF 节流，
  在事件回调里读 getBoundingClientRect (非 render 期)，cleanup 移除监听 + 取消 rAF。
  ink 用激活链接的 CSS 左边框 (border-inline-start)，不 JS 测 DOM 定位。
  affix: position:sticky 吸顶（inset-block-start = offsetTop）。
  updateHash: 激活变更时写 location.hash（replaceState，不触发额外滚动/历史堆栈）。
  targetOffset: 点击滚动的独立偏移，缺省继承 offsetTop。
  getContainer: 自定义滚动容器（缺省 window）。提供时监听该容器 scroll，
    几何按容器视口换算（target.top - container.top），点击滚动该容器（红线 #3）。
  horizontal: 水平模式，链接横排，ink 走底部下划线（border-block-end）。
  多级嵌套: link.children 形成树形。渲染用递归 snippet（renderList），每深一层
    的子列表向内缩进一级（--cd-anchor-indent，逐层累加），rail 只在顶层一条。
    scroll-spy 命令式遍历扁平化树（flatten 纯函数派生 flatLinks），父子链接皆可
    点击跳转 + 滚动高亮。无 children 时行为与平铺链接完全一致（向后兼容）。

  双 API（对齐 Semi + 照 Nav 范式）：
    - 传统 links 数组 API（向后兼容）；
    - 声明式 <Anchor.Link> 子组件（照 Nav：普通数组 declared 承接注册、唯一反应量
      revision=$state、子项挂载后 queueMicrotask 异步 bump、$derived.by 重建）。
    互斥：传了 links 就用数组、忽略 children；否则用 children 收集结果。
    scroll-spy 内核继续吃 flatten(resolvedLinks)，保持纯派生。
-->
<script lang="ts" module>
  export { ANCHOR_COLLECTOR_KEY } from './context.js';
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { setContext } from 'svelte';
  import type { AnchorLink, AnchorShowTooltip, AnchorTooltipConfig } from './types.js';
  import {
    nextRovingIndex,
    rovingKeyFromEvent,
    createResizeObserver,
    isOverflowing,
    parsePlacement,
    type Placement,
  } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import Tooltip from '../tooltip/Tooltip.svelte';
  import Popover from '../popover/Popover.svelte';
  import {
    ANCHOR_COLLECTOR_KEY,
    type AnchorCollector,
  } from './context.js';

  /** railTheme：active ink 颜色主题（对齐 Semi）。 */
  type AnchorRailTheme = 'primary' | 'tertiary' | 'muted';
  /** size：选项高度/间距尺寸（对齐 Semi）。 */
  type AnchorSize = 'small' | 'default';

  interface Props {
    links?: AnchorLink[];
    value?: string;
    defaultValue?: string;
    offsetTop?: number;
    bounds?: number;
    showInk?: boolean;
    /** 点击是否平滑滚动（默认 false，对齐 Semi；reduced-motion 下强制即时）。 */
    scrollMotion?: boolean;
    /** position:sticky 吸顶 */
    affix?: boolean;
    /** 激活变更时写 location.hash */
    updateHash?: boolean;
    /** 点击滚动的独立偏移（缺省继承 offsetTop） */
    targetOffset?: number;
    /** 自定义滚动容器；缺省监听/滚动 window */
    getContainer?: () => HTMLElement | null;
    /** 水平模式：链接横排，ink 走底部下划线 */
    horizontal?: boolean;
    /**
     * 滚动时动态展开激活路径的子级、折叠其它（对齐 Semi），默认 false（全展开）。
     * autoCollapse 时一个链接的 children 仅在「本链接激活」或「激活链接是其后代」时渲染。
     */
    autoCollapse?: boolean;
    /** ink 颜色主题（对齐 Semi）：primary（默认）/ tertiary / muted。 */
    railTheme?: AnchorRailTheme;
    /** 尺寸（对齐 Semi）：default（默认）/ small，影响选项高度与间距。 */
    size?: AnchorSize;
    /** 内容最大高度，超出滚动（对齐 Semi）；数字转 px。 */
    maxHeight?: string | number;
    /** 内容最大宽度，超出 ellipsis（对齐 Semi）；数字转 px。 */
    maxWidth?: string | number;
    /** 根 nav 自定义内联样式（与 affix inset 合并，不覆盖）。 */
    style?: string;
    /** 点击链接回调（e.preventDefault 之后触发，对齐 Semi）。 */
    onClick?: (event: MouseEvent, link: AnchorLink) => void;
    /** 激活变更回调（对齐 Semi：传入当前/上一个 link 对象）。 */
    onChange?: (
      currentLink: AnchorLink | null,
      previousLink: AnchorLink | null,
    ) => void;
    /**
     * 链接文字被缩略（ellipsis）时，hover 链接以浮层展示完整 title（对齐 Semi）。
     * boolean | { type: 'tooltip' | 'popover'; opts }；true 等价 { type: 'tooltip' }。
     * 默认 false：不装 overflow 检测，也不包浮层，零开销。
     */
    showTooltip?: AnchorShowTooltip;
    /**
     * 浮层弹出位置（12 方位 Placement）；仅 showTooltip 开启时生效。
     * 缺省不传，跟随浮层组件默认。
     */
    position?: Placement;
    ariaLabel?: string;
    /** 声明式子项（<Anchor.Link>）。与 links 二选一，links 优先。 */
    children?: Snippet;
  }

  let {
    links = [],
    value,
    defaultValue,
    offsetTop = 0,
    bounds = 5,
    showInk = true,
    scrollMotion = false,
    affix = false,
    updateHash = false,
    targetOffset,
    getContainer,
    horizontal = false,
    autoCollapse = false,
    railTheme = 'primary',
    size = 'default',
    maxHeight = '750px',
    maxWidth = '200px',
    style,
    onClick,
    onChange,
    showTooltip = false,
    position,
    ariaLabel,
    children,
  }: Props = $props();

  const loc = useLocale();

  // --- showTooltip 归一化（对齐 Semi）：true→{type:'tooltip'}；false→null（不装）。 ---
  const tip = $derived<AnchorTooltipConfig | null>(
    showTooltip === true ? { type: 'tooltip' } : showTooltip || null,
  );

  // --- 声明式子项收集（<Anchor.Link>）---
  // 普通数组承接注册（非 $state，避免子项 init push 触发反应自循环）。
  let declared: AnchorLink[] = [];
  // 唯一反应量：子项挂载后异步 bump，触发一次 links 重建。
  let revision = $state(0);
  let bumpScheduled = false;

  setContext<AnchorCollector>(ANCHOR_COLLECTOR_KEY, {
    add: (link: AnchorLink) => {
      declared.push(link);
      return link;
    },
    bump: () => {
      // 合并同一帧的多次 bump 为一次；异步脱离挂载 effect 同步栈。
      if (bumpScheduled) return;
      bumpScheduled = true;
      queueMicrotask(() => {
        bumpScheduled = false;
        revision += 1;
      });
    },
  });

  // 互斥：links prop 优先；否则用声明式收集结果。
  // 必须真正使用 revision 的值（裸读语句会被编译器优化掉、断开依赖）；
  // 返回浅拷贝确保下游每次收到新数组引用而重派生。
  const resolvedLinks = $derived.by<AnchorLink[]>(() => {
    if (links.length) return links;
    const r = revision;
    return r >= 0 ? declared.slice() : [];
  });

  // 深度优先扁平化嵌套链接树（纯函数，红线 #2）。scroll-spy 与初始激活
  // 计算只关心全部叶/枝链接的线性集合，与渲染的树形结构解耦。
  function flatten(items: AnchorLink[]): AnchorLink[] {
    const out: AnchorLink[] = [];
    for (const item of items) {
      out.push(item);
      if (item.children?.length) out.push(...flatten(item.children));
    }
    return out;
  }
  const flatLinks = $derived<AnchorLink[]>(flatten(resolvedLinks));

  // childMap：每个链接 key → 其所有后代 key 的集合（纯函数，对齐 Semi _getLinkToMap）。
  // autoCollapse 用它判断某链接是否在当前激活路径上（激活链接是本链接的后代）。
  function buildChildMap(
    items: AnchorLink[],
    ancestors: string[],
    map: Record<string, Set<string>>,
  ): void {
    for (const item of items) {
      if (!(item.key in map)) map[item.key] = new Set();
      for (const anc of ancestors) map[anc]?.add(item.key);
      if (item.children?.length) {
        ancestors.push(item.key);
        buildChildMap(item.children, ancestors, map);
        ancestors.pop();
      }
    }
  }
  const childMap = $derived.by<Record<string, Set<string>>>(() => {
    const map: Record<string, Set<string>> = {};
    buildChildMap(resolvedLinks, [], map);
    return map;
  });

  // autoCollapse=true 时，一个链接的 children 仅在「本链接激活」或「激活链接是其后代」
  // 时渲染（对齐 Semi link.tsx renderChildren）；默认 false 全展开。
  function shouldRenderChildren(key: string): boolean {
    if (!autoCollapse) return true;
    return key === activeKey || childMap[key]?.has(activeKey) === true;
  }

  function getInitialActive(): string {
    return defaultValue ?? flatten(links)[0]?.key ?? '';
  }

  // --- 受控 value (红线 #1): 不回写 value, 仅 onChange ---
  const isControlled = $derived(value !== undefined);
  let innerActive = $state<string>(getInitialActive());
  const activeKey = $derived<string>(isControlled ? (value ?? '') : innerActive);

  // onChange 对齐 Semi：传 link 对象而非裸 key，并携带上一个激活 link。
  let previousLink: AnchorLink | null = null;
  function findLink(key: string): AnchorLink | null {
    return flatLinks.find((l) => l.key === key) ?? null;
  }

  function setActive(key: string) {
    if (key === activeKey) return;
    const current = findLink(key);
    const prev = previousLink;
    if (!isControlled) innerActive = key;
    onChange?.(current, prev);
    previousLink = current;
  }

  // updateHash：把激活链接的 href（#id）写入 location.hash。
  // 用 replaceState 避免污染历史堆栈与触发浏览器原生跳转滚动。
  function writeHash(href: string) {
    if (!updateHash || typeof window === 'undefined') return;
    if (!href.startsWith('#')) return;
    history.replaceState(null, '', href);
  }

  // getContainer 提供时几何以容器视口为参照系（target.top - container.top），
  // 缺省时参照系为浏览器视口顶部（0），即原 window 行为。命令式读取，非 render 期。
  function getReferenceTop(): number {
    const container = getContainer?.();
    return container ? container.getBoundingClientRect().top : 0;
  }

  // 命令式读取目标元素并算出当前激活 key（在事件回调里调用，非 render 期）。
  function computeActiveKey(): string {
    const refTop = getReferenceTop();
    let best = '';
    let bestTop = -Infinity;
    // 遍历扁平化后的全部链接（含嵌套子链接），父子皆参与 scroll-spy。
    for (const link of flatLinks) {
      const el = document.querySelector(link.href);
      if (!el) continue;
      // 相对滚动容器视口顶部的偏移。
      const top = el.getBoundingClientRect().top - refTop;
      // 已滚过顶部阈值的 section 里取最接近阈值的那个。
      if (top <= offsetTop + bounds && top > bestTop) {
        bestTop = top;
        best = link.key;
      }
    }
    // 没有任何 section 越过阈值时，回退到第一个链接。
    if (best === '') best = flatLinks[0]?.key ?? '';
    return best;
  }

  function prefersReducedMotion(): boolean {
    return (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  // --- scroll-spy (红线 #3): $effect 内命令式监听 + rAF 节流 ---
  // 监听目标：getContainer() 返回的元素（缺省 window）。读取 getContainer 使其
  // 变更时 effect 重订阅。
  $effect(() => {
    if (typeof window === 'undefined') return;
    const target: HTMLElement | Window = getContainer?.() ?? window;
    let frame = 0;

    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setActive(computeActiveKey());
      });
    }

    target.addEventListener('scroll', onScroll, { passive: true });
    // 初始算一次。
    onScroll();

    // 尺寸/可见性感知重算（对标 Semi）：内容高度变化，或某 section 从
    // display:none 变可见但用户「没滚动」时，scroll 事件不触发，active 高亮/ink
    // 位置会滞后。观测滚动容器（window 模式观测 documentElement）尺寸变化，
    // 变化时复用同一套 scroll-spy 重算（onScroll，rAF 节流）。
    // core RO 首帧异步派发（脱离本 effect 同步栈），且 onScroll→setActive 只在
    // key 变化时写 innerActive（RO 观测的是尺寸而非该 state），不会自循环（红线 #2）。
    const observed: HTMLElement | null =
      getContainer?.() ??
      (typeof document !== 'undefined' ? document.documentElement : null);
    const ro = observed
      ? createResizeObserver({ box: 'content-box', onResize: () => onScroll() })
      : null;
    if (observed && ro) ro.observe(observed);

    return () => {
      target.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
      ro?.disconnect();
    };
  });

  function handleClick(e: MouseEvent, link: AnchorLink) {
    e.preventDefault();
    // 禁用链接不响应点击跳转（对齐 Semi）。
    if (link.disabled) return;
    onClick?.(e, link);
    activateLink(link);
  }

  // 滚动 + setActive + writeHash 主体（与 handleClick 解耦，供 Space 键复用，无 event）。
  function activateLink(link: AnchorLink) {
    // 禁用链接不响应跳转（对齐 Semi）。
    if (link.disabled) return;
    const el = document.querySelector(link.href);
    if (el) {
      const smooth = scrollMotion && !prefersReducedMotion();
      const offset = targetOffset ?? offsetTop;
      const container = getContainer?.();
      if (container) {
        // 滚动量 = 目标相对容器视口顶部的偏移 - offset，叠加容器当前滚动位置。
        const delta =
          el.getBoundingClientRect().top -
          container.getBoundingClientRect().top -
          offset;
        container.scrollTo({
          top: container.scrollTop + delta,
          behavior: smooth ? 'smooth' : 'auto',
        });
      } else {
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
      }
    }
    setActive(link.key);
    writeHash(link.href);
  }

  // --- roving tabindex（a11y §6）：链接列表为单一 Tab 停靠点。 ---
  // rootEl 普通引用，命令式 focus() 用（非 render 期）。
  let rootEl = $state<HTMLElement | null>(null);
  // 当前焦点链接 key；null = 尚无焦点 -> 首个可聚焦链接作为 Tab 停靠点。
  let focusedKey = $state<string | null>(null);

  // roving 只在非禁用链接间移动：禁用链接排除出可聚焦集合。
  const focusableLinks = $derived<AnchorLink[]>(
    flatLinks.filter((l) => !l.disabled),
  );

  // 纯派生 tabindex：焦点链接（或无焦点时的首个可聚焦链接）为 0，其余 -1；
  // 禁用链接始终 -1（排除出 roving）。不在 render 期写 $state（红线 #2）。
  function linkTabindex(link: AnchorLink): 0 | -1 {
    if (link.disabled) return -1;
    return (focusedKey ?? focusableLinks[0]?.key) === link.key ? 0 : -1;
  }

  // 链接 keydown：方向键 roving（纯函数 nextRovingIndex 派生）、Home/End 跳首尾、
  // Space 显式激活（原生 <a> 不响应 Space）。Enter 交给原生 <a> 点击（向后兼容）。
  // roving 只在 focusableLinks（非禁用）间移动。
  function onLinkKeydown(e: KeyboardEvent, link: AnchorLink) {
    const intent = rovingKeyFromEvent(e.key);
    if (intent) {
      e.preventDefault();
      const idx = focusableLinks.findIndex((l) => l.key === link.key);
      const next = nextRovingIndex(idx, focusableLinks.length, intent, false);
      const nextKey = focusableLinks[next]?.key;
      if (nextKey != null) {
        focusedKey = nextKey;
        rootEl
          ?.querySelector<HTMLElement>(`[data-anchor-key="${CSS.escape(nextKey)}"]`)
          ?.focus();
      }
      return;
    }
    if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      const nextKey = (
        e.key === 'Home'
          ? focusableLinks[0]
          : focusableLinks[focusableLinks.length - 1]
      )?.key;
      if (nextKey != null) {
        focusedKey = nextKey;
        rootEl
          ?.querySelector<HTMLElement>(`[data-anchor-key="${CSS.escape(nextKey)}"]`)
          ?.focus();
      }
      return;
    }
    if (e.key === ' ') {
      e.preventDefault();
      activateLink(link);
    }
  }

  // --- showTooltip overflow 检测（仅 tip 开启时装 RO，默认 false 零开销）---
  // truncated 记录每个链接是否被 ellipsis 缩略；用普通对象 + 唯一反应量 truncRevision
  // 驱动重渲染（避免直接 $state Map 的等值判定坑）。写入只发生在 RO 回调里（非 render 期），
  // RO 观测的是 <a> 尺寸而非 truncated 本身，故不自循环（红线 #2）。
  const truncated: Record<string, boolean> = {};
  let truncRevision = $state(0);

  // per-link 缩略查询：读 truncRevision 建立依赖，使 RO 回调 bump 后重派生。
  function isTruncated(key: string): boolean {
    void truncRevision;
    return truncated[key] === true;
  }

  // 测量单个 <a> 是否单行缩略，写回 truncated 并按需 bump 反应量。
  // 复用 core isOverflowing 纯函数（rows:1 单行宽度比较），不自造判定。
  function measureLink(key: string, el: HTMLElement): void {
    const next = isOverflowing({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
      rows: 1,
    });
    if (truncated[key] !== next) {
      truncated[key] = next;
      truncRevision += 1;
    }
  }

  // Svelte action：仅 tip 开启时对 <a> 装 ResizeObserver 观测缩略。
  // 默认 showTooltip=false 时 tip 为 null，早退不建 RO（零开销）。
  // 写 state 仅在 RO 回调（rAF 异步）里，与渲染读分离，避免 effect_update_depth 自循环（红线 #2/#4）。
  function overflowProbe(node: HTMLElement, key: string) {
    let frame = 0;
    let ro: ResizeObserver | null = null;

    function schedule() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        measureLink(key, node);
      });
    }

    function setup() {
      if (!tip || typeof ResizeObserver === 'undefined') return;
      ro = new ResizeObserver(schedule);
      ro.observe(node);
      // 首测异步（rAF），脱离挂载同步栈避免与首帧渲染读写同栈。
      schedule();
    }

    function teardown() {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      ro?.disconnect();
      ro = null;
    }

    setup();

    return {
      update(nextKey: string) {
        key = nextKey;
        // tip 由关变开 / 由开变关时重建；key 变化仅需重测。
        if (tip && !ro) {
          setup();
        } else if (!tip && ro) {
          teardown();
          if (truncated[key]) {
            truncated[key] = false;
            truncRevision += 1;
          }
        } else if (ro) {
          schedule();
        }
      },
      destroy: teardown,
    };
  }

  // Popover 用 position(Side)+align 而非单一 Placement：拆分 position prop 供 Popover 消费。
  // 未传 position 时不下发 side/align（走 Popover 自身默认）；exactOptionalPropertyTypes
  // 下不能传 undefined，故用对象在缺省时省略键，再展开给浮层组件。
  const tooltipProps = $derived<Record<string, unknown>>(
    position ? { position } : {},
  );
  const popoverProps = $derived.by<Record<string, unknown>>(() => {
    if (!position) return {};
    const { side, align } = parsePlacement(position);
    return { position: side, align };
  });

  // 数字转 px（对齐 Semi maxHeight/maxWidth 数字入参）。
  function toCssLength(v: string | number): string {
    return typeof v === 'number' ? `${v}px` : v;
  }

  // 根 nav style：affix inset + maxHeight/overflow + maxWidth，最后合并透传 style。
  const rootStyle = $derived.by(() => {
    const parts: string[] = [];
    if (affix) parts.push(`inset-block-start:${offsetTop}px`);
    parts.push(`max-height:${toCssLength(maxHeight)}`);
    parts.push('overflow:auto');
    parts.push(`max-width:${toCssLength(maxWidth)}`);
    if (style) parts.push(style);
    return parts.join(';');
  });
</script>

<nav
  bind:this={rootEl}
  class="cd-anchor cd-anchor--rail-{railTheme} cd-anchor--size-{size}"
  class:cd-anchor--no-ink={!showInk}
  class:cd-anchor--affix={affix}
  class:cd-anchor--horizontal={horizontal}
  style={rootStyle}
  aria-label={ariaLabel ?? loc().t('Anchor.ariaLabel')}
>
  {@render renderList(resolvedLinks, 0)}
</nav>

<!-- 声明式子项注册宿主：仅当未传 links 且有 children 时挂载。
     Anchor.Link 渲染无可见 DOM，只在此注册描述符；display:none 不占位。 -->
{#if !links.length && children}
  <div hidden style="display:none">{@render children()}</div>
{/if}

{#snippet linkAnchor(link: AnchorLink, level: number, active: boolean)}
  <a
    class="cd-anchor__link cd-anchor__link--level-{level} {link.className ?? ''}"
    class:cd-anchor__link--active={active}
    class:cd-anchor__link--disabled={link.disabled}
    href={link.href}
    aria-current={active ? 'location' : undefined}
    aria-disabled={link.disabled ? 'true' : undefined}
    tabindex={linkTabindex(link)}
    data-anchor-key={link.key}
    style={link.style}
    use:overflowProbe={link.key}
    onclick={(e) => handleClick(e, link)}
    onkeydown={(e) => onLinkKeydown(e, link)}
    onfocus={() => {
      focusedKey = link.key;
    }}
  >
    {link.title}
  </a>
{/snippet}

{#snippet renderList(items: AnchorLink[], level: number)}
  <ul class="cd-anchor__list">
    {#each items as link (link.key)}
      {@const active = link.key === activeKey}
      <li class="cd-anchor__item">
        {#if tip && isTruncated(link.key)}
          <!-- 缩略且 showTooltip 开启：以浮层承载完整 title（对齐 Semi）。
               tip.type 决定 Tooltip / Popover；position 拆分给对应浮层；opts 透传。 -->
          {#if tip.type === 'popover'}
            <Popover content={link.title} {...tip.opts} {...popoverProps}>
              {@render linkAnchor(link, level, active)}
            </Popover>
          {:else}
            <Tooltip content={link.title} {...tip.opts} {...tooltipProps}>
              {@render linkAnchor(link, level, active)}
            </Tooltip>
          {/if}
        {:else}
          {@render linkAnchor(link, level, active)}
        {/if}
        {#if link.children?.length && shouldRenderChildren(link.key)}
          {@render renderList(link.children, level + 1)}
        {/if}
      </li>
    {/each}
  </ul>
{/snippet}

<style>
  .cd-anchor {
    display: block;
  }
  .cd-anchor--affix {
    position: sticky;
    inset-block-start: 0;
  }

  /* --- railTheme：切换 active ink 颜色来源（token 已对齐 Semi，仅按 class 切换） --- */
  .cd-anchor--rail-primary {
    --cd-anchor-ink-color: var(--cd-color-anchor-slide-primary-bg-active);
  }
  .cd-anchor--rail-tertiary {
    --cd-anchor-ink-color: var(--cd-color-anchor-slide-tertiary-bg-active);
  }
  .cd-anchor--rail-muted {
    --cd-anchor-ink-color: var(--cd-color-anchor-slide-muted-bg-active);
  }

  /* --- size：选项高度与上下间距（token 已对齐 Semi） --- */
  .cd-anchor--size-default {
    --cd-anchor-link-height: var(--cd-height-anchor-slide-default);
    --cd-anchor-link-gap-y: var(--cd-spacing-anchor-slide-default-y);
  }
  .cd-anchor--size-small {
    --cd-anchor-link-height: var(--cd-height-anchor-slide-small);
    --cd-anchor-link-gap-y: var(--cd-spacing-anchor-slide-small-y);
  }

  .cd-anchor__list {
    margin: 0;
    padding: 0;
    list-style: none;
    border-inline-start: 1px solid var(--cd-anchor-rail-color);
  }
  /* 嵌套子列表：不重复绘制滑轨（rail 只在顶层一条），整体向内缩进一级，
     使每深一层的链接累加缩进。level-0 顶层链接样式完全不受影响（向后兼容）。 */
  .cd-anchor__list .cd-anchor__list {
    border-inline-start: none;
    margin-inline-start: var(--cd-anchor-indent, 16px);
  }
  .cd-anchor__item {
    margin: 0;
    padding: 0;
  }
  /* showTooltip 开启且链接缩略时，<a> 被 Tooltip/Popover 的 inline-block 浮层 wrapper
     包裹。默认 inline-block 会撑到内容宽度（如 352px），使 <a> 不受 li 的 maxWidth 约束、
     ellipsis 永不触发、truncated 恒 false、浮层永不弹（曾踩此 bug）。
     令 wrapper 与其 trigger 两层都 block 铺满 li，把 maxWidth 约束从 li 一路传导到 <a>，
     使 <a>（block + 负 margin ink）布局与未包裹时完全一致（ink 对齐、缩略生效）。
     DOM 为 li > .cd-tooltip > .cd-tooltip__trigger > a，故用后代选择器覆盖两层。 */
  .cd-anchor__item :global(.cd-tooltip),
  .cd-anchor__item :global(.cd-tooltip__trigger) {
    display: block;
  }
  .cd-anchor__link {
    display: block;
    padding: var(--cd-anchor-link-padding);
    line-height: var(--cd-anchor-link-height, normal);
    margin-block: var(--cd-anchor-link-gap-y, 0);
    border-inline-start: var(--cd-anchor-ink-width) solid transparent;
    margin-inline-start: calc(-1 * var(--cd-anchor-ink-width));
    color: var(--cd-anchor-link-color);
    text-decoration: none;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    transition: color var(--cd-motion-duration-fast)
      var(--cd-motion-ease-standard);
  }
  .cd-anchor__link:hover {
    color: var(--cd-anchor-link-color-active);
  }
  .cd-anchor__link:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
    border-radius: var(--cd-border-radius-small);
  }
  .cd-anchor__link--active {
    color: var(--cd-anchor-link-color-active);
    border-inline-start-color: var(--cd-anchor-ink-color);
  }
  .cd-anchor--no-ink .cd-anchor__link--active {
    border-inline-start-color: transparent;
  }
  /* --- disabled：置灰、禁指针（对齐 Semi） --- */
  .cd-anchor__link--disabled,
  .cd-anchor__link--disabled:hover {
    color: var(--cd-color-anchor-title-text-disabled);
    cursor: not-allowed;
  }

  /* --- horizontal 水平模式：链接横排，ink 走底部下划线 --- */
  .cd-anchor--horizontal .cd-anchor__list {
    display: flex;
    flex-wrap: nowrap;
    border-inline-start: none;
    border-block-end: 1px solid var(--cd-anchor-rail-color);
  }
  .cd-anchor--horizontal .cd-anchor__link {
    border-inline-start: none;
    margin-inline-start: 0;
    border-block-end: var(--cd-anchor-ink-width) solid transparent;
    margin-block-end: calc(-1 * var(--cd-anchor-ink-width));
  }
  .cd-anchor--horizontal .cd-anchor__link--active {
    border-inline-start-color: transparent;
    border-block-end-color: var(--cd-anchor-ink-color);
  }
  .cd-anchor--horizontal.cd-anchor--no-ink .cd-anchor__link--active {
    border-block-end-color: transparent;
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-anchor__link {
      transition: none;
    }
  }
</style>
