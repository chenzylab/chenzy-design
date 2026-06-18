<!--
  Tree — see specs/components/show/Tree.spec.md
  层级展示：展开/收起、单选/多选、可勾选父子联动(含半选 mixed)、内置搜索高亮。
  受控 value/checkedKeys/expandedKeys 不回写，仅 onChange/onCheck/onExpandedChange 通知。
  键盘遵循 WAI-ARIA APG Tree View（单一 tab stop + aria-activedescendant）。
  复用 @chenzy-design/core 的纯函数树算法，不重复实现。
  TODO(延后): draggable / virtualized / loadData / showLine / accordion / fieldNames。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    useId,
    flattenVisible,
    collectExpandable,
    conduct,
    toggleCheck,
    computeFilteredKeys,
    type TreeKey,
    type TreeNodeData,
    type FlatNode,
  } from '@chenzy-design/core';

  type Size = 'small' | 'default' | 'large';
  type Status = 'default' | 'warning' | 'error';

  type ChangeInfo = { value: TreeKey | TreeKey[]; node: TreeNodeData; selected: boolean };
  type CheckInfo = { checked: TreeKey[]; node: TreeNodeData; halfChecked: TreeKey[] };
  type ExpandInfo = { expanded: TreeKey[]; node: TreeNodeData; expand: boolean };

  interface Props {
    treeData?: TreeNodeData[];
    value?: TreeKey | TreeKey[] | null;
    defaultValue?: TreeKey | TreeKey[] | null;
    multiple?: boolean;
    checkable?: boolean;
    checkedKeys?: TreeKey[];
    defaultCheckedKeys?: TreeKey[];
    checkStrictly?: boolean;
    expandedKeys?: TreeKey[];
    defaultExpandedKeys?: TreeKey[];
    defaultExpandAll?: boolean;
    selectable?: boolean;
    showIcon?: boolean;
    filterable?: boolean;
    blockNode?: boolean;
    disabled?: boolean;
    size?: Size;
    status?: Status;
    emptyContent?: string;
    ariaLabel?: string;
    onChange?: (info: ChangeInfo) => void;
    onCheck?: (info: CheckInfo) => void;
    onExpandedChange?: (info: ExpandInfo) => void;
    label?: Snippet<
      [{ node: TreeNodeData; level: number; searchValue: string; selected: boolean; checked: boolean }]
    >;
  }

  let {
    treeData = [],
    value,
    defaultValue = null,
    multiple = false,
    checkable = false,
    checkedKeys,
    defaultCheckedKeys = [],
    checkStrictly = false,
    expandedKeys,
    defaultExpandedKeys = [],
    defaultExpandAll = false,
    selectable = true,
    showIcon = true,
    filterable = false,
    blockNode = false,
    disabled = false,
    size = 'default',
    status = 'default',
    emptyContent,
    ariaLabel,
    onChange,
    onCheck,
    onExpandedChange,
    label,
  }: Props = $props();

  const baseId = useId('cd-tree-item');

  function itemId(key: TreeKey): string {
    return `${baseId}-${String(key)}`;
  }

  // --- selection: 受控 value 不回写 (红线 #1) ---
  function initValue(): TreeKey | TreeKey[] | null {
    if (multiple) return Array.isArray(defaultValue) ? [...defaultValue] : [];
    return Array.isArray(defaultValue) ? (defaultValue[0] ?? null) : defaultValue;
  }
  const isValueControlled = $derived(value !== undefined);
  let innerValue = $state<TreeKey | TreeKey[] | null>(initValue());
  const currentValue = $derived(isValueControlled ? (value ?? null) : innerValue);
  const selectedSet = $derived.by(() => {
    const set = new Set<TreeKey>();
    if (Array.isArray(currentValue)) for (const k of currentValue) set.add(k);
    else if (currentValue !== null) set.add(currentValue);
    return set;
  });

  // --- check: 受控 checkedKeys 不回写 (红线 #1)。base 为叶子级显式勾选 ---
  function initCheckedBase(): Set<TreeKey> {
    return new Set(defaultCheckedKeys);
  }
  const isCheckControlled = $derived(checkedKeys !== undefined);
  let innerCheckedBase = $state<Set<TreeKey>>(initCheckedBase());
  const currentCheckedBase = $derived(
    isCheckControlled ? new Set(checkedKeys ?? []) : innerCheckedBase,
  );
  // checkStrictly 下直接用 base 当 checked，无半选；否则用 conduct 归一
  const checkState = $derived.by(() => {
    if (checkStrictly) {
      return { checked: new Set(currentCheckedBase), half: new Set<TreeKey>() };
    }
    return conduct(treeData, currentCheckedBase);
  });

  // --- expand: 受控 expandedKeys 不回写 (红线 #1) ---
  function initExpanded(): Set<TreeKey> {
    if (defaultExpandAll) return new Set(collectExpandable(treeData));
    return new Set(defaultExpandedKeys);
  }
  const isExpandControlled = $derived(expandedKeys !== undefined);
  let innerExpanded = $state<Set<TreeKey>>(initExpanded());
  const currentExpandedSet = $derived(
    isExpandControlled ? new Set(expandedKeys ?? []) : innerExpanded,
  );

  // --- 搜索：本地状态，派生临时叠加展开集，不回写受控 expandedKeys (红线 #1) ---
  let searchValue = $state('');
  const trimmedSearch = $derived(searchValue.trim());
  const searchActive = $derived(filterable && trimmedSearch.length > 0);
  const filterResult = $derived.by(() => {
    if (!searchActive) return { matched: new Set<TreeKey>(), expand: new Set<TreeKey>() };
    const lower = trimmedSearch.toLowerCase();
    return computeFilteredKeys(treeData, (node) => node.label.toLowerCase().includes(lower));
  });
  // 搜索激活时把过滤展开集并入可见展开集（派生，不写回）
  const effectiveExpanded = $derived.by(() => {
    if (!searchActive) return currentExpandedSet;
    const merged = new Set(currentExpandedSet);
    for (const k of filterResult.expand) merged.add(k);
    return merged;
  });

  // --- 可见扁平节点 ---
  const flat = $derived(flattenVisible(treeData, effectiveExpanded));
  // 搜索时仅保留命中或其祖先链上的节点（expand 集即祖先链 + 自身有命中后代者）
  const visibleFlat = $derived.by(() => {
    if (!searchActive) return flat;
    return flat.filter(
      (f) => filterResult.matched.has(f.node.key) || filterResult.expand.has(f.node.key),
    );
  });

  const isEmpty = $derived(visibleFlat.length === 0);
  const emptyText = $derived(emptyContent ?? '暂无数据');

  // --- roving 焦点：activeKey + 派生高亮，render 不读挂载 registry (红线 #2) ---
  let activeKey = $state<TreeKey | null>(null);
  const activeDescId = $derived.by(() => {
    if (activeKey === null) return undefined;
    const exists = visibleFlat.some((f) => f.node.key === activeKey);
    return exists ? itemId(activeKey) : undefined;
  });

  function isNodeDisabled(node: TreeNodeData): boolean {
    return disabled || !!node.disabled;
  }

  function isSelectable(node: TreeNodeData): boolean {
    return selectable && node.selectable !== false && !isNodeDisabled(node);
  }

  function isCheckableNode(node: TreeNodeData): boolean {
    return checkable && node.checkable !== false && !isNodeDisabled(node);
  }

  function isExpanded(key: TreeKey): boolean {
    return effectiveExpanded.has(key);
  }

  // --- 状态写入：仅非受控写 inner，受控只回调 (红线 #1) ---
  function emitSelect(node: TreeNodeData) {
    if (!isSelectable(node)) return;
    let next: TreeKey | TreeKey[];
    let selected: boolean;
    if (multiple) {
      const arr = Array.isArray(currentValue) ? [...currentValue] : [];
      const idx = arr.indexOf(node.key);
      if (idx >= 0) {
        arr.splice(idx, 1);
        selected = false;
      } else {
        arr.push(node.key);
        selected = true;
      }
      next = arr;
    } else {
      // 单选：点击直接选中该节点（不取消），selected 恒为 true
      next = node.key;
      selected = true;
    }
    if (!isValueControlled) innerValue = next;
    onChange?.({ value: next, node, selected });
  }

  function emitCheck(node: TreeNodeData) {
    if (!isCheckableNode(node)) return;
    let nextBase: Set<TreeKey>;
    if (checkStrictly) {
      nextBase = new Set(currentCheckedBase);
      if (nextBase.has(node.key)) nextBase.delete(node.key);
      else nextBase.add(node.key);
    } else {
      nextBase = toggleCheck(treeData, currentCheckedBase, node.key);
    }
    if (!isCheckControlled) innerCheckedBase = nextBase;
    const resolved = checkStrictly
      ? { checked: new Set(nextBase), half: new Set<TreeKey>() }
      : conduct(treeData, nextBase);
    onCheck?.({
      checked: [...resolved.checked],
      node,
      halfChecked: [...resolved.half],
    });
  }

  function emitExpand(node: TreeNodeData, expand: boolean) {
    const next = new Set(currentExpandedSet);
    if (expand) next.add(node.key);
    else next.delete(node.key);
    if (!isExpandControlled) innerExpanded = next;
    onExpandedChange?.({ expanded: [...next], node, expand });
  }

  function toggleExpand(node: TreeNodeData) {
    if (!node.children || node.children.length === 0) return;
    emitExpand(node, !isExpanded(node.key));
  }

  function onRowClick(node: TreeNodeData) {
    if (isNodeDisabled(node)) return;
    activeKey = node.key;
    if (isSelectable(node)) emitSelect(node);
    else if (node.children && node.children.length > 0) toggleExpand(node);
  }

  // --- 键盘导航 (红线 #2: 全部基于派生 visibleFlat 与 activeKey) ---
  function activeIndex(): number {
    if (activeKey === null) return -1;
    return visibleFlat.findIndex((f) => f.node.key === activeKey);
  }

  function moveNext() {
    const cur = activeIndex();
    let i = cur < 0 ? 0 : cur + 1;
    while (i < visibleFlat.length && isNodeDisabled((visibleFlat[i] as FlatNode).node)) i++;
    if (i < visibleFlat.length) activeKey = (visibleFlat[i] as FlatNode).node.key;
  }

  function movePrev() {
    const cur = activeIndex();
    let i = cur < 0 ? visibleFlat.length - 1 : cur - 1;
    while (i >= 0 && isNodeDisabled((visibleFlat[i] as FlatNode).node)) i--;
    if (i >= 0) activeKey = (visibleFlat[i] as FlatNode).node.key;
  }

  function moveFirst() {
    let i = 0;
    while (i < visibleFlat.length && isNodeDisabled((visibleFlat[i] as FlatNode).node)) i++;
    if (i < visibleFlat.length) activeKey = (visibleFlat[i] as FlatNode).node.key;
  }

  function moveLast() {
    let i = visibleFlat.length - 1;
    while (i >= 0 && isNodeDisabled((visibleFlat[i] as FlatNode).node)) i--;
    if (i >= 0) activeKey = (visibleFlat[i] as FlatNode).node.key;
  }

  function currentFlat(): FlatNode | undefined {
    const i = activeIndex();
    return i >= 0 ? visibleFlat[i] : undefined;
  }

  function moveToParent() {
    const f = currentFlat();
    if (!f || f.parentKey === null) return;
    activeKey = f.parentKey;
  }

  function onKeydown(e: KeyboardEvent) {
    if (disabled || visibleFlat.length === 0) return;
    if (activeKey === null) {
      if (
        e.key === 'ArrowDown' ||
        e.key === 'ArrowUp' ||
        e.key === 'Home' ||
        e.key === 'End'
      ) {
        e.preventDefault();
        moveFirst();
      }
      return;
    }
    const f = currentFlat();
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        moveNext();
        break;
      case 'ArrowUp':
        e.preventDefault();
        movePrev();
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (f && f.hasChildren) {
          if (!isExpanded(f.node.key)) emitExpand(f.node, true);
          else moveNext();
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (f && f.hasChildren && isExpanded(f.node.key)) emitExpand(f.node, false);
        else moveToParent();
        break;
      case 'Home':
        e.preventDefault();
        moveFirst();
        break;
      case 'End':
        e.preventDefault();
        moveLast();
        break;
      case 'Enter':
        e.preventDefault();
        if (f) emitSelect(f.node);
        break;
      case ' ':
        e.preventDefault();
        if (f) {
          if (isCheckableNode(f.node)) emitCheck(f.node);
          else emitSelect(f.node);
        }
        break;
      default:
        break;
    }
  }

  // --- 搜索高亮：把命中子串包 <mark>，返回片段数组供模板渲染 ---
  type Part = { text: string; mark: boolean };
  function highlightParts(text: string): Part[] {
    if (!searchActive) return [{ text, mark: false }];
    const lower = text.toLowerCase();
    const term = trimmedSearch.toLowerCase();
    const parts: Part[] = [];
    let from = 0;
    let idx = lower.indexOf(term, from);
    while (idx !== -1) {
      if (idx > from) parts.push({ text: text.slice(from, idx), mark: false });
      parts.push({ text: text.slice(idx, idx + term.length), mark: true });
      from = idx + term.length;
      idx = lower.indexOf(term, from);
    }
    if (from < text.length) parts.push({ text: text.slice(from), mark: false });
    return parts;
  }

  function rowChecked(node: TreeNodeData): boolean {
    return checkState.checked.has(node.key);
  }
  function rowHalf(node: TreeNodeData): boolean {
    return checkState.half.has(node.key);
  }
  function ariaCheckedValue(node: TreeNodeData): boolean | 'mixed' {
    if (rowChecked(node)) return true;
    if (rowHalf(node)) return 'mixed';
    return false;
  }

  const cls = $derived(
    [
      'cd-tree',
      `cd-tree--${size}`,
      `cd-tree--${status}`,
      disabled && 'cd-tree--disabled',
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<div class={cls}>
  {#if filterable}
    <div class="cd-tree__search">
      <input
        class="cd-tree__search-input"
        type="text"
        placeholder="搜索"
        aria-label="搜索树节点"
        bind:value={searchValue}
        {disabled}
      />
    </div>
  {/if}

  {#if isEmpty}
    <div class="cd-tree__empty">{emptyText}</div>
  {:else}
    <div
      class="cd-tree__list"
      role="tree"
      aria-label={ariaLabel}
      aria-multiselectable={multiple || checkable}
      aria-activedescendant={activeDescId}
      aria-disabled={disabled || undefined}
      tabindex={disabled ? -1 : 0}
      onkeydown={onKeydown}
    >
      {#each visibleFlat as f (f.node.key)}
        {@const node = f.node}
        {@const expandable = f.hasChildren}
        {@const expanded = expandable && isExpanded(node.key)}
        {@const nodeDisabled = isNodeDisabled(node)}
        {@const selected = selectedSet.has(node.key)}
        {@const checked = rowChecked(node)}
        {@const active = activeKey === node.key}
        <!-- treeitem 焦点经容器 aria-activedescendant 漫游管理，行本身 tabindex=-1，键盘统一在 role=tree 容器处理 -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div
          id={itemId(node.key)}
          class="cd-tree__node"
          class:cd-tree__node--selected={selected}
          class:cd-tree__node--disabled={nodeDisabled}
          class:cd-tree__node--active={active}
          class:cd-tree__node--block={blockNode}
          role="treeitem"
          tabindex={-1}
          aria-level={f.level + 1}
          aria-setsize={f.setSize}
          aria-posinset={f.posInSet}
          aria-expanded={expandable ? expanded : undefined}
          aria-selected={selectable ? selected : undefined}
          aria-checked={checkable ? ariaCheckedValue(node) : undefined}
          aria-disabled={nodeDisabled || undefined}
          style="padding-inline-start: calc({f.level} * var(--cd-tree-indent))"
          onclick={() => onRowClick(node)}
        >
          {#if expandable}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <span
              class="cd-tree__switcher"
              class:cd-tree__switcher--open={expanded}
              role="button"
              tabindex="-1"
              aria-label={expanded ? '收起' : '展开'}
              onclick={(e) => {
                e.stopPropagation();
                if (!nodeDisabled) toggleExpand(node);
              }}
            >
              <svg viewBox="0 0 16 16" width="10" height="10" aria-hidden="true" focusable="false">
                <path fill="currentColor" d="M6 4l4 4-4 4V4Z" />
              </svg>
            </span>
          {:else}
            <span class="cd-tree__switcher cd-tree__switcher--leaf" aria-hidden="true"></span>
          {/if}

          {#if checkable}
            <span
              class="cd-tree__checkbox"
              class:cd-tree__checkbox--checked={checked}
              class:cd-tree__checkbox--half={!checked && rowHalf(node)}
              class:cd-tree__checkbox--disabled={!isCheckableNode(node)}
              role="button"
              tabindex="-1"
              aria-hidden="true"
              onclick={(e) => {
                e.stopPropagation();
                emitCheck(node);
              }}
            >
              {#if checked}
                <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false">
                  <path
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3.5 8.5l3 3 6-6.5"
                  />
                </svg>
              {:else if rowHalf(node)}
                <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false">
                  <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M4 8h8" />
                </svg>
              {/if}
            </span>
          {/if}

          {#if showIcon}
            <span class="cd-tree__icon" aria-hidden="true"></span>
          {/if}

          <span class="cd-tree__label">
            {#if label}
              {@render label({ node, level: f.level, searchValue: trimmedSearch, selected, checked })}
            {:else}
              {#each highlightParts(node.label) as part, i (i)}
                {#if part.mark}
                  <mark class="cd-tree__highlight">{part.text}</mark>
                {:else}{part.text}{/if}
              {/each}
            {/if}
          </span>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .cd-tree {
    --cd-tree-row-height: var(--cd-tree-node-height);
    display: flex;
    flex-direction: column;
    gap: var(--cd-spacing-1);
    color: var(--cd-tree-node-color);
    font-size: var(--cd-font-size-body);
  }
  .cd-tree--small {
    --cd-tree-row-height: var(--cd-tree-node-height-small);
  }
  .cd-tree--large {
    --cd-tree-row-height: var(--cd-tree-node-height-large);
  }
  .cd-tree--disabled {
    color: var(--cd-tree-node-color-disabled);
  }

  .cd-tree__search-input {
    inline-size: 100%;
    block-size: var(--cd-tree-row-height);
    padding-inline: var(--cd-spacing-2);
    color: inherit;
    background: var(--cd-color-bg-1, transparent);
    border: 1px solid var(--cd-tree-border-color);
    border-radius: var(--cd-radius-small, 4px);
    font: inherit;
  }
  .cd-tree--warning .cd-tree__search-input {
    border-color: var(--cd-tree-border-color-warning);
  }
  .cd-tree--error .cd-tree__search-input {
    border-color: var(--cd-tree-border-color-error);
  }
  .cd-tree__search-input:focus-visible {
    outline: none;
    border-color: var(--cd-tree-focus-ring);
    box-shadow: 0 0 0 2px var(--cd-tree-focus-ring);
  }

  .cd-tree__list {
    display: flex;
    flex-direction: column;
    outline: none;
  }
  .cd-tree__list:focus-visible {
    box-shadow: 0 0 0 2px var(--cd-tree-focus-ring);
    border-radius: var(--cd-radius-small, 4px);
  }

  .cd-tree__node {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-1);
    block-size: var(--cd-tree-row-height);
    padding-inline-end: var(--cd-spacing-2);
    border-radius: var(--cd-radius-small, 4px);
    cursor: pointer;
    transition: background-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-tree__node:hover {
    background: var(--cd-tree-node-bg-hover);
  }
  .cd-tree__node--selected {
    color: var(--cd-tree-node-color-selected);
    background: var(--cd-tree-node-bg-selected);
  }
  .cd-tree__node--active {
    box-shadow: inset 0 0 0 1px var(--cd-tree-focus-ring);
  }
  .cd-tree__node--disabled {
    color: var(--cd-tree-node-color-disabled);
    cursor: not-allowed;
  }
  .cd-tree__node--disabled:hover {
    background: transparent;
  }

  .cd-tree__switcher {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    inline-size: 1rem;
    block-size: 1rem;
    color: var(--cd-tree-expand-icon-color);
    cursor: pointer;
    transition: transform var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-tree__switcher--open {
    transform: rotate(90deg);
  }
  .cd-tree__switcher--leaf {
    cursor: default;
  }

  .cd-tree__checkbox {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    inline-size: 1rem;
    block-size: 1rem;
    color: #fff;
    background: var(--cd-color-bg-1, #fff);
    border: 1px solid var(--cd-color-border);
    border-radius: var(--cd-radius-small, 3px);
    cursor: pointer;
  }
  .cd-tree__checkbox--checked,
  .cd-tree__checkbox--half {
    background: var(--cd-color-primary);
    border-color: var(--cd-color-primary);
  }
  .cd-tree__checkbox--disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .cd-tree__icon {
    display: inline-flex;
    flex: 0 0 auto;
    inline-size: 0;
    block-size: 1rem;
  }

  .cd-tree__label {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .cd-tree__highlight {
    padding: 0;
    color: var(--cd-tree-search-highlight-color);
    background: var(--cd-tree-search-highlight-bg);
  }

  .cd-tree__empty {
    padding: var(--cd-spacing-3);
    color: var(--cd-tree-node-color-disabled);
    text-align: center;
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-tree__node,
    .cd-tree__switcher {
      transition: none;
    }
  }
</style>
