<!--
  List — see specs/components/show/List.spec.md
  基础子集：dataSource + renderItem、header/footer（string|Snippet）、bordered/split、
    loading（骨架/spinner）、empty、loadMore（内置按钮/自定义）、grid 网格布局。
  pagination：复用 Pagination 组件，对 dataSource 切片渲染当页（受控 current 不回写，红线 #1）。
  进阶子集：
    - 虚拟化（virtualized）：大数据只渲染视口内行，复用 core fixedRange/dynamicRange/
      scrollOffsetForIndex（与 VirtualList 同一套区间数学）。命令式滚动监听 + rAF 节流 +
      cleanup（红线 #3）；区间/总高纯 $derived，仅依赖本地 $state（红线 #2）。virtualized
      与 grid/pagination 互斥（优先生效，对全量 dataSource 虚拟化）。
    - selectable（'single'|'multiple'）：行可选，选中态受控 selectedKeys + onSelectionChange，
      不回写仅回调（红线 #1）。容器 role=listbox（multiple 时 aria-multiselectable），
      行 role=option + aria-selected。shift 连选（multiple）。
    - 声明式 List.Item / List.Item.Meta：不传 dataSource 时渲染 children（内嵌 <List.Item>），
      通过 context 暴露 selectable 状态给子项（getter 保持响应性，子项不写 $state，避免
      effect 自循环——红线 #2）。
