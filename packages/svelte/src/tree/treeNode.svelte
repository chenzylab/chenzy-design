<!--
  TreeNode — 对齐 Semi Design `treeNode.tsx`：单节点渲染，从 Tree.svelte 内联的 `row` snippet
  抽出为独立组件。行自身状态（expanded/checked/selected/level 等，对应 Semi getTreeNodeProps）
  经 props 传入；树级配置与事件回调（multiple/draggable/showLine/onNodeClick 等，对应 Semi
  TreeContext）经 `getTreeContext()` 读取，避免每行重复透传十余个 prop。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { FlatNode, TreeNodeData, TreeKey } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import Checkbox from '../checkbox/Checkbox.svelte';
  import Spin from '../spin/Spin.svelte';
  import Highlight from '../highlight/Highlight.svelte';
  import Indent from './indent.svelte';
  import { getTreeContext } from './treeContext.js';
  import { ariaCheckedFromState, itemDomId } from './treeUtil.js';
  import { IconTreeTriangleDown, IconFile, IconFolder, IconFolderOpen } from '@chenzy-design/icons';

  interface Props {
    flat: FlatNode;
    baseId: string;
    expandable: boolean;
    loading: boolean;
    expanded: boolean;
    disabled: boolean;
    selected: boolean;
    checked: boolean;
    halfChecked: boolean;
    checkable: boolean;
    active: boolean;
    dragging: boolean;
    isDropTarget: boolean;
    dropPos: 'before' | 'inside' | 'after' | null;
    filtered: boolean;
    searchWord: string;
    ellipsis: boolean;
    /** 虚拟化行绝对定位样式（对齐 Semi treeNode.tsx 的 style prop） */
    posStyle: string | undefined;
  }

  const {
    flat,
    baseId,
    expandable,
    loading,
    expanded,
    disabled,
    selected,
    checked,
    halfChecked,
    checkable,
    active,
    dragging,
    isDropTarget,
    dropPos,
    filtered,
    searchWord,
    ellipsis,
    posStyle,
  }: Props = $props();

  const ctx = getTreeContext();
  const loc = useLocale();
  const node = $derived(flat.node);

  const rowStyle = $derived(posStyle);

  function onClick(e: MouseEvent): void {
    ctx.onNodeClick(node, e);
  }
  function onExpandClick(e: MouseEvent): void {
    e.stopPropagation();
    if (!disabled) ctx.onNodeExpand(node, e);
  }
  function onCheckClick(): void {
    ctx.onNodeCheck(node);
  }
  function onDoubleClick(e: MouseEvent): void {
    ctx.onNodeDoubleClick(node, e);
  }
  function onContextMenu(e: MouseEvent): void {
    e.preventDefault();
    ctx.onNodeRightClick(node, e);
  }

  // renderFullLabel 场景下的内置状态类名（对齐 Semi `.tree-option-fullLabel-level-N` 等），
  // 供使用者自定义渲染沿用内置样式；缩进由该 CSS 类的 padding-left 公式负责（不渲染 Indent）。
  const fullLabelClassName = $derived(
    [
      'cd-tree-option',
      'cd-tree-option-fullLabel',
      `cd-tree-option-fullLabel-level-${flat.level + 1}`,
      selected && 'cd-tree-option-selected',
      disabled && 'cd-tree-option-disabled',
      active && 'cd-tree-option-active',
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

{#snippet fullLabelExpandIcon(s: { expanded: boolean; loading: boolean })}
  {#if s.loading}
    <span class="cd-tree-option-expand-icon cd-tree-option-spin-icon" aria-hidden="true">
      <Spin size="small" />
    </span>
  {:else}
    <span class="cd-tree-option-expand-icon" class:cd-tree-option-expand-icon-open={s.expanded} aria-hidden="true">
      <IconTreeTriangleDown size="small" />
    </span>
  {/if}
{/snippet}

{#if ctx.renderFullLabel}
  {@render ctx.renderFullLabel({
    data: ctx.toOrig(node),
    level: flat.level,
    style: rowStyle,
    className: fullLabelClassName,
    expandIcon: fullLabelExpandIcon,
    isLeaf: !expandable,
    checkStatus: { checked, halfChecked },
    expandStatus: { expanded, loading },
    filtered,
    searchWord,
    onClick,
    onCheck: onCheckClick,
    onExpand: onExpandClick,
    onContextMenu,
    onDoubleClick,
  })}
{:else}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div
    id={itemDomId(baseId, node.key)}
    class="cd-tree-option"
    class:cd-tree-option-selected={selected}
    class:cd-tree-option-disabled={disabled}
    class:cd-tree-option-active={active}
    class:cd-tree-option-block={ctx.blockNode}
    class:cd-tree-option-draggable={dragging}
    class:cd-tree-option-drag-over-gap-top={isDropTarget && dropPos === 'before'}
    class:cd-tree-option-drag-over={isDropTarget && dropPos === 'inside'}
    class:cd-tree-option-drag-over-gap-bottom={isDropTarget && dropPos === 'after'}
    role="treeitem"
    draggable={ctx.draggable && !disabled ? true : undefined}
    tabindex={-1}
    aria-level={flat.level + 1}
    aria-setsize={flat.setSize}
    aria-posinset={flat.posInSet}
    aria-expanded={expandable ? expanded : undefined}
    aria-selected={!ctx.multiple ? selected : undefined}
    aria-checked={ctx.multiple ? ariaCheckedFromState(checked, halfChecked) : undefined}
    aria-disabled={disabled || undefined}
    style={rowStyle}
    onclick={onClick}
    ondblclick={ctx.wantsDoubleClick ? onDoubleClick : undefined}
    oncontextmenu={ctx.wantsContextMenu ? onContextMenu : undefined}
    ondragstart={ctx.draggable ? (e) => ctx.onNodeDragStart(node, e) : undefined}
    ondragover={ctx.draggable ? (e) => ctx.onNodeDragOver(node, e) : undefined}
    ondragleave={ctx.draggable ? (e) => ctx.onNodeDragLeave(node, e) : undefined}
    ondrop={ctx.draggable ? (e) => ctx.onNodeDrop(node, e) : undefined}
    ondragend={ctx.draggable ? (e) => ctx.onNodeDragEnd(node, e) : undefined}
  >
    <Indent level={flat.level} isEnd={flat.ancestorIsLast} showLine={ctx.showLine} />
    {#if loading}
      {#if ctx.expandIcon}
        {@render ctx.expandIcon({ node, expanded: false, loading: true })}
      {:else}
        <span class="cd-tree-option-expand-icon cd-tree-option-spin-icon" aria-hidden="true">
          <Spin size="small" />
        </span>
      {/if}
    {:else if expandable}
      {#if ctx.expandIcon}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <span
          role="button"
          tabindex="-1"
          aria-label={expanded ? loc().t('Tree.collapse') : loc().t('Tree.expand')}
          onclick={onExpandClick}
        >
          {@render ctx.expandIcon({ node, expanded, loading: false })}
        </span>
      {:else}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <span
          class="cd-tree-option-expand-icon"
          class:cd-tree-option-expand-icon-open={expanded}
          role="button"
          tabindex="-1"
          aria-label={expanded ? loc().t('Tree.collapse') : loc().t('Tree.expand')}
          onclick={onExpandClick}
        >
          <IconTreeTriangleDown size="small" />
        </span>
      {/if}
    {:else if ctx.expandIcon}
      {@render ctx.expandIcon({ node, expanded: false, loading: false })}
    {:else}
      <span class="cd-tree-option-expand-icon cd-tree-option-switcher-leaf-line" aria-hidden="true"></span>
    {/if}

    {#if ctx.multiple}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <span class="cd-tree-option-checkbox" onclick={(e) => e.stopPropagation()}>
        <Checkbox
          {checked}
          indeterminate={!checked && halfChecked}
          disabled={!checkable}
          aria-label="Toggle the checked state of checkbox"
          onChange={onCheckClick}
        />
      </span>
    {/if}

    {#if ctx.icon || ctx.directory}
      {@const isLeaf = !expandable}
      <span class="cd-tree-option-item-icon" class:cd-tree-option-item-icon-directory={ctx.directory && !ctx.icon} aria-hidden="true">
        {#if ctx.icon}
          {@render ctx.icon({ node, expanded, isLeaf })}
        {:else if ctx.directory}
          {#if isLeaf}
            <IconFile />
          {:else if expanded}
            <IconFolderOpen />
          {:else}
            <IconFolder />
          {/if}
        {/if}
      </span>
    {/if}

    <span class="cd-tree-option-label" class:cd-tree-option-ellipsis={ellipsis}>
      {#if ctx.renderLabel}
        {@render ctx.renderLabel({ node, level: flat.level, searchValue: searchWord, selected, checked })}
      {:else if filtered && searchWord && typeof node.label === 'string'}
        <Highlight sourceString={node.label} searchWords={searchWord} highlightClassName="cd-tree-option-highlight" />
      {:else if typeof node.label === 'function'}
        {@render (node.label as Snippet)()}
      {:else}{node.label}{/if}
    </span>

    {#if ctx.suffix}
      <span class="cd-tree-option-suffix">
        {@render ctx.suffix({ node })}
      </span>
    {/if}

    {#if ctx.dragGhost && dragging}
      <span class="cd-tree-drag-ghost" aria-hidden="true">
        {@render ctx.dragGhost({ node })}
      </span>
    {/if}
  </div>
{/if}
