<!--
  TreeSelect — see specs/components/input/TreeSelect.spec.md
  基础子集: 单选、可展开/收起的单面板树、叶子或任意节点选中 (leafOnly 控制)。
  multiple: checkbox 多选 + 父子联动 (复用 core conduct/toggleCheck)，trigger 多 tag 回显可单独移除。
  Token-driven, a11y-correct, 受控/非受控。
  TODO(延后): filterable 搜索、remote 异步加载、虚拟化、节点 icon。
-->
<script lang="ts">
  import { useId, useDismiss, conduct, toggleCheck, type TreeNodeData } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import Tag from '../tag/Tag.svelte';
  import type { TreeNode, TreeKey } from './types.js';

  type Size = 'small' | 'default' | 'large';
  type Status = 'default' | 'warning' | 'error';

  interface Props {
    value?: TreeKey | TreeKey[] | null;
    defaultValue?: TreeKey | TreeKey[] | null;
    treeData?: TreeNode[];
    open?: boolean;
    defaultOpen?: boolean;
    /** 多选：面板节点显示 checkbox + 父子联动，trigger 多 tag 回显 */
    multiple?: boolean;
    /** 多选时父子勾选互不影响（无半选） */
    checkStrictly?: boolean;
    placeholder?: string;
    size?: Size;
    status?: Status;
    disabled?: boolean;
    clearable?: boolean;
    leafOnly?: boolean;
    defaultExpandAll?: boolean;
    onChange?: (value: TreeKey | TreeKey[] | null) => void;
    onOpenChange?: (open: boolean) => void;
    ariaLabel?: string;
  }

  let {
    value,
    defaultValue = null,
    treeData = [],
    open,
    defaultOpen = false,
    multiple = false,
    checkStrictly = false,
    placeholder = '请选择',
    size = 'default',
    status = 'default',
    disabled = false,
    clearable = false,
    leafOnly = false,
    defaultExpandAll = false,
    onChange,
    onOpenChange,
    ariaLabel,
  }: Props = $props();

  const loc = useLocale();

  const treeId = useId('cd-tree-select-panel');

  // --- 纯函数: 递归查找节点 (用于回显 label) ---
  function findNode(data: TreeNode[], key: TreeKey): TreeNode | undefined {
    for (const node of data) {
      if (node.key === key) return node;
      if (node.children) {
        const found = findNode(node.children, key);
        if (found) return found;
      }
    }
    return undefined;
  }

  // --- 纯函数: 收集全部有 children 的节点 key (defaultExpandAll 用) ---
  function collectExpandable(data: TreeNode[], acc: TreeKey[]): TreeKey[] {
    for (const node of data) {
      if (node.children && node.children.length > 0) {
        acc.push(node.key);
        collectExpandable(node.children, acc);
      }
    }
    return acc;
  }

  function asKeyArray(v: TreeKey | TreeKey[] | null | undefined): TreeKey[] {
    if (v === null || v === undefined) return [];
    return Array.isArray(v) ? [...v] : [v];
  }

  function getInitialSingle(): TreeKey | null {
    if (Array.isArray(defaultValue)) return defaultValue[0] ?? null;
    return defaultValue ?? null;
  }
  function getInitialChecked(): Set<TreeKey> {
    return new Set(asKeyArray(defaultValue));
  }
  function getInitialOpen(): boolean {
    return defaultOpen;
  }
  function getInitialExpanded(): Set<TreeKey> {
    return defaultExpandAll
      ? new Set(collectExpandable(treeData, []))
      : new Set<TreeKey>();
  }

  // --- 受控 value (红线 #1): 不无条件回写 value，仅 onChange ---
  const isValueControlled = $derived(value !== undefined);

  // 单选：当前选中 key
  let innerValue = $state<TreeKey | null>(getInitialSingle());
  const currentValue = $derived<TreeKey | null>(
    isValueControlled
      ? (Array.isArray(value) ? (value[0] ?? null) : (value ?? null))
      : innerValue,
  );

  // 多选：叶子级显式勾选 base + conduct 归一（含半选）
  let innerChecked = $state<Set<TreeKey>>(getInitialChecked());
  const currentCheckedBase = $derived<Set<TreeKey>>(
    isValueControlled ? new Set(asKeyArray(value)) : innerChecked,
  );
  const checkState = $derived.by(() => {
    if (!multiple) return { checked: new Set<TreeKey>(), half: new Set<TreeKey>() };
    if (checkStrictly) return { checked: new Set(currentCheckedBase), half: new Set<TreeKey>() };
    return conduct(treeData as unknown as TreeNodeData[], currentCheckedBase);
  });
  // trigger 回显的已选节点（多选取 checked 全集，按树序）
  const checkedNodes = $derived.by<TreeNode[]>(() => {
    if (!multiple) return [];
    const out: TreeNode[] = [];
    const walk = (nodes: TreeNode[]) => {
      for (const n of nodes) {
        if (checkState.checked.has(n.key)) out.push(n);
        if (n.children) walk(n.children);
      }
    };
    walk(treeData);
    return out;
  });

  // --- 受控 open (红线 #1): 不无条件回写 open，仅 onOpenChange ---
  const isOpenControlled = $derived(open !== undefined);
  let innerOpen = $state(getInitialOpen());
  const isOpen = $derived(isOpenControlled ? !!open : innerOpen);

  // --- 本地展开状态 (红线 #2): expandedKeys 本地 $state Set，不依赖挂载 registry ---
  let expandedKeys = $state<Set<TreeKey>>(getInitialExpanded());

  const selectedNode = $derived(
    currentValue === null ? undefined : findNode(treeData, currentValue),
  );
  const displayLabel = $derived(selectedNode?.label ?? '');
  const hasSelection = $derived(
    multiple ? checkedNodes.length > 0 : selectedNode !== undefined,
  );
  const showClear = $derived(clearable && !disabled && hasSelection);

  function setValue(next: TreeKey | null) {
    if (!isValueControlled) innerValue = next;
    onChange?.(next);
  }

  // 多选：勾选 base 变更 → conduct 归一为 checked 全集回调
  function setChecked(nextBase: Set<TreeKey>) {
    if (!isValueControlled) innerChecked = nextBase;
    const resolved = checkStrictly
      ? new Set(nextBase)
      : conduct(treeData as unknown as TreeNodeData[], nextBase).checked;
    onChange?.([...resolved]);
  }

  function toggleCheckNode(node: TreeNode) {
    if (node.disabled || disabled) return;
    let nextBase: Set<TreeKey>;
    if (checkStrictly) {
      nextBase = new Set(currentCheckedBase);
      if (nextBase.has(node.key)) nextBase.delete(node.key);
      else nextBase.add(node.key);
    } else {
      nextBase = toggleCheck(treeData as unknown as TreeNodeData[], currentCheckedBase, node.key);
    }
    setChecked(nextBase);
  }

  // 移除某 tag：把该节点（及其子树，非 strictly）从勾选中去掉
  function removeChecked(node: TreeNode) {
    if (disabled) return;
    const isChecked = checkState.checked.has(node.key);
    if (checkStrictly) {
      const next = new Set(currentCheckedBase);
      next.delete(node.key);
      setChecked(next);
    } else if (isChecked) {
      // 复用 toggleCheck：已选 → 取消（含子树联动）
      setChecked(toggleCheck(treeData as unknown as TreeNodeData[], currentCheckedBase, node.key));
    }
  }

  function nodeCheckState(node: TreeNode): { checked: boolean; half: boolean } {
    return {
      checked: checkState.checked.has(node.key),
      half: !checkState.checked.has(node.key) && checkState.half.has(node.key),
    };
  }

  function setOpen(next: boolean) {
    if (next === isOpen) return;
    if (!isOpenControlled) innerOpen = next;
    onOpenChange?.(next);
  }

  function toggleOpen() {
    if (disabled) return;
    setOpen(!isOpen);
  }

  function hasChildren(node: TreeNode): boolean {
    return !!node.children && node.children.length > 0;
  }

  function isExpanded(key: TreeKey): boolean {
    return expandedKeys.has(key);
  }

  function toggleExpand(key: TreeKey) {
    const next = new Set(expandedKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    expandedKeys = next;
  }

  function selectNode(node: TreeNode) {
    if (node.disabled || disabled) return;
    if (multiple) {
      // 多选：父节点也可勾选（联动子树），不关面板
      toggleCheckNode(node);
      return;
    }
    if (leafOnly && hasChildren(node)) {
      toggleExpand(node.key);
      return;
    }
    setValue(node.key);
    setOpen(false);
  }

  function clearAll(e: MouseEvent) {
    e.stopPropagation();
    if (disabled) return;
    if (multiple) {
      setChecked(new Set());
    } else {
      setValue(null);
    }
  }

  // --- useDismiss (红线 #3): 绑定放进 $effect，open 时绑、cleanup 解绑 ---
  let rootEl = $state<HTMLDivElement | null>(null);

  $effect(() => {
    if (!isOpen || !rootEl) return;
    return useDismiss(rootEl, {
      onDismiss: () => setOpen(false),
      escape: true,
      outsideClick: true,
    });
  });

  const cls = $derived(
    [
      'cd-tree-select',
      `cd-tree-select--${size}`,
      `cd-tree-select--${status}`,
      disabled && 'cd-tree-select--disabled',
      isOpen && 'cd-tree-select--open',
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

{#snippet treeNodes(nodes: TreeNode[], level: number)}
  {#each nodes as node (node.key)}
    {@const expandable = hasChildren(node)}
    {@const nodeOpen = expandable && isExpanded(node.key)}
    {@const cs = nodeCheckState(node)}
    {@const selected = multiple ? cs.checked : currentValue === node.key}
    <div
      class="cd-tree-select__node"
      class:cd-tree-select__node--selected={!multiple && selected}
      role="treeitem"
      aria-selected={selected}
      aria-checked={multiple ? (cs.checked ? true : cs.half ? 'mixed' : false) : undefined}
      aria-expanded={expandable ? nodeOpen : undefined}
      aria-disabled={node.disabled || undefined}
      style="padding-inline-start: calc({level} * var(--cd-tree-indent))"
      onclick={() => selectNode(node)}
      onkeydown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectNode(node);
        }
      }}
      tabindex={node.disabled ? -1 : 0}
    >
      {#if expandable}
        <span
          class="cd-tree-select__expand"
          class:cd-tree-select__expand--open={nodeOpen}
          role="button"
          tabindex="-1"
          aria-label={nodeOpen ? loc().t('Tree.collapse') : loc().t('Tree.expand')}
          onclick={(e) => {
            e.stopPropagation();
            toggleExpand(node.key);
          }}
          onkeydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              toggleExpand(node.key);
            }
          }}
        >
          <svg viewBox="0 0 16 16" width="10" height="10" aria-hidden="true" focusable="false">
            <path fill="currentColor" d="M6 4l4 4-4 4V4Z" />
          </svg>
        </span>
      {:else}
        <span class="cd-tree-select__expand cd-tree-select__expand--placeholder" aria-hidden="true"></span>
      {/if}
      {#if multiple}
        <span
          class="cd-tree-select__checkbox"
          class:cd-tree-select__checkbox--checked={cs.checked}
          class:cd-tree-select__checkbox--half={cs.half}
          aria-hidden="true"
        >
          {#if cs.checked}
            <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false">
              <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M3.5 8.5l3 3 6-6.5" />
            </svg>
          {:else if cs.half}
            <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false">
              <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M4 8h8" />
            </svg>
          {/if}
        </span>
      {/if}
      <span class="cd-tree-select__node-label">{node.label}</span>
    </div>
    {#if expandable && nodeOpen}
      {@render treeNodes(node.children ?? [], level + 1)}
    {/if}
  {/each}
{/snippet}

<div class={cls} bind:this={rootEl}>
  <!-- combobox 容器用 div 以合法承载多选 tags / clear 等内部交互元素 -->
  <div
    class="cd-tree-select__trigger"
    role="combobox"
    aria-haspopup="tree"
    aria-expanded={isOpen}
    aria-controls={treeId}
    aria-label={ariaLabel}
    aria-invalid={status === 'error' || undefined}
    aria-disabled={disabled || undefined}
    tabindex={disabled ? -1 : 0}
    onclick={toggleOpen}
    onkeydown={(e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (!disabled) setOpen(true);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    }}
  >
    <span class="cd-tree-select__content">
      {#if multiple}
        {#if checkedNodes.length > 0}
          <span class="cd-tree-select__tags">
            {#each checkedNodes as node (node.key)}
              <Tag
                size={size === 'large' ? 'default' : 'small'}
                closable={!disabled}
                onClose={() => removeChecked(node)}
              >
                {node.label}
              </Tag>
            {/each}
          </span>
        {:else}
          <span class="cd-tree-select__placeholder">{placeholder}</span>
        {/if}
      {:else if hasSelection}
        <span class="cd-tree-select__value">{displayLabel}</span>
      {:else}
        <span class="cd-tree-select__placeholder">{placeholder}</span>
      {/if}
    </span>

    {#if showClear}
      <span
        class="cd-tree-select__clear"
        role="button"
        tabindex="-1"
        aria-label={loc().t('TreeSelect.clear')}
        onclick={clearAll}
        onkeydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            clearAll(e as unknown as MouseEvent);
          }
        }}
      >
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
          <path
            fill="currentColor"
            d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm2.5 9.1-1.4 1.4L8 9.4 6.5 11l-1.4-1.4L6.6 8 5.1 6.5 6.5 5.1 8 6.6 9.5 5.1l1.4 1.4L9.4 8l1.1 1.1Z"
          />
        </svg>
      </span>
    {/if}

    <span class="cd-tree-select__arrow" aria-hidden="true">
      <svg viewBox="0 0 16 16" width="12" height="12" focusable="false">
        <path fill="currentColor" d="M3.5 6 8 10.5 12.5 6l-1-1L8 8.5 4.5 5l-1 1Z" />
      </svg>
    </span>
  </div>

  {#if isOpen}
    <div class="cd-tree-select__panel" id={treeId} role="tree">
      {#if treeData.length === 0}
        <div class="cd-tree-select__empty">{loc().t('TreeSelect.emptyText')}</div>
      {:else}
        {@render treeNodes(treeData, 0)}
      {/if}
    </div>
  {/if}
</div>

<style>
  .cd-tree-select {
    position: relative;
    display: inline-flex;
    inline-size: 100%;
    font-size: var(--cd-select-font-size);
  }
  .cd-tree-select__trigger {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-2);
    inline-size: 100%;
    min-block-size: var(--cd-select-height-default);
    padding-inline: var(--cd-select-padding-x);
    background: var(--cd-select-bg);
    border: 1px solid var(--cd-select-border);
    border-radius: var(--cd-select-radius);
    color: inherit;
    font: inherit;
    text-align: start;
    cursor: pointer;
    transition: border-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-tree-select--small .cd-tree-select__trigger {
    min-block-size: var(--cd-select-height-small);
  }
  .cd-tree-select--large .cd-tree-select__trigger {
    min-block-size: var(--cd-select-height-large);
  }
  .cd-tree-select__trigger:focus-visible {
    outline: none;
    border-color: var(--cd-select-border-active);
    box-shadow: var(--cd-focus-ring);
  }
  .cd-tree-select--open .cd-tree-select__trigger {
    border-color: var(--cd-select-border-active);
  }
  .cd-tree-select--error .cd-tree-select__trigger {
    border-color: var(--cd-select-border-error);
  }
  .cd-tree-select__trigger[aria-disabled='true'] {
    background: var(--cd-color-fill-0);
    color: var(--cd-color-text-3);
    cursor: not-allowed;
  }
  .cd-tree-select__content {
    display: flex;
    flex: 1 1 auto;
    align-items: center;
    min-inline-size: 0;
  }
  .cd-tree-select__value {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .cd-tree-select__placeholder {
    color: var(--cd-input-color-placeholder);
  }
  .cd-tree-select__clear,
  .cd-tree-select__arrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    color: var(--cd-color-text-2);
  }
  .cd-tree-select__clear {
    cursor: pointer;
  }
  .cd-tree-select__clear:hover {
    color: var(--cd-color-text-0);
  }
  .cd-tree-select__arrow {
    transition: transform var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-tree-select--open .cd-tree-select__arrow {
    transform: rotate(180deg);
  }
  .cd-tree-select__panel {
    position: absolute;
    inset-block-start: calc(100% + var(--cd-spacing-1));
    inset-inline: 0;
    z-index: var(--cd-select-dropdown-z);
    max-block-size: 16rem;
    overflow-y: auto;
    padding-block: var(--cd-spacing-1);
    background: var(--cd-select-dropdown-bg);
    border-radius: var(--cd-select-dropdown-radius);
    box-shadow: var(--cd-select-dropdown-shadow);
  }
  .cd-tree-select__node {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-1);
    block-size: var(--cd-tree-node-height);
    padding-inline-end: var(--cd-tree-node-padding-x);
    cursor: pointer;
  }
  .cd-tree-select__node:hover {
    background: var(--cd-tree-node-bg-hover);
  }
  .cd-tree-select__node--selected {
    color: var(--cd-tree-node-color-selected);
    background: var(--cd-tree-node-bg-active);
  }
  .cd-tree-select__node:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-tree-select__node[aria-disabled='true'] {
    color: var(--cd-color-text-3);
    cursor: not-allowed;
  }
  .cd-tree-select__expand {
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
  .cd-tree-select__expand--open {
    transform: rotate(90deg);
  }
  .cd-tree-select__expand--placeholder {
    cursor: default;
  }
  .cd-tree-select__node-label {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .cd-tree-select__checkbox {
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
  }
  .cd-tree-select__checkbox--checked,
  .cd-tree-select__checkbox--half {
    background: var(--cd-color-primary);
    border-color: var(--cd-color-primary);
  }
  .cd-tree-select__tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--cd-spacing-1);
    align-items: center;
    min-inline-size: 0;
  }
  .cd-tree-select__empty {
    padding: var(--cd-tree-node-padding-x);
    color: var(--cd-color-text-3);
    text-align: center;
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-tree-select__trigger,
    .cd-tree-select__arrow,
    .cd-tree-select__expand {
      transition: none;
    }
  }
</style>
