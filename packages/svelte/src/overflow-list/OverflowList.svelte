<!--
  OverflowList — 严格镜像 Semi Design OverflowList（破坏性重写，无向后兼容）。
  行为组件：展示列表并自适应展示尽可能多的项目，溢出项折叠为一个元素；
  容器 resize 时重新计算可见项。参考 Semi packages/semi-ui/overflowList/index.tsx。

  两种渲染模式（renderMode）：
  - collapse（默认）：容器放不下时把溢出项收纳进 overflowRenderer 返回的节点。
    算法完全对齐 Semi：先按 maxCount = min(items.length, floor(containerWidth/4)) 全量
    渲染一批可见项，每项用 ResizeObserver 测宽存入 itemSizeMap；折叠节点亦测宽 overflowWidth。
    当 itemSizeMap 收齐 maxCount 项后 handleCollapse：itemWidths 从 overflowWidth 起累加每项宽，
    超过 containerWidth 即 overflowed，pivot = max(minVisibleItems, 已累加项数)。
    collapseFrom='start' 时用 reverse 后的 items 计算，折叠节点渲染在头部。
  - scroll：不折叠，可见层为可横向滚动容器；用 IntersectionObserver 观测每项可见性
    （data-scrollkey），visibleStart..visibleEnd 之外的项归入 overflow（[头部溢出, 尾部溢出]），
    overflowRenderer 返回长度为 2 的数组分别渲染在两端。threshold 控制触发阈值。

  ⚠️ 防死循环红线（同 Tabs）：几何测量/ResizeObserver/IntersectionObserver 全部命令式 +
  cleanup。render 期绝不读 measure 写入的 DOM 宽度触发循环；测量只在 RO/IO 回调里做，
  写入 $state 后 render 重渲，但不回触发测量（测量不依赖 visibleCount 类 $state）。

  DOM 结构镜像 Semi（semi- → cd-）：
    .cd-overflow-list（根，flex nowrap，collapse 模式首帧 visibility:hidden）
      collapse: [collapseFrom=start? overflow] .cd-overflow-list-item* [collapseFrom=end? overflow]
        overflow 包 .cd-overflow-list-overflow
      scroll: [overflow[0]] .cd-overflow-list-scroll-wrapper{ 可见项* } [overflow[1]]
