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

<style>
  .cd-tree-option {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-extra-tight);
    height: var(--cd-tree-row-height);
    /* 首层左内边距 + 行右内边距（对齐 Semi $spacing-tree_option_level1-paddingLeft 8px） */
    padding-left: var(--cd-spacing-tree-option-level1-padding-left);
    padding-right: var(--cd-spacing-tree-option-level1-padding-left);
    border-radius: var(--cd-radius-tree-checkbox-addon);
    cursor: pointer;
    position: relative;
    transition: background-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-tree-option:hover {
    background: var(--cd-color-tree-option-bg-hover);
  }
  /* 按下态（对齐 Semi $color-tree_option_selected-bg-default = fill-1） */
  .cd-tree-option:active {
    background: var(--cd-color-tree-option-selected-bg-default);
  }
  .cd-tree-option-selected {
    color: var(--cd-color-tree-option-text-default);
    background: var(--cd-color-tree-option-bg-active);
  }
  .cd-tree-option-selected:hover,
  .cd-tree-option-selected:active {
    background: var(--cd-color-tree-option-bg-active);
  }
  /* 键盘 roving 焦点（当前项）：对齐 Semi 无 border，仅用背景区分；焦点可见性靠背景差异。 */
  .cd-tree-option-active:not(.cd-tree-option-selected) {
    background: var(--cd-color-tree-option-bg-hover);
  }
  .cd-tree-option-disabled {
    color: var(--cd-color-tree-option-disabled-text-default);
    cursor: not-allowed;
  }
  .cd-tree-option-disabled:hover {
    background: transparent;
  }

  /* --- 拖拽排序：被拖节点半透明 + 插入指示线 / 内部高亮 --- */
  /* 可拖拽行的内边距（对齐 Semi $spacing-tree_option_draggable-paddingY 2 / paddingX 0） */
  .cd-tree-option[draggable='true'] {
    padding-top: var(--cd-spacing-tree-option-draggable-padding-y);
    padding-bottom: var(--cd-spacing-tree-option-draggable-padding-y);
    padding-right: calc(
      var(--cd-spacing-tree-option-level1-padding-left) +
        var(--cd-spacing-tree-option-draggable-padding-x)
    );
  }
  .cd-tree-option-draggable {
    opacity: 0.5;
  }
  /* before/after 用 ::after 画一条插入指示线（不影响布局，子元素不接收 drag 事件） */
  .cd-tree-option-drag-over-gap-top::after,
  .cd-tree-option-drag-over-gap-bottom::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    height: var(--cd-width-tree-option-draggable-border);
    background: var(--cd-color-tree-option-draggable-insert-border-default);
    border-radius: 1px;
    pointer-events: none;
  }
  .cd-tree-option-drag-over-gap-top::after {
    top: -1px;
  }
  .cd-tree-option-drag-over-gap-bottom::after {
    bottom: -1px;
  }
  /* inside：成为子节点 → 整行高亮框 */
  .cd-tree-option-drag-over {
    background: var(--cd-color-tree-option-bg-hover);
    box-shadow: inset 0 0 0 1px var(--cd-color-tree-option-draggable-insert-border-default);
  }

  .cd-tree-option-expand-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    /* 对齐 Semi $width-tree_emptyIcon（展开图标宽 12）+ marginRight 8 */
    width: var(--cd-width-tree-empty-icon);
    height: var(--cd-width-tree-empty-icon);
    margin-right: var(--cd-spacing-tree-icon-margin-right);
    color: var(--cd-color-tree-option-icon-default);
    cursor: pointer;
    transition: transform var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
    /* IconTreeTriangleDown 默认朝下（=展开态外观，对齐 Semi）；收起态旋转 -90deg 指向右侧。 */
    transform: rotate(-90deg);
  }
  .cd-tree-option-expand-icon:hover {
    color: var(--cd-color-tree-option-icon-hover);
  }
  .cd-tree-option-expand-icon:active {
    color: var(--cd-color-tree-option-icon-active);
  }
  .cd-tree-option-expand-icon-open {
    transform: rotate(0deg);
  }
  .cd-tree-option-switcher-leaf-line {
    cursor: default;
    transform: none;
  }
  .cd-tree-option-spin-icon {
    cursor: default;
    transform: none;
    /* 加载 spin 尺寸对齐 Semi $width-tree_spinIcon（12） */
    width: var(--cd-width-tree-spin-icon);
    height: var(--cd-width-tree-spin-icon);
  }

  /* 勾选框：框体样式由 Checkbox 组件自带，此处仅负责在行内的定位与右间距（对齐 Semi label withIcon marginRight 8） */
  .cd-tree-option-checkbox {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
    margin-right: var(--cd-spacing-tree-label-with-icon-margin-right);
  }

  .cd-tree-option-item-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: 0;
    height: var(--cd-width-tree-empty-icon);
    color: var(--cd-color-tree-option-icon-default);
  }
  /* 有自定义图标内容时撑开尺寸 + 右间距（对齐 Semi label withIcon marginRight 8） */
  .cd-tree-option-item-icon:not(:empty) {
    width: var(--cd-width-tree-empty-icon);
    margin-right: var(--cd-spacing-tree-label-with-icon-margin-right);
  }

  .cd-tree-option-label {
    flex: 1 1 auto;
    min-width: 0;
  }
  /* labelEllipsis：超长单行省略（默认关闭；虚拟化下默认开启） */
  .cd-tree-option-ellipsis {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .cd-tree-option-suffix {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
    margin-left: var(--cd-spacing-extra-tight);
  }

  /* 拖拽幽灵节点：绝对定位在节点外屏幕外，由浏览器 setDragImage 拾取（或 CSS 隐藏） */
  .cd-tree-drag-ghost {
    position: absolute;
    left: -9999px;
    top: 0;
    pointer-events: none;
  }

  /* 搜索命中高亮：class 注入到 Highlight 子组件内部的 mark，需 :global 穿透 scoped CSS。
     对齐 Semi：primary 文字 + bold + 无独立背景（inherit）。 */
  .cd-tree-option-label :global(.cd-tree-option-highlight) {
    padding: 0;
    color: var(--cd-color-tree-option-highlight-text);
    background: inherit;
    font-weight: var(--cd-font-tree-option-highlight-weight);
  }
</style>
