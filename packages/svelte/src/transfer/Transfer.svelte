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
  import { tick } from 'svelte';
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
    useId,
    useLiveAnnouncer,
    rovingKeyFromEvent,
    nextRovingIndex,
    type TreeNodeData,
    type FlatNode,
  } from '@chenzy-design/core';
  import type { Snippet } from 'svelte';
  import Pagination from '../pagination/Pagination.svelte';
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
  type TransferType = 'list' | 'groupList' | 'treeList';

  /** emptyContent: custom empty state renderers */
  interface EmptyContent {
    left?: Snippet | string;
    right?: Snippet | string;
    search?: Snippet | string;
  }

  /** pagination config for left panel */
  interface PaginationConfig {
    pageSize?: number;
    currentPage?: number;
    defaultCurrentPage?: number;
    onPageChange?: (page: number) => void;
  }

  /** Source panel header render args */
  interface SourceHeaderProps {
    totalContent: string;
    allContent: string;
    onAllClick: () => void;
    title: string;
    allChecked: boolean;
    showButton: boolean;
    leafOnlyNum?: number | undefined;
  }

  /** Selected panel header render args */
  interface SelectedHeaderProps {
    totalContent: string;
    allContent: string;
    onAllClick: () => void;
    title: string;
  }

  /** renderSourcePanel args */
  interface SourcePanelProps {
    dataSource: TransferItem[];
    selectedItems: TransferItem[];
    onChange: (keys: TransferKey[]) => void;
    onSearch: (v: string) => void;
    inputValue: string;
    searchResult: TransferItem[];
  }

  /** renderSelectedPanel args */
  interface SelectedPanelProps {
    selectedItems: TransferItem[];
    onRemove: (key: TransferKey) => void;
    onSortEnd: (keys: TransferKey[]) => void;
  }

  interface Props {
    value?: TransferKey[];
    defaultValue?: TransferKey[];
    dataSource?: TransferItem[] | TransferGroup[] | TransferTreeNode[];
    /** 'list' | 'groupList' | 'treeList' — controls source panel render mode. */
    type?: TransferType;
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
    /** Custom empty state renderers for left/right/search empty states. */
    emptyContent?: EmptyContent;
    /** Extra props passed to the search Input component. */
    inputProps?: Record<string, unknown>;
    /** Props passed to the Tree component when type='treeList'. */
    treeProps?: Record<string, unknown>;
    /** When type='treeList', show full path in right panel selected items. */
    showPath?: boolean;
    /** Left panel pagination config (only for list/groupList). */
    pagination?: PaginationConfig;
    /** Called when a single item is checked (not bulk select). */
    onSelect?: (item: TransferItem) => void;
    /** Called when a single item is unchecked (not bulk select). */
    onDeselect?: (item: TransferItem) => void;
    /** Custom render for left panel source items. */
    renderSourceItem?: Snippet<[{ item: TransferItem; onChange: () => void; checked: boolean }]>;
    /** Custom render for right panel selected items. */
    renderSelectedItem?: Snippet<[{ item: TransferItem; onRemove: () => void; sortableHandle?: unknown }]>;
    /** Custom render for left panel header. */
    renderSourceHeader?: Snippet<[SourceHeaderProps]>;
    /** Custom render for right panel header. */
    renderSelectedHeader?: Snippet<[SelectedHeaderProps]>;
    /** Fully custom left panel renderer. */
    renderSourcePanel?: Snippet<[SourcePanelProps]>;
    /** Fully custom right panel renderer. */
    renderSelectedPanel?: Snippet<[SelectedPanelProps]>;
  }

  let {
    value,
    defaultValue = [],
    dataSource = [],
    type = 'list',
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
    emptyContent,
    inputProps,
    treeProps: _treeProps,
    showPath = false,
    pagination,
    onSelect,
    onDeselect,
    renderSourceItem,
    renderSelectedItem,
    renderSourceHeader,
    renderSelectedHeader,
    renderSourcePanel,
    renderSelectedPanel,
  }: Props = $props();

  const loc = useLocale();

  const announcer = useLiveAnnouncer();
  const baseId = useId('cd-transfer');
  const leftTitleId = `${baseId}-left-title`;
  const rightTitleId = `${baseId}-right-title`;

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

  // --- Listbox roving focus + range-select anchors (a11y §6 / Listbox APG) ---
  // Roving focus key per panel (single Tab stop each). null => first visible row
  // is the Tab stop. Owned as $state here; DOM focus() happens in event handlers.
  let leftFocusKey = $state<TransferKey | null>(null);
  let rightFocusKey = $state<TransferKey | null>(null);
  // Shift range-select anchors (plain bookkeeping, not reactive — 红线 #2).
  let leftAnchor = -1;
  let rightAnchor = -1;
  // List roots captured via {@attach} for command focus() (非 render 期读 DOM).
  let leftListEl = $state<HTMLUListElement | null>(null);
  let rightListEl = $state<HTMLUListElement | null>(null);

  // Local search queries — local UI state.
  let leftQuery = $state('');
  let rightQuery = $state('');

  // --- Tree mode detection (treeList) -------------------------------------
  // type='treeList' OR auto-detect via data shape (backward compat).
  const isTree = $derived(type === 'treeList' || isTreeData(dataSource as readonly unknown[]));
  const treeData = $derived(isTree ? (dataSource as TransferTreeNode[]) : []);

  // Tree leaves flattened to flat items (the migratable units) for the target
  // panel + label lookups. In tree mode this replaces the normalized list.
  const treeLeaves = $derived(flattenLeaves(treeData));

  // Normalize grouped `{ title, items }[]` or flat items into one flat list,
  // tagging each item with `group`. Backward compatible: flat data is untouched.
  const items = $derived(
    isTree ? treeLeaves : normalizeData(dataSource as TransferItem[] | TransferGroup[]),
  );
  // type='groupList' forces grouped render; also auto-detect via data shape.
  const grouped = $derived(!isTree && (type === 'groupList' || hasGroups(items)));

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

  // --- Listbox roving math (flat panels only; tree/group panels stay non-listbox) ---
  // Ordered visible row keys per panel — pure derivations (红线 #2: render 期只读).
  const leftRowKeys = $derived(leftVisible.map((i) => i.key));
  const rightRowKeys = $derived(rightVisible.map((i) => i.key));

  function panelItems(side: 'left' | 'right'): TransferItem[] {
    return side === 'left' ? leftVisible : rightVisible;
  }

  // 纯派生 tabindex：焦点行（或无焦点/失效时首行）为 0，其余 -1。失效焦点回退首行。
  function rowTabindex(side: 'left' | 'right', key: TransferKey): 0 | -1 {
    const focus = side === 'left' ? leftFocusKey : rightFocusKey;
    const keys = side === 'left' ? leftRowKeys : rightRowKeys;
    const active = focus != null && keys.includes(focus) ? focus : keys[0];
    return active === key ? 0 : -1;
  }

  // 命令式 focus()（事件回调内，非 render 期读 DOM）。
  function focusRow(side: 'left' | 'right', key: TransferKey): void {
    const root = side === 'left' ? leftListEl : rightListEl;
    root
      ?.querySelector<HTMLElement>(`[data-transfer-key="${CSS.escape(String(key))}"]`)
      ?.focus();
  }

  // Shift 连选：把 [from, to] 闭区间内非禁用项 toggle-on 进 checked 集合。
  function setRangeChecked(side: 'left' | 'right', from: number, to: number): void {
    const list = panelItems(side);
    const lo = Math.min(from, to);
    const hi = Math.max(from, to);
    const cur = side === 'left' ? leftChecked : rightChecked;
    const set = new Set(cur);
    for (let i = lo; i <= hi; i += 1) {
      const it = list[i];
      if (it && !it.disabled && !disabled) set.add(it.key);
    }
    if (side === 'left') leftChecked = [...set];
    else rightChecked = [...set];
  }

  // 行 keydown：↑↓/Home/End roving、Space 勾选、Enter 移动本面板已勾选、Shift+↑↓ 连选。
  // 焦点 $state 在此写、命令式 focus() 也在此（非 render 期）。
  function onRowKeydown(e: KeyboardEvent, side: 'left' | 'right', key: TransferKey): void {
    const keys = side === 'left' ? leftRowKeys : rightRowKeys;
    const list = panelItems(side);
    const cur = keys.indexOf(key);
    if (cur < 0) return;
    const item = list[cur];
    // Space：切换当前行勾选（禁用项为 no-op）。
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      if (item && !item.disabled && !disabled) {
        toggleChecked(side, key);
        if (side === 'left') leftAnchor = cur;
        else rightAnchor = cur;
      }
      return;
    }
    // Enter：把本面板已勾选项移到对侧。
    if (e.key === 'Enter') {
      e.preventDefault();
      if (side === 'left') moveToRight();
      else moveToLeft();
      return;
    }
    const intent = rovingKeyFromEvent(e.key);
    if (!intent) return;
    e.preventDefault();
    const next = nextRovingIndex(cur, keys.length, intent);
    const nextKey = keys[next];
    if (nextKey == null) return;
    if (side === 'left') leftFocusKey = nextKey;
    else rightFocusKey = nextKey;
    // Shift+方向键（仅 prev/next，不含 Home/End）：以锚点为基准范围连选。
    if (e.shiftKey && (intent === 'prev' || intent === 'next')) {
      const anchor = side === 'left' ? leftAnchor : rightAnchor;
      const base = anchor >= 0 ? anchor : cur;
      if (side === 'left') leftAnchor = base;
      else rightAnchor = base;
      setRangeChecked(side, base, next);
    } else if (!e.shiftKey) {
      if (side === 'left') leftAnchor = next;
      else rightAnchor = next;
    }
    focusRow(side, nextKey);
  }

  function onRowFocus(side: 'left' | 'right', key: TransferKey): void {
    if (side === 'left') leftFocusKey = key;
    else rightFocusKey = key;
  }

  // 选项行点击：单击 toggle，Shift+click 以锚点为基准范围连选（与键盘一致）。
  function onRowOptionClick(e: MouseEvent, side: 'left' | 'right', item: TransferItem): void {
    if (disabled || item.disabled) return;
    const keys = side === 'left' ? leftRowKeys : rightRowKeys;
    const idx = keys.indexOf(item.key);
    if (e.shiftKey) {
      const anchor = side === 'left' ? leftAnchor : rightAnchor;
      if (anchor >= 0) {
        setRangeChecked(side, anchor, idx);
      } else {
        toggleChecked(side, item.key);
        if (side === 'left') leftAnchor = idx;
        else rightAnchor = idx;
      }
    } else {
      toggleChecked(side, item.key);
      if (side === 'left') leftAnchor = idx;
      else rightAnchor = idx;
    }
    if (side === 'left') leftFocusKey = item.key;
    else rightFocusKey = item.key;
  }

  // 选项行 root 捕获（多个 {@attach} 合法；避免 bind:this 三元）。
  function captureList(side: 'left' | 'right'): Attachment<HTMLUListElement> {
    return (el) => {
      if (side === 'left') leftListEl = el;
      else rightListEl = el;
      return () => {
        if (side === 'left') leftListEl = null;
        else rightListEl = null;
      };
    };
  }

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
    const list = side === 'left' ? leftVisible : rightVisible;
    const item = list.find((i) => i.key === key);
    if (side === 'left') {
      const wasChecked = leftChecked.includes(key);
      leftChecked = wasChecked
        ? leftChecked.filter((k) => k !== key)
        : [...leftChecked, key];
      if (item) {
        if (wasChecked) onDeselect?.(item);
        else onSelect?.(item);
      }
    } else {
      const wasChecked = rightChecked.includes(key);
      rightChecked = wasChecked
        ? rightChecked.filter((k) => k !== key)
        : [...rightChecked, key];
      if (item) {
        if (wasChecked) onDeselect?.(item);
        else onSelect?.(item);
      }
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
    // Focus retention (spec §6)：移动后焦点留在 SOURCE 列相邻选项 + live 播报。
    const count = movable.length;
    const oldKeys = leftRowKeys;
    const firstMovedIdx = oldKeys.findIndex((k) => movable.includes(k));
    announcer.announce(loc().t('Transfer.movedToRight', { count }));
    void tick().then(() => {
      const keys = leftRowKeys;
      if (keys.length === 0) return;
      const idx = Math.min(Math.max(firstMovedIdx, 0), keys.length - 1);
      const k = keys[idx];
      if (k == null) return;
      leftFocusKey = k;
      leftAnchor = idx;
      focusRow('left', k);
    });
  }

  function moveToLeft() {
    if (disabled) return;
    const movable = rightItems
      .filter((i) => !i.disabled && rightChecked.includes(i.key))
      .map((i) => i.key);
    if (movable.length === 0) return;
    const remove = new Set(movable);
    const count = movable.length;
    const oldKeys = rightRowKeys;
    const firstMovedIdx = oldKeys.findIndex((k) => movable.includes(k));
    commit(current.filter((k) => !remove.has(k)));
    rightChecked = [];
    // Focus retention (spec §6)：移动后焦点留在 SOURCE（右）列相邻选项 + live 播报。
    announcer.announce(loc().t('Transfer.movedToLeft', { count }));
    void tick().then(() => {
      const keys = rightRowKeys;
      if (keys.length === 0) return;
      const idx = Math.min(Math.max(firstMovedIdx, 0), keys.length - 1);
      const k = keys[idx];
      if (k == null) return;
      rightFocusKey = k;
      rightAnchor = idx;
      focusRow('right', k);
    });
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

  // --- showPath: build label path for tree leaves in right panel ---------------
  // Map leaf key → ancestor-path label string (e.g. "Parent / Child").
  function buildPathMap(
    nodes: TransferTreeNode[],
    ancestors: string[] = [],
  ): Map<TransferKey, string> {
    const map = new Map<TransferKey, string>();
    for (const node of nodes) {
      const path = [...ancestors, node.label];
      if (node.children && node.children.length > 0) {
        const childMap = buildPathMap(node.children, path);
        childMap.forEach((v, k) => map.set(k, v));
      } else {
        map.set(node.key, path.join(' / '));
      }
    }
    return map;
  }
  const treePathMap = $derived(isTree && showPath ? buildPathMap(treeData) : new Map<TransferKey, string>());

  function itemDisplayLabel(item: TransferItem, side: 'left' | 'right'): string {
    if (side === 'right' && isTree && showPath) {
      return treePathMap.get(item.key) ?? item.label;
    }
    return item.label;
  }

  // --- Pagination (left panel, list/groupList only) -------------------------
  // Use a plain getter to extract defaultCurrentPage once at init time, avoiding
  // the "state_referenced_locally" reactive-capture warning.
  function getInitialPage(): number {
    return pagination?.defaultCurrentPage ?? 1;
  }
  let paginationPage = $state(getInitialPage());
  const isControlledPage = $derived(pagination?.currentPage !== undefined);
  const activePage = $derived(isControlledPage ? (pagination!.currentPage ?? 1) : paginationPage);
  const pageSize = $derived(pagination?.pageSize ?? 0);
  const hasPagination = $derived(!!pagination && pageSize > 0 && !isTree);

  const leftVisiblePaged = $derived(
    hasPagination
      ? leftVisible.slice((activePage - 1) * pageSize, activePage * pageSize)
      : leftVisible,
  );

  function onPageChange(page: number) {
    if (!isControlledPage) paginationPage = page;
    pagination?.onPageChange?.(page);
  }

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

{#snippet itemRow(side: 'left' | 'right', item: TransferItem, style = '', asOption = false)}
  {@const tIndex = side === 'right' ? targetIndexOf(item.key) : -1}
  {@const dragRow = side === 'right' && canDrag && !(item.disabled ?? false)}
  {@const isChecked = (side === 'left' ? leftChecked : rightChecked).includes(item.key)}
  {@const rowDisabled = disabled || (item.disabled ?? false)}
  {@const displayLabel = itemDisplayLabel(item, side)}
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
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
    role={asOption ? 'option' : undefined}
    aria-label={asOption ? displayLabel : undefined}
    aria-selected={asOption ? (side === 'right' && oneWay ? true : isChecked) : undefined}
    aria-disabled={asOption ? rowDisabled || undefined : undefined}
    data-transfer-key={asOption ? item.key : undefined}
    tabindex={asOption ? rowTabindex(side, item.key) : undefined}
    onkeydown={asOption ? (e) => onRowKeydown(e, side, item.key) : undefined}
    onfocus={asOption ? () => onRowFocus(side, item.key) : undefined}
    onclick={asOption && !(side === 'right' && oneWay)
      ? (e) => onRowOptionClick(e, side, item)
      : undefined}
    draggable={dragRow}
    ondragstart={dragRow ? (e) => onRowDragStart(e, item.key) : undefined}
    ondragover={side === 'right' && canDrag ? (e) => onRowDragOver(e, item.key) : undefined}
    ondragleave={side === 'right' && canDrag ? (e) => onRowDragLeave(e, item.key) : undefined}
    ondrop={side === 'right' && canDrag ? (e) => onRowDrop(e, item.key) : undefined}
    ondragend={side === 'right' && canDrag ? resetDrag : undefined}
  >
    {#if side === 'right' && oneWay}
      {#if renderSelectedItem}
        {@render renderSelectedItem({ item, onRemove: () => removeOne(item.key) })}
      {:else}
        <span class="cd-transfer__item-label">{displayLabel}</span>
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
      {/if}
    {:else if asOption}
      {#if side === 'right' && renderSelectedItem}
        {@render renderSelectedItem({ item, onRemove: () => removeOne(item.key) })}
      {:else if side === 'left' && renderSourceItem}
        {@render renderSourceItem({ item, onChange: () => toggleChecked(side, item.key), checked: isChecked })}
      {:else}
        <!-- 选项行：单一 Tab 停靠点（行本身可聚焦），勾选框为纯视觉，无 input/无第二停靠点。 -->
        <span class="cd-transfer__option-control" aria-hidden="true">
          <span class="cd-transfer__check" class:cd-transfer__check--on={isChecked}>
            {#if isChecked}
              <svg viewBox="0 0 16 16" width="10" height="10" focusable="false">
                <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M3.5 8.5 6.5 11.5 12.5 4.5" />
              </svg>
            {/if}
          </span>
          <span class="cd-transfer__option-label">{displayLabel}</span>
        </span>
      {/if}
    {:else}
      {#if side === 'left' && renderSourceItem}
        {@render renderSourceItem({ item, onChange: () => toggleChecked(side, item.key), checked: isChecked })}
      {:else}
        <Checkbox
          {size}
          checked={isChecked}
          disabled={disabled || (item.disabled ?? false)}
          onChange={() => toggleChecked(side, item.key)}
        >
          {displayLabel}
        </Checkbox>
      {/if}
    {/if}
  </li>
{/snippet}

{#snippet treeRow(f: FlatNode)}
  {@const node = f.node}
  {@const checked = conducted.checked.has(node.key)}
  {@const half = !checked && conducted.half.has(node.key)}
  <li
    class="cd-transfer__tree-node"
    style="padding-inline-start: calc({f.level} * var(--cd-transfer-tree-indent))"
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

{#snippet emptyNode(side: 'left' | 'right', isSearch = false)}
  {@const customEmpty = isSearch ? emptyContent?.search : (side === 'left' ? emptyContent?.left : emptyContent?.right)}
  <li class="cd-transfer__empty">
    {#if customEmpty}
      {#if typeof customEmpty === 'string'}
        {customEmpty}
      {:else}
        {@render customEmpty()}
      {/if}
    {:else}
      {isSearch ? loc().t('Transfer.searchEmpty') : loc().t('Transfer.empty')}
    {/if}
  </li>
{/snippet}

{#snippet panelList(side: 'left' | 'right', visible: TransferItem[], groups: TransferRenderGroup[])}
  {@const isVirtual = side === 'left' ? leftVirtual : rightVirtual}
  {@const vItems = side === 'left' ? leftVItems : rightVItems}
  {@const vRange = side === 'left' ? leftVRange : rightVRange}
  {@const vTotal = side === 'left' ? leftVTotal : rightVTotal}
  <!-- For left panel with pagination, use paged slice. -->
  {@const displayVisible = side === 'left' && hasPagination ? leftVisiblePaged : visible}
  <!-- empty state: search-filtered vs truly empty -->
  {@const isSearchFiltered = side === 'left' ? (leftQuery.trim() !== '') : (rightQuery.trim() !== '')}
  <!-- 空态（仅含 cd-transfer__empty 占位 li）时 listbox 无 option 子节点 → 违反
       aria-required-children；空态下退化为普通容器（无 role/listbox ARIA），按 APG
       处理空 listbox。loading 时仍非空（spinner li）但同样不是 option，故并入判定。 -->
  {@const isEmptyPanel = !loading && visible.length === 0}
  <ul
    class="cd-transfer__list"
    role={isEmptyPanel ? undefined : 'listbox'}
    aria-multiselectable={isEmptyPanel ? undefined : 'true'}
    aria-labelledby={!isEmptyPanel && showPanelTitle
      ? (side === 'left' ? leftTitleId : rightTitleId)
      : undefined}
    aria-label={!isEmptyPanel && !showPanelTitle
      ? (side === 'left' ? sourceFallback : targetFallback)
      : undefined}
    aria-disabled={disabled || undefined}
    {@attach captureList(side)}
    {@attach side === 'left' ? leftScrollAttach : rightScrollAttach}
  >
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
          {@render emptyNode(side, isSearchFiltered)}
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
          {@render emptyNode(side, isSearchFiltered)}
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
          true,
        )}
      {/each}
      {#if visible.length === 0 && !loading}
        {@render emptyNode(side, isSearchFiltered)}
      {/if}
    {:else}
      {#each displayVisible as item (item.key)}
        {@render itemRow(side, item, '', true)}
      {:else}
        {#if !loading}
          {@render emptyNode(side, isSearchFiltered)}
        {/if}
      {/each}
    {/if}
  </ul>
{/snippet}

<div class={cls} role="group" aria-disabled={disabled || undefined}>
  <div class="cd-transfer__panel">
    {#if renderSourcePanel}
      {@render renderSourcePanel({
        dataSource: leftItems,
        selectedItems: rightItems,
        onChange: commit,
        onSearch: (v) => onQueryInput('left', v),
        inputValue: leftQuery,
        searchResult: leftVisible,
      })}
    {:else}
      {#if showPanelTitle}
        <div class="cd-transfer__panel-header">
          {#if renderSourceHeader}
            {@render renderSourceHeader({
              totalContent: loc().t('Transfer.itemsUnit', { count: leftItems.length }),
              allContent: loc().t('Transfer.itemsUnit', { count: items.length }),
              onAllClick: () => {},
              title: titles?.[0] ?? loc().t('Transfer.titleSource'),
              allChecked: leftItems.length > 0 && leftItems.filter((i) => !i.disabled).every((i) => leftChecked.includes(i.key)),
              showButton: true,
              leafOnlyNum: isTree ? leftVisible.filter((i) => !current.includes(i.key)).length : undefined,
            })}
          {:else}
            <span id={leftTitleId} class="cd-transfer__panel-title">{titles?.[0] ?? loc().t('Transfer.titleSource')}</span>
            <span class="cd-transfer__panel-count">{loc().t('Transfer.itemsUnit', { count: leftItems.length })}</span>
          {/if}
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
            {...(inputProps ?? {})}
          />
        </div>
      {/if}
      {@render panelList('left', leftVisible, leftGroups)}
      {#if hasPagination}
        <div class="cd-transfer__pagination">
          <Pagination
            total={leftVisible.length}
            currentPage={activePage}
            pageSize={pageSize}
            onChange={(page) => onPageChange(page)}
            size="small"
          />
        </div>
      {/if}
    {/if}
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
    {#if renderSelectedPanel}
      {@render renderSelectedPanel({
        selectedItems: rightItems,
        onRemove: removeOne,
        onSortEnd: commit,
      })}
    {:else}
      {#if showPanelTitle}
        <div class="cd-transfer__panel-header">
          {#if renderSelectedHeader}
            {@render renderSelectedHeader({
              totalContent: loc().t('Transfer.itemsUnit', { count: rightItems.length }),
              allContent: loc().t('Transfer.itemsUnit', { count: items.length }),
              onAllClick: () => {},
              title: titles?.[1] ?? loc().t('Transfer.titleTarget'),
            })}
          {:else}
            <span id={rightTitleId} class="cd-transfer__panel-title">{titles?.[1] ?? loc().t('Transfer.titleTarget')}</span>
            <span class="cd-transfer__panel-count">{loc().t('Transfer.itemsUnit', { count: rightItems.length })}</span>
          {/if}
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
            {...(inputProps ?? {})}
          />
        </div>
      {/if}
      {@render panelList('right', rightVisible, rightGroups)}
    {/if}
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
    padding-block: var(--cd-spacing-tight);
    padding-inline: var(--cd-spacing-base-tight);
    background: var(--cd-transfer-panel-header-bg);
    border-block-end: 1px solid var(--cd-transfer-panel-border);
    font-weight: var(--cd-font-weight-medium);
  }
  .cd-transfer__panel-count {
    color: var(--cd-color-transfer-header-text);
    font-size: var(--cd-font-size-small);
    font-weight: var(--cd-font-weight-regular);
  }
  .cd-transfer__panel-search {
    padding: var(--cd-spacing-tight);
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
    gap: var(--cd-spacing-tight);
    min-block-size: var(--cd-transfer-item-height);
    padding-inline: var(--cd-spacing-base-tight);
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
  /* 选项行（listbox option）：可聚焦、选中/禁用强调、纯视觉勾选框。 */
  .cd-transfer__item[role='option'] {
    cursor: pointer;
    outline: none;
  }
  .cd-transfer__item[role='option']:focus-visible {
    box-shadow: inset 0 0 0 2px var(--cd-color-primary);
  }
  .cd-transfer__item[aria-selected='true'] {
    background: var(--cd-transfer-item-bg-checked);
  }
  .cd-transfer__item[aria-disabled='true'] {
    color: var(--cd-transfer-item-disabled-text);
    cursor: not-allowed;
  }
  .cd-transfer__option-control {
    display: inline-flex;
    align-items: center;
    gap: var(--cd-spacing-tight);
    pointer-events: none;
    min-inline-size: 0;
    flex: 1 1 auto;
  }
  .cd-transfer__check {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    inline-size: 16px;
    block-size: 16px;
    border: 1px solid var(--cd-color-border);
    border-radius: var(--cd-border-radius-small);
    color: var(--cd-color-bg-0);
    background: var(--cd-color-bg-0);
  }
  .cd-transfer__check--on {
    background: var(--cd-color-primary);
    border-color: var(--cd-color-primary);
  }
  .cd-transfer__option-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .cd-transfer__loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--cd-spacing-tight);
    padding-block: var(--cd-spacing-base-tight);
    color: var(--cd-color-text-3);
    font-size: var(--cd-font-size-small);
  }
  .cd-transfer__spinner {
    inline-size: 1em;
    block-size: 1em;
    border: 2px solid var(--cd-color-border);
    border-block-start-color: var(--cd-color-primary);
    border-radius: var(--cd-border-radius-full);
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
    border-radius: var(--cd-border-radius-small);
    background: transparent;
    color: var(--cd-color-transfer-close-icon-icon);
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
    padding-inline-end: var(--cd-spacing-base-tight);
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
    padding-inline: var(--cd-spacing-base-tight);
    background: var(--cd-transfer-panel-header-bg);
    font-weight: var(--cd-font-weight-medium);
  }
  .cd-transfer__group-count {
    color: var(--cd-color-transfer-group-title-text);
    font-size: var(--cd-font-size-small);
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
    padding-block: var(--cd-spacing-base);
    color: var(--cd-color-transfer-empty-text);
    font-size: var(--cd-font-size-small);
  }
  .cd-transfer__ops {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: var(--cd-spacing-tight);
  }
  .cd-transfer__pagination {
    display: flex;
    justify-content: center;
    padding-block: var(--cd-spacing-tight);
    border-block-start: 1px solid var(--cd-transfer-panel-border);
  }
</style>