-->
<script lang="ts" generics="T extends Record<string, any>">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';

  // MINIMUM_HTML_ELEMENT_WIDTH：Semi numbers 常量，用于估算 maxCount 上界。
  const MINIMUM_HTML_ELEMENT_WIDTH = 4;

  type Key = string | number;

  let {
    items = [],
    renderMode = 'collapse',
    collapseFrom = 'end',
    minVisibleItems = 0,
    threshold = 0.75,
    itemKey,
    visibleItemRenderer,
    overflowRenderer,
    onOverflow,
    onIntersect,
    onVisibleStateChange,
    wrapperClass = '',
    wrapperStyle = '',
    style = '',
    class: className = '',
  }: {
    /** 数据驱动的渲染项；scroll 模式要求每项含 key（或提供 itemKey） */
    items?: T[];
    /** 渲染模式：collapse 折叠（默认）/ scroll 滚动 */
    renderMode?: 'collapse' | 'scroll';
    /** collapse 模式折叠方向：end 尾部（默认）/ start 头部 */
    collapseFrom?: 'start' | 'end';
    /** collapse 模式最小可见项数目 */
    minVisibleItems?: number;
    /** scroll 模式触发溢出回调的 IntersectionObserver 阈值 */
    threshold?: number;
    /** 取项 key：字段名或函数；缺省取 item.key */
    itemKey?: Key | ((item: T) => Key);
    /** 可见项渲染模板（对齐 Semi visibleItemRenderer，Svelte 用 Snippet） */
    visibleItemRenderer?: Snippet<[T, number]>;
    /**
     * 溢出项渲染模板（对齐 Semi overflowRenderer，Svelte 用 Snippet）。
     * collapse 模式收到全部溢出项；scroll 模式收到 [头部溢出项, 尾部溢出项] 二元组，
     * 需分别在两端渲染（与 Semi overflowRenderer 返回数组一致）。
     */
    overflowRenderer?: Snippet<[T[]]>;
    /** collapse 模式溢出项变化回调 */
    onOverflow?: (overflowItems: T[]) => void;
    /** scroll 模式相交状态回调 */
    onIntersect?: (res: Record<string, IntersectionObserverEntry>) => void;
    /** scroll 模式可见状态变化回调 */
    onVisibleStateChange?: (visibleState: Map<string, boolean>) => void;
    /** scroll 模式滚动 wrapper 类名（对齐 Semi wrapperClassName） */
    wrapperClass?: string;
    /** scroll 模式滚动 wrapper 内联样式（对齐 Semi wrapperStyle） */
    wrapperStyle?: string;
    /** 根节点内联样式 */
    style?: string;
    /** 根节点附加类名 */
    class?: string;
  } = $props();

  const isScroll = $derived(renderMode === 'scroll');

  // 取 key：对齐 Semi getItemKey（itemKey 为函数则调用，否则取字段，缺省 'key'，再缺省 index）。
  function getItemKey(item: T, defaultKey?: Key): Key {
    if (typeof itemKey === 'function') return itemKey(item);
    if (typeof itemKey === 'string' || typeof itemKey === 'number') {
      const v = (item as Record<string, any>)[itemKey as any];
      return v ?? (defaultKey as Key);
    }
    return (item as Record<string, any>).key ?? (defaultKey as Key);
  }

  // ─────────────────────────────── 几何 $state ───────────────────────────────
  // 仅由命令式 RO/IO 回调写入，render 期只读（红线：不在 render 期读 DOM 触发循环）。
  let containerWidth = $state(0);
  let overflowWidth = $state(0);
  // maxCount：本轮先全量渲染的可见项上界（对齐 Semi getDerivedStateFromProps）。
  let maxCount = $state(untrack(() => items.length));
  // pivot：折叠划分点；-1 表示尚未计算（首帧隐藏依据）。
  let pivot = $state(-1);
  // overflowStatus：calculating（测量中，首帧 pivot<0 时隐藏）/ overflowed / normal。
  let overflowStatus = $state<'calculating' | 'overflowed' | 'normal'>('calculating');

  // scroll 模式可见状态：itemKey → 是否 intersecting。
  let visibleState = $state<Map<string, boolean>>(new Map());

  // 命令式测量表 + RO 句柄（普通变量，不参与响应式）。
  let itemSizeMap = new Map<Key, number>();
  let containerEl = $state<HTMLElement | null>(null);
  let scrollerEl = $state<HTMLElement | null>(null);
  let io: IntersectionObserver | null = null;
  // 已观测的 scroll 项 DOM（key → node），用于 IO diff。
  const scrollItemNodes = new Map<string, Element>();
  // onOverflow 去重（对齐 Semi statePivot !== pivot 判断）。
  let prevOverflowPivot = -1;
  let previousY: number | undefined = undefined;

  // items key 序列快照：变化时重置测量（对齐 Semi componentDidUpdate key 比较）。
  const itemKeysSig = $derived(items.map((it, i) => getItemKey(it, i)).join(''));

  // ─────────────────────── collapse 划分（render-safe $derived） ───────────────────────
  // 对齐 Semi：getDerivedStateFromProps 先按 maxCount 切，handleCollapse 后按 pivot 切。
  // 用 reverse 处理 collapseFrom='start'。均为纯切片，不读 DOM。
  const reversedItems = $derived([...items].reverse());

  // 当前可见项：pivot>=0 用 pivot，否则用 maxCount（首帧全量测量）。
  const effectiveCount = $derived(pivot >= 0 ? pivot : maxCount);
  const collapseVisible = $derived(
    collapseFrom === 'start'
      ? reversedItems.slice(0, effectiveCount).reverse()
      : items.slice(0, effectiveCount),
  );
  const collapseOverflow = $derived(
    collapseFrom === 'start'
      ? reversedItems.slice(effectiveCount).reverse()
      : items.slice(effectiveCount),
  );

  // scroll 模式溢出划分（对齐 Semi foundation getOverflowItem）：
  // visibleState 里首个/末个可见项之外的项分别归入 [头部溢出, 尾部溢出]。
  const scrollOverflow = $derived.by((): [T[], T[]] => {
    if (!isScroll) return [[], []];
    if (visibleState.size === 0) return [[], []];
    const arr = items.map((it, i) => Boolean(visibleState.get(String(getItemKey(it, i)))));
    const start = arr.indexOf(true);
    const end = arr.lastIndexOf(true);
    if (start < 0 || end < 0) return [[], []];
    return [items.slice(0, start), items.slice(end + 1)];
  });

  const rootCls = $derived(
    ['cd-overflow-list', className].filter(Boolean).join(' '),
  );
  const rootStyle = $derived(
    isScroll
      ? style
      : [
          'max-width:100%',
          overflowStatus === 'calculating' && pivot < 0
            ? 'visibility:hidden'
            : 'visibility:visible',
          style,
        ]
          .filter(Boolean)
          .join(';'),
  );

  // ─────────────────────────── collapse 测量算法（命令式） ───────────────────────────
  // 对齐 Semi handleCollapseOverflow：itemWidths 从 overflowWidth 起累加每项宽，
  // 超 containerWidth 即 overflowed；pivot = max(minVisibleItems, 已容纳项数)。
  function handleCollapse(): void {
    if (isScroll || overflowStatus !== 'calculating') return;
    const list = collapseFrom === 'start' ? reversedItems : items;

    let itemWidths = overflowWidth;
    let _pivot = 0;
    let overflowed = false;
    for (let i = 0; i < list.length; i += 1) {
      const it = list[i];
      if (it === undefined) continue;
      const key = getItemKey(it, i);
      itemWidths += itemSizeMap.get(key) ?? 0;
      if (itemWidths > containerWidth) {
        overflowed = true;
        break;
      }
      // 顺利遍历完 → 无溢出，全量可见。
      if (_pivot === list.length - 1) {
        overflowStatus = 'normal';
        pivot = list.length - 1;
        return;
      }
      _pivot += 1;
    }

    if (overflowed) {
      const nextPivot = Math.max(minVisibleItems, _pivot);
      overflowStatus = 'overflowed';
      pivot = nextPivot;
      // 触发 onOverflow（去重，对齐 Semi statePivot !== pivot）。
      if (prevOverflowPivot !== nextPivot) {
        prevOverflowPivot = nextPivot;
        const overflow =
          collapseFrom === 'start'
            ? reversedItems.slice(nextPivot).reverse()
            : items.slice(nextPivot);
        onOverflow?.(overflow);
      }
    }
  }

  // 某可见项测宽回调：写入 itemSizeMap；宽度变化或收齐 maxCount 时触发重算。
  function onItemMeasured(item: T, idx: number, width: number): void {
    const key = getItemKey(item, idx);
    const prev = itemSizeMap.get(key);
    if (prev === undefined) {
      itemSizeMap.set(key, width);
    } else if (prev !== width) {
      itemSizeMap.set(key, width);
      overflowStatus = 'calculating';
      pivot = -1;
    }
    // 收齐 maxCount 项 → 触发真正划分（对齐 Semi onItemResize）。
    if (itemSizeMap.size === maxCount) {
      overflowStatus = 'calculating';
      queueMicrotask(() => handleCollapse());
    }
  }

  // action：给每个可见项包 ResizeObserver 测宽（命令式，cleanup disconnect）。
  function measureItem(node: HTMLElement, params: { item: T; index: number }) {
    let current = params;
    const ro = new ResizeObserver(() => {
      onItemMeasured(current.item, current.index, node.clientWidth);
    });
    ro.observe(node);
    return {
      update(next: { item: T; index: number }) {
        current = next;
      },
      destroy() {
        ro.disconnect();
      },
    };
  }

  // action：折叠节点测宽 overflowWidth（命令式）。
  function measureOverflow(node: HTMLElement) {
    const ro = new ResizeObserver(() => {
      const w = node.clientWidth;
      if (w !== overflowWidth) {
        overflowWidth = w;
        overflowStatus = 'calculating';
        pivot = -1;
      }
    });
    ro.observe(node);
    return {
      destroy() {
        ro.disconnect();
      },
    };
  }

  // ─────────────────────────── scroll 测量（IntersectionObserver） ───────────────────────────
  function handleIntersect(entries: IntersectionObserverEntry[]): void {
    const next = new Map(visibleState);
    const res: Record<string, IntersectionObserverEntry> = {};
    for (const entry of entries) {
      const key = (entry.target as HTMLElement).dataset.scrollkey ?? '';
      res[key] = entry;
      next.set(key, entry.isIntersecting);
    }
    let someVisible = false;
    for (const v of next.values()) {
      if (v) {
        someVisible = true;
        break;
      }
    }
    // 纵向滚动使整个 List 移出视口时不处理（对齐 Semi previousY 逻辑）。
    const currentY = entries[0]?.boundingClientRect.y ?? 0;
    if (!someVisible && previousY !== undefined && currentY !== previousY) {
      previousY = currentY;
      return;
    }
    previousY = currentY;
    visibleState = next;
    onVisibleStateChange?.(next);
    onIntersect?.(res);
  }

  // action：scroll 项注册 data-scrollkey + 交给 IO 观测（命令式）。
  function observeScrollItem(node: HTMLElement, key: string) {
    node.dataset.scrollkey = key;
    scrollItemNodes.set(key, node);
    io?.observe(node);
    return {
      update(nextKey: string) {
        if (nextKey !== key) {
          io?.unobserve(node);
          scrollItemNodes.delete(key);
          key = nextKey;
          node.dataset.scrollkey = key;
          scrollItemNodes.set(key, node);
          io?.observe(node);
        }
      },
      destroy() {
        io?.unobserve(node);
        scrollItemNodes.delete(key);
      },
    };
  }

  // ─────────────────────────────── effects（命令式生命周期） ───────────────────────────────

  // 容器 ResizeObserver（collapse 模式）：容器宽变 → 重置 calculating 触发重算。
  // 对齐 Semi resize：containerWidth = clientWidth，overflowStatus='calculating'。
  $effect(() => {
    if (isScroll || !containerEl) return;
    const el = containerEl;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.target.clientWidth ?? 0;
      containerWidth = w;
      overflowStatus = 'calculating';
      pivot = -1;
    });
    ro.observe(el);
    // 立即测一次初值。
    containerWidth = el.clientWidth;
    return () => {
      ro.disconnect();
    };
  });

  // items key 变化：重置测量表 + maxCount（对齐 Semi getDerivedStateFromProps items 变）。
  $effect(() => {
    void itemKeysSig;
    void renderMode;
    void collapseFrom;
    untrack(() => {
      if (isScroll) return;
      itemSizeMap = new Map();
      prevOverflowPivot = -1;
      // maxCount = min(items.length, floor(containerWidth/4))（对齐 Semi）。
      let mc = items.length;
      const byWidth = Math.floor(containerWidth / MINIMUM_HTML_ELEMENT_WIDTH);
      if (byWidth !== 0) mc = Math.min(mc, byWidth);
      maxCount = mc;
      pivot = -1;
      overflowStatus = 'calculating';
    });
  });

  // scroll 模式 IntersectionObserver：观测滚动 wrapper 内各项。
  $effect(() => {
    if (!isScroll || !scrollerEl) return;
    const root = scrollerEl;
    const observer = new IntersectionObserver((entries) => handleIntersect(entries), {
      root,
      threshold,
      rootMargin: '0px',
    });
    io = observer;
    // 观测当前已注册的项。
    for (const node of scrollItemNodes.values()) observer.observe(node);
    return () => {
      observer.disconnect();
      io = null;
    };
  });
