<!--
  Transfer 穿梭框 — 严格对齐 Semi Design（semi-ui/transfer/index.tsx，单文件结构）。
  单态模型：无中间“移动”按钮，左侧勾选=立即迁移到右侧（对齐 Semi handleSelectOrRemove，
  selectedItems 是 Map<key, item>，其迭代顺序即右侧展示顺序）。
  受控 value：父拥有 value（回传/接收的是 item.value，非 key），组件只经 onChange(values, items)
  通知，绝不回写 value（红线 #1）。
  draggable：右侧已选列可鼠标拖拽重排；新顺序仅经 onChange 通知（复用本库通用 sortable action，
  基于真实 pointer 事件 + DragOverlay，对齐 Semi @dnd-kit 的交互模型；Svelte5 事件委托会忽略
  HTML5 DnD 合成事件，故未采用原生 draggable API）。
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
  import Spin from '../spin/Spin.svelte';
  import { useLocale } from '../locale-provider/index.js';
  import { fixedRange, type TreeNodeData } from '@chenzy-design/core';
  import type { Snippet } from 'svelte';
  import type { Attachment } from 'svelte/attachments';
  import type { TransferGroup, TransferItem, TransferTreeNode } from './types.js';
  import { buildGroups, normalizeData } from './group.js';
  import { flattenLeaves } from './tree.js';
  import { sortable, arrayMove } from '../sortable/index.js';

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
    height?: number | string;
    width?: number | string;
    itemSize: number;
  }

  /** Source panel header render args（对齐 Semi SourceHeaderProps）。 */
  interface SourceHeaderProps {
    num: number;
    showButton: boolean;
    allChecked: boolean;
    onAllClick: () => void;
    leafOnlyNum?: number | undefined;
  }

  /** Selected panel header render args（对齐 Semi SelectedHeaderProps）。 */
  interface SelectedHeaderProps {
    num: number;
    showButton: boolean;
    onClear: () => void;
  }

  /** renderSourcePanel args（对齐 Semi SourcePanelProps 全量字段）。 */
  interface SourcePanelProps {
    value: TransferKey[];
    loading: boolean;
    noMatch: boolean;
    filterData: TransferItem[];
    sourceData: TransferItem[];
    propsDataSource: TransferItem[] | TransferGroup[] | TransferTreeNode[];
    allChecked: boolean;
    showNumber: number;
    inputValue: string;
    onSearch: (v: string) => void;
    onAllClick: () => void;
    selectedItems: Map<TransferKey, TransferItem>;
    onSelectOrRemove: (item: TransferItem) => void;
    onSelect: (value: TransferKey[]) => void;
  }

  /** renderSelectedPanel args（对齐 Semi SelectedPanelProps）。 */
  interface SelectedPanelProps {
    length: number;
    selectedData: TransferItem[];
    onClear: () => void;
    onRemove: (item: TransferItem) => void;
    /** 拖拽排序结束后调用（对齐 Semi onSortEnd({oldIndex,newIndex})）。 */
    onSortEnd: (args: { oldIndex: number; newIndex: number }) => void;
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
     * 右侧已选列可鼠标拖拽重排（sortable action + DragOverlay）。新顺序仅经 onChange
     * 通知，受控 value 不回写（红线 #1）。
     */
    draggable?: boolean;
    /** 右侧已选列虚拟化 {height,width,itemSize}（对齐 Semi，仅右侧）。 */
    virtualize?: VirtualizeProps;
    /** 远程搜索：提供后切远程模式，本地不再过滤，由父更新 dataSource（对齐 Semi onSearch(input)）。 */
    onSearch?: (input: string) => void;
    /** 远程加载中：源面板显示 Spin（对齐 Semi <Spin />）。 */
    loading?: boolean;
    /** 选中变更（对齐 Semi）：回传 (values, items)，values 为 item.value 集合。 */
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
    /** 自定义右侧条目渲染（对齐 Semi renderSelectedItem，含 sortableHandle / fullPath）。
     * sortableHandle()：把返回的 attachment 挂到任意自定义节点上（`{@attach sortableHandle()}`），
     * 该节点即成为拖拽触发区域，对齐 Semi `(WrapperComponent) => WrapperComponent` 高阶包装的
     * 效果（用 Svelte attachment 而非 React 式组件包装实现同等能力）。 */
    renderSelectedItem?: Snippet<
      [
        {
          item: TransferItem;
          onRemove: () => void;
          sortableHandle: () => Attachment<HTMLElement>;
          fullPath?: TransferItem['fullPath'];
        },
      ]
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

  const isControlled = $derived(value !== undefined);

  // --- 数据形态判定（对齐 Semi _generateDataByType：完全信任 type prop 决定分支，
  // 不做自动推断——Semi 不传 type='treeList'/'groupList' 时数据永远按 list 处理）------
  const isTree = $derived(type === 'treeList');
  const treeData = $derived(isTree ? (dataSource as TransferTreeNode[]) : []);
  const treeLeaves = $derived(flattenLeaves(treeData));
  const items = $derived(
    isTree ? treeLeaves : normalizeData(dataSource as TransferItem[] | TransferGroup[]),
  );
  const grouped = $derived(!isTree && type === 'groupList');

  // key → item 映射（selectedItems 用 key 做 Map 键，对齐 Semi）。
  const itemMap = $derived(new Map<TransferKey, TransferItem>(items.map((i) => [i.key, i])));
  function itemValue(item: TransferItem): TransferKey {
    return item.value ?? item.key;
  }
  // value → key 映射（受控 value 数组存的是 item.value，对齐 Semi _generateSelectedItems）。
  const keyByValue = $derived(new Map<TransferKey, TransferKey>(items.map((i) => [itemValue(i), i.key])));

  // --- 单态选中模型：selectedItems 是 Map<key,item>，迭代顺序=右侧展示顺序 -----
  // （对齐 Semi TransferState.selectedItems；非受控时组件自己维护，受控时每次从 value 重建）。
  function buildSelectedFromValue(values: TransferKey[]): Map<TransferKey, TransferItem> {
    const map = new Map<TransferKey, TransferItem>();
    for (const v of values) {
      const key = keyByValue.get(v);
      if (key === undefined) continue;
      const item = itemMap.get(key);
      if (item) map.set(key, item);
    }
    return map;
  }
  function getInitialSelected(): Map<TransferKey, TransferItem> {
    return buildSelectedFromValue(defaultValue);
  }
  let innerSelected = $state<Map<TransferKey, TransferItem>>(getInitialSelected());
  const selectedItems = $derived(isControlled ? buildSelectedFromValue(value ?? []) : innerSelected);

  const current = $derived([...selectedItems.keys()]);
  const rightItems = $derived([...selectedItems.values()]);

  function commit(nextSelected: Map<TransferKey, TransferItem>) {
    if (!isControlled) innerSelected = nextSelected;
    const nextItems = [...nextSelected.values()];
    const nextValues = nextItems.map((i) => itemValue(i));
    onChange?.(nextValues, nextItems);
  }

  // --- 搜索（对齐 Semi handleInputChange）-------------------------------------
  const isRemote = $derived(onSearch !== undefined);
  let inputValue = $state('');

  function matchItem(item: TransferItem, q: string): boolean {
    if (typeof filter === 'function') return filter(q, item);
    return item.label.toLowerCase().includes(q.trim().toLowerCase());
  }
  const filterEnabled = $derived(filter !== false);
  const inSearchMode = $derived(inputValue.trim() !== '');
  // 源面板过滤后的可见项（remote 模式下父已更新 dataSource，本地不再过滤）。
  const filterData = $derived(
    filterEnabled && !isRemote && inSearchMode ? items.filter((i) => matchItem(i, inputValue)) : items,
  );
  const noMatch = $derived(inSearchMode && filterData.length === 0);

  // --- 全选 / 取消全选（对齐 Semi foundation.handleAll）-----------------------
  const selectableLeft = $derived(filterData.filter((i) => !i.disabled && !selectedItems.has(i.key)));
  const leftContainsNotSelected = $derived(selectableLeft.length > 0);
  const filterDataAllDisabled = $derived(filterData.filter((i) => !i.disabled).length === 0);

  function handleAll(wantAllChecked: boolean) {
    if (disabled) return;
    const next = new Map(selectedItems);
    if (wantAllChecked) {
      for (const item of filterData) {
        if (item.disabled) continue;
        next.set(item.key, item);
      }
    } else {
      for (const item of filterData) {
        if (item.disabled) continue;
        next.delete(item.key);
      }
    }
    commit(next);
  }

  // --- 单项勾选/取消（左侧 Checkbox 或右侧删除，对齐 Semi handleSelectOrRemove）
  // 唯一的迁移入口：勾选=立即加入 selectedItems，取消/删除=立即移出（无中间态）。
  function onSelectOrRemove(item: TransferItem) {
    if (disabled || item.disabled) return;
    const next = new Map(selectedItems);
    if (next.has(item.key)) {
      next.delete(item.key);
      onDeselect?.(item);
    } else {
      next.set(item.key, item);
      onSelect?.(item);
    }
    commit(next);
  }

  /** 右侧全部清空（对齐 Semi handleClear，disabled 项保留）。 */
  function handleClear() {
    if (disabled) return;
    const next = new Map(selectedItems);
    for (const item of items) {
      if (!item.disabled) next.delete(item.key);
    }
    commit(next);
  }

  // --- 树模式：内嵌复用 Tree 组件（对齐 Semi renderLeftTree：value 受控传入，
  // Tree 自行渲染勾选/高亮态；已选叶子不做 disabled 遗罩，仍可再次点击取消，
  // 与左侧 Checkbox 列表行为一致）。
  const sourceTreeData = $derived(treeData as unknown as TreeNodeData[]);
  // Tree 组件值通道对齐 Semi getValueOrKey：节点声明 value 字段时走 value，否则 fallback key
  // （见 Tree.svelte keyToOutput/entryToKey）。受控 value 传 item.value，与 onChange 回传对称。
  const treeValue = $derived(rightItems.map((i) => itemValue(i)));

  /** 对齐 Semi foundation.handleSelect 的合并语义：Tree 回传选中 value 数组（对齐 Semi
   * getValueOrKey），转回 key 后逐项与已选态 diff 合并（disabled 项若已选保留，未选不可新增）。 */
  function onTreeChange(v: unknown) {
    if (disabled) return;
    const values = (Array.isArray(v) ? v : v == null ? [] : [v]) as TransferKey[];
    const next = new Map<TransferKey, TransferItem>();
    for (const val of values) {
      const key = keyByValue.get(val) ?? val;
      const item = itemMap.get(key);
      if (!item) continue;
      if (selectedItems.has(key)) {
        next.set(key, item);
        continue;
      }
      if (item.disabled) continue;
      next.set(key, item);
    }
    commit(next);
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

  // --- 右侧拖拽重排（对齐 Semi `_sortable`/@dnd-kit：复用本库通用 sortable action，
  // 拖拽仅由手柄触发，dragOverlay:true 跟随指针，与 TagInput 同一套机制，
  // 见 packages/svelte/src/sortable/sortable.ts）--------------------------------------
  const canDrag = $derived(draggable && !disabled);
  const SORTABLE_HANDLE_ATTR = 'data-cd-transfer-sortable-handle';

  /** 对齐 Semi sortableHandle：接收任意节点，挂载后该节点即拖拽触发区域（renderSelectedItem
   * 自定义渲染场景，替代默认的 IconHandle）。用 attachment 而非 React 式高阶组件包装
   * ——Svelte 惯用法是把行为挂到用户自己的节点上，不强加一层包装容器。 */
  function sortableHandle(): Attachment<HTMLElement> {
    return (node) => {
      node.setAttribute(SORTABLE_HANDLE_ATTR, '');
      return () => node.removeAttribute(SORTABLE_HANDLE_ATTR);
    };
  }

  function resolveRightDragIndex(e: PointerEvent, container: HTMLElement): number {
    if (!canDrag) return -1;
    const target = e.target as HTMLElement | null;
    // 默认渲染：固定 IconHandle class；renderSelectedItem 自定义渲染：sortableHandle attachment 标记。
    const handle = target?.closest<HTMLElement>(
      `.cd-transfer-right-item-drag-handler, [${SORTABLE_HANDLE_ATTR}]`,
    );
    if (!handle) return -1;
    const item = handle.closest<HTMLElement>('[data-sortable-item]');
    if (!item) return -1;
    const items = [...container.querySelectorAll<HTMLElement>('[data-sortable-item]')];
    return items.indexOf(item);
  }

  /** 对齐 Semi foundation.handleSortEnd：按新顺序重建 selectedItems（Map 迭代顺序即展示顺序）。 */
  function handleReorder(from: number, to: number) {
    const nextKeys = arrayMove(current, from, to);
    const next = new Map<TransferKey, TransferItem>();
    for (const k of nextKeys) {
      const item = itemMap.get(k);
      if (item) next.set(k, item);
    }
    commit(next);
  }

  let dragIndex = $state<number | null>(null);

  // --- DragOverlay（对齐 Semi `_sortable` useDragOverlay:true 默认态）：sortable action
  // 只报告坐标，overlay 内容由本组件用真实的 rightItem snippet 再渲染一份（非 cloneNode）。
  let overlayIndex = $state<number | null>(null);
  let overlayTop = $state(0);
  let overlayLeft = $state(0);
  // 行内 .cd-transfer-item 用 width:100% 撑满面板（非 TagInput 那种 inline-flex 自适应内容），
  // DragOverlay 脱离文档流后失去容器宽度参照，须显式回填源项的真实宽度。
  let overlayWidth = $state(0);

  function handleDragOverlayStart(index: number, rect: DOMRect) {
    overlayIndex = index;
    overlayTop = rect.top;
    overlayLeft = rect.left;
    overlayWidth = rect.width;
  }
  function handleDragOverlayMove(top: number, left: number) {
    overlayTop = top;
    overlayLeft = left;
  }
  function handleDragOverlayEnd() {
    overlayIndex = null;
  }

  /** 挂载到 document.body（对齐 Popover/Tooltip/TagInput 既有 portal 模式）。 */
  function portalToBody(node: HTMLElement) {
    document.body.appendChild(node);
    return {
      destroy() {
        node.remove();
      },
    };
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

  // --- 左侧分页（list/groupList 才有；对齐 Semi handlePageChange / updateInput）--
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
  // 无 group 字段的条目落入空标题桶（不渲染分组标题行，非 Semi 契约的容错，见 buildGroups）。
  const pagedGroups = $derived(buildGroups(pagedData, ''));
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

  // --- 计数 / 头部文案（对齐 Semi renderLeft / renderRight）--------------------
  const showNumber = $derived(inSearchMode ? filterData.length : items.length);
  // treeList：叶子数（对齐 Semi leafOnlyNum）。
  const leafOnlyNum = $derived(isTree ? filterData.length : undefined);
  const leftShowButton = $derived(!isTree && !filterDataAllDisabled);
  const rightHasValid = $derived(rightItems.some((i) => !i.disabled));
  const rightShowButton = $derived(rightItems.length > 0 && rightHasValid);

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

<!-- ============ 搜索框（对齐 Semi renderFilter）============ -->
{#snippet filterBox()}
  {#if filterEnabled}
    <div role="search" aria-label="Transfer filter" class="cd-transfer-filter">
      <Input
        value={inputValue}
        placeholder={loc().t('Transfer.placeholder')}
        showClear
        {disabled}
        aria-label={loc().t('Transfer.placeholder')}
        onInput={onInputChange}
      >
        {#snippet prefix()}
          <IconSearch />
        {/snippet}
      </Input>
    </div>
  {/if}
{/snippet}

<!-- ============ 头部（total + 全选/清空按钮，对齐 Semi renderHeader）============ -->
{#snippet header(kind: 'left' | 'right')}
  {#if kind === 'left' && renderSourceHeader}
    {@render renderSourceHeader({
      num: showNumber,
      showButton: leftShowButton,
      allChecked: !leftContainsNotSelected,
      onAllClick: () => handleAll(leftContainsNotSelected),
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
          onclick={kind === 'left' ? () => handleAll(leftContainsNotSelected) : handleClear}
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

<!-- ============ 空态（对齐 Semi renderEmpty）============ -->
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

<!-- ============ 左侧单项（对齐 Semi renderLeftItem：Checkbox 即条目行，无 wrapper）============ -->
{#snippet leftItem(item: TransferItem)}
  {@const checked = selectedItems.has(item.key)}
  {#if renderSourceItem}
    {@render renderSourceItem({ item, onChange: () => onSelectOrRemove(item), checked })}
  {:else}
    <Checkbox
      class="cd-transfer-item"
      disabled={disabled || (item.disabled ?? false)}
      {checked}
      role="listitem"
      onChange={() => onSelectOrRemove(item)}
    >
      {item.label}
    </Checkbox>
  {/if}
{/snippet}

<!-- ============ 右侧单项（对齐 Semi renderRightItem：IconClose 直接承载 class/onClick）======= -->
{#snippet rightItem(item: TransferItem, index: number, vStyle = '', isOverlay = false)}
  {@const dragRow = canDrag && !(item.disabled ?? false)}
  {#if renderSelectedItem}
    <!-- 对齐 Semi _sortable SortableItem：外层定位容器始终存在（dnd-kit `ref={setNodeRef}` 的
         真实 DOM 节点，供 rect 测量/排序几何计算），renderItem({sortableHandle}) 只替换容器
         内部内容，容器本身用户无法感知/移除、非 display:contents（display:contents 元素
         getBoundingClientRect() 恒为零矩形，会让 sortable action 的 snapshotRects 测量失效）。
         data-sortable-item 标记是 sortable action getRows()/resolveIndexFromEvent 判定行边界
         的依据，缺了它自定义渲染场景下拖拽会完全找不到行。 -->
    <div
      class:cd-transfer-right-item-sortable-item-active={!isOverlay && dragIndex === index}
      style={vStyle}
      data-sortable-item={isOverlay ? undefined : true}
    >
      {@render renderSelectedItem({ item, onRemove: () => onSelectOrRemove(item), sortableHandle, fullPath: itemFullPath(item.key) })}
    </div>
  {:else}
    <div
      class="cd-transfer-item cd-transfer-right-item"
      class:cd-transfer-right-item-draggable={dragRow}
      class:cd-transfer-right-item-sortable-item-active={!isOverlay && dragIndex === index}
      role="listitem"
      style={vStyle}
      data-sortable-item={isOverlay ? undefined : true}
    >
      {#if dragRow}
        <IconHandle role="button" aria-label={loc().t('Transfer.dragSort')} class="cd-transfer-right-item-drag-handler" />
      {/if}
      <div class="cd-transfer-right-item-text">{rightLabel(item)}</div>
      <IconClose
        role="button"
        aria-label={loc().t('Transfer.remove')}
        aria-disabled={item.disabled}
        class={`cd-transfer-item-close-icon${item.disabled ? ' cd-transfer-item-close-icon-disabled' : ''}`}
        onclick={() => onSelectOrRemove(item)}
      />
    </div>
  {/if}
{/snippet}

<!-- ============ 左侧面板（对齐 Semi renderLeft）============ -->
{#snippet leftPanel()}
  {#if renderSourcePanel}
    {@render renderSourcePanel({
      value: current,
      loading,
      noMatch,
      filterData,
      sourceData: items,
      propsDataSource: dataSource,
      allChecked: !leftContainsNotSelected,
      showNumber,
      inputValue,
      selectedItems,
      onSearch: onInputChange,
      onAllClick: () => handleAll(leftContainsNotSelected),
      onSelectOrRemove,
      onSelect: onTreeChange,
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
          <Spin />
        {:else if noMatch}
          {@render emptyBox('left', true)}
        {:else if items.length === 0}
          {@render emptyBox('left', false)}
        {:else}
        {@render header('left')}
        <div class="cd-transfer-left-list" role="list" aria-label="Option list">
          {#if grouped}
            {#each pagedGroups as group (group.title)}
              {#if group.title}
                <div class="cd-transfer-group-title">{group.title}</div>
              {/if}
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
            />
          </div>
        {/if}
        {/if}
      {/if}
    </section>
  {/if}
{/snippet}

<!-- ============ 右侧面板（对齐 Semi renderRight）============ -->
{#snippet rightPanel()}
  {#if renderSelectedPanel}
    {@render renderSelectedPanel({
      length: rightItems.length,
      selectedData: rightItems,
      onClear: handleClear,
      onRemove: (item: TransferItem) => onSelectOrRemove(item),
      onSortEnd: ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
        const keys = arrayMove(current, oldIndex, newIndex);
        const next = new Map<TransferKey, TransferItem>();
        for (const k of keys) {
          const item = itemMap.get(k);
          if (item) next.set(k, item);
        }
        commit(next);
      },
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
              rightVRange.startIndex + i,
              `position:absolute; inset-inline:0; transform:translateY(${(rightVRange.startIndex + i) * vItemSize}px); block-size:${vItemSize}px`,
            )}
          {/each}
        </div>
      {:else}
        <div
          class="cd-transfer-right-list"
          role="list"
          aria-label="Selected list"
          use:sortable={{
            getItemCount: () => rightItems.length,
            resolveIndexFromEvent: resolveRightDragIndex,
            dragOverlay: true,
            onReorder: handleReorder,
            onDragStart: (i) => (dragIndex = i),
            onDragEnd: () => {
              dragIndex = null;
            },
            onDragCancel: () => {
              dragIndex = null;
            },
            onDragOverlayStart: handleDragOverlayStart,
            onDragOverlayMove: handleDragOverlayMove,
            onDragOverlayEnd: handleDragOverlayEnd,
          }}
        >
          {#each rightItems as item, i (item.key)}
            {@render rightItem(item, i)}
          {/each}
        </div>
      {/if}
    </section>
  {/if}
{/snippet}

<div class={cls} {style} role="group" aria-disabled={disabled || undefined}>
  {@render leftPanel()}
  {@render rightPanel()}
</div>

{#if overlayIndex !== null}
  <!-- DragOverlay：真实渲染 rightItem snippet（非克隆 DOM），position:fixed 挂 body，
       跟随指针（坐标来自 sortable action 的 onDragOverlayMove），对齐 Semi dnd-kit
       DragOverlay 视觉（拖拽副本完全不透明清晰，与原位置半透明项区分）。 -->
  <div
    use:portalToBody
    class="cd-transfer-right-item-drag-overlay"
    style:top="{overlayTop}px"
    style:left="{overlayLeft}px"
    style:width="{overlayWidth}px"
  >
    {@render rightItem(rightItems[overlayIndex] as TransferItem, overlayIndex, '', true)}
  </div>
{/if}

<style>
  .cd-transfer {
    display: flex;
    box-sizing: border-box;
    min-width: var(--cd-width-transfer-min-width);
    height: var(--cd-height-transfer);
    background-color: var(--cd-color-transfer-bg);
    border: var(--cd-width-transfer-border) solid var(--cd-color-transfer-border);
    border-radius: var(--cd-radius-transfer);
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
  .cd-transfer-disabled :global(.cd-transfer-item) {
    color: var(--cd-color-transfer-disabled-text);
    cursor: not-allowed;
  }
  .cd-transfer-disabled :global(.cd-transfer-item:hover) {
    background-color: inherit;
  }
  .cd-transfer-disabled :global(.cd-transfer-item:hover .cd-transfer-item-close-icon) {
    visibility: hidden;
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
  .cd-transfer-left :global(.cd-spin) {
    width: 100%;
    flex-grow: 1;
  }

  /* 头部（对齐 Semi @include font-size-small + @include ver-center：font-size/line-height/font-family 三件套） */
  .cd-transfer-header {
    display: flex;
    align-items: center;
    height: var(--cd-height-transfer-header);
    margin: var(--cd-spacing-transfer-header-margin-top) var(--cd-spacing-transfer-header-margin-right)
      var(--cd-spacing-transfer-header-margin-bottom) var(--cd-spacing-transfer-header-margin-left);
    color: var(--cd-color-transfer-header-text);
    font-size: var(--cd-font-size-small);
    line-height: var(--cd-line-height-small);
    font-family: var(--cd-font-family-regular);
    flex-shrink: 0;
  }
  .cd-transfer-right-header {
    height: var(--cd-height-transfer-right-header);
    margin-top: var(--cd-spacing-transfer-right-header-margin-top);
    margin-bottom: var(--cd-spacing-transfer-right-header-margin-bottom);
  }
  /* 对齐 Semi `.semi-transfer-header .semi-button { @include font-size-small }` */
  .cd-transfer-header :global(.cd-button) {
    font-size: var(--cd-font-size-small);
    line-height: var(--cd-line-height-small);
    font-family: var(--cd-font-family-regular);
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

  /* 条目（对齐 Semi $module-item：Checkbox 根节点直接挂 cd-transfer-item；
     @include font-size-regular + @include ver-center 三件套 + justify-content/flex-wrap） */
  :global(.cd-transfer-item) {
    min-height: var(--cd-height-transfer-item-min-height);
    padding: var(--cd-spacing-transfer-item-padding-top) var(--cd-spacing-transfer-item-padding-right)
      var(--cd-spacing-transfer-item-padding-bottom) var(--cd-spacing-transfer-item-padding-left);
    user-select: none;
    font-size: var(--cd-font-size-regular);
    line-height: var(--cd-line-height-regular);
    font-family: var(--cd-font-family-regular);
    color: var(--cd-color-transfer-item-text);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: nowrap;
    width: 100%;
    transition: background-color var(--cd-transition-duration-transfer-item-bg)
      var(--cd-transition-function-transfer-item-bg) var(--cd-transition-delay-transfer-item-bg);
  }
  :global(.cd-transfer-item:hover) {
    background-color: var(--cd-color-transfer-item-bg-hover);
  }
  :global(.cd-transfer-item:active) {
    background-color: var(--cd-color-transfer-item-bg-active);
  }
  :global(.cd-transfer-item-disabled) {
    cursor: not-allowed;
  }
  :global(.cd-transfer-item-disabled:hover) {
    background-color: inherit;
  }

  .cd-transfer-right-item {
    color: var(--cd-color-transfer-selected-item-text);
    cursor: auto;
  }
  .cd-transfer-right-item-text {
    flex: 1;
    word-break: break-all;
  }
  :global(.cd-transfer-item-close-icon) {
    flex-shrink: 0;
    font-size: var(--cd-width-transfer-item-close-icon);
    color: var(--cd-color-transfer-close-icon-icon);
    cursor: pointer;
    visibility: hidden;
  }
  .cd-transfer-right-item:hover :global(.cd-transfer-item-close-icon) {
    visibility: visible;
  }
  .cd-transfer-right-item:hover :global(.cd-transfer-item-close-icon.cd-transfer-item-close-icon-disabled) {
    visibility: hidden;
  }
  /* class 挂在跨组件的 IconHandle 上（非本文件内产生的元素），未加 :global() 时 Svelte
     scoped 属性选择器不会命中，规则整条失效——手柄退回继承父级 .cd-transfer-item 的
     cursor:pointer，而非 Semi 的 cursor:move。
     真机实测发现二次坑：全局第三方 reset 有 `button, [role="button"] { cursor: pointer }`，
     与单类选择器 `.cd-transfer-right-item-drag-handler` 特异性相等（均 0,1,0），胜负取决于
     两份样式表的加载顺序而非选择器设计——本库场景下顺序不稳定，导致 cursor 在 move/pointer
     间随机跳变。用父级限定把特异性提到 0,2,0，稳定压过该 reset 规则（不改全局 reset，
     避免波及站内其它 role=button 元素）。 */
  :global(.cd-transfer-right-item .cd-transfer-right-item-drag-handler) {
    margin-right: var(--cd-spacing-transfer-right-item-drag-handler-margin-right);
    flex-shrink: 0;
    cursor: move;
  }
  /* 对齐 Semi &-sortable-item-active：拖拽源项原位隐藏，DragOverlay 副本跟随指针显示。 */
  .cd-transfer-right-item-sortable-item-active {
    opacity: 0;
  }
  /* 对齐 Semi &-drag-item-move（dnd-kit DragOverlay 层级）。真机实测 Semi 官网
     （elementFromPoint 命中的是浮层内部 SVG，document.body 下唯一 fixed 定位元素即
     此浮层）：浮层不设 pointer-events:none，物理遮挡鼠标位置下方的原列表其他行——
     这正是"拖拽经过其他行时它们不出现 hover 高亮/删除图标"的真实机制（非样式层面
     刻意抑制 hover，而是浮层挡住了鼠标，下方行天然收不到 pointer 事件）。拖拽状态机
     的 pointermove/up 监听绑在 document 上，不受浮层遮挡影响，逻辑不受此影响。
     浮层自身背景色对齐 hover 态（$color-transfer_item-bg-hover）——因浮层现在会真实
     接收指针，天然触发 :hover，此处仍显式回填避免抖动时的巧合闪烁。 */
  .cd-transfer-right-item-drag-overlay {
    position: fixed;
    z-index: var(--cd-z-index-transfer-right-item-drag-item-move);
    margin: 0;
    box-sizing: border-box;
    background-color: var(--cd-color-transfer-item-bg-hover);
  }
  /* 浮层现在真实接收指针、鼠标压在其上会自然触发 :hover，但显式回填避免依赖巧合命中。 */
  .cd-transfer-right-item-drag-overlay :global(.cd-transfer-item-close-icon) {
    visibility: visible;
  }

  /* 分组标题（对齐 Semi @include font-size-small + @include ver-center） */
  .cd-transfer-group-title {
    display: flex;
    align-items: center;
    height: var(--cd-height-transfer-group-title);
    padding-left: var(--cd-spacing-transfer-group-title-padding-left);
    color: var(--cd-color-transfer-group-title-text);
    font-size: var(--cd-font-size-small);
    line-height: var(--cd-line-height-small);
    font-family: var(--cd-font-family-regular);
  }

  /* 空态（对齐 Semi @include all-center + @include font-size-small） */
  .cd-transfer-empty {
    width: var(--cd-width-transfer-empty);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--cd-font-size-small);
    line-height: var(--cd-line-height-small);
    font-family: var(--cd-font-family-regular);
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

  /* Tree 复用：撑满剩余高度 */
  .cd-transfer-left :global(.cd-transfer-tree) {
    flex: 1;
    overflow: auto;
    min-height: 0;
  }

  /* —— RTL（对齐 Semi transfer/rtl.scss）——
     左右两栏之间的分割边框换边、条目内边距镜像、全选文案的单侧外边距换边。 */
  :global(.cd-rtl) .cd-transfer {
    direction: rtl;
  }
  :global(.cd-rtl) .cd-transfer-left {
    border-right: 0;
    border-left: var(--cd-width-transfer-left-border) solid var(--cd-color-transfer-border);
  }
  :global(.cd-rtl .cd-transfer-item) {
    padding-left: var(--cd-spacing-transfer-item-padding-right);
    padding-right: var(--cd-spacing-transfer-item-padding-left);
  }
  :global(.cd-rtl) .cd-transfer-header :global(.cd-transfer-header-all) {
    margin-left: 0;
    margin-right: var(--cd-spacing-transfer-header-all-margin-left);
  }
  :global(.cd-rtl) .cd-transfer-group-title {
    padding-left: 0;
    padding-right: var(--cd-spacing-transfer-group-title-padding-left);
  }
</style>
