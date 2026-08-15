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

  // renderFullLabel 场景的缩进：对齐 Semi tree.scss `@for $i from 1 through 20` 生成的
  // `.tree-option.tree-option-fullLabel-level-#{$i}` 层级 padding-left 公式
  // （levelPaddingLeft * (i-1) + level1PaddingLeft，i = flat.level+1）。Semi 用 SCSS 循环
  // 生成 20 条全局 class 规则即可命中调用方渲染的 DOM；Svelte 没有等价的循环生成 CSS 能力，
  // 且 renderFullLabel 的 snippet 由 demo 侧组件渲染，不在 treeNode.svelte 的 scoped CSS
  // 作用域内（scoped hash 只打给模板内写死的元素），class 选择器天然打不到。用内联 style
  // 计算这一行的 padding-left 数值直接跨作用域生效，等价于 Semi 的逐层级 class 规则。
  const fullLabelPaddingLeft = $derived(
    `calc(var(--cd-spacing-tree-option-level-padding-left) * ${flat.level} + var(--cd-spacing-tree-option-level1-padding-left))`,
  );
  const fullLabelStyle = $derived(
    [rowStyle, `padding-left: ${fullLabelPaddingLeft}`].filter(Boolean).join('; '),
  );

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
  // 拖拽插入提示（对齐 Semi nodeCls 第 389/390 行 fullLabel-drag-over-gap-top/bottom +
  // 214/215 行 drag-over 三态）：renderFullLabel 场景用户自定义的 DOM 结构不保证有稳定的
  // position:relative 容器画 ::after 绝对定位插入线（普通分支 cd-tree-option-drag-over-gap-*
  // 的实现方式），故这里对齐 Semi 改用 fullLabel 专属 class + border 方案（见下方 CSS）。此前
  // isDropTarget/dropPos 完全没有编入这个 className，renderFullLabel 场景拖拽时插入位置提示
  // （蓝色线/高亮框）全部消失，用户只能凭空拖放、看不到会插入到哪。
  const fullLabelClassName = $derived(
    [
      'cd-tree-option',
      'cd-tree-option-fullLabel',
      `cd-tree-option-fullLabel-level-${flat.level + 1}`,
      selected && 'cd-tree-option-selected',
      disabled && 'cd-tree-option-disabled',
      active && 'cd-tree-option-active',
      ctx.draggable && !disabled && 'cd-tree-option-fullLabel-draggable',
      !disabled && isDropTarget && dropPos === 'inside' && 'cd-tree-option-drag-over',
      !disabled && isDropTarget && dropPos === 'before' && 'cd-tree-option-fullLabel-drag-over-gap-top',
      !disabled && isDropTarget && dropPos === 'after' && 'cd-tree-option-fullLabel-drag-over-gap-bottom',
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
  {:else if expandable}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- onclick 必须挂在这里：对齐 Semi renderArrow 默认图标分支
         `<IconTreeTriangleDown onClick={this.onExpand} />`——用户未传自定义 expandIcon prop
         时，Semi 返回的默认三角图标本身自带展开点击。renderFullLabel demo 里这个 span 只是
         原样渲染 `{expandIcon}`，点击响应必须由本库这一侧提供，而非指望 demo 自己再包一层
         onclick（Semi 官方 demo 也没包，直接信任 expandIcon 自带交互）。此前没挂 onclick，
         点这个箭头图标本身完全无法折叠/展开，只能靠外层 onClick 在 expandAction==='click'
         时间接触发——而这两个 demo 默认 expandAction 不是 'click'，导致折叠彻底失效。 -->
    <span
      class="cd-tree-option-expand-icon"
      class:cd-tree-option-expand-icon-open={s.expanded}
      role="button"
      tabindex="-1"
      aria-label={s.expanded ? loc().t('Tree.collapse') : loc().t('Tree.expand')}
      onclick={onExpandClick}
    >
      <IconTreeTriangleDown size="small" />
    </span>
  {:else}
    <!-- 对齐 Semi renderArrow `showIcon = !isLeaf()`：expandIcon 传给 renderFullLabel 前已经
         被计算成 renderArrow() 的结果，叶子节点该结果是空占位 span（非箭头图标），demo 里
         `{expandIcon}` 无条件渲染这个已算好的值即可得到"叶子节点无图标"的效果。此前这个
         snippet 没做叶子判断，无条件渲染箭头图标，导致叶子分组单选等 demo 里叶子节点也带
         着与父节点相同的展开箭头。 -->
    <span class="cd-tree-option-expand-icon cd-tree-option-empty-icon" aria-hidden="true"></span>
  {/if}
{/snippet}

{#if ctx.renderFullLabel}
  {@render ctx.renderFullLabel({
    data: ctx.toOrig(node),
    level: flat.level,
    style: fullLabelStyle,
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
    // 对齐 Semi renderFullLabel + draggable 态 cloneElement 注入拖拽属性：本库无法在 snippet
    // 渲染结果之后再注入属性（Svelte 没有 cloneElement 等价能力），改为把 draggable 布尔值与
    // 拖拽事件回调都暴露给调用方，由调用方自己绑到根节点上（对齐普通渲染分支已有的写法）。
    draggable: ctx.draggable && !disabled,
    onDragStart: (e) => ctx.onNodeDragStart(node, e),
    onDragOver: (e) => ctx.onNodeDragOver(node, e),
    onDragLeave: (e) => ctx.onNodeDragLeave(node, e),
    onDrop: (e) => ctx.onNodeDrop(node, e),
    onDragEnd: (e) => ctx.onNodeDragEnd(node, e),
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
        <!-- 对齐 Semi renderArrow：无论 expandIcon 是 ReactNode 还是函数，cloneElement/回调
             入参都统一带上 `${prefixcls}-expand-icon` 这个 className——旋转由父级 collapsed
             态的 CSS 祖先选择器驱动（&-collapsed .expand-icon { transform: rotate(270deg) }），
             不区分图标内容。此前这层 span 没挂这个 class，导致自定义 expandIcon 完全不会
             旋转（未展开态该显示 > 却仍是传入的固定朝向）。 -->
        <span
          class="cd-tree-option-expand-icon"
          class:cd-tree-option-expand-icon-open={expanded}
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
    {:else if ctx.showLine}
      <!-- 叶子节点 + showLine：对齐 Semi renderArrow `showIcon = !isLeaf()` 后 `if (showLine)
           return this.renderSwitcher()`——只有开启 showLine 时叶子节点才画连接线（竖线延续 +
           横线拐角），未开 showLine 时是纯空白占位（走下面 else 分支）。
           cd-tree-option-tree-node-last-leaf：对齐 Semi &-tree-node-last-leaf 修饰符，同级最后
           一个叶子节点的竖线只延伸到行中点（配合横线形成 └─ 拐角），非最后一个则竖线贯穿全高
           形成 ├─。 -->
      <span
        class="cd-tree-option-expand-icon cd-tree-option-switcher-leaf-line"
        class:cd-tree-option-tree-node-last-leaf={flat.isLast}
        aria-hidden="true"
      ></span>
    {:else}
      <!-- 叶子节点，未开 showLine：对齐 Semi renderArrow 兜底 `<span className={empty-icon}/>`。 -->
      <span class="cd-tree-option-expand-icon cd-tree-option-empty-icon" aria-hidden="true"></span>
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

    {#if node.icon || ctx.icon || ctx.directory}
      {@const isLeaf = !expandable}
      <span
        class="cd-tree-option-item-icon"
        class:cd-tree-option-item-icon-directory={ctx.directory && !node.icon && !ctx.icon}
        aria-hidden="true"
      >
        {#if node.icon}
          <!-- 节点级 icon 优先（对齐 Semi renderIcon：data.icon 命中即返回） -->
          {@render (node.icon as Snippet)()}
        {:else if ctx.icon}
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
  /* :global() 包裹本行基础布局/状态修饰符规则：renderFullLabel 场景下 fullLabelClassName
     （含 cd-tree-option / cd-tree-option-selected / -disabled / -active）是拼成字符串
     传给调用方 snippet 的，实际渲染这个 class 的 DOM 元素在调用方（demo）组件内，不在
     本组件的 scoped CSS 作用域里——Svelte scoped hash 只打给模板内写死的元素，普通 scoped
     选择器打不到跨组件渲染的节点，导致 renderFullLabel demo 里整行 flex 布局、hover/选中/
     禁用态背景全部失效（真机复现：叶子分组勾选 demo 里 checkbox 与文字各自换行、层级散架）。
     :global() 让选择器不再依赖 scoped hash，对普通分支（本就在 scoped 作用域内）与
     renderFullLabel 跨作用域分支都能生效，互不影响。 */
  :global(.cd-tree-option) {
    display: flex;
    align-items: center;
    /* 不用 gap：对齐 Semi &-option 无 flex gap，间距全部靠各子元素自身 margin-right
       （expand-icon/checkbox/item-icon 均已有）。用 gap 时，level=0 根节点的 indent
       容器渲染 0 个 indent-unit（空但仍是 flex item），gap 依然在它与下一个兄弟
       之间生效，把 expand-icon 多推出 4px；而有缩进的行，第一个 indent-unit 在
       indent 容器内部，不受这个外层 gap 影响——两种情况下 expand-icon 的起始 x
       坐标产生 4px 系统性偏差，导致连接线在跨行衔接处出现横向错位（真机复现：
       parent-1 的连接线比同列 leaf-0-1 的连接线偏右 4px）。 */
    /* box-sizing:border-box + padding-top/bottom：查证 Semi tree.scss 第 20/32 行，
       li.semi-tree-option 本就同时声明 box-sizing:border-box 与
       padding-top/paddingBottom 4px（$spacing-tree_option-paddingTop/Bottom），
       非本库随手加的兜底。showLine 连接线 ::before 的
       top:calc(padding-top * -1) / bottom:calc(padding-bottom * -1) 依赖这层
       padding 才能把竖线从 padding-box 精确拉回 border-box 边界、与相邻行首尾相接；
       此前本库 .cd-tree-option 没有这层 padding，::before 拉出的 4px 直接侵入相邻
       行内部，造成本行竖线与相邻行竖线在交界处真实重叠 8px（真机测量验证：两行
       ::before 的 top/bottom 区间有 8px 交集），肉眼观感是竖线一段段颜色更深。 */
    box-sizing: border-box;
    height: var(--cd-tree-row-height);
    padding-top: var(--cd-spacing-tree-option-padding-top);
    padding-bottom: var(--cd-spacing-tree-option-padding-bottom);
    /* 首层左内边距 + 行右内边距（对齐 Semi $spacing-tree_option_level1-paddingLeft 8px） */
    padding-left: var(--cd-spacing-tree-option-level1-padding-left);
    padding-right: var(--cd-spacing-tree-option-level1-padding-left);
    border-radius: var(--cd-radius-tree-checkbox-addon);
    cursor: pointer;
    position: relative;
    transition: background-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  :global(.cd-tree-option:hover) {
    background: var(--cd-color-tree-option-bg-hover);
  }
  /* 按下态（对齐 Semi $color-tree_option_selected-bg-default = fill-1） */
  :global(.cd-tree-option:active) {
    background: var(--cd-color-tree-option-selected-bg-default);
  }
  :global(.cd-tree-option-selected) {
    color: var(--cd-color-tree-option-text-default);
    background: var(--cd-color-tree-option-bg-active);
  }
  :global(.cd-tree-option-selected:hover),
  :global(.cd-tree-option-selected:active) {
    background: var(--cd-color-tree-option-bg-active);
  }
  /* 键盘 roving 焦点（当前项）：对齐 Semi 无 border，仅用背景区分；焦点可见性靠背景差异。 */
  :global(.cd-tree-option-active:not(.cd-tree-option-selected)) {
    background: var(--cd-color-tree-option-bg-hover);
  }
  :global(.cd-tree-option-disabled) {
    color: var(--cd-color-tree-option-disabled-text-default);
    cursor: not-allowed;
  }
  :global(.cd-tree-option-disabled:hover) {
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
  /* inside：成为子节点 → 整行高亮框。:global() 包裹：cd-tree-option-drag-over 同样通过
     fullLabelClassName 字符串跨作用域传给 renderFullLabel 调用方渲染，理由同上方 .cd-tree-option
     基础布局规则的 :global() 说明。 */
  :global(.cd-tree-option-drag-over) {
    background: var(--cd-color-tree-option-bg-hover);
    box-shadow: inset 0 0 0 1px var(--cd-color-tree-option-draggable-insert-border-default);
  }
  /* renderFullLabel 场景的插入线（对齐 Semi &-fullLabel-draggable 组合选择器 border-top/bottom
     方案）：用户自定义渲染的根节点不保证有稳定的 position:relative 容器可画 ::after 绝对定位
     横线（普通分支 drag-over-gap-top/bottom 的实现方式），故改用实线边框，不依赖定位上下文。
     :global() 包裹：这几个 class 同样跨作用域，理由同上。 */
  :global(.cd-tree-option-fullLabel-draggable.cd-tree-option-fullLabel-drag-over-gap-top) {
    border-top: var(--cd-width-tree-option-draggable-border) solid
      var(--cd-color-tree-option-draggable-insert-border-default);
  }
  :global(.cd-tree-option-fullLabel-draggable.cd-tree-option-fullLabel-drag-over-gap-bottom) {
    border-bottom: var(--cd-width-tree-option-draggable-border) solid
      var(--cd-color-tree-option-draggable-insert-border-default);
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
  /* showLine 叶子节点连接线（对齐 Semi &-switcher-leaf-line）：两个伪元素叠加——
     ::before 竖线（贯穿本行上下，与祖先缩进列的竖线相接续），::after 横线（从竖线中点
     拐向文字），组合成 ├─ 效果；同级最后一个叶子节点竖线只延伸到中点（见下方
     -tree-node-last-leaf 修饰符），配合横线形成 └─ 收尾效果。 */
  .cd-tree-option-switcher-leaf-line {
    cursor: default;
    transform: none;
    z-index: 1;
    position: relative;
    /* 不设 width:100%：Semi 里这条规则的父级 &-switcher 是独立的固定宽度容器
       （$width-tree_emptyIcon 12px），100% 相对的是那 12px。本库没有这层容器，
       该 span 直接就是 .cd-tree-option-expand-icon 本身、处在整行 flex 布局里，
       width:100% 会相对整行宽度算，把 label 文字挤出可视区域（真机复现：文字消失）。
       宽度沿用 .cd-tree-option-expand-icon 已有的 width:12px（等价于 Semi 的
       emptyIcon 宽度）。

       但高度需要 align-self:stretch（对齐 Semi &-switcher 的 align-self:stretch）：
       Semi 的 switcher 容器没有显式 height，靠 stretch 撑满所在行的 content-box 高度
       （行高 28px 减去上下各 4px padding = 20px），::after 横线的 height:50% 正是
       相对这个拉伸后的高度算的（10px），而非 emptyIcon 自身的 12px。本库整行没有
       独立 padding 层，直接固定 32px 高度，故 stretch 撑满的就是这 32px（该 span
       所在的 flex 行本身，而非以图标 12px 为基准），横线高度公式（height:50%）
       才能算出与竖线正确衔接的位置。 */
    align-self: stretch;
    height: auto;
  }
  .cd-tree-option-switcher-leaf-line::before {
    content: '';
    position: absolute;
    top: calc(var(--cd-spacing-tree-option-padding-top) * -1);
    bottom: calc(var(--cd-spacing-tree-option-padding-bottom) * -1);
    left: calc(var(--cd-width-tree-empty-icon) / 2);
    border-right: var(--cd-width-tree-option-line) solid var(--cd-color-tree-option-line);
  }
  .cd-tree-option-switcher-leaf-line::after {
    content: '';
    display: block;
    box-sizing: border-box;
    position: absolute;
    /* top:0（非 auto/50%）：真机实测 Semi 官网 ::after 恒 top:0——横线画在容器上半段
       （从顶部到纵向中点），终点正好落在竖线贯穿路径的中点上，与 ::before 相接形成
       ├；last-leaf 态只截短 ::before 的 height 到中点，::after 的 top:0/height:50%
       不变，两者依然在同一中点会合，形成 └。此前遗漏 top 声明，伪元素退化用初始值，
       横线未能稳定落在容器上半段，与竖线错位。
       left + margin-left 两者叠加才是 Semi 真实值：真机实测 Semi 官网 ::after 的
       computed left 恒为 6px（emptyIcon 宽度一半，与 ::before 的 left 相同基准），
       margin-left 1px 是叠加在这 6px 之上，让横线可视起点落在竖线右侧贴合处
       （7px），不会向左穿过竖线。此前只写 margin-left（无 left，等价 left:0）会让
       横线从竖线左侧 1px 处起笔穿透竖线；只写 left:6px 又丢了竖线自身宽度的让位，
       会让横线压线 1px。两者必须都写。 */
    top: 0;
    left: calc(var(--cd-width-tree-empty-icon) / 2);
    width: calc(var(--cd-spacing-tree-option-level-padding-left) / 2 * 0.8);
    height: 50%;
    margin-left: var(--cd-width-tree-option-line);
    border-bottom: var(--cd-width-tree-option-line) solid var(--cd-color-tree-option-line);
  }
  .cd-tree-option-tree-node-last-leaf.cd-tree-option-switcher-leaf-line::before {
    height: calc(50% + var(--cd-spacing-tree-option-padding-top));
    bottom: auto;
  }
  /* 未开 showLine 的叶子节点：纯空白占位，无连接线（对齐 Semi renderArrow 兜底 empty-icon）。 */
  .cd-tree-option-empty-icon {
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