</script>

{#if isScroll}
  <!-- scroll 模式：可见层为可横向滚动 wrapper；溢出项二元组分渲两端。 -->
  <div class={rootCls} style={rootStyle} bind:this={containerEl}>
    {#if overflowRenderer}{@render overflowRenderer(scrollOverflow[0])}{/if}
    <div
      class={['cd-overflow-list-scroll-wrapper', wrapperClass].filter(Boolean).join(' ')}
      style={wrapperStyle}
      bind:this={scrollerEl}
    >
      {#each items as item, idx (getItemKey(item, idx))}
        <div use:observeScrollItem={String(getItemKey(item, idx))}>
          {#if visibleItemRenderer}{@render visibleItemRenderer(item, idx)}{/if}
        </div>
      {/each}
    </div>
    {#if overflowRenderer}{@render overflowRenderer(scrollOverflow[1])}{/if}
  </div>
{:else}
  <!-- collapse 模式：折叠方向决定 overflow 节点渲染在头部还是尾部。 -->
  <div class={rootCls} style={rootStyle} bind:this={containerEl}>
    {#if collapseFrom === 'start' && collapseOverflow.length > 0 && overflowRenderer}
      <div class="cd-overflow-list-overflow" use:measureOverflow>
        {@render overflowRenderer(collapseOverflow)}
      </div>
    {/if}
    {#each collapseVisible as item, idx (getItemKey(item, idx))}
      <div class="cd-overflow-list-item" use:measureItem={{ item, index: idx }}>
        {#if visibleItemRenderer}{@render visibleItemRenderer(item, idx)}{/if}
      </div>
    {/each}
    {#if collapseFrom === 'end' && collapseOverflow.length > 0 && overflowRenderer}
      <div class="cd-overflow-list-overflow" use:measureOverflow>
        {@render overflowRenderer(collapseOverflow)}
      </div>
    {/if}
  </div>
{/if}

<style>
  /* 镜像 Semi overflowList.scss：根 flex nowrap min-width:0；scroll wrapper flex:1 可滚动。 */
  .cd-overflow-list {
    display: flex;
    flex-wrap: nowrap;
    min-width: 0;
  }

  .cd-overflow-list-scroll-wrapper {
    display: flex;
    flex: 1;
    flex-wrap: nowrap;
    overflow-x: scroll;
  }
</style>
