<!--
  Transfer — see specs/components/input/Transfer.spec.md
  Basic subset: type='list' two-column transfer, checkbox multi-select,
  move buttons, local search filter. Controlled / uncontrolled `value`.
  groupList: `dataSource` accepts grouped `{ title, items }[]` (or flat items
  with an optional `group` field) — each side renders group headers + items.
  treeList: `dataSource` accepts `TransferTreeNode[]` (items with `children`).
  The source panel renders a tree (indent + expand/collapse); checking a parent
  conducts to all enabled leaf descendants (core `conduct`/`toggleCheck`), with
  tri-state half-check. Only leaves migrate to the (flat) target panel; migrated
  leaves are greyed/disabled in the source tree.
  oneWay: left→right only — each target row has its own remove button; no
  right→left batch button.
  virtualize: `virtualize` (+`itemHeight`) renders only the in-viewport slice of
  *both* flat panels (reuses core `fixedRange`); scrollTop is written by an
  imperative rAF-throttled scroll listener into local $state, the visible range
  is a pure $derived (红线 #2/#3). Falls back to full render for tree/group panels.
  draggable: `draggable` lets target (selected) rows be reordered by mouse via
  HTML5 DnD; the new order is computed by the `reorder` pure fn (红线 #2) and only
  propagated via `onChange` — controlled `value` is never written (红线 #1).
  remote onSearch: providing `onSearch(query, direction)` switches to remote mode
  (debounced via `searchDebounce`, imperative timer + cleanup, 红线 #3); the parent
  updates `dataSource`, local filtering is skipped, `loading` shows a spinner.
-->
<script lang="ts">
  import Checkbox from '../checkbox/Checkbox.svelte';
  import Input from '../input/Input.svelte';
  import Button from '../button/Button.svelte';
  import { useLocale } from '../locale-provider/index.js';
  import {
    conduct,
    toggleCheck,
    flattenVisible,
    collectExpandable,
    computeFilteredKeys,
    type TreeNodeData,
    type FlatNode,
  } from '@chenzy-design/core';
  import type {
    TransferGroup,
    TransferItem,
    TransferRenderGroup,
    TransferTreeNode,
  } from './types.js';
  import { fixedRange } from '@chenzy-design/core';
  import { buildGroups, hasGroups, normalizeData } from './group.js';
  import { isTreeData, flattenLeaves } from './tree.js';
  import { computeInsertSide, reorder, type InsertSide } from './reorder.js';
  import type { Attachment } from 'svelte/attachments';

  type TransferKey = string | number;
  type Size = 'small' | 'default' | 'large';
  type Status = 'default' | 'warning' | 'error';

  interface Props {
    value?: TransferKey[];
    defaultValue?: TransferKey[];
    dataSource?: TransferItem[] | TransferGroup[] | TransferTreeNode[];
    filter?: boolean;
    searchPlaceholder?: string;
    size?: Size;
    status?: Status;
    disabled?: boolean;
    showPanelTitle?: boolean;
    titles?: [string, string];
    /** Left→right only: target rows get a remove button, no right→left batch. */
    oneWay?: boolean;
    /**
     * Reorder target (selected) rows by mouse drag (HTML5 DnD). New order is
     * propagated only via `onChange` (controlled `value` is never written).
     * Ignored in tree mode (target panel stays flat but DnD reorder applies).
     */
    draggable?: boolean;
    /**
     * Virtualize both flat panels: render only the in-viewport slice for large
     * lists. Reuses core `fixedRange`. Ignored for grouped/tree source panels.
     */
    virtualize?: boolean;
    /** Virtualized row height (px, default 32); must match the real row height. */
    itemHeight?: number;
    /**
     * Remote search: providing this switches to remote mode — input is debounced
     * (`searchDebounce` ms) then this is called with the query and which panel
     * fired it; the parent updates `dataSource`, local filtering is skipped.
     */
    onSearch?: (query: string, direction: 'left' | 'right') => void;
    /** Remote loading: shows a spinner row in each panel list. */
    loading?: boolean;
    /** onSearch debounce in ms (default 300). */
    searchDebounce?: number;
    onChange?: (targetKeys: TransferKey[]) => void;
  }

  let {
    value,
    defaultValue = [],
    dataSource = [],
    filter = true,
    searchPlaceholder,
    size = 'default',
    status = 'default',
    disabled = false,
    showPanelTitle = true,
    titles,
    oneWay = false,
    draggable = false,
    virtualize = false,
    itemHeight = 32,
    onSearch,
    loading = false,
    searchDebounce = 300,
    onChange,
  }: Props = $props();

  const loc = useLocale();

  const searchPlaceholderText = $derived(
    searchPlaceholder ?? loc().t('Transfer.searchPlaceholder'),
  );

  const isControlled = $derived(value !== undefined);
  let inner = $state<TransferKey[]>(getInitialValue());
  // Controlled (`value=`): parent owns the value; we never write the prop, only
  // propagate via `onChange`. Uncontrolled: keep our own state in sync.
  const current = $derived(isControlled ? (value ?? []) : inner);

  function getInitialValue(): TransferKey[] {
    return [...defaultValue];
  }

  // Local checked sets — purely local UI state, independent of `value`.
  // In tree mode `leftChecked` is the *base* (leaf-level) checked set fed to
  // core `conduct`/`toggleCheck`.
  let leftChecked = $state<TransferKey[]>([]);
  let rightChecked = $state<TransferKey[]>([]);

  // Local search queries — local UI state.
  let leftQuery = $state('');
  let rightQuery = $state('');

  // --- Tree mode detection (treeList) -------------------------------------
  const isTree = $derived(isTreeData(dataSource as readonly unknown[]));
  const treeData = $derived(isTree ? (dataSource as TransferTreeNode[]) : []);

  // Tree leaves flattened to flat items (the migratable units) for the target
  // panel + label lookups. In tree mode this replaces the normalized list.
  const treeLeaves = $derived(flattenLeaves(treeData));

  // Normalize grouped `{ title, items }[]` or flat items into one flat list,
  // tagging each item with `group`. Backward compatible: flat data is untouched.
  const items = $derived(
    isTree ? treeLeaves : normalizeData(dataSource as TransferItem[] | TransferGroup[]),
  );
  const grouped = $derived(!isTree && hasGroups(items));

  const leftItems = $derived(items.filter((item) => !current.includes(item.key)));
  const rightItems = $derived(items.filter((item) => current.includes(item.key)));

  // remote 模式：外部已按 query 更新 dataSource，本地不再过滤（对齐 Select）。
  const isRemote = $derived(onSearch !== undefined);

  function matches(label: string, query: string): boolean {
    return label.toLowerCase().includes(query.trim().toLowerCase());
  }

  const leftVisible = $derived(
    filter && !isRemote && leftQuery
      ? leftItems.filter((i) => matches(i.label, leftQuery))
      : leftItems,
  );
  const rightVisible = $derived(
    filter && !isRemote && rightQuery
      ? rightItems.filter((i) => matches(i.label, rightQuery))
      : rightItems,
  );

  // Render groups — pure derivations. Empty groups vanish because the input is
  // the post-filter visible list. Fallback bucket reuses the panel title.
  const sourceFallback = $derived(titles?.[0] ?? loc().t('Transfer.titleSource'));
  const targetFallback = $derived(titles?.[1] ?? loc().t('Transfer.titleTarget'));
  const leftGroups = $derived(buildGroups(leftVisible, sourceFallback));
  const rightGroups = $derived(buildGroups(rightVisible, targetFallback));

  // --- Tree-mode derivations (pure; render never writes state) -------------
  const movedSet = $derived(new Set(current));

  // Tree for the source panel: already-migrated leaves are disabled (greyed) so
  // they cannot be re-checked (core `conduct` excludes disabled from auto-check).
  function maskTree(nodes: TransferTreeNode[]): TreeNodeData[] {
    return nodes.map((n) => {
      if (n.children && n.children.length > 0) {
        return { ...n, children: maskTree(n.children) } as TreeNodeData;
      }
      return { ...n, disabled: !!n.disabled || movedSet.has(n.key) } as TreeNodeData;
    });
  }
  const sourceTree = $derived(maskTree(treeData));

  // Expansion is local UI state. Default: expand all parents on first paint.
  let expandedTouched = $state(false);
  let innerExpanded = $state<Set<TransferKey>>(new Set());
  const defaultExpanded = $derived(new Set(collectExpandable(sourceTree)));
  const baseExpanded = $derived(expandedTouched ? innerExpanded : defaultExpanded);

  // Search expands ancestors of matches without writing the base set (红线 #1/#2).
  const treeSearch = $derived(filter && !isRemote ? leftQuery.trim().toLowerCase() : '');
  const treeFiltered = $derived(
    treeSearch
      ? computeFilteredKeys(sourceTree, (n) => n.label.toLowerCase().includes(treeSearch))
      : { matched: new Set<TransferKey>(), expand: new Set<TransferKey>() },
  );
  const searchExpand = $derived(treeFiltered.expand);
  const searchMatched = $derived(treeFiltered.matched);
  const effectiveExpanded = $derived(
    treeSearch ? new Set([...baseExpanded, ...searchExpand]) : baseExpanded,
  );

  const flatNodes = $derived(isTree ? flattenVisible(sourceTree, effectiveExpanded) : []);
  // Hide nodes that (under active search) neither match nor have a matching
  // descendant. A node stays if matched, or is an expanded ancestor of a match.
  const visibleFlat = $derived(
    treeSearch
      ? flatNodes.filter(
          (f) => searchMatched.has(f.node.key) || searchExpand.has(f.node.key),
        )
      : flatNodes,
  );

  // Conduction: derive checked/half from the leaf-level base set.
  const conducted = $derived(
    isTree ? conduct(sourceTree, new Set(leftChecked)) : { checked: new Set<TransferKey>(), half: new Set<TransferKey>() },
  );

  function isExpanded(key: TransferKey): boolean {
    return effectiveExpanded.has(key);
  }

  function toggleExpand(key: TransferKey) {
    const next = new Set(baseExpanded);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    innerExpanded = next;
    expandedTouched = true;
  }

  function toggleTreeCheck(node: TreeNodeData) {
    if (disabled || node.disabled) return;
    leftChecked = [...toggleCheck(sourceTree, new Set(leftChecked), node.key)];
  }

  /** Movable (non-disabled, checked) keys within one render group. */
  function groupMovable(
    side: 'left' | 'right',
    group: TransferRenderGroup,
  ): TransferKey[] {
    const checked = side === 'left' ? leftChecked : rightChecked;
    return group.items.filter((i) => !i.disabled && checked.includes(i.key)).map((i) => i.key);
  }

  /** Tri-state for a group's header checkbox. */
  function groupCheckState(
    side: 'left' | 'right',
    group: TransferRenderGroup,
  ): { checked: boolean; indeterminate: boolean } {
    const checked = side === 'left' ? leftChecked : rightChecked;
    const selectable = group.items.filter((i) => !disabled && !i.disabled);
    if (selectable.length === 0) return { checked: false, indeterminate: false };
    const picked = selectable.filter((i) => checked.includes(i.key)).length;
    return { checked: picked === selectable.length, indeterminate: picked > 0 && picked < selectable.length };
  }

  function toggleGroup(side: 'left' | 'right', group: TransferRenderGroup) {
    if (disabled) return;
    const keys = group.items.filter((i) => !i.disabled).map((i) => i.key);
    if (keys.length === 0) return;
    const checked = side === 'left' ? leftChecked : rightChecked;
    const allOn = keys.every((k) => checked.includes(k));
    const set = new Set(checked);
    if (allOn) keys.forEach((k) => set.delete(k));
    else keys.forEach((k) => set.add(k));
    if (side === 'left') leftChecked = [...set];
    else rightChecked = [...set];
  }

  function commit(next: TransferKey[]) {
    if (!isControlled) inner = next;
    onChange?.(next);
  }

  function toggleChecked(side: 'left' | 'right', key: TransferKey) {
    if (side === 'left') {
      leftChecked = leftChecked.includes(key)
        ? leftChecked.filter((k) => k !== key)
        : [...leftChecked, key];
    } else {
      rightChecked = rightChecked.includes(key)
        ? rightChecked.filter((k) => k !== key)
        : [...rightChecked, key];
    }
  }

  function moveToRight() {
    if (disabled) return;
    // In tree mode `leftChecked` is leaf-level; keep only enabled, not-yet-moved.
    const movable = leftItems
      .filter((i) => !i.disabled && leftChecked.includes(i.key))
      .map((i) => i.key);
    if (movable.length === 0) return;
    commit([...current, ...movable]);
    leftChecked = leftChecked.filter((k) => !movable.includes(k));
  }

  function moveToLeft() {
    if (disabled) return;
    const movable = rightItems
      .filter((i) => !i.disabled && rightChecked.includes(i.key))
      .map((i) => i.key);
    if (movable.length === 0) return;
    const remove = new Set(movable);
    commit(current.filter((k) => !remove.has(k)));
    rightChecked = [];
  }

  /** oneWay: remove a single target item back to the source. */
  function removeOne(key: TransferKey) {
    if (disabled) return;
    commit(current.filter((k) => k !== key));
    rightChecked = rightChecked.filter((k) => k !== key);
  }

  // --- remote 搜索防抖（命令式定时器 + cleanup，红线 #3）对齐 Select ---
  let leftTimer: ReturnType<typeof setTimeout> | undefined;
  let rightTimer: ReturnType<typeof setTimeout> | undefined;
  function scheduleSearch(direction: 'left' | 'right', q: string) {
    const timer = direction === 'left' ? leftTimer : rightTimer;
    if (timer !== undefined) clearTimeout(timer);
    const id = setTimeout(() => {
      if (direction === 'left') leftTimer = undefined;
      else rightTimer = undefined;
      onSearch?.(q, direction);
    }, Math.max(0, searchDebounce));
    if (direction === 'left') leftTimer = id;
    else rightTimer = id;
  }
  function onQueryInput(direction: 'left' | 'right', v: string) {
    if (direction === 'left') leftQuery = v;
    else rightQuery = v;
    if (isRemote) scheduleSearch(direction, v);
  }
  // 卸载兜底清理。
  $effect(() => () => {
    if (leftTimer !== undefined) clearTimeout(leftTimer);
    if (rightTimer !== undefined) clearTimeout(rightTimer);
  });

  // --- 目标列拖拽重排（HTML5 DnD，与 TagInput 对齐）---------------------------
  // 受控不改 value，仅经 onChange 通知新顺序（红线 #1）；拖拽态用 $state，事件
  // 处理命令式 + drop/dragend 清理（红线 #3）；重排交由 reorder.ts 纯函数（红线 #2）。
  // 拖拽作用于「当前 target keys 的顺序」，按可见目标项的全局索引映射回 current。
  const canDrag = $derived(draggable && !disabled);
  let dragIndex = $state<number | null>(null); // 被拖拽目标项在 current 中的下标
  let dropIndex = $state<number | null>(null); // 当前悬停目标项下标
  let dropSide = $state<InsertSide | null>(null); // 插入到目标前/后

  function resetDrag() {
    dragIndex = null;
    dropIndex = null;
    dropSide = null;
  }
  // 把可见目标项映射回它在 current（已选顺序）中的下标。
  function targetIndexOf(key: TransferKey): number {
    return current.indexOf(key);
  }
  function onRowDragStart(e: DragEvent, key: TransferKey) {
    if (!canDrag) {
      e.preventDefault();
      return;
    }
    dragIndex = targetIndexOf(key);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      // 必须 setData，否则部分浏览器不触发 drop。
      e.dataTransfer.setData('text/plain', String(dragIndex));
    }
  }
  function onRowDragOver(e: DragEvent, key: TransferKey) {
    if (dragIndex === null) return;
    e.preventDefault(); // dragover 必须 preventDefault 才能触发 drop。
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dropIndex = targetIndexOf(key);
    dropSide = computeInsertSide(e.clientY - rect.top, rect.height);
  }
  function onRowDragLeave(e: DragEvent, key: TransferKey) {
    const related = e.relatedTarget as Node | null;
    const cur = e.currentTarget as HTMLElement;
    if (related && cur.contains(related)) return;
    if (dropIndex === targetIndexOf(key)) {
      dropIndex = null;
      dropSide = null;
    }
  }
  function onRowDrop(e: DragEvent, key: TransferKey) {
    if (dragIndex === null || dropSide === null) {
      resetDrag();
      return;
    }
    e.preventDefault();
    const next = reorder(current, dragIndex, targetIndexOf(key), dropSide);
    const changed = next.length === current.length && next.some((k, i) => k !== current[i]);
    resetDrag();
    if (changed) commit(next); // 受控仅 onChange（红线 #1）。
  }

  // --- 虚拟化（仅平铺、非分组面板生效；tree/group 回退全量渲染）--------------
  // 视口=列表容器自身滚动；scrollTop 由命令式 rAF 节流回调写本地 $state，可见区间
  // 纯 $derived render 期只读不读 DOM（红线 #2/#3）。对齐 Select 虚拟化范式。
  const VIRTUAL_OVERSCAN = 4;
  const vItemHeight = $derived(itemHeight > 0 ? itemHeight : 32);
  const leftVirtual = $derived(virtualize && !grouped && !isTree);
  const rightVirtual = $derived(virtualize && !grouped);
  let leftScrollTop = $state(0);
  let rightScrollTop = $state(0);
  let leftViewportH = $state(0);
  let rightViewportH = $state(0);

  const leftVTotal = $derived(leftVisible.length * vItemHeight);
  const rightVTotal = $derived(rightVisible.length * vItemHeight);
  const leftVRange = $derived(
    leftVirtual
      ? fixedRange(leftScrollTop, leftViewportH, vItemHeight, leftVisible.length, VIRTUAL_OVERSCAN)
      : { startIndex: 0, endIndex: leftVisible.length },
  );
  const rightVRange = $derived(
    rightVirtual
      ? fixedRange(rightScrollTop, rightViewportH, vItemHeight, rightVisible.length, VIRTUAL_OVERSCAN)
      : { startIndex: 0, endIndex: rightVisible.length },
  );
  const leftVItems = $derived(
    leftVirtual ? leftVisible.slice(leftVRange.startIndex, leftVRange.endIndex) : leftVisible,
  );
  const rightVItems = $derived(
    rightVirtual ? rightVisible.slice(rightVRange.startIndex, rightVRange.endIndex) : rightVisible,
  );

  // 滚动容器：用 attachment 绑定列表元素，命令式 rAF 节流监听 scroll，把视口高度与
  // scrollTop 写回本地 $state 驱动 vRange 派生；attachment 返回 cleanup（红线 #3）。
  function virtualScroll(
    setTop: (n: number) => void,
    setViewport: (n: number) => void,
  ): Attachment<HTMLUListElement> {
    return (el) => {
      let raf = 0;
      setViewport(el.clientHeight);
      setTop(el.scrollTop);
      function onScroll() {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          setTop(el.scrollTop);
        });
      }
      el.addEventListener('scroll', onScroll, { passive: true });
      return () => {
        el.removeEventListener('scroll', onScroll);
        if (raf) cancelAnimationFrame(raf);
      };
    };
  }
  const noopAttach: Attachment<HTMLUListElement> = () => {};
  const leftScrollAttach = $derived(
    leftVirtual
      ? virtualScroll(
          (n) => (leftScrollTop = n),
          (n) => (leftViewportH = n),
        )
      : noopAttach,
  );
  const rightScrollAttach = $derived(
    rightVirtual
      ? virtualScroll(
          (n) => (rightScrollTop = n),
          (n) => (rightViewportH = n),
        )
      : noopAttach,
  );

  const moveRightDisabled = $derived(
    disabled ||
      leftItems.filter((i) => !i.disabled && leftChecked.includes(i.key)).length === 0,
  );
  const moveLeftDisabled = $derived(
    disabled ||
      rightItems.filter((i) => !i.disabled && rightChecked.includes(i.key)).length === 0,
  );

  const cls = $derived(
    ['cd-transfer', `cd-transfer--${size}`, `cd-transfer--${status}`, disabled && 'cd-transfer--disabled']
      .filter(Boolean)
      .join(' '),
  );
</script>

{#snippet itemRow(side: 'left' | 'right', item: TransferItem, style = '')}
  {@const tIndex = side === 'right' ? targetIndexOf(item.key) : -1}
  {@const dragRow = side === 'right' && canDrag && !(item.disabled ?? false)}
  <li
    class="cd-transfer__item"
    class:cd-transfer__item--draggable={dragRow}
    class:cd-transfer__item--dragging={side === 'right' && dragIndex !== null && dragIndex === tIndex}
    class:cd-transfer__item--drop-before={side === 'right' &&
      dropIndex === tIndex &&
      dropSide === 'before'}
    class:cd-transfer__item--drop-after={side === 'right' &&
      dropIndex === tIndex &&
      dropSide === 'after'}
    {style}
    draggable={dragRow}
    ondragstart={dragRow ? (e) => onRowDragStart(e, item.key) : undefined}
    ondragover={side === 'right' && canDrag ? (e) => onRowDragOver(e, item.key) : undefined}
    ondragleave={side === 'right' && canDrag ? (e) => onRowDragLeave(e, item.key) : undefined}
    ondrop={side === 'right' && canDrag ? (e) => onRowDrop(e, item.key) : undefined}
    ondragend={side === 'right' && canDrag ? resetDrag : undefined}
  >
    {#if side === 'right' && oneWay}
      <span class="cd-transfer__item-label">{item.label}</span>
      <button
        type="button"
        class="cd-transfer__remove"
        aria-label={loc().t('Transfer.remove')}
        disabled={disabled || (item.disabled ?? false)}
        onclick={() => removeOne(item.key)}
      >
        <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false">
          <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M4 4l8 8M12 4l-8 8" />
        </svg>
      </button>
    {:else}
      <Checkbox
        {size}
        checked={(side === 'left' ? leftChecked : rightChecked).includes(item.key)}
        disabled={disabled || (item.disabled ?? false)}
        onChange={() => toggleChecked(side, item.key)}
      >
        {item.label}
      </Checkbox>
    {/if}
  </li>
{/snippet}

{#snippet treeRow(f: FlatNode)}
  {@const node = f.node}
  {@const checked = conducted.checked.has(node.key)}
  {@const half = !checked && conducted.half.has(node.key)}
  <li
    class="cd-transfer__tree-node"
    style="padding-inline-start: calc({f.level} * var(--cd-transfer-tree-indent, 18px))"
  >
    {#if f.hasChildren}
      <button
        type="button"
        class="cd-transfer__switcher"
        class:cd-transfer__switcher--open={isExpanded(node.key)}
        aria-label={isExpanded(node.key) ? loc().t('Tree.collapse') : loc().t('Tree.expand')}
        onclick={() => toggleExpand(node.key)}
      >
        <svg viewBox="0 0 16 16" width="10" height="10" aria-hidden="true" focusable="false">
          <path fill="currentColor" d="M6 4l4 4-4 4V4Z" />
        </svg>
      </button>
    {:else}
      <span class="cd-transfer__switcher cd-transfer__switcher--leaf" aria-hidden="true"></span>
    {/if}
    <Checkbox
      {size}
      {checked}
      indeterminate={half}
      disabled={disabled || (node.disabled ?? false)}
      onChange={() => toggleTreeCheck(node)}
    >
      {node.label}
    </Checkbox>
  </li>
{/snippet}

{#snippet panelList(side: 'left' | 'right', visible: TransferItem[], groups: TransferRenderGroup[])}
  {@const isVirtual = side === 'left' ? leftVirtual : rightVirtual}
  {@const vItems = side === 'left' ? leftVItems : rightVItems}
  {@const vRange = side === 'left' ? leftVRange : rightVRange}
  {@const vTotal = side === 'left' ? leftVTotal : rightVTotal}
  <ul class="cd-transfer__list" {@attach side === 'left' ? leftScrollAttach : rightScrollAttach}>
    {#if loading}
      <li class="cd-transfer__loading" aria-live="polite">
        <span class="cd-transfer__spinner" aria-hidden="true"></span>
        <span>{loc().t('Transfer.loading')}</span>
      </li>
    {/if}
    {#if side === 'left' && isTree}
      {#each visibleFlat as f (f.node.key)}
        {@render treeRow(f)}
      {:else}
        {#if !loading}
          <li class="cd-transfer__empty">{loc().t('Transfer.empty')}</li>
        {/if}
      {/each}
    {:else if grouped}
      {#each groups as group (group.title)}
        {@const state = groupCheckState(side, group)}
        <li class="cd-transfer__group">
          <div class="cd-transfer__group-header">
            <Checkbox
              {size}
              checked={state.checked}
              indeterminate={state.indeterminate}
              disabled={disabled || group.items.every((i) => i.disabled)}
              onChange={() => toggleGroup(side, group)}
            >
              {group.title}
            </Checkbox>
            <span class="cd-transfer__group-count">{group.items.length}</span>
          </div>
          <ul class="cd-transfer__group-list">
            {#each group.items as item (item.key)}
              {@render itemRow(side, item)}
            {/each}
          </ul>
        </li>
      {:else}
        {#if !loading}
          <li class="cd-transfer__empty">{loc().t('Transfer.empty')}</li>
        {/if}
      {/each}
    {:else if isVirtual}
      <!-- 虚拟化：spacer 撑总高，可见项绝对定位按全局索引偏移；只渲染视口切片 -->
      <li class="cd-transfer__spacer" style={`block-size:${vTotal}px`} aria-hidden="true"></li>
      {#each vItems as item, i (item.key)}
        {@render itemRow(
          side,
          item,
          `position:absolute; inset-inline:0; transform:translateY(${(vRange.startIndex + i) * vItemHeight}px); block-size:${vItemHeight}px`,
        )}
      {/each}
      {#if visible.length === 0 && !loading}
        <li class="cd-transfer__empty">{loc().t('Transfer.empty')}</li>
      {/if}
    {:else}
      {#each visible as item (item.key)}
        {@render itemRow(side, item)}
      {:else}
        {#if !loading}
          <li class="cd-transfer__empty">{loc().t('Transfer.empty')}</li>
        {/if}
      {/each}
    {/if}
  </ul>
{/snippet}

<div class={cls} role="group" aria-disabled={disabled || undefined}>
  <div class="cd-transfer__panel">
    {#if showPanelTitle}
      <div class="cd-transfer__panel-header">
        <span class="cd-transfer__panel-title">{titles?.[0] ?? loc().t('Transfer.titleSource')}</span>
        <span class="cd-transfer__panel-count">{loc().t('Transfer.itemsUnit', { count: leftItems.length })}</span>
      </div>
    {/if}
    {#if filter}
      <div class="cd-transfer__panel-search">
        <Input
          {size}
          value={leftQuery}
          placeholder={searchPlaceholderText}
          clearable
          disabled={disabled}
          ariaLabel={searchPlaceholderText}
          onInput={(v) => onQueryInput('left', v)}
        />
      </div>
    {/if}
    {@render panelList('left', leftVisible, leftGroups)}
  </div>

  <div class="cd-transfer__ops">
    <Button
      type="primary"
      size="small"
      ariaLabel={loc().t('Transfer.moveToRight')}
      disabled={moveRightDisabled}
      onclick={moveToRight}
    >
      &gt;
    </Button>
    {#if !oneWay}
      <Button
        type="primary"
        size="small"
        ariaLabel={loc().t('Transfer.moveToLeft')}
        disabled={moveLeftDisabled}
        onclick={moveToLeft}
      >
        &lt;
      </Button>
    {/if}
  </div>

  <div class="cd-transfer__panel">
    {#if showPanelTitle}
      <div class="cd-transfer__panel-header">
        <span class="cd-transfer__panel-title">{titles?.[1] ?? loc().t('Transfer.titleTarget')}</span>
        <span class="cd-transfer__panel-count">{loc().t('Transfer.itemsUnit', { count: rightItems.length })}</span>
      </div>
    {/if}
    {#if filter}
      <div class="cd-transfer__panel-search">
        <Input
          {size}
          value={rightQuery}
          placeholder={searchPlaceholderText}
          clearable
          disabled={disabled}
          ariaLabel={searchPlaceholderText}
          onInput={(v) => onQueryInput('right', v)}
        />
      </div>
    {/if}
    {@render panelList('right', rightVisible, rightGroups)}
  </div>
</div>

<style>
  .cd-transfer {
    display: inline-flex;
    align-items: stretch;
    gap: var(--cd-transfer-gap);
    color: var(--cd-color-text-0);
  }
  .cd-transfer--disabled {
    opacity: 0.6;
  }
  .cd-transfer__panel {
    display: flex;
    flex-direction: column;
    inline-size: var(--cd-transfer-panel-width);
    block-size: var(--cd-transfer-panel-height);
    border: 1px solid var(--cd-transfer-panel-border);
    border-radius: var(--cd-transfer-panel-radius);
    overflow: hidden;
  }
  .cd-transfer__panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-block: var(--cd-spacing-2);
    padding-inline: var(--cd-spacing-3);
    background: var(--cd-transfer-panel-header-bg);
    border-block-end: 1px solid var(--cd-transfer-panel-border);
    font-weight: var(--cd-font-weight-medium);
  }
  .cd-transfer__panel-count {
    color: var(--cd-color-text-2);
    font-size: var(--cd-font-size-1);
    font-weight: var(--cd-font-weight-regular);
  }
  .cd-transfer__panel-search {
    padding: var(--cd-spacing-2);
    border-block-end: 1px solid var(--cd-transfer-panel-border);
  }
  .cd-transfer__list {
    position: relative;
    flex: 1 1 auto;
    margin: 0;
    padding: 0;
    list-style: none;
    overflow-y: auto;
  }
  /* 虚拟化占位：撑出总高度，可见项绝对定位浮于其上。 */
  .cd-transfer__spacer {
    pointer-events: none;
  }
  .cd-transfer__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--cd-spacing-2);
    min-block-size: var(--cd-transfer-item-height);
    padding-inline: var(--cd-spacing-3);
  }
  .cd-transfer__item:hover {
    background: var(--cd-transfer-item-bg-hover);
  }
  .cd-transfer__item--draggable {
    cursor: grab;
  }
  .cd-transfer__item--dragging {
    opacity: 0.5;
  }
  /* 拖拽插入指示线：目标项上/下边缘 2px 主色线。 */
  .cd-transfer__item--drop-before {
    box-shadow: inset 0 2px 0 0 var(--cd-color-primary);
  }
  .cd-transfer__item--drop-after {
    box-shadow: inset 0 -2px 0 0 var(--cd-color-primary);
  }
  .cd-transfer__loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--cd-spacing-2);
    padding-block: var(--cd-spacing-3);
    color: var(--cd-color-text-3);
    font-size: var(--cd-font-size-1);
  }
  .cd-transfer__spinner {
    inline-size: 1em;
    block-size: 1em;
    border: 2px solid var(--cd-color-border);
    border-block-start-color: var(--cd-color-primary);
    border-radius: var(--cd-radius-full);
    animation: cd-transfer-spin 0.7s linear infinite;
  }
  @keyframes cd-transfer-spin {
    to {
      transform: rotate(360deg);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-transfer__spinner {
      animation: none;
    }
  }
  .cd-transfer__item-label {
    flex: 1 1 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .cd-transfer__remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    inline-size: 18px;
    block-size: 18px;
    padding: 0;
    border: none;
    border-radius: var(--cd-radius-1, 4px);
    background: transparent;
    color: var(--cd-color-text-2);
    cursor: pointer;
  }
  .cd-transfer__remove:hover:not(:disabled) {
    background: var(--cd-transfer-item-bg-hover);
    color: var(--cd-color-text-0);
  }
  .cd-transfer__remove:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  .cd-transfer__remove:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-transfer__tree-node {
    display: flex;
    align-items: center;
    min-block-size: var(--cd-transfer-item-height);
    padding-inline-end: var(--cd-spacing-3);
  }
  .cd-transfer__tree-node:hover {
    background: var(--cd-transfer-item-bg-hover);
  }
  .cd-transfer__switcher {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    inline-size: 18px;
    block-size: 18px;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--cd-color-text-2);
    cursor: pointer;
    transition: transform 0.15s ease;
  }
  .cd-transfer__switcher--open {
    transform: rotate(90deg);
  }
  .cd-transfer__switcher--leaf {
    cursor: default;
  }
  .cd-transfer__switcher:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-transfer__group {
    display: block;
  }
  .cd-transfer__group-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-block-size: var(--cd-transfer-item-height);
    padding-inline: var(--cd-spacing-3);
    background: var(--cd-transfer-panel-header-bg);
    font-weight: var(--cd-font-weight-medium);
  }
  .cd-transfer__group-count {
    color: var(--cd-color-text-2);
    font-size: var(--cd-font-size-1);
    font-weight: var(--cd-font-weight-regular);
  }
  .cd-transfer__group-list {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .cd-transfer__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-block: var(--cd-spacing-4);
    color: var(--cd-color-text-3);
    font-size: var(--cd-font-size-1);
  }
  .cd-transfer__ops {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: var(--cd-spacing-2);
  }
</style>
