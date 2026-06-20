<!--
  Cascader — see specs/components/input/Cascader.spec.md
  基础子集: 单选、点击逐级展开级联列、叶子选中。Token-driven, a11y-correct, 受控/非受控。
  面板 portal 到 body + position:fixed（脱离 overflow:hidden 裁剪），flip 避让。
  异步 loadData：点击非叶子且无 children 的节点时调 loadData 动态加载，
  加载中显示 spinner，结果缓存到本地 extraChildren（不改 treeData prop）。
  multiple：每列 checkbox 多选 + 父子联动（复用 core conduct/toggleCheck，以 value 为 key），
  trigger 按选中叶子路径多 tag 回显可单独移除；value 为 Key[][]（多条路径）。
  filterable：搜索时切换为扁平路径列表，按 label 链过滤 + 高亮命中，点击直接选中整条路径。
  TODO(延后): changeOnSelect 完整语义、hover 展开、displayRender 自定义回显。
-->
<script lang="ts">
  import { useId, useDismiss, conduct, toggleCheck, type TreeNodeData } from '@chenzy-design/core';
  import { SvelteMap, SvelteSet } from 'svelte/reactivity';
  import { useLocale } from '../locale-provider/index.js';
  import { floating } from '../_floating/use-floating.js';
  import Tag from '../tag/Tag.svelte';
  import type { CascaderNode } from './types.js';

  type Key = string | number;
  type Size = 'small' | 'default' | 'large';
  type Status = 'default' | 'warning' | 'error';

  interface Props {
    /** 单选为单条路径 Key[]；多选为多条路径 Key[][] */
    value?: Key[] | Key[][];
    defaultValue?: Key[] | Key[][];
    treeData?: CascaderNode[];
    open?: boolean;
    defaultOpen?: boolean;
    /** 多选：每列 checkbox + 父子联动，trigger 多 tag 回显 */
    multiple?: boolean;
    size?: Size;
    status?: Status;
    placeholder?: string;
    disabled?: boolean;
    clearable?: boolean;
    changeOnSelect?: boolean;
    /** 搜索时切换为扁平路径列表，按 label 链过滤 + 高亮命中 */
    filterable?: boolean;
    /** 动态加载子节点；点击非叶子且无 children 的节点时调用 */
    loadData?: (node: CascaderNode) => Promise<CascaderNode[]>;
    /** 单选回调单条路径；多选回调多条叶子路径 */
    onChange?: (value: Key[] | Key[][]) => void;
    onOpenChange?: (open: boolean) => void;
    ariaLabel?: string;
  }

  let {
    value,
    defaultValue,
    treeData = [],
    open,
    defaultOpen = false,
    multiple = false,
    size = 'default',
    status = 'default',
    placeholder = '请选择',
    disabled = false,
    clearable = false,
    changeOnSelect = false,
    filterable = false,
    loadData,
    onChange,
    onOpenChange,
    ariaLabel,
  }: Props = $props();

  const loc = useLocale();

  // 异步加载：已加载子节点缓存（node.value → children）+ 加载中节点集合。
  // 不写回 treeData prop（红线 #1：不改受控数据源）。
  const extraChildren = new SvelteMap<Key, CascaderNode[]>();
  const loadingKeys = new SvelteSet<Key>();

  // 取节点的有效子节点：优先 node.children，否则查 extraChildren 缓存。
  function childrenOf(node: CascaderNode): CascaderNode[] | undefined {
    if (node.children && node.children.length > 0) return node.children;
    return extraChildren.get(node.value);
  }

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

  // --- 由 activePath 生成各列数据（含异步加载的子节点缓存）---
  function columnsFor(data: CascaderNode[], path: Key[]): CascaderNode[][] {
    const columns: CascaderNode[][] = [data];
    let level = data;
    for (const key of path) {
      const node = level.find((n) => n.value === key);
      const kids = node ? childrenOf(node) : undefined;
      if (!node || !kids || kids.length === 0) break;
      columns.push(kids);
      level = kids;
    }
    return columns;
  }

  // 联合 value 规整：单选取单条路径，多选取多条路径
  function asSinglePath(v: Key[] | Key[][] | undefined): Key[] {
    if (!v || v.length === 0) return [];
    return Array.isArray(v[0]) ? ((v[0] as Key[]) ?? []) : (v as Key[]);
  }
  function asMultiPaths(v: Key[] | Key[][] | undefined): Key[][] {
    if (!v || v.length === 0) return [];
    return Array.isArray(v[0]) ? (v as Key[][]) : [v as Key[]];
  }

  function getInitialValue(): Key[] {
    return asSinglePath(defaultValue);
  }
  function getInitialPaths(): Key[][] {
    return asMultiPaths(defaultValue).map((p) => p.slice());
  }
  function getInitialOpen(): boolean {
    return defaultOpen;
  }
  function getInitialPath(): Key[] {
    return asSinglePath(defaultValue).slice();
  }

  // --- 受控 value (红线 #1): 不无条件回写 value，仅 onChange ---
  const isValueControlled = $derived(value !== undefined);
  // 单选：当前路径
  let innerValue = $state<Key[]>(getInitialValue());
  const currentValue = $derived<Key[]>(
    isValueControlled ? asSinglePath(value) : innerValue,
  );
  // 多选：选中的多条叶子路径
  let innerPaths = $state<Key[][]>(getInitialPaths());
  const currentPaths = $derived<Key[][]>(
    isValueControlled ? asMultiPaths(value) : innerPaths,
  );

  // --- 受控 open (红线 #1): 不无条件回写 open，仅 onOpenChange ---
  const isOpenControlled = $derived(open !== undefined);
  let innerOpen = $state(getInitialOpen());
  const isOpen = $derived(isOpenControlled ? !!open : innerOpen);

  // --- 本地展开状态 (红线 #2): activePath 本地 $state，不依赖挂载 registry ---
  let activePath = $state<Key[]>(getInitialPath());

  const columns = $derived(columnsFor(treeData, activePath));

  // --- 多选：合并树（含异步缓存）转 core TreeNodeData（以 value 为 key），跑 conduct ---
  function toTreeData(nodes: CascaderNode[]): TreeNodeData[] {
    return nodes.map((n) => {
      const kids = childrenOf(n);
      const td: TreeNodeData = { key: n.value, label: n.label };
      if (n.disabled) td.disabled = true;
      if (kids && kids.length > 0) td.children = toTreeData(kids);
      return td;
    });
  }
  const mergedTreeData = $derived(toTreeData(treeData));

  // --- filterable：扁平路径列表 + 搜索过滤 ---
  let searchValue = $state('');
  const trimmedSearch = $derived(searchValue.trim());
  const searchActive = $derived(filterable && trimmedSearch.length > 0);

  interface FlatPath {
    values: Key[];
    labels: string[];
    disabled: boolean;
  }
  // 收集所有可选路径：叶子路径；changeOnSelect 时含所有非叶子路径。
  const flatPaths = $derived.by<FlatPath[]>(() => {
    const out: FlatPath[] = [];
    const walk = (nodes: CascaderNode[], vals: Key[], labels: string[], parentDisabled: boolean) => {
      for (const n of nodes) {
        const kids = childrenOf(n);
        const isLeaf = !kids || kids.length === 0;
        const nv = [...vals, n.value];
        const nl = [...labels, n.label];
        const dis = parentDisabled || !!n.disabled;
        if (isLeaf || changeOnSelect) out.push({ values: nv, labels: nl, disabled: dis });
        if (!isLeaf) walk(kids, nv, nl, dis);
      }
    };
    walk(treeData, [], [], false);
    return out;
  });
  const filteredPaths = $derived.by<FlatPath[]>(() => {
    if (!searchActive) return [];
    const lower = trimmedSearch.toLowerCase();
    return flatPaths.filter((p) => p.labels.join(' / ').toLowerCase().includes(lower));
  });

  // 命中文本高亮（作用于整条 label 链字符串）
  type HlPart = { text: string; mark: boolean };
  function highlightParts(text: string): HlPart[] {
    if (!searchActive) return [{ text, mark: false }];
    const lower = text.toLowerCase();
    const term = trimmedSearch.toLowerCase();
    const parts: HlPart[] = [];
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

  // 点击扁平路径：单选选中关闭；多选切换勾选（取末端节点）
  function selectFlatPath(p: FlatPath) {
    if (p.disabled || disabled) return;
    if (multiple) {
      const leaf = p.values[p.values.length - 1] as Key;
      const nextBase = toggleCheck(mergedTreeData, checkedBase, leaf);
      const resolved = conduct(mergedTreeData, nextBase);
      setPaths(leafBaseToPaths(resolved.checked));
      searchValue = '';
    } else {
      setValue(p.values.slice());
      setOpen(false);
    }
  }

  // 多选勾选 base：把每条选中路径的叶子 value 作为显式勾选项
  function pathsToLeafBase(paths: Key[][]): Set<Key> {
    const set = new Set<Key>();
    for (const p of paths) {
      if (p.length > 0) set.add(p[p.length - 1] as Key);
    }
    return set;
  }
  const checkedBase = $derived(pathsToLeafBase(currentPaths));
  const checkState = $derived.by(() =>
    multiple
      ? conduct(mergedTreeData, checkedBase)
      : { checked: new Set<Key>(), half: new Set<Key>() },
  );

  // 选中叶子的完整路径链（用于多 tag 回显）。遍历合并树收集 checked 的叶子路径。
  const checkedLeafPaths = $derived.by<{ path: Key[]; labels: string[] }[]>(() => {
    if (!multiple) return [];
    const out: { path: Key[]; labels: string[] }[] = [];
    const walk = (nodes: CascaderNode[], path: Key[], labels: string[]) => {
      for (const n of nodes) {
        const kids = childrenOf(n);
        const np = [...path, n.value];
        const nl = [...labels, n.label];
        const isLeaf = !kids || kids.length === 0;
        if (isLeaf && checkState.checked.has(n.value)) {
          out.push({ path: np, labels: nl });
        } else if (!isLeaf) {
          walk(kids, np, nl);
        }
      }
    };
    walk(treeData, [], []);
    return out;
  });

  const selectedChain = $derived(findPath(treeData, currentValue));
  const displayLabel = $derived(selectedChain.map((n) => n.label).join(' / '));
  const hasSelection = $derived(
    multiple ? checkedLeafPaths.length > 0 : selectedChain.length > 0,
  );
  const showClear = $derived(clearable && !disabled && hasSelection);

  function setValue(next: Key[]) {
    if (!isValueControlled) innerValue = next;
    onChange?.(next);
  }

  // 多选：由勾选叶子全集生成多条路径回调
  function leafBaseToPaths(checkedSet: Set<Key>): Key[][] {
    const out: Key[][] = [];
    const walk = (nodes: CascaderNode[], path: Key[]) => {
      for (const n of nodes) {
        const kids = childrenOf(n);
        const np = [...path, n.value];
        const isLeaf = !kids || kids.length === 0;
        if (isLeaf) {
          if (checkedSet.has(n.value)) out.push(np);
        } else {
          walk(kids, np);
        }
      }
    };
    walk(treeData, []);
    return out;
  }

  function setPaths(nextPaths: Key[][]) {
    if (!isValueControlled) innerPaths = nextPaths;
    onChange?.(nextPaths);
  }

  // 切换某节点勾选（父子联动），由 nextBase → conduct → 叶子路径回调
  function toggleCheckNode(node: CascaderNode) {
    if (node.disabled || disabled) return;
    const nextBase = toggleCheck(mergedTreeData, checkedBase, node.value);
    const resolved = conduct(mergedTreeData, nextBase);
    setPaths(leafBaseToPaths(resolved.checked));
  }

  // 移除某 tag（按叶子 value 取消勾选，联动祖先半选更新）
  function removeLeaf(leafValue: Key) {
    if (disabled) return;
    const nextBase = new Set(checkedBase);
    nextBase.delete(leafValue);
    const resolved = conduct(mergedTreeData, nextBase);
    setPaths(leafBaseToPaths(resolved.checked));
  }

  function nodeCheck(node: CascaderNode): { checked: boolean; half: boolean } {
    return {
      checked: checkState.checked.has(node.value),
      half: !checkState.checked.has(node.value) && checkState.half.has(node.value),
    };
  }

  function setOpen(next: boolean) {
    if (next === isOpen) return;
    if (!next) searchValue = '';
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
    const kids = childrenOf(node);
    return !!kids && kids.length > 0;
  }

  // 节点是否可展开：已有子节点，或非叶子且配置了 loadData（可异步加载）。
  function canExpand(node: CascaderNode): boolean {
    if (hasChildren(node)) return true;
    return !node.isLeaf && loadData !== undefined;
  }

  function isLoading(node: CascaderNode): boolean {
    return loadingKeys.has(node.value);
  }

  // 异步加载子节点：标记 loading → await loadData → 缓存结果 → 清 loading。
  async function loadChildren(node: CascaderNode): Promise<boolean> {
    if (!loadData || loadingKeys.has(node.value)) return false;
    loadingKeys.add(node.value);
    try {
      const kids = await loadData(node);
      extraChildren.set(node.value, kids);
      return kids.length > 0;
    } catch {
      return false;
    } finally {
      loadingKeys.delete(node.value);
    }
  }

  function selectNode(colIndex: number, node: CascaderNode) {
    if (node.disabled || disabled) return;
    const nextPath = activePath.slice(0, colIndex);
    nextPath.push(node.value);
    activePath = nextPath;

    // 多选：非叶子展开列 / 异步加载；叶子切换勾选且不关面板
    if (multiple) {
      if (hasChildren(node)) {
        return;
      }
      if (!node.isLeaf && loadData) {
        void loadChildren(node);
        return;
      }
      toggleCheckNode(node);
      return;
    }

    if (hasChildren(node)) {
      // 非叶子: 展开下一列；changeOnSelect 时也提交当前路径
      if (changeOnSelect) setValue(nextPath.slice());
    } else if (!node.isLeaf && loadData) {
      // 异步加载：加载完成后子节点经 extraChildren 进列，activePath 已指向本节点。
      if (changeOnSelect) setValue(nextPath.slice());
      void loadChildren(node);
    } else {
      // 叶子: 提交完整路径并关闭
      setValue(nextPath.slice());
      setOpen(false);
    }
  }

  function clearAll(e: MouseEvent) {
    e.stopPropagation();
    if (disabled) return;
    if (multiple) {
      setPaths([]);
    } else {
      setValue([]);
    }
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
  <!-- combobox 容器用 div 以合法承载多选 tags / clear 等内部交互元素 -->
  <div
    class="cd-cascader__trigger"
    role="combobox"
    aria-haspopup="listbox"
    aria-expanded={isOpen}
    aria-controls={listId}
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
    <span class="cd-cascader__content">
      {#if multiple}
        {#if checkedLeafPaths.length > 0}
          <span class="cd-cascader__tags">
            {#each checkedLeafPaths as leaf (leaf.path.join('/'))}
              <Tag
                size={size === 'large' ? 'default' : 'small'}
                closable={!disabled}
                onClose={() => removeLeaf(leaf.path[leaf.path.length - 1] as Key)}
              >
                {leaf.labels.join(' / ')}
              </Tag>
            {/each}
          </span>
        {:else}
          <span class="cd-cascader__placeholder">{placeholder}</span>
        {/if}
      {:else if hasSelection}
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
  </div>

  {#if isOpen}
    <div
      class="cd-cascader__panel"
      bind:this={panelEl}
      use:floating={{ trigger: rootEl, placement: 'bottomStart', autoAdjust: true, offset: 4 }}
      id={listId}
    >
      {#if filterable}
        <div class="cd-cascader__search">
          <input
            class="cd-cascader__search-input"
            type="text"
            placeholder={loc().t('Cascader.searchPlaceholder')}
            aria-label={loc().t('Cascader.searchPlaceholder')}
            bind:value={searchValue}
          />
        </div>
      {/if}
      {#if searchActive}
        <ul class="cd-cascader__flat" role="listbox">
          {#if filteredPaths.length === 0}
            <li class="cd-cascader__empty">{loc().t('Cascader.emptyText')}</li>
          {:else}
            {#each filteredPaths as p (p.values.join('/'))}
              <li
                class="cd-cascader__option cd-cascader__flat-option"
                role="option"
                aria-selected={false}
                aria-disabled={p.disabled || undefined}
                onclick={() => selectFlatPath(p)}
                onkeydown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectFlatPath(p);
                  }
                }}
                tabindex={p.disabled ? -1 : 0}
              >
                <span class="cd-cascader__option-label">
                  {#each highlightParts(p.labels.join(' / ')) as part, i (i)}
                    {#if part.mark}<mark class="cd-cascader__highlight">{part.text}</mark>{:else}{part.text}{/if}
                  {/each}
                </span>
              </li>
            {/each}
          {/if}
        </ul>
      {:else}
      <div class="cd-cascader__columns">
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
              {#if multiple}
                {@const cs = nodeCheck(node)}
                <span
                  class="cd-cascader__checkbox"
                  class:cd-cascader__checkbox--checked={cs.checked}
                  class:cd-cascader__checkbox--half={cs.half}
                  role="button"
                  tabindex="-1"
                  aria-hidden="true"
                  onclick={(e) => {
                    e.stopPropagation();
                    toggleCheckNode(node);
                  }}
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
              <span class="cd-cascader__option-label">{node.label}</span>
              {#if isLoading(node)}
                <span class="cd-cascader__option-loading" aria-label={loc().t('Cascader.loading')}></span>
              {:else if canExpand(node)}
                <span class="cd-cascader__option-expand" aria-hidden="true">›</span>
              {/if}
            </li>
          {/each}
        </ul>
      {/each}
      </div>
      {/if}
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
  .cd-cascader__trigger[aria-disabled='true'] {
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
    flex-direction: column;
    padding: 0;
    background: var(--cd-select-dropdown-bg);
    border-radius: var(--cd-select-dropdown-radius);
    box-shadow: var(--cd-select-dropdown-shadow);
  }
  /* 级联列容器：横向排列各列 */
  .cd-cascader__columns {
    display: flex;
    max-block-size: 16rem;
  }
  .cd-cascader__search {
    padding: var(--cd-spacing-1) var(--cd-spacing-2);
    border-block-end: 1px solid var(--cd-cascader-column-border);
  }
  .cd-cascader__search-input {
    inline-size: 100%;
    block-size: var(--cd-input-height-small);
    padding-inline: var(--cd-input-padding-x);
    background: var(--cd-input-bg, transparent);
    color: inherit;
    border: 1px solid var(--cd-input-border);
    border-radius: var(--cd-input-radius);
    font: inherit;
    font-size: var(--cd-font-size-1);
  }
  .cd-cascader__search-input:focus-visible {
    outline: none;
    border-color: var(--cd-input-border-active);
    box-shadow: var(--cd-focus-ring);
  }
  /* 搜索结果：扁平路径列表（单列纵向滚动） */
  .cd-cascader__flat {
    margin: 0;
    padding-block: var(--cd-spacing-1);
    padding-inline: 0;
    list-style: none;
    max-block-size: 16rem;
    min-inline-size: var(--cd-cascader-column-width);
    overflow-y: auto;
  }
  .cd-cascader__flat-option {
    justify-content: flex-start;
  }
  .cd-cascader__empty {
    padding: var(--cd-tree-node-padding-x);
    color: var(--cd-color-text-3);
    text-align: center;
  }
  .cd-cascader__highlight {
    padding: 0;
    color: var(--cd-tree-search-highlight-color);
    background: var(--cd-tree-search-highlight-bg);
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
    flex: 1 1 auto;
  }
  .cd-cascader__checkbox {
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
  .cd-cascader__checkbox--checked,
  .cd-cascader__checkbox--half {
    background: var(--cd-color-primary);
    border-color: var(--cd-color-primary);
  }
  .cd-cascader__tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--cd-spacing-1);
    align-items: center;
    min-inline-size: 0;
  }
  .cd-cascader__option-expand {
    flex: 0 0 auto;
    color: var(--cd-tree-expand-icon-color);
  }
  .cd-cascader__option-loading {
    flex: 0 0 auto;
    inline-size: 12px;
    block-size: 12px;
    border: 2px solid var(--cd-tree-expand-icon-color, currentColor);
    border-block-start-color: transparent;
    border-radius: var(--cd-radius-full);
    animation: cd-cascader-spin 0.7s linear infinite;
  }
  @keyframes cd-cascader-spin {
    to {
      transform: rotate(360deg);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-cascader__option-loading {
      animation: none;
    }
    .cd-cascader__trigger,
    .cd-cascader__arrow {
      transition: none;
    }
  }
</style>
