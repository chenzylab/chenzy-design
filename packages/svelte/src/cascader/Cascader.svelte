<!--
  Cascader — see specs/components/input/Cascader.spec.md
  基础子集: 单选、点击逐级展开级联列、叶子选中。Token-driven, a11y-correct, 受控/非受控。
  面板 portal 到 body + position:fixed（脱离 overflow:hidden 裁剪），flip 避让。
  TODO(延后): multiple/checkbox 级联、changeOnSelect 完整语义、loadData 异步、
  hover 展开、搜索 filterTreeNode、displayRender 自定义回显。
-->
<script lang="ts">
  import { useId, useDismiss } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import { floating } from '../_floating/use-floating.js';
  import type { CascaderNode } from './types.js';

  type Key = string | number;
  type Size = 'small' | 'default' | 'large';
  type Status = 'default' | 'warning' | 'error';

  interface Props {
    value?: Key[];
    defaultValue?: Key[];
    treeData?: CascaderNode[];
    open?: boolean;
    defaultOpen?: boolean;
    size?: Size;
    status?: Status;
    placeholder?: string;
    disabled?: boolean;
    clearable?: boolean;
    changeOnSelect?: boolean;
    onChange?: (path: Key[]) => void;
    onOpenChange?: (open: boolean) => void;
    ariaLabel?: string;
  }

  let {
    value,
    defaultValue,
    treeData = [],
    open,
    defaultOpen = false,
    size = 'default',
    status = 'default',
    placeholder = '请选择',
    disabled = false,
    clearable = false,
    changeOnSelect = false,
    onChange,
    onOpenChange,
    ariaLabel,
  }: Props = $props();

  const loc = useLocale();

  const listId = useId('cd-cascader-panel');

  // --- 纯函数: 按 key 路径取节点链 (用于回显 label) ---
  function findPath(data: CascaderNode[], valuePath: Key[]): CascaderNode[] {
    const chain: CascaderNode[] = [];
    let level = data;
    for (const key of valuePath) {
      const node = level.find((n) => n.value === key);
      if (!node) break;
      chain.push(node);
      level = node.children ?? [];
    }
    return chain;
  }

  // --- 纯函数: 由 activePath 生成各列数据 ---
  function columnsFor(data: CascaderNode[], path: Key[]): CascaderNode[][] {
    const columns: CascaderNode[][] = [data];
    let level = data;
    for (const key of path) {
      const node = level.find((n) => n.value === key);
      if (!node || !node.children || node.children.length === 0) break;
      columns.push(node.children);
      level = node.children;
    }
    return columns;
  }

  function getInitialValue(): Key[] {
    return defaultValue ?? [];
  }
  function getInitialOpen(): boolean {
    return defaultOpen;
  }
  function getInitialPath(): Key[] {
    return defaultValue ? defaultValue.slice() : [];
  }

  // --- 受控 value (红线 #1): 不无条件回写 value，仅 onChange ---
  const isValueControlled = $derived(value !== undefined);
  let innerValue = $state<Key[]>(getInitialValue());
  const currentValue = $derived<Key[]>(isValueControlled ? (value ?? []) : innerValue);

  // --- 受控 open (红线 #1): 不无条件回写 open，仅 onOpenChange ---
  const isOpenControlled = $derived(open !== undefined);
  let innerOpen = $state(getInitialOpen());
  const isOpen = $derived(isOpenControlled ? !!open : innerOpen);

  // --- 本地展开状态 (红线 #2): activePath 本地 $state，不依赖挂载 registry ---
  let activePath = $state<Key[]>(getInitialPath());

  const columns = $derived(columnsFor(treeData, activePath));

  const selectedChain = $derived(findPath(treeData, currentValue));
  const displayLabel = $derived(selectedChain.map((n) => n.label).join(' / '));
  const hasSelection = $derived(selectedChain.length > 0);
  const showClear = $derived(clearable && !disabled && hasSelection);

  function setValue(next: Key[]) {
    if (!isValueControlled) innerValue = next;
    onChange?.(next);
  }

  function setOpen(next: boolean) {
    if (next === isOpen) return;
    if (!isOpenControlled) innerOpen = next;
    onOpenChange?.(next);
    if (next) {
      // 打开时同步 activePath 到当前选中路径
      activePath = currentValue.slice();
    }
  }

  function toggleOpen() {
    if (disabled) return;
    setOpen(!isOpen);
  }

  function isActiveAt(colIndex: number, node: CascaderNode): boolean {
    return activePath[colIndex] === node.value;
  }

  function isSelectedLeaf(colIndex: number, node: CascaderNode): boolean {
    return (
      currentValue.length === colIndex + 1 &&
      currentValue[colIndex] === node.value
    );
  }

  function hasChildren(node: CascaderNode): boolean {
    return !!node.children && node.children.length > 0;
  }

  function selectNode(colIndex: number, node: CascaderNode) {
    if (node.disabled || disabled) return;
    const nextPath = activePath.slice(0, colIndex);
    nextPath.push(node.value);
    activePath = nextPath;

    if (hasChildren(node)) {
      // 非叶子: 展开下一列；changeOnSelect 时也提交当前路径
      if (changeOnSelect) setValue(nextPath.slice());
    } else {
      // 叶子: 提交完整路径并关闭
      setValue(nextPath.slice());
      setOpen(false);
    }
  }

  function clearAll(e: MouseEvent) {
    e.stopPropagation();
    if (disabled) return;
    setValue([]);
    activePath = [];
  }

  // --- DOM 引用：触发根 + portal 面板（定位由 use:floating action 接管）---
  let rootEl = $state<HTMLDivElement | null>(null);
  let panelEl = $state<HTMLDivElement | null>(null);

  // --- useDismiss (红线 #3): panel portal 出 root 子树后列入 extraTargets ---
  $effect(() => {
    if (!isOpen || !rootEl) return;
    return useDismiss(rootEl, {
      onDismiss: () => setOpen(false),
      escape: true,
      outsideClick: true,
      extraTargets: [panelEl],
    });
  });

  const cls = $derived(
    [
      'cd-cascader',
      `cd-cascader--${size}`,
      `cd-cascader--${status}`,
      disabled && 'cd-cascader--disabled',
      isOpen && 'cd-cascader--open',
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<div class={cls} bind:this={rootEl}>
  <button
    type="button"
    class="cd-cascader__trigger"
    role="combobox"
    aria-haspopup="listbox"
    aria-expanded={isOpen}
    aria-controls={listId}
    aria-label={ariaLabel}
    aria-invalid={status === 'error' || undefined}
    disabled={disabled || undefined}
    onclick={toggleOpen}
  >
    <span class="cd-cascader__content">
      {#if hasSelection}
        <span class="cd-cascader__value">{displayLabel}</span>
      {:else}
        <span class="cd-cascader__placeholder">{placeholder}</span>
      {/if}
    </span>

    {#if showClear}
      <span
        class="cd-cascader__clear"
        role="button"
        tabindex="-1"
        aria-label={loc().t('Cascader.clear')}
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

    <span class="cd-cascader__arrow" aria-hidden="true">
      <svg viewBox="0 0 16 16" width="12" height="12" focusable="false">
        <path fill="currentColor" d="M3.5 6 8 10.5 12.5 6l-1-1L8 8.5 4.5 5l-1 1Z" />
      </svg>
    </span>
  </button>

  {#if isOpen}
    <div
      class="cd-cascader__panel"
      bind:this={panelEl}
      use:floating={{ trigger: rootEl, placement: 'bottomStart', autoAdjust: true, offset: 4 }}
      id={listId}
    >
      {#each columns as column, colIndex (colIndex)}
        <ul class="cd-cascader__column" role="listbox">
          {#each column as node (node.value)}
            <li
              class="cd-cascader__option"
              class:cd-cascader__option--active={isActiveAt(colIndex, node)}
              class:cd-cascader__option--selected={isSelectedLeaf(colIndex, node)}
              role="option"
              aria-selected={isActiveAt(colIndex, node)}
              aria-disabled={node.disabled || undefined}
              onclick={() => selectNode(colIndex, node)}
              onkeydown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  selectNode(colIndex, node);
                }
              }}
              tabindex={node.disabled ? -1 : 0}
            >
              <span class="cd-cascader__option-label">{node.label}</span>
              {#if hasChildren(node)}
                <span class="cd-cascader__option-expand" aria-hidden="true">›</span>
              {/if}
            </li>
          {/each}
        </ul>
      {/each}
    </div>
  {/if}
</div>

<style>
  .cd-cascader {
    position: relative;
    display: inline-flex;
    inline-size: 100%;
    font-size: var(--cd-select-font-size);
  }
  .cd-cascader__trigger {
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
  .cd-cascader--small .cd-cascader__trigger {
    min-block-size: var(--cd-select-height-small);
  }
  .cd-cascader--large .cd-cascader__trigger {
    min-block-size: var(--cd-select-height-large);
  }
  .cd-cascader__trigger:focus-visible {
    outline: none;
    border-color: var(--cd-select-border-active);
    box-shadow: var(--cd-focus-ring);
  }
  .cd-cascader--open .cd-cascader__trigger {
    border-color: var(--cd-select-border-active);
  }
  .cd-cascader--error .cd-cascader__trigger {
    border-color: var(--cd-select-border-error);
  }
  .cd-cascader__trigger:disabled {
    background: var(--cd-color-fill-0);
    color: var(--cd-color-text-3);
    cursor: not-allowed;
  }
  .cd-cascader__content {
    display: flex;
    flex: 1 1 auto;
    align-items: center;
    min-inline-size: 0;
  }
  .cd-cascader__value {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .cd-cascader__placeholder {
    color: var(--cd-input-color-placeholder);
  }
  .cd-cascader__clear,
  .cd-cascader__arrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    color: var(--cd-color-text-2);
  }
  .cd-cascader__clear {
    cursor: pointer;
  }
  .cd-cascader__clear:hover {
    color: var(--cd-color-text-0);
  }
  .cd-cascader__arrow {
    transition: transform var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-cascader--open .cd-cascader__arrow {
    transform: rotate(180deg);
  }
  /* 面板 portal 到 body，由 JS 写 position:fixed + transform 定位 */
  .cd-cascader__panel {
    z-index: var(--cd-select-dropdown-z);
    display: flex;
    max-block-size: 16rem;
    padding: 0;
    background: var(--cd-select-dropdown-bg);
    border-radius: var(--cd-select-dropdown-radius);
    box-shadow: var(--cd-select-dropdown-shadow);
  }
  .cd-cascader__column {
    margin: 0;
    padding-block: var(--cd-spacing-1);
    padding-inline: 0;
    list-style: none;
    overflow-y: auto;
    inline-size: var(--cd-cascader-column-width);
    border-inline-end: 1px solid var(--cd-cascader-column-border);
  }
  .cd-cascader__column:last-child {
    border-inline-end: none;
  }
  .cd-cascader__option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--cd-spacing-2);
    block-size: var(--cd-tree-node-height);
    padding-inline: var(--cd-tree-node-padding-x);
    cursor: pointer;
  }
  .cd-cascader__option:hover {
    background: var(--cd-tree-node-bg-hover);
  }
  .cd-cascader__option--active {
    background: var(--cd-tree-node-bg-active);
  }
  .cd-cascader__option--selected {
    color: var(--cd-tree-node-color-selected);
  }
  .cd-cascader__option:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-cascader__option[aria-disabled='true'] {
    color: var(--cd-color-text-3);
    cursor: not-allowed;
  }
  .cd-cascader__option-label {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .cd-cascader__option-expand {
    flex: 0 0 auto;
    color: var(--cd-tree-expand-icon-color);
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-cascader__trigger,
    .cd-cascader__arrow {
      transition: none;
    }
  }
</style>