-->
<script lang="ts" generics="T">
  import { untrack, type Snippet } from 'svelte';
  import {
    fixedRange,
    buildOffsets,
    totalFromOffsets,
    dynamicRange,
    scrollOffsetForIndex,
    toggleSelection,
    rangeSelection,
    useLiveAnnouncer,
    type ScrollAlign,
    type ListKey,
  } from '@chenzy-design/core';
  import Empty from '../empty/Empty.svelte';
  import { Button } from '../button/index.js';
  import { Pagination } from '../pagination/index.js';
  import { useLocale } from '../locale-provider/index.js';
  import { setListContext } from './context.js';

  type ListSize = 'small' | 'default' | 'large';
  type GridConfig = number | { column?: number; gutter?: number };
  type SelectableMode = false | 'single' | 'multiple';
  type VirtualConfig = {
    /** 行高（px），默认 40；传 'auto' 启用动态测高。 */
    itemSize?: number | 'auto';
    /** 动态测高初始估算行高（px）。 */
    estimatedItemSize?: number;
    /** 视口高度（px 数字，或 CSS 字符串如 '60vh'）。 */
    height: number | string;
    /** 上下缓冲行数，默认 3。 */
    overscan?: number;
  };

  // 泛型组件 props 用内联类型而非具名 interface Props：在 declaration:true 下，
  // 引用泛型参数 T 的具名 interface 会被当作私有名泄漏进生成的 .d.ts 公共签名而报错。
  let {
    dataSource = [],
    renderItem,
    rowKey = 'key',
    size = 'default',
    bordered = false,
    split = true,
    header,
    footer,
    loading = false,
    loadingSkeleton = false,
    skeletonCount = 3,
    emptyContent,
    grid,
    loadMore,
    onLoadMore,
    loadingMore = false,
    hasMore = false,
    pagination,
    virtualized = false,
    selectable = false,
    selectedKeys,
    defaultSelectedKeys = [],
    onSelectionChange,
    ariaLabel,
    children,
    layout = 'vertical',
    onListScroll,
    class: className = '',
  }: {
    dataSource?: T[];
    renderItem?: Snippet<[item: T, index: number]>;
    rowKey?: string | ((item: T) => string | number);
    size?: ListSize;
    bordered?: boolean;
    split?: boolean;
    header?: string | Snippet;
    footer?: string | Snippet;
    loading?: boolean;
    loadingSkeleton?: boolean;
    skeletonCount?: number;
    emptyContent?: string | Snippet;
    /** 网格布局：列数或 { column, gutter } */
    grid?: GridConfig;
    /** 自定义底部加载区（优先于内置按钮） */
    loadMore?: Snippet;
    /** 内置「加载更多」按钮回调 */
    onLoadMore?: () => void;
    /** 内置按钮 loading 态 */
    loadingMore?: boolean;
    /** 是否还有更多（控制内置按钮显隐） */
    hasMore?: boolean;
    /** 分页：复用 Pagination，对 dataSource 切片渲染当页（与 loadMore 互斥，优先生效） */
    pagination?:
      | false
      | {
          pageSize?: number;
          current?: number;
          defaultCurrent?: number;
          onChange?: (page: number) => void;
        };
    /** 虚拟化：大数据只渲染视口内行（与 grid/pagination 互斥，优先生效）。 */
    virtualized?: false | VirtualConfig;
    /** 行可选：'single' 单选 / 'multiple' 多选。 */
    selectable?: SelectableMode;
    /** 受控选中 key 集合（不回写，仅 onSelectionChange 回调，红线 #1）。 */
    selectedKeys?: ListKey[];
    /** 非受控初始选中 key 集合。 */
    defaultSelectedKeys?: ListKey[];
    /** 选中态变更回调（受控/非受控均触发）。 */
    onSelectionChange?: (
      keys: ListKey[],
      info: { item: T | undefined; key: ListKey; selected: boolean },
    ) => void;
    /** selectable 模式 listbox 容器可访问名（缺省回退 i18n List.selectableLabel）。 */
    ariaLabel?: string;
    /** 声明式用法：内嵌 <List.Item>（不传 dataSource 时生效）。 */
    children?: Snippet;
    /** 整体布局方向：'vertical'（默认）每 item 内容纵向排列；'horizontal' 横向排列。 */
    layout?: 'horizontal' | 'vertical';
    /** 列表容器滚动事件。 */
    onListScroll?: (e: Event) => void;
    class?: string;
  } = $props();

  const loc = useLocale();
  // 单例 live region（polite）：selectable 模式选中/取消时播报（红线 #3：命令式）。
  const announcer = useLiveAnnouncer();

  function isSnippet(v: unknown): v is Snippet {
    return typeof v === 'function';
  }

  function keyOf(item: T, index: number): string | number {
    if (typeof rowKey === 'function') return rowKey(item);
    const rec = item as unknown as Record<string, unknown>;
    const k = rec?.[rowKey];
    if (typeof k === 'string' || typeof k === 'number') return k;
    return index;
  }

  // 声明式用法：未传 dataSource 且存在 children（内嵌 <List.Item>）。优先级低于 dataSource。
  const useDeclarative = $derived(dataSource.length === 0 && children != null);

  const isEmpty = $derived(!loading && !useDeclarative && dataSource.length === 0);
  const skeletonRows = $derived(Array.from({ length: Math.max(0, skeletonCount) }, (_, i) => i));

  // --- selectable 选中态：受控 selectedKeys 不回写，本地 inner 兜底（红线 #1） ---
  const selectMode = $derived<'single' | 'multiple' | null>(
    selectable === 'single' || selectable === 'multiple' ? selectable : null,
  );
  const isSelectControlled = $derived(selectedKeys !== undefined);
  let innerSelected = $state<ListKey[]>(untrack(() => [...defaultSelectedKeys]));
  // 当前选中集合（受控优先）；用 Set 做 O(1) 命中判定（红线 #2：纯派生）。
  const selectedSet = $derived<ReadonlySet<ListKey>>(
    new Set(selectedKeys !== undefined ? selectedKeys : innerSelected),
  );
  // shift 连选锚点（普通簿记变量，不参与 render 响应式）。
  let anchorIndex = -1;

  function keyToItem(key: ListKey): T | undefined {
    for (let i = 0; i < dataSource.length; i += 1) {
      const it = dataSource[i]!;
      if (keyOf(it, i) === key) return it;
    }
    return undefined;
  }

  // 命令式选中切换：算出下一集合 → 仅回调 onSelectionChange（受控不回写，红线 #1）。
  function toggleKey(key: ListKey, shiftKey: boolean): void {
    if (!selectMode) return;
    let next: Set<ListKey>;
    if (shiftKey && selectMode === 'multiple' && anchorIndex >= 0) {
      const orderedKeys = dataSource.map((it, i) => keyOf(it, i));
      const targetIndex = orderedKeys.indexOf(key);
      next = rangeSelection(selectedSet, orderedKeys, anchorIndex, targetIndex);
    } else {
      next = toggleSelection(selectedSet, key, selectMode);
      // 仅非 shift 单击更新锚点。
      if (selectMode === 'multiple') {
        anchorIndex = dataSource.findIndex((it, i) => keyOf(it, i) === key);
      }
    }
    const selected = next.has(key);
    if (!isSelectControlled) innerSelected = [...next];
    onSelectionChange?.([...next], { item: keyToItem(key), key, selected });
    // polite 播报当前操作项的选中/取消状态。label 取常见文本字段，回退到 key。
    const label = selectionLabel(key);
    announcer.announce(
      loc().t(selected ? 'List.selectAnnounce' : 'List.deselectAnnounce', { label }),
    );
  }

  // 选中播报用可读名：优先 item 的字符串本体或 label/title/name 字段，回退到 key。
  function selectionLabel(key: ListKey): string {
    const item = keyToItem(key);
    if (typeof item === 'string' || typeof item === 'number') return String(item);
    const rec = item as unknown as Record<string, unknown> | undefined;
    const text = rec?.label ?? rec?.title ?? rec?.name;
    if (typeof text === 'string' || typeof text === 'number') return String(text);
    return String(key);
  }

  // 向声明式 <List.Item> 暴露 selectable 状态（getter 保持响应性；红线 #2：子项不写 $state）。
  setListContext({
    getSelectable: () => selectable,
    isSelected: (key) => selectedSet.has(key),
    toggle: (key, shiftKey) => toggleKey(key, shiftKey),
    getSize: () => size,
    rowTabindex: (key) => itemTabindex(key),
    onRowKeydown: (e, key) => onItemKeydown(e, key),
    onRowFocus: (key) => onRowFocus(key),
  });

  // --- 虚拟化几何（复用 core 区间数学；红线 #2/#3） ---
  const virtualOn = $derived(virtualized !== false && virtualized !== undefined);
  const vCfg = $derived<VirtualConfig>(
    virtualized && virtualized !== undefined
      ? virtualized
      : { height: 400 },
  );
  const vDynamic = $derived(virtualOn && vCfg.itemSize === 'auto');
  const vItemSize = $derived(typeof vCfg.itemSize === 'number' ? vCfg.itemSize : 40);
  const vEstimated = $derived(vCfg.estimatedItemSize ?? 40);
  const vOverscan = $derived(vCfg.overscan ?? 3);
  const vHeightStyle = $derived(
    typeof vCfg.height === 'number' ? `${vCfg.height}px` : vCfg.height,
  );

  // viewport 元素普通引用（bind:this），不参与响应式几何读取。
  let viewportEl = $state<HTMLDivElement | null>(null);
  // 本地响应式状态：仅由命令式回调 / ResizeObserver 写入，render 期只读。
  let vScrollTop = $state(0);
  let vMeasuredH = $state(0);
  let vHeights = $state<Record<number, number>>({});
  let vRafId = 0;

  // 有效视口高：number 直接用，字符串用测量值。
  const vViewportH = $derived(
    typeof vCfg.height === 'number' ? vCfg.height : vMeasuredH,
  );

  // dynamic：合并实测/估算每项高度 → 前缀和 offsets（render-safe，仅依赖 $state）。
  const vOffsets = $derived.by(() => {
    if (!vDynamic) return [] as number[];
    const arr = new Array<number>(dataSource.length);
    for (let i = 0; i < dataSource.length; i += 1) arr[i] = vHeights[i] ?? vEstimated;
    return buildOffsets(arr);
  });
  const vTotalHeight = $derived(
    vDynamic ? totalFromOffsets(vOffsets) : dataSource.length * vItemSize,
  );
  const vRange = $derived(
    vDynamic
      ? dynamicRange(vOffsets, vScrollTop, vViewportH, vOverscan)
      : fixedRange(vScrollTop, vViewportH, vItemSize, dataSource.length, vOverscan),
  );
  const vStart = $derived(vRange.startIndex);
  const vEnd = $derived(vRange.endIndex);
  const vVisible = $derived(dataSource.slice(vStart, vEnd));

  function vItemOffset(index: number): number {
    if (vDynamic) return vOffsets[index] ?? index * vEstimated;
    return index * vItemSize;
  }
  function vItemMainSize(index: number): number {
    if (vDynamic) return vHeights[index] ?? vEstimated;
    return vItemSize;
  }
  function vItemStyle(index: number): string {
    const off = vItemOffset(index);
    if (vDynamic) return `transform:translateY(${off}px)`;
    return `transform:translateY(${off}px); block-size:${vItemSize}px`;
  }

  /**
   * 命令式滚动到指定索引项（红线 #3：直接写 DOM scrollTop，非 render 期）。
   */
  export function scrollToIndex(
    index: number,
    opts?: { align?: ScrollAlign },
  ): void {
    const el = viewportEl;
    if (!el || !virtualOn || dataSource.length === 0) return;
    const i = Math.max(0, Math.min(dataSource.length - 1, Math.floor(index)));
    const totalMain = vDynamic ? totalFromOffsets(vOffsets) : dataSource.length * vItemSize;
    const target = scrollOffsetForIndex(
      vItemOffset(i),
      vItemMainSize(i),
      el.clientHeight,
      totalMain,
      opts?.align ?? 'start',
    );
    el.scrollTop = target;
    vScrollTop = target;
  }

  // 虚拟化滚动监听（命令式 + rAF 节流 + cleanup；红线 #3）。
  $effect(() => {
    const el = viewportEl;
    if (!el || !virtualOn) return;
    function onScroll() {
      if (vRafId) return;
      vRafId = requestAnimationFrame(() => {
        vRafId = 0;
        if (el) vScrollTop = el.scrollTop;
      });
    }
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (vRafId) {
        cancelAnimationFrame(vRafId);
        vRafId = 0;
      }
    };
  });

  // 视口高度测量：仅 height 非数字（字符串）时启用 ResizeObserver。
  $effect(() => {
    const el = viewportEl;
    if (!el || !virtualOn || typeof vCfg.height === 'number') return;
    vMeasuredH = el.clientHeight;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) vMeasuredH = entry.contentRect.height;
    });
    ro.observe(el);
    return () => ro.disconnect();
  });

  // dynamic 行高实测 + 偏移补偿（命令式 ResizeObserver，cleanup disconnect；红线 #2/#3）。
  $effect(() => {
    const el = viewportEl;
    if (!el || !virtualOn || !vDynamic) return;
    void vVisible; // 依赖渲染行集合变化重建 observer。

    function measure(node: Element) {
      const idx = Number((node as HTMLElement).dataset.vindex);
      if (Number.isNaN(idx)) return;
      const h = (node as HTMLElement).getBoundingClientRect().height;
      if (h <= 0) return;
      const prev = vHeights[idx];
      if (prev !== undefined && Math.abs(prev - h) < 0.5) return;
      const before = prev ?? vEstimated;
      const delta = h - before;
      vHeights[idx] = h;
      if (delta !== 0 && el && vItemOffset(idx) < vScrollTop) {
        el.scrollTop += delta;
        vScrollTop = el.scrollTop;
      }
    }

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) measure(entry.target);
    });
    const rows = el.querySelectorAll<HTMLElement>('[data-vindex]');
    rows.forEach((node) => {
      measure(node);
      ro.observe(node);
    });
    return () => ro.disconnect();
  });

  // selectable 行点击/键盘（dataSource 模式用；声明式由 List.Item 自身处理）。
  function onRowActivate(item: T, index: number, shiftKey: boolean): void {
    toggleKey(keyOf(item, index), shiftKey);
  }

  // --- roving tabindex（a11y §6 / Listbox APG）：selectable 行组为单一 Tab 停靠点。 ---
  // rootEl 普通引用（bind:this），命令式 focus() 用，非 render 期读 DOM；
  // 声明式 / 虚拟化 / 普通三种渲染路径的行都带 data-list-key，统一按 DOM 顺序漫游
  // （红线 #2：不用 $state 数组收集子项，避免 effect 自循环）。
  let rootEl = $state<HTMLElement | null>(null);
  // 当前焦点行的 key；null = 尚无焦点 -> 首行作为 Tab 停靠点。
  let focusedRowKey = $state<ListKey | null>(null);

  // selectable 模式下行的有序 key 列表（用于 roving 首末 / PageUp/Down 计算）。
  const rowKeys = $derived<ListKey[]>(
    selectMode ? dataSource.map((it, i) => keyOf(it, i)) : [],
  );

  // 纯派生 tabindex：焦点行（或无焦点时首行）为 0，其余 -1（红线 #2：render 期只读）。
  function rowTabindex(key: ListKey): 0 | -1 {
    if (!selectMode) return 0;
    return (focusedRowKey ?? rowKeys[0]) === key ? 0 : -1;
  }

  function focusRowByKey(key: ListKey): void {
    rootEl
      ?.querySelector<HTMLElement>(
        `[data-list-key="${CSS.escape(String(key))}"]`,
      )
      ?.focus();
  }

  // DOM 顺序的行 key 列表（声明式 <List.Item> 用：行不在 dataSource 内，按 DOM 漫游）。
  function domRowKeys(): string[] {
    if (!rootEl) return [];
    return [...rootEl.querySelectorAll<HTMLElement>('[data-list-key]')].map(
      (el) => el.dataset.listKey ?? '',
    );
  }

  // 翻一屏的行数（虚拟化按可视区估算，否则固定 10 行兜底）。
  function pageStep(): number {
    if (virtualOn && vItemSize > 0) {
      return Math.max(1, Math.floor(vViewportH / vItemSize));
    }
    return 10;
  }

  // 行 keydown：↑↓ roving、Home/End 跳首末、PageUp/Down 翻屏、Space/Enter 激活。
  // Shift+↑↓（multiple）连选。命令式 focus() 在事件回调（非 render 期）。
  function onRowKeydown(e: KeyboardEvent, item: T, index: number): void {
    const key = keyOf(item, index);
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onRowActivate(item, index, e.shiftKey);
      return;
    }
    if (!selectMode) return;
    const keys = rowKeys;
    if (keys.length === 0) return;
    const cur = keys.indexOf(key);
    let target = -1;
    if (e.key === 'ArrowDown') target = Math.min(keys.length - 1, cur + 1);
    else if (e.key === 'ArrowUp') target = Math.max(0, cur - 1);
    else if (e.key === 'Home') target = 0;
    else if (e.key === 'End') target = keys.length - 1;
    else if (e.key === 'PageDown') target = Math.min(keys.length - 1, cur + pageStep());
    else if (e.key === 'PageUp') target = Math.max(0, cur - pageStep());
    else return;
    e.preventDefault();
    const targetKey = keys[target];
    if (targetKey == null) return;
    focusedRowKey = targetKey;
    // multiple 模式 Shift+方向键：移动焦点同时连选（范围以锚点为基准）。
    if (e.shiftKey && selectMode === 'multiple') {
      toggleKey(targetKey, true);
    }
    focusRowByKey(targetKey);
  }
  function onRowFocus(key: ListKey): void {
    focusedRowKey = key;
  }

  // 声明式 <List.Item> keydown：按 DOM 顺序 roving（行不在 dataSource 内）。
  // Space/Enter 由 List.Item 自身的 activate 处理，这里只管方向键 / Home/End / PageUp/Down。
  function onItemKeydown(e: KeyboardEvent, key: ListKey): void {
    if (!selectMode) return;
    const keys = domRowKeys();
    if (keys.length === 0) return;
    const cur = keys.indexOf(String(key));
    if (cur < 0) return;
    let target = -1;
    if (e.key === 'ArrowDown') target = Math.min(keys.length - 1, cur + 1);
    else if (e.key === 'ArrowUp') target = Math.max(0, cur - 1);
    else if (e.key === 'Home') target = 0;
    else if (e.key === 'End') target = keys.length - 1;
    else if (e.key === 'PageDown') target = Math.min(keys.length - 1, cur + pageStep());
    else if (e.key === 'PageUp') target = Math.max(0, cur - pageStep());
    else return;
    e.preventDefault();
    const targetKey = keys[target];
    if (targetKey == null) return;
    focusedRowKey = targetKey;
    if (e.shiftKey && selectMode === 'multiple') toggleKey(targetKey, true);
    focusRowByKey(targetKey);
  }
  // 声明式行 tabindex：焦点行 / 首个 DOM 行为 0，其余 -1（红线 #2：render 期只读）。
  // 挂载前 rootEl 为空、DOM 顺序未知，回退为 0 保证可 Tab 进入；挂载后由 DOM 查询收敛为单一停靠点。
  function itemTabindex(key: ListKey): 0 | -1 {
    if (!selectMode) return 0;
    if (focusedRowKey != null) return focusedRowKey === key ? 0 : -1;
    const keys = domRowKeys();
    if (keys.length === 0) return 0;
    return keys[0] === String(key) ? 0 : -1;
  }

  // --- 分页：受控 current 不回写 (红线 #1)，本地 inner 兜底 ---
  const paginationOn = $derived(pagination !== undefined && pagination !== false);
  const pageSize = $derived(pagination ? (pagination.pageSize ?? 10) : 10);
  const isPageControlled = $derived(!!pagination && pagination.current !== undefined);
  let innerPage = $state(untrack(() => (pagination ? (pagination.defaultCurrent ?? 1) : 1)));
  const currentPage = $derived(
    pagination && pagination.current !== undefined ? pagination.current : innerPage,
  );
  // 当前页切片数据；未分页时为全量。
  const pagedData = $derived.by<T[]>(() => {
    if (!paginationOn) return dataSource;
    const start = (currentPage - 1) * pageSize;
    return dataSource.slice(start, start + pageSize);
  });
  function onPageChange(page: number) {
    if (!isPageControlled) innerPage = page;
    if (pagination) pagination.onChange?.(page);
  }

  // grid 布局：解析列数/间距，生成 inline CSS（CSS grid）。
  const gridOn = $derived(grid !== undefined);
  const gridColumn = $derived(
    typeof grid === 'number' ? grid : (grid?.column ?? 4),
  );
  const gridGutter = $derived(
    typeof grid === 'object' ? (grid.gutter ?? 16) : 16,
  );
  const gridStyle = $derived(
    gridOn
      ? `display:grid;grid-template-columns:repeat(${gridColumn},minmax(0,1fr));gap:${gridGutter}px`
      : undefined,
  );

  const cls = $derived(
    [
      'cd-list',
      `cd-list--${size}`,
      bordered && 'cd-list--bordered',
      split && 'cd-list--split',
      selectMode && 'cd-list--selectable',
      layout === 'horizontal' && 'cd-list--horizontal',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  // selectable 列表语义：role=listbox（multiple 时 aria-multiselectable），否则原生 list。
  const itemsRole = $derived(selectMode ? 'listbox' : undefined);
  const itemsMultiselect = $derived(selectMode === 'multiple' ? true : undefined);
  // listbox 可访问名（aria-input-field-name）：缺省回退 i18n。非 selectable 时不设。
  const itemsLabel = $derived(
    selectMode ? (ariaLabel ?? loc().t('List.selectableLabel')) : undefined,
  );
</script>

<!--
  selectable 行的勾选指示器：纯视觉（aria-hidden + 无 input），避免 option 内嵌可聚焦控件
  导致 axe nested-interactive。选中态由行 aria-selected 表达，勾选/取消走行的 Space/Enter。
-->
{#snippet selectorMark(sel: boolean)}
  <span class="cd-list__item-selector" aria-hidden="true">
    <span class="cd-list__check" class:cd-list__check--on={sel}>
      {#if sel}
        <svg viewBox="0 0 16 16" width="10" height="10" focusable="false">
          <path
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3.5 8.5 6.5 11.5 12.5 4.5"
          />
        </svg>
      {/if}
    </span>
  </span>
{/snippet}

<div class={cls} aria-busy={loading || undefined} bind:this={rootEl} onscroll={onListScroll}>
  {#if header !== undefined}
    <div class="cd-list__header">
      {#if isSnippet(header)}{@render header()}{:else}{header}{/if}
    </div>
  {/if}

  <div class="cd-list__body">
    {#if loading && loadingSkeleton}
      <ul class="cd-list__items" aria-hidden="true">
        {#each skeletonRows as i (i)}
          <li class="cd-list__item cd-list__item--skeleton">
            <span class="cd-list__skeleton-bar"></span>
          </li>
        {/each}
      </ul>
    {:else if loading}
      <div class="cd-list__spinner-wrap">
        <span class="cd-list__spinner" aria-hidden="true"></span>
      </div>
    {:else if isEmpty}
      <div class="cd-list__empty">
        {#if isSnippet(emptyContent)}
          {@render emptyContent()}
        {:else if emptyContent !== undefined}
          {emptyContent}
        {:else}
          <Empty image="noData" />
        {/if}
      </div>
    {:else if useDeclarative}
      <!-- 声明式：渲染内嵌 <List.Item>（selectable 状态经 context 下发）。 -->
      <ul
        class="cd-list__items"
        role={itemsRole}
        aria-multiselectable={itemsMultiselect}
        aria-label={itemsLabel}
      >
        {@render children?.()}
      </ul>
    {:else if virtualOn}
      <!-- 虚拟化：仅渲染视口内行，复用 core 区间数学；命令式滚动监听（红线 #2/#3）。 -->
      <div
        class="cd-list__virtual"
        bind:this={viewportEl}
        role={itemsRole ?? 'list'}
        aria-multiselectable={itemsMultiselect}
        aria-label={itemsLabel}
        style={`block-size:${vHeightStyle}; overflow:auto`}
      >
        <div class="cd-list__virtual-spacer" style={`block-size:${vTotalHeight}px`}>
          {#each vVisible as item, i (keyOf(item, vStart + i))}
            {@const index = vStart + i}
            {@const k = keyOf(item, index)}
            {@const sel = selectMode ? selectedSet.has(k) : false}
            <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
            <div
              class="cd-list__item cd-list__virtual-item"
              class:cd-list__item--selectable={!!selectMode}
              class:cd-list__item--selected={sel}
              data-vindex={index}
              data-list-key={selectMode ? k : undefined}
              role={selectMode ? 'option' : 'listitem'}
              aria-selected={selectMode ? sel : undefined}
              aria-setsize={dataSource.length}
              aria-posinset={index + 1}
              tabindex={selectMode ? rowTabindex(k) : undefined}
              style={vItemStyle(index)}
              onclick={selectMode ? (e) => onRowActivate(item, index, e.shiftKey) : undefined}
              onkeydown={selectMode ? (e) => onRowKeydown(e, item, index) : undefined}
              onfocus={selectMode ? () => onRowFocus(k) : undefined}
            >
              {#if selectMode}
                {@render selectorMark(sel)}
              {/if}
              <div class="cd-list__item-content">
                {#if renderItem}{@render renderItem(item, index)}{/if}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {:else}
      <ul
        class="cd-list__items"
        class:cd-list__items--grid={gridOn}
        style={gridStyle}
        role={itemsRole}
        aria-multiselectable={itemsMultiselect}
        aria-label={itemsLabel}
      >
        {#each pagedData as item, index (keyOf(item, index))}
          {@const realIndex = paginationOn ? (currentPage - 1) * pageSize + index : index}
          {@const k = keyOf(item, realIndex)}
          {@const sel = selectMode ? selectedSet.has(k) : false}
          {#if selectMode}
            <li
              class="cd-list__item cd-list__item--selectable"
              class:cd-list__item--selected={sel}
              class:cd-list__item--grid={gridOn}
              data-list-key={k}
              role="option"
              aria-selected={sel}
              tabindex={rowTabindex(k)}
              onclick={(e) => onRowActivate(item, realIndex, e.shiftKey)}
              onkeydown={(e) => onRowKeydown(e, item, realIndex)}
              onfocus={() => onRowFocus(k)}
            >
              {@render selectorMark(sel)}
              <div class="cd-list__item-content">
                {#if renderItem}{@render renderItem(item, realIndex)}{/if}
              </div>
            </li>
          {:else}
            <li class="cd-list__item" class:cd-list__item--grid={gridOn}>
              {#if renderItem}{@render renderItem(item, realIndex)}{/if}
            </li>
          {/if}
        {/each}
      </ul>

      {#if paginationOn}
        <div class="cd-list__pagination">
          <Pagination
            total={dataSource.length}
            currentPage={currentPage}
            {pageSize}
            size={size === 'large' ? 'default' : size}
            onChange={onPageChange}
          />
        </div>
      {:else if loadMore}
        <div class="cd-list__load-more">{@render loadMore()}</div>
      {:else if onLoadMore !== undefined && (hasMore || loadingMore)}
        <div class="cd-list__load-more">
          <Button
            loading={loadingMore}
            disabled={!hasMore && !loadingMore}
            onclick={() => onLoadMore?.()}
          >
            {loc().t('List.loadMore')}
          </Button>
        </div>
      {/if}
    {/if}
  </div>

  {#if footer !== undefined}
    <div class="cd-list__footer">
      {#if isSnippet(footer)}{@render footer()}{:else}{footer}{/if}
    </div>
  {/if}
</div>

<style>
  .cd-list {
    background: var(--cd-list-bg);
    color: var(--cd-list-item-color);
    --cd-list-pad-y: var(--cd-list-item-padding);
  }
  .cd-list--small {
    --cd-list-pad-y: var(--cd-list-item-padding-small);
  }
  .cd-list--bordered {
    border: 1px solid var(--cd-list-border);
    border-radius: var(--cd-list-radius);
    overflow: hidden;
  }

  /* horizontal layout: item 内容横向排列 */
  .cd-list--horizontal .cd-list__item {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: var(--cd-spacing-base-tight, 12px);
  }

  .cd-list__header {
    padding-block: var(--cd-list-pad-y);
    padding-inline: var(--cd-list-item-padding);
    color: var(--cd-list-header-color);
    border-block-end: 1px solid var(--cd-list-split-color);
  }
  .cd-list__footer {
    padding-block: var(--cd-list-pad-y);
    padding-inline: var(--cd-list-item-padding);
    border-block-start: 1px solid var(--cd-list-split-color);
  }

  .cd-list__items {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .cd-list__item {
    padding-block: var(--cd-list-pad-y);
    padding-inline: var(--cd-list-item-padding);
  }
  .cd-list--split .cd-list__item + .cd-list__item {
    border-block-start: 1px solid var(--cd-list-split-color);
  }
  /* grid 模式：取消 split 分隔线与行内边距，由 grid gap 控制间距 */
  .cd-list__items--grid {
    padding-block: var(--cd-list-pad-y);
  }
  .cd-list--split .cd-list__item--grid + .cd-list__item--grid {
    border-block-start: none;
  }
  .cd-list__item--grid {
    padding: 0;
  }

  /* selectable 行：内置 checkbox + 主内容横向布局，选中/hover/focus 强调。 */
  .cd-list__item--selectable {
    display: flex;
    align-items: flex-start;
    gap: var(--cd-spacing-tight, 8px);
    cursor: pointer;
    outline: none;
  }
  .cd-list__item--selectable:hover {
    background: var(--cd-color-fill-0, rgba(0, 0, 0, 0.03));
  }
  .cd-list__item--selectable:focus-visible {
    box-shadow: inset 0 0 0 2px var(--cd-color-primary, #0066ff);
  }
  .cd-list__item--selected {
    background: var(--cd-color-primary-light-default, rgba(0, 102, 255, 0.1));
  }
  .cd-list__item-selector {
    flex: none;
    display: flex;
    align-items: center;
    pointer-events: none;
  }
  /* 纯视觉勾选框（无 input；选中态走行 aria-selected，避免 nested-interactive）。 */
  .cd-list__check {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    inline-size: 16px;
    block-size: 16px;
    border: 1px solid var(--cd-color-border);
    border-radius: var(--cd-border-radius-small);
    color: var(--cd-color-bg-0, #fff);
    background: var(--cd-color-bg-0, #fff);
  }
  .cd-list__check--on {
    background: var(--cd-color-primary, #0066ff);
    border-color: var(--cd-color-primary, #0066ff);
  }
  .cd-list__item-content {
    flex: 1;
    min-inline-size: 0;
  }

  /* 虚拟化：视口自身滚动，撑高占位 + 绝对定位行。 */
  .cd-list__virtual {
    position: relative;
    inline-size: 100%;
    scrollbar-color: var(--cd-virtual-list-scrollbar, currentColor) transparent;
  }
  .cd-list__virtual-spacer {
    position: relative;
    inline-size: 100%;
  }
  .cd-list__virtual-item {
    position: absolute;
    inset-block-start: 0;
    inset-inline: 0;
  }

  .cd-list__load-more {
    display: flex;
    justify-content: center;
    padding-block: var(--cd-list-item-padding);
  }
  .cd-list__pagination {
    display: flex;
    justify-content: flex-end;
    padding-block: var(--cd-list-item-padding);
    padding-inline: var(--cd-list-item-padding);
  }

  .cd-list__empty {
    padding-block: var(--cd-spacing-list-empty-paddingy);
    padding-inline: var(--cd-spacing-list-empty-paddingx);
    color: var(--cd-color-list-empty-text-default);
    display: flex;
    justify-content: center;
  }

  .cd-list__spinner-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-block: calc(var(--cd-list-item-padding) * 2);
  }
  .cd-list__spinner {
    inline-size: 1.5em;
    block-size: 1.5em;
    border: 2px solid var(--cd-list-split-color);
    border-block-start-color: var(--cd-color-primary, currentColor);
    border-radius: var(--cd-border-radius-full);
    animation: cd-list-spin 0.7s linear infinite;
  }

  .cd-list__skeleton-bar {
    display: block;
    block-size: 1em;
    inline-size: 100%;
    border-radius: var(--cd-border-radius-small);
    background: var(--cd-list-split-color);
    position: relative;
    overflow: hidden;
  }
  .cd-list__skeleton-bar::after {
    content: '';
    position: absolute;
    inset: 0;
    transform: translateX(-100%);
    background: linear-gradient(
      90deg,
      transparent,
      var(--cd-list-bg),
      transparent
    );
    animation: cd-list-shimmer 1.2s ease-in-out infinite;
  }

  @keyframes cd-list-spin {
    to {
      transform: rotate(360deg);
    }
  }
  @keyframes cd-list-shimmer {
    100% {
      transform: translateX(100%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-list__spinner {
      animation: none;
    }
    .cd-list__skeleton-bar::after {
      animation: none;
    }
  }
</style>
