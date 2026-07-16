<!--
  Transfer 穿梭框 — 严格对齐 Semi Design（semi-ui/transfer）。
  双栏（左 source / 右 selected）间迁移条目；type='list'|'groupList'|'treeList'。
  - list/groupList：左侧 Checkbox 列表（groupList 带分组标题），右侧已选列表带删除按钮。
  - treeList：左侧内嵌复用本库 Tree 组件（multiple + leafOnly + disableStrictly），
    仅叶子迁移到平铺右侧；已选叶子在源树 disabled 置灰。showPath 时右侧显示完整路径。
  受控 value：父拥有值，组件只经 onChange(values, items) 通知，绝不回写 value（红线 #1）。
  draggable：右侧已选列可鼠标拖拽重排（HTML5 DnD），新顺序仅经 onChange 通知（reorder 纯函数）。
  virtualize={height,width,itemSize}：仅右侧已选列虚拟化（对齐 Semi，复用 core fixedRange）。
  onSearch(input)：提供后切远程模式，本地不再过滤，由父按 input 更新 dataSource，loading 显示 Spin。
-->
<script lang="ts">
  import { IconClose, IconSearch, IconHandle } from '@chenzy-design/icons';
  import Checkbox from '../checkbox/Checkbox.svelte';
  import Input from '../input/Input.svelte';
  import Button from '../button/Button.svelte';
  import Tree from '../tree/Tree.svelte';
  import Pagination from '../pagination/Pagination.svelte';
  import { useLocale } from '../locale-provider/index.js';
  import { fixedRange, useId, type TreeNodeData } from '@chenzy-design/core';
  import type { Snippet } from 'svelte';
  import type { Attachment } from 'svelte/attachments';
  import type {
    TransferGroup,
    TransferItem,
    TransferRenderGroup,
    TransferTreeNode,
  } from './types.js';
  import { buildGroups, hasGroups, normalizeData } from './group.js';
  import { isTreeData, flattenLeaves } from './tree.js';
  import { computeInsertSide, reorder, type InsertSide } from './reorder.js';

  type TransferKey = string | number;
  type TransferType = 'list' | 'groupList' | 'treeList';

  const DEFAULT_PAGE_SIZE = 10; // 对齐 Semi numbers.DEFAULT_PAGE_SIZE

  /** emptyContent: custom empty state renderers（对齐 Semi {left,right,search}）。 */
  interface EmptyContent {
    left?: Snippet | string;
    right?: Snippet | string;
    search?: Snippet | string;
  }

  /** pagination config for left panel（对齐 Semi PaginationProps）。 */
  interface PaginationConfig {
    pageSize?: number;
    currentPage?: number;
    defaultCurrentPage?: number;
    onPageChange?: (currentPage: number) => void;
  }

  /** virtualize config，仅作用于右侧已选列（对齐 Semi VirtualizeProps）。 */
  interface VirtualizeProps {
    height?: number;
    width?: number | string;
    itemSize: number;
  }

  /** Source panel header render args（对齐 Semi renderSourceHeader）。 */
  interface SourceHeaderProps {
    num: number;
    showButton: boolean;
    allChecked: boolean;
    onAllClick: () => void;
    leafOnlyNum?: number | undefined;
  }

  /** Selected panel header render args（对齐 Semi renderSelectedHeader）。 */
  interface SelectedHeaderProps {
    num: number;
    showButton: boolean;
    onClear: () => void;
  }

  /** renderSourcePanel args（对齐 Semi SourcePanelProps 常用子集）。 */
  interface SourcePanelProps {
    value: TransferKey[];
    loading: boolean;
    noMatch: boolean;
    filterData: TransferItem[];
    sourceData: TransferItem[];
    allChecked: boolean;
    showNumber: number;
    inputValue: string;
    onSearch: (v: string) => void;
    onAllClick: () => void;
    onSelectOrRemove: (item: TransferItem) => void;
  }

  /** renderSelectedPanel args（对齐 Semi SelectedPanelProps）。 */
  interface SelectedPanelProps {
    length: number;
    selectedData: TransferItem[];
    onClear: () => void;
    onRemove: (item: TransferItem) => void;
    onSortEnd: (keys: TransferKey[]) => void;
  }

  interface Props {
    style?: string;
    class?: string;
    value?: TransferKey[];
    defaultValue?: TransferKey[];
    dataSource?: TransferItem[] | TransferGroup[] | TransferTreeNode[];
    /** 'list' | 'groupList' | 'treeList'（对齐 Semi type）。 */
    type?: TransferType;
    /** 是否显示本地搜索框，或自定义匹配函数（对齐 Semi filter）。 */
    filter?: boolean | ((input: string, item: TransferItem) => boolean);
    disabled?: boolean;
    /**
     * 右侧已选列可鼠标拖拽重排（HTML5 DnD）。新顺序经 reorder 纯函数算出仅经 onChange
     * 通知，受控 value 不回写（红线 #1）。
     */
    draggable?: boolean;
    /** 右侧已选列虚拟化 {height,width,itemSize}（对齐 Semi，仅右侧）。 */
    virtualize?: VirtualizeProps;
    /** 远程搜索：提供后切远程模式，本地不再过滤，由父更新 dataSource（对齐 Semi onSearch(input)）。 */
    onSearch?: (input: string) => void;
    /** 远程加载中：源面板显示 Spin（此处为轻量 spinner 行）。 */
    loading?: boolean;
    /** 选中变更（对齐 Semi）：回传 (values, items)。 */
    onChange?: (values: TransferKey[], items: TransferItem[]) => void;
    emptyContent?: EmptyContent;
    /** 透传给搜索框 Input 的额外参数（对齐 Semi inputProps）。 */
    inputProps?: Record<string, unknown>;
    /** type='treeList' 时透传给内部 Tree 的属性（对齐 Semi Omit<TreeProps,'value'|'ref'|'onChange'>）。 */
    treeProps?: Record<string, unknown>;
    /** type='treeList' 时右侧已选项显示完整路径（对齐 Semi showPath）。 */
    showPath?: boolean;
    /** 左侧面板分页（仅 list/groupList，对齐 Semi pagination）。 */
    pagination?: PaginationConfig;
    onSelect?: (item: TransferItem) => void;
    onDeselect?: (item: TransferItem) => void;
    /** 自定义左侧条目渲染（对齐 Semi renderSourceItem）。 */
    renderSourceItem?: Snippet<[{ item: TransferItem; onChange: () => void; checked: boolean }]>;
    /** 自定义右侧条目渲染（对齐 Semi renderSelectedItem，含 sortableHandle / fullPath）。 */
    renderSelectedItem?: Snippet<
      [{ item: TransferItem; onRemove: () => void; sortableHandle?: unknown; fullPath?: TransferItem['fullPath'] }]
    >;
    /** 自定义左侧面板头部（对齐 Semi renderSourceHeader）。 */
    renderSourceHeader?: Snippet<[SourceHeaderProps]>;
    /** 自定义右侧面板头部（对齐 Semi renderSelectedHeader）。 */
    renderSelectedHeader?: Snippet<[SelectedHeaderProps]>;
    /** 完全自定义左侧面板（对齐 Semi renderSourcePanel）。 */
    renderSourcePanel?: Snippet<[SourcePanelProps]>;
    /** 完全自定义右侧面板（对齐 Semi renderSelectedPanel）。 */
    renderSelectedPanel?: Snippet<[SelectedPanelProps]>;
  }

  let {
    style,
    class: className,
    value,
    defaultValue = [],
    dataSource = [],
    type = 'list',
    filter = true,
    disabled = false,
    draggable = false,
    virtualize,
    onSearch,
    loading = false,
    onChange,
    emptyContent,
    inputProps,
    treeProps,
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
  const baseId = useId('cd-transfer');

  const isControlled = $derived(value !== undefined);
  // 用 getter 一次性取初值，避免 state_referenced_locally 反应式捕获告警。
  function getInitialValue(): TransferKey[] {
    return [...defaultValue];
  }
  let inner = $state<TransferKey[]>(getInitialValue());
  const current = $derived(isControlled ? (value ?? []) : inner);

  // --- 数据形态判定 -------------------------------------------------------
  const isTree = $derived(type === 'treeList' || isTreeData(dataSource as readonly unknown[]));
  const treeData = $derived(isTree ? (dataSource as TransferTreeNode[]) : []);
  const treeLeaves = $derived(flattenLeaves(treeData));
  const items = $derived(
    isTree ? treeLeaves : normalizeData(dataSource as TransferItem[] | TransferGroup[]),
  );
  const grouped = $derived(!isTree && (type === 'groupList' || hasGroups(items)));

  // key → item 映射（供 onChange 回传 items、右侧渲染）。
  const itemMap = $derived(new Map<TransferKey, TransferItem>(items.map((i) => [i.key, i])));

  const leftItems = $derived(items.filter((item) => !current.includes(item.key)));
  // 右侧已选保持 current（用户迁移/拖拽）的顺序。
  const rightItems = $derived(
    current.map((k) => itemMap.get(k)).filter((i): i is TransferItem => i !== undefined),
  );

  // --- 搜索 ---------------------------------------------------------------
  const isRemote = $derived(onSearch !== undefined);
  let inputValue = $state('');

  function matchItem(item: TransferItem, q: string): boolean {
    if (typeof filter === 'function') return filter(q, item);
    return item.label.toLowerCase().includes(q.trim().toLowerCase());
  }
  const filterEnabled = $derived(filter !== false);
  // 源面板过滤后的可见项（remote 模式下父已更新 dataSource，本地不再过滤）。
  const filterData = $derived(
    filterEnabled && !isRemote && inputValue.trim()
      ? leftItems.filter((i) => matchItem(i, inputValue))
      : leftItems,
  );
  const inSearchMode = $derived(inputValue.trim() !== '');
  const noMatch = $derived(inSearchMode && filterData.length === 0);

  // --- 左侧勾选态（纯本地 UI，独立于 value）-------------------------------
  let leftChecked = $state<TransferKey[]>([]);

  function commit(next: TransferKey[]) {
    if (!isControlled) inner = next;
    const nextItems = next.map((k) => itemMap.get(k)).filter((i): i is TransferItem => i !== undefined);
    onChange?.(next, nextItems);
  }

  /** 单项勾选/取消（左侧 Checkbox 或 renderSourceItem 触发）。 */
  function toggleChecked(key: TransferKey) {
    if (disabled) return;
    const item = itemMap.get(key);
    const was = leftChecked.includes(key);
    leftChecked = was ? leftChecked.filter((k) => k !== key) : [...leftChecked, key];
    if (item) {
      if (was) onDeselect?.(item);
      else onSelect?.(item);
    }
  }

  // --- 左侧全选 / 取消全选（对齐 Semi handleAll）------------------------
  // filterData 中非禁用、且不在 current（未迁移）的项。
  const selectableLeft = $derived(filterData.filter((i) => !i.disabled && !current.includes(i.key)));
  const leftContainsNotSelected = $derived(selectableLeft.length > 0);
  const filterDataAllDisabled = $derived(filterData.filter((i) => !i.disabled).length === 0);
  const allChecked = $derived(!leftContainsNotSelected && filterData.length > 0);

  function handleAll() {
    if (disabled) return;
    if (leftContainsNotSelected) {
      // 全选：把可选左项直接迁移到右侧（对齐 Semi handleAll(true)）。
      const keys = selectableLeft.map((i) => i.key);
      commit([...current, ...keys]);
      leftChecked = leftChecked.filter((k) => !keys.includes(k));
    } else {
      // 取消全选：把 filterData 中已迁移的项移回左侧。
      const remove = new Set(filterData.map((i) => i.key));
      commit(current.filter((k) => !remove.has(k)));
    }
  }

  // --- 迁移 ---------------------------------------------------------------
  function moveToRight() {
    if (disabled) return;
    const movable = leftItems
      .filter((i) => !i.disabled && leftChecked.includes(i.key))
      .map((i) => i.key);
    if (movable.length === 0) return;
    commit([...current, ...movable]);
    leftChecked = leftChecked.filter((k) => !movable.includes(k));
  }

  /** 右侧删除单项（对齐 Semi item-close-icon 的 handleSelectOrRemove）。 */
  function removeOne(key: TransferKey) {
    if (disabled) return;
    commit(current.filter((k) => k !== key));
  }

  /** 单项 select-or-remove（renderSourcePanel 消费方用；勾选后立即迁移，对齐 Semi）。 */
  function onSelectOrRemove(item: TransferItem) {
    if (disabled) return;
    if (current.includes(item.key)) removeOne(item.key);
    else commit([...current, item.key]);
  }

  /** 右侧全部清空（对齐 Semi handleClear）。 */
  function handleClear() {
    if (disabled) return;
    // 保留 disabled 已选项（对齐 Semi：仅清可清项）。
    const keep = current.filter((k) => itemMap.get(k)?.disabled);
    commit(keep);
  }

  // --- 树模式：内嵌复用 Tree 组件 ----------------------------------------
  // 已迁移叶子在源树 disabled 置灰（不可再勾）。Tree treeData 用 TreeNodeData。
  const movedSet = $derived(new Set(current));
  function maskTree(nodes: TransferTreeNode[]): TreeNodeData[] {
    return nodes.map((n) => {
      if (n.children && n.children.length > 0) {
        return { ...n, children: maskTree(n.children) } as unknown as TreeNodeData;
      }
      return { ...n, disabled: !!n.disabled || movedSet.has(n.key) } as unknown as TreeNodeData;
    });
  }
  const sourceTreeData = $derived(maskTree(treeData));
  // Tree value = 当前已选叶子 key（受控给 Tree，但 Transfer 只经 onChange 收 Tree 变更）。
  const treeValue = $derived(current.filter((k) => treeLeaves.some((l) => l.key === k)));

  function onTreeChange(v: unknown) {
    if (disabled) return;
    const keys = (Array.isArray(v) ? v : v == null ? [] : [v]) as TransferKey[];
    // Tree 只回传叶子（leafOnly）；直接作为新的 current 中的树部分。
    commit(keys);
  }

  // treeList：搜索交给内嵌 Tree 自身（filterTreeNode 开启即渲染 Tree 内置搜索框）。
  // filter=false 时不开启 Tree 搜索（对齐外层 filter 语义）。treeProps 可覆盖任意项。
  const mergedTreeProps = $derived<Record<string, unknown>>({
    filterTreeNode: filterEnabled,
    defaultExpandAll: true,
    ...(treeProps ?? {}),
  });

  // --- showPath：叶子 key → 祖先路径 -------------------------------------
  function buildPathMap(
    nodes: TransferTreeNode[],
    ancestors: { key: TransferKey; label: string }[] = [],
  ): Map<TransferKey, { key: TransferKey; label: string }[]> {
    const map = new Map<TransferKey, { key: TransferKey; label: string }[]>();
    for (const node of nodes) {
      const path = [...ancestors, { key: node.key, label: node.label }];
      if (node.children && node.children.length > 0) {
        buildPathMap(node.children, path).forEach((v, k) => map.set(k, v));
      } else {
        map.set(node.key, path);
      }
    }
    return map;
  }
  const treePathMap = $derived(
    isTree && showPath ? buildPathMap(treeData) : new Map<TransferKey, { key: TransferKey; label: string }[]>(),
  );
  function itemFullPath(key: TransferKey): TransferItem['fullPath'] {
    return isTree && showPath ? treePathMap.get(key) : undefined;
  }
  function rightLabel(item: TransferItem): string {
    if (isTree && showPath) {
      const p = treePathMap.get(item.key);
      if (p) return p.map((x) => x.label).join(' / ');
    }
    return item.label;
  }

  // --- 分组渲染 -----------------------------------------------------------
  const leftGroups = $derived(buildGroups(filterData, loc().t('Transfer.titleSource')));

  // --- 右侧拖拽重排（HTML5 DnD）------------------------------------------
  const canDrag = $derived(draggable && !disabled);
  let dragIndex = $state<number | null>(null);
  let dropIndex = $state<number | null>(null);
  let dropSide = $state<InsertSide | null>(null);

  function resetDrag() {
    dragIndex = null;
    dropIndex = null;
    dropSide = null;
  }
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
      e.dataTransfer.setData('text/plain', String(dragIndex));
    }
  }
  function onRowDragOver(e: DragEvent, key: TransferKey) {
    if (dragIndex === null) return;
    e.preventDefault();
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
    if (changed) commit(next);
  }

  // --- 右侧虚拟化（仅平铺、非拖拽；对齐 Semi）----------------------------
  const rightVirtual = $derived(!!virtualize && !draggable);
  const vItemSize = $derived(virtualize?.itemSize ?? 36);
  let rightScrollTop = $state(0);
  let rightViewportH = $state(0);
  const VIRTUAL_OVERSCAN = 4;
  const rightVTotal = $derived(rightItems.length * vItemSize);
  const rightVRange = $derived(
    rightVirtual
      ? fixedRange(rightScrollTop, rightViewportH, vItemSize, rightItems.length, VIRTUAL_OVERSCAN)
      : { startIndex: 0, endIndex: rightItems.length },
  );
  const rightVItems = $derived(
    rightVirtual ? rightItems.slice(rightVRange.startIndex, rightVRange.endIndex) : rightItems,
  );
  function virtualScroll(): Attachment<HTMLDivElement> {
    return (el) => {
      let raf = 0;
      rightViewportH = typeof virtualize?.height === 'number' ? virtualize.height : el.clientHeight;
      rightScrollTop = el.scrollTop;
      function onScroll() {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          rightScrollTop = el.scrollTop;
        });
      }
      el.addEventListener('scroll', onScroll, { passive: true });
      return () => {
        el.removeEventListener('scroll', onScroll);
        if (raf) cancelAnimationFrame(raf);
      };
    };
  }
  const noopAttach: Attachment<HTMLDivElement> = () => {};
  const rightScrollAttach = $derived(rightVirtual ? virtualScroll() : noopAttach);

  // --- 左侧分页（list/groupList 才有）-----------------------------------
  function getInitialPage(): number {
    return pagination?.defaultCurrentPage ?? pagination?.currentPage ?? 1;
  }
  let paginationPage = $state(getInitialPage());
  const isControlledPage = $derived(pagination?.currentPage !== undefined);
  const activePage = $derived(isControlledPage ? (pagination!.currentPage ?? 1) : paginationPage);
  const pageSize = $derived(pagination?.pageSize ?? DEFAULT_PAGE_SIZE);
  const hasPagination = $derived(!!pagination && !isTree);
  const totalPage = $derived(hasPagination ? Math.ceil(filterData.length / pageSize) : 1);
  const pagedData = $derived(
    hasPagination
      ? filterData.slice((activePage - 1) * pageSize, activePage * pageSize)
      : filterData,
  );
  const pagedGroups = $derived(buildGroups(pagedData, loc().t('Transfer.titleSource')));
  function onPageChange(page: number) {
    if (!isControlledPage) paginationPage = page;
    pagination?.onPageChange?.(page);
  }
  // 搜索变化重置到第 1 页（对齐 Semi updateInput）。
  function onInputChange(v: string) {
    inputValue = v;
    if (!isControlledPage) paginationPage = 1;
    if (isRemote) onSearch?.(v);
  }

  /** 命令式搜索：置值但不触发 onSearch（对齐 Semi search(value, false)）。 */
  export function search(v: string): void {
    inputValue = v;
    if (!isControlledPage) paginationPage = 1;
  }

  // --- 计数 / 头部文案 ----------------------------------------------------
  const showNumber = $derived(inSearchMode ? filterData.length : leftItems.length);
  // treeList：叶子数（对齐 Semi leafOnlyNum）。
  const leafOnlyNum = $derived(isTree ? filterData.length : undefined);
  const leftShowButton = $derived(!isTree && !filterDataAllDisabled);
  const rightHasValid = $derived(rightItems.some((i) => !i.disabled));
  const rightShowButton = $derived(rightItems.length > 0 && rightHasValid);

  const moveRightDisabled = $derived(
    disabled || leftItems.filter((i) => !i.disabled && leftChecked.includes(i.key)).length === 0,
  );

  const cls = $derived(
    [
      'cd-transfer',
      disabled && 'cd-transfer-disabled',
      renderSourcePanel && renderSelectedPanel && 'cd-transfer-custom-panel',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<!-- ============ 搜索框 ============ -->
{#snippet filterBox()}
  {#if filterEnabled}
    <div role="search" aria-label="Transfer filter" class="cd-transfer-filter">
      <Input
        value={inputValue}
        placeholder={loc().t('Transfer.searchPlaceholder')}
        showClear
        {disabled}
        ariaLabel={loc().t('Transfer.searchPlaceholder')}
        onInput={onInputChange}
      >
        {#snippet prefix()}
          <IconSearch size="small" />
        {/snippet}
      </Input>
    </div>
  {/if}
{/snippet}

<!-- ============ 头部（total + 全选/清空按钮）============ -->
{#snippet header(kind: 'left' | 'right')}
  {#if kind === 'left' && renderSourceHeader}
    {@render renderSourceHeader({
      num: showNumber,
      showButton: leftShowButton,
      allChecked,
      onAllClick: handleAll,
      leafOnlyNum,
    })}
  {:else if kind === 'right' && renderSelectedHeader}
    {@render renderSelectedHeader({
      num: rightItems.length,
      showButton: rightShowButton,
      onClear: handleClear,
    })}
  {:else}
    <div class="cd-transfer-header" class:cd-transfer-left-header={kind === 'left'} class:cd-transfer-right-header={kind === 'right'}>
      <span class="cd-transfer-header-total">
        {#if kind === 'left'}
          {loc().t('Transfer.total', { total: showNumber })}
        {:else}
          {loc().t('Transfer.selected', { total: rightItems.length })}
        {/if}
      </span>
      {#if kind === 'left' ? leftShowButton : rightShowButton}
        <Button
          theme="borderless"
          type="tertiary"
          size="small"
          class="cd-transfer-header-all"
          {disabled}
          onclick={kind === 'left' ? handleAll : handleClear}
        >
          {#if kind === 'left'}
            {leftContainsNotSelected ? loc().t('Transfer.selectAll') : loc().t('Transfer.clearSelectAll')}
          {:else}
            {loc().t('Transfer.clear')}
          {/if}
        </Button>
      {/if}
    </div>
  {/if}
{/snippet}

<!-- ============ 空态 ============ -->
{#snippet emptyBox(kind: 'left' | 'right', isSearch = false)}
  {@const custom = isSearch ? emptyContent?.search : kind === 'left' ? emptyContent?.left : emptyContent?.right}
  <div
    aria-label="empty"
    class="cd-transfer-empty"
    class:cd-transfer-left-empty={kind === 'left'}
    class:cd-transfer-right-empty={kind === 'right'}
  >
    {#if custom}
      {#if typeof custom === 'string'}{custom}{:else}{@render custom()}{/if}
    {:else if isSearch}
      {loc().t('Transfer.emptySearch')}
    {:else if kind === 'left'}
      {loc().t('Transfer.emptyLeft')}
    {:else}
      {loc().t('Transfer.emptyRight')}
    {/if}
  </div>
{/snippet}

<!-- ============ 左侧单项（Checkbox）============ -->
{#snippet leftItem(item: TransferItem)}
  {@const checked = current.includes(item.key) || leftChecked.includes(item.key)}
  {#if renderSourceItem}
    {@render renderSourceItem({ item, onChange: () => toggleChecked(item.key), checked: leftChecked.includes(item.key) })}
  {:else}
    <div class="cd-transfer-item" class:cd-transfer-item-disabled={item.disabled} role="listitem">
      <Checkbox
        checked={leftChecked.includes(item.key)}
        disabled={disabled || (item.disabled ?? false)}
        onChange={() => toggleChecked(item.key)}
      >
        {item.label}
      </Checkbox>
    </div>
  {/if}
{/snippet}

<!-- ============ 右侧单项 ============ -->
{#snippet rightItem(item: TransferItem, vStyle = '')}
  {@const tIndex = targetIndexOf(item.key)}
  {@const dragRow = canDrag && !(item.disabled ?? false)}
  {#if renderSelectedItem}
    {@render renderSelectedItem({ item, onRemove: () => removeOne(item.key), sortableHandle: undefined, fullPath: itemFullPath(item.key) })}
  {:else}
    <div
      class="cd-transfer-item cd-transfer-right-item"
      class:cd-transfer-right-item-draggable={dragRow}
      class:cd-transfer-right-item-dragging={dragIndex !== null && dragIndex === tIndex}
      class:cd-transfer-right-item-drop-before={dropIndex === tIndex && dropSide === 'before'}
      class:cd-transfer-right-item-drop-after={dropIndex === tIndex && dropSide === 'after'}
      role="listitem"
      style={vStyle}
      draggable={dragRow}
      ondragstart={dragRow ? (e) => onRowDragStart(e, item.key) : undefined}
      ondragover={canDrag ? (e) => onRowDragOver(e, item.key) : undefined}
      ondragleave={canDrag ? (e) => onRowDragLeave(e, item.key) : undefined}
      ondrop={canDrag ? (e) => onRowDrop(e, item.key) : undefined}
      ondragend={canDrag ? resetDrag : undefined}
    >
      {#if dragRow}
        <span class="cd-transfer-right-item-drag-handler" role="button" aria-label={loc().t('Transfer.dragSort')}>
          <IconHandle size="small" />
        </span>
      {/if}
      <div class="cd-transfer-item-text">{rightLabel(item)}</div>
      <button
        type="button"
        class="cd-transfer-item-close-icon"
        class:cd-transfer-item-close-icon-disabled={item.disabled}
        aria-label={loc().t('Transfer.remove')}
        disabled={disabled || (item.disabled ?? false)}
        onclick={() => removeOne(item.key)}
      >
        <IconClose size="small" />
      </button>
    </div>
  {/if}
{/snippet}

<!-- ============ 左侧面板 ============ -->
{#snippet leftPanel()}
  {#if renderSourcePanel}
    {@render renderSourcePanel({
      value: current,
      loading,
      noMatch,
      filterData,
      sourceData: leftItems,
      allChecked,
      showNumber,
      inputValue,
      onSearch: onInputChange,
      onAllClick: handleAll,
      onSelectOrRemove,
    })}
  {:else}
    <section class="cd-transfer-left">
      {#if isTree}
        <!-- 树模式：内嵌 Tree 组件自管搜索/展开/空态（不叠加外层搜索框）。 -->
        {@render header('left')}
        <Tree
          class="cd-transfer-tree"
          treeData={sourceTreeData}
          multiple
          leafOnly
          disableStrictly
          {disabled}
          value={treeValue}
          onChange={onTreeChange}
          {...mergedTreeProps}
        />
      {:else}
        {@render filterBox()}
        {#if loading}
          <div class="cd-transfer-loading" aria-live="polite">
            <span class="cd-transfer-spinner" aria-hidden="true"></span>
            <span>{loc().t('Transfer.loading')}</span>
          </div>
        {:else if noMatch}
          {@render emptyBox('left', true)}
        {:else if items.length === 0}
          {@render emptyBox('left', false)}
        {:else}
        {@render header('left')}
        <div class="cd-transfer-left-list" role="list" aria-label="Option list">
          {#if grouped}
            {#each pagedGroups as group (group.title)}
              <div class="cd-transfer-group-title">{group.title}</div>
              {#each group.items as item (item.key)}
                {@render leftItem(item)}
              {/each}
            {/each}
          {:else}
            {#each pagedData as item (item.key)}
              {@render leftItem(item)}
            {/each}
          {/if}
        </div>
        {#if hasPagination && totalPage > 1}
          <div class="cd-transfer-left-pagination">
            <Pagination
              total={filterData.length}
              currentPage={activePage}
              {pageSize}
              onPageChange={onPageChange}
              size="small"
            />
          </div>
        {/if}
        {/if}
      {/if}
    </section>
  {/if}
{/snippet}

<!-- ============ 右侧面板 ============ -->
{#snippet rightPanel()}
  {#if renderSelectedPanel}
    {@render renderSelectedPanel({
      length: rightItems.length,
      selectedData: rightItems,
      onClear: handleClear,
      onRemove: (item: TransferItem) => removeOne(item.key),
      onSortEnd: commit,
    })}
  {:else}
    <section class="cd-transfer-right">
      {@render header('right')}
      {#if rightItems.length === 0}
        {@render emptyBox('right', false)}
      {:else if rightVirtual}
        <div class="cd-transfer-right-list cd-transfer-right-virtual-list" role="list" aria-label="Selected list" {@attach rightScrollAttach}>
          <div class="cd-transfer-spacer" style={`block-size:${rightVTotal}px`} aria-hidden="true"></div>
          {#each rightVItems as item, i (item.key)}
            {@render rightItem(
              item,
              `position:absolute; inset-inline:0; transform:translateY(${(rightVRange.startIndex + i) * vItemSize}px); block-size:${vItemSize}px`,
            )}
          {/each}
        </div>
      {:else}
        <div class="cd-transfer-right-list" role="list" aria-label="Selected list">
          {#each rightItems as item (item.key)}
            {@render rightItem(item)}
          {/each}
        </div>
      {/if}
    </section>
  {/if}
{/snippet}

<div class={cls} {style} role="group" aria-disabled={disabled || undefined}>
  {@render leftPanel()}
  <div class="cd-transfer-ops">
    <Button
      theme="borderless"
      type="tertiary"
      size="small"
      ariaLabel={loc().t('Transfer.moveToRight')}
      disabled={moveRightDisabled}
      onclick={moveToRight}
    >
      &gt;
    </Button>
  </div>
  {@render rightPanel()}
</div>


<style>
  .cd-transfer {
    display: flex;
    box-sizing: border-box;
    min-width: var(--cd-width-transfer-min-width);
    height: var(--cd-height-transfer);
    background-color: var(--cd-color-transfer-bg);
    border: var(--cd-width-transfer-border) solid var(--cd-color-transfer-border);
    border-radius: var(--cd-radius-transfer);
    color: var(--cd-color-transfer-item-text);
  }
  .cd-transfer,
  .cd-transfer * {
    box-sizing: border-box;
  }
  .cd-transfer-custom-panel {
    border: none;
    min-width: inherit;
    height: inherit;
  }
  .cd-transfer-disabled .cd-transfer-header,
  .cd-transfer-disabled .cd-transfer-item {
    color: var(--cd-color-transfer-disabled-text);
    cursor: not-allowed;
  }

  .cd-transfer-left {
    width: var(--cd-width-transfer-left);
    border-right: var(--cd-width-transfer-left-border) solid var(--cd-color-transfer-border);
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .cd-transfer-right {
    width: var(--cd-width-transfer-right);
    display: flex;
    flex-direction: column;
    position: relative;
    min-width: 0;
  }

  /* 头部 */
  .cd-transfer-header {
    display: flex;
    align-items: center;
    height: var(--cd-height-transfer-header);
    margin: var(--cd-spacing-transfer-header-margin-top) var(--cd-spacing-transfer-header-margin-right)
      var(--cd-spacing-transfer-header-margin-bottom) var(--cd-spacing-transfer-header-margin-left);
    color: var(--cd-color-transfer-header-text);
    font-size: var(--cd-font-size-small);
    flex-shrink: 0;
  }
  .cd-transfer-right-header {
    height: var(--cd-height-transfer-right-header);
    margin-top: var(--cd-spacing-transfer-right-header-margin-top);
    margin-bottom: var(--cd-spacing-transfer-right-header-margin-bottom);
  }
  .cd-transfer-header-total {
    flex: 1;
  }
  .cd-transfer-header :global(.cd-transfer-header-all) {
    font-weight: var(--cd-font-transfer-header-all-font-weight);
    margin-left: var(--cd-spacing-transfer-header-all-margin-left);
  }

  /* 搜索框 */
  .cd-transfer-filter {
    margin: var(--cd-spacing-transfer-filter-margin-top) var(--cd-spacing-transfer-filter-margin-right)
      var(--cd-spacing-transfer-filter-margin-bottom) var(--cd-spacing-transfer-filter-margin-left);
    flex-shrink: 0;
  }

  /* 列表 */
  .cd-transfer-left-list,
  .cd-transfer-right-list {
    overflow: auto;
    flex-grow: 1;
  }
  .cd-transfer-right-virtual-list {
    position: relative;
  }
  .cd-transfer-spacer {
    pointer-events: none;
  }

  /* 条目 */
  .cd-transfer-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: nowrap;
    min-height: var(--cd-height-transfer-item-min-height);
    padding: var(--cd-spacing-transfer-item-padding-top) var(--cd-spacing-transfer-item-padding-right)
      var(--cd-spacing-transfer-item-padding-bottom) var(--cd-spacing-transfer-item-padding-left);
    user-select: none;
    font-size: var(--cd-font-size-regular);
    color: var(--cd-color-transfer-item-text);
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  .cd-transfer-item:hover {
    background-color: var(--cd-color-transfer-item-bg-hover);
  }
  .cd-transfer-item:active {
    background-color: var(--cd-color-transfer-item-bg-active);
  }
  .cd-transfer-item-disabled {
    cursor: not-allowed;
  }
  .cd-transfer-item-disabled:hover {
    background-color: inherit;
  }
  /* 左侧 Checkbox 整行填充 */
  .cd-transfer-left-list .cd-transfer-item :global(.cd-checkbox) {
    width: 100%;
  }

  .cd-transfer-right-item {
    color: var(--cd-color-transfer-selected-item-text);
    cursor: auto;
  }
  .cd-transfer-item-text {
    flex: 1;
    word-break: break-all;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .cd-transfer-item-close-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 0;
    border: none;
    background: transparent;
    font-size: var(--cd-width-transfer-item-close-icon);
    color: var(--cd-color-transfer-close-icon-icon);
    cursor: pointer;
    visibility: hidden;
  }
  .cd-transfer-right-item:hover .cd-transfer-item-close-icon {
    visibility: visible;
  }
  .cd-transfer-right-item:hover .cd-transfer-item-close-icon.cd-transfer-item-close-icon-disabled {
    visibility: hidden;
  }
  .cd-transfer-item-close-icon:disabled {
    cursor: not-allowed;
  }
  .cd-transfer-right-item-drag-handler {
    display: inline-flex;
    align-items: center;
    margin-right: var(--cd-spacing-transfer-right-item-drag-handler-margin-right);
    flex-shrink: 0;
    cursor: move;
    color: var(--cd-color-text-2);
  }
  .cd-transfer-right-item-draggable {
    cursor: grab;
  }
  .cd-transfer-right-item-dragging {
    opacity: 0.5;
  }
  .cd-transfer-right-item-drop-before {
    box-shadow: inset 0 2px 0 0 var(--cd-color-primary);
  }
  .cd-transfer-right-item-drop-after {
    box-shadow: inset 0 -2px 0 0 var(--cd-color-primary);
  }

  /* 分组标题 */
  .cd-transfer-group-title {
    display: flex;
    align-items: center;
    height: var(--cd-height-transfer-group-title);
    padding-left: var(--cd-spacing-transfer-group-title-padding-left);
    color: var(--cd-color-transfer-group-title-text);
    font-size: var(--cd-font-size-small);
  }

  /* 空态 */
  .cd-transfer-empty {
    width: var(--cd-width-transfer-empty);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--cd-font-size-small);
    color: var(--cd-color-transfer-empty-text);
  }
  .cd-transfer-left-empty {
    height: var(--cd-height-transfer-left-empty);
  }
  .cd-transfer-right-empty {
    position: absolute;
    height: var(--cd-height-transfer-right-empty);
  }

  /* 左侧分页 */
  .cd-transfer-left-pagination {
    display: flex;
    justify-content: center;
    padding: var(--cd-spacing-base-tight);
    flex-shrink: 0;
  }

  /* 中间操作按钮 */
  .cd-transfer-ops {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 var(--cd-spacing-tight);
  }

  /* Tree 复用：撑满剩余高度 */
  .cd-transfer-left :global(.cd-transfer-tree) {
    flex: 1;
    overflow: auto;
    min-height: 0;
  }

  /* loading */
  .cd-transfer-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--cd-spacing-tight);
    flex-grow: 1;
    padding: var(--cd-spacing-base-tight);
    color: var(--cd-color-text-3);
    font-size: var(--cd-font-size-small);
  }
  .cd-transfer-spinner {
    inline-size: 1em;
    block-size: 1em;
    border: 2px solid var(--cd-color-border);
    border-block-start-color: var(--cd-color-primary);
    border-radius: 50%;
    animation: cd-transfer-spin 0.7s linear infinite;
  }
  @keyframes cd-transfer-spin {
    to {
      transform: rotate(360deg);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-transfer-spinner {
      animation: none;
    }
  }
</style>
