<!--
  Item — Cascader 面板内容渲染子组件（对齐 Semi cascader/item.tsx 的职责边界）。
  纯内部实现细节：只被 Cascader.svelte import 使用，不在 cascader/index.ts 或
  packages/svelte/src/index.ts 导出（同 breadcrumb/Item.svelte 撞名但语义不同——
  那个是对外可组合子组件，这个不是）。

  职责（对应 Semi Item.render）：渲染整个 `.cd-cascader-option-lists`——
  - 非搜索：树状多列渲染（各列 <ul role=listbox>，逐节点 li role=option）
  - 搜索：扁平路径结果渲染（非 virtualize：<ul> 直接 each；virtualize：VirtualList）
  - 空态（列为空 / 搜索无命中）
  - 点击 / hover 展开 / checkbox 勾选交互：接回调，不持有选中/展开状态

  状态所有权边界：activePath/kbCol/kbValue/kbFlatIndex/columns/filteredPaths 等
  键盘导航与选中状态，连同 isActiveAt/isKbActive/canExpand/isLoading/nodeCheck/
  scheduleHoverExpand/selectNode/selectFlatPath 等派生逻辑，仍是 Cascader.svelte
  的职责（onPanelKeydown/onFlatKeydown 等键盘状态机同样要读这些），Item 只接收
  「本次渲染需要的数据 + 状态查询回调 + 交互回调」，不复制/不持有这些状态
  ——这正是 Semi Item 拿 activeKeys/selectedKeys 等 Set 加 onItemClick 等回调、
  而非自己算选中态的同构设计。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { IconChevronRight, IconTick, IconSpin } from '@chenzy-design/icons';
  import Checkbox from '../checkbox/Checkbox.svelte';
  import { VirtualList } from '../virtual-list/index.js';
  import type { CascaderNode } from './types.js';

  type Key = string | number;

  interface FlatPath {
    values: Key[];
    labels: string[];
    labelNodes: (string | Snippet)[];
    nodes: CascaderNode[];
    isLeaf: boolean;
    disabled: boolean;
  }
  type PathPart = { kind: 'text'; text: string; mark: boolean } | { kind: 'snippet'; snippet: Snippet } | { kind: 'sep' };

  interface FilterRenderArg {
    path: FlatPath;
    data: CascaderNode[];
    inputValue: string;
    disabled: boolean;
    className: string;
    selected: boolean;
    onClick: () => void;
    onCheck: () => void;
    checkStatus: { checked: boolean; halfChecked: boolean };
  }

  interface Props {
    /** 是否搜索态（对齐 Semi searchable：true 时渲染扁平结果，否则渲染树状多列） */
    searchActive: boolean;
    /** 组件级禁用（叠加节点自身 disabled，供多选 Checkbox 使用） */
    disabled: boolean;
    /** 非搜索：树状多列数据（各列节点数组） */
    columns: CascaderNode[][];
    /** 搜索：扁平路径命中结果 */
    filteredPaths: FlatPath[];
    /** 是否多选（决定是否渲染 checkbox） */
    multiple: boolean;
    /** 搜索关键字（filterRender 透传 inputValue、单选 selected 判定用） */
    searchValue: string;
    /** 当前单选路径（判定扁平结果 selected） */
    currentValue: Key[];
    /** 分隔符（拼接 label 面包屑） */
    separator: string;
    /** 空态文案（emptyContent 为 string 或缺省时的兜底文案） */
    emptyText: string;
    /** 空态自定义 Snippet（emptyContent 为函数时） */
    emptySnippet?: Snippet | undefined;
    /** emptyContent === null 时完全不渲染空态 UI（对齐 Semi item.tsx renderEmpty） */
    hideEmpty: boolean;
    /** 搜索结果虚拟滚动配置（对齐 Semi virtualizeInSearch） */
    virtualizeInSearch?: { height: number; width: number; itemSize: number } | undefined;
    /** 自定义搜索结果项渲染（对齐 Semi filterRender） */
    filterRender?: Snippet<[FilterRenderArg]> | undefined;
    /** 自定义列项展开图标（对齐 Semi expandIcon） */
    expandIcon?: Snippet | undefined;
    /** 列表 / 扁平结果容器 id（供触发器 aria-controls 引用） */
    listId: string;
    flatListId: string;
    /** 可访问名文案（已由父级 i18n 解析好，Item 不直接依赖 locale） */
    columnLabel: (level: number) => string;
    searchResultsLabel: string;
    loadingLabel: string;
    /** id 生成（供 aria-activedescendant 指向） */
    colItemId: (colIndex: number, value: Key) => string;
    flatItemId: (values: Key[]) => string;
    /** 该列节点的父节点 id（对齐 Semi aria-owns：非首列时子项指向其父项 id） */
    columnParentId: (colIndex: number) => string | undefined;
    /** 命中文本高亮拆分（搜索态，逐条 label 节点处理，Snippet 项原样保留） */
    highlightPathParts: (labelNodes: (string | Snippet)[]) => PathPart[];

    // --- 状态查询回调（对齐 Semi activeKeys/selectedKeys/loadedKeys/loadingKeys 派生判断） ---
    isActiveAt: (colIndex: number, node: CascaderNode) => boolean;
    isKbActive: (colIndex: number, node: CascaderNode) => boolean;
    isSelectedLeaf: (colIndex: number, node: CascaderNode) => boolean;
    isFlatActive: (flatIndex: number) => boolean;
    canExpand: (node: CascaderNode) => boolean;
    isLoading: (node: CascaderNode) => boolean;
    nodeCheck: (node: CascaderNode) => { checked: boolean; half: boolean };
    checkStatusOfLeaf: (leafValue: Key) => { checked: boolean; halfChecked: boolean };
    isFlatSelected: (p: FlatPath) => boolean;

    // --- 交互回调（对齐 Semi onItemClick/onItemHover/onItemCheckboxClick/onListScroll） ---
    onSelectNode: (colIndex: number, node: CascaderNode) => void;
    onToggleCheckNode: (node: CascaderNode, colIndex: number) => void;
    onHoverExpand: (colIndex: number, node: CascaderNode) => void;
    onHoverLeave: () => void;
    onSelectFlatPath: (p: FlatPath) => void;
    onListScroll: (e: Event, colIndex: number) => void;
  }

  let {
    searchActive,
    disabled,
    columns,
    filteredPaths,
    multiple,
    searchValue,
    currentValue,
    separator,
    emptyText,
    emptySnippet,
    hideEmpty,
    virtualizeInSearch,
    filterRender,
    expandIcon,
    listId,
    flatListId,
    columnLabel,
    searchResultsLabel,
    loadingLabel,
    colItemId,
    flatItemId,
    columnParentId,
    highlightPathParts,
    isActiveAt,
    isKbActive,
    isSelectedLeaf,
    isFlatActive,
    canExpand,
    isLoading,
    nodeCheck,
    checkStatusOfLeaf,
    isFlatSelected,
    onSelectNode,
    onToggleCheckNode,
    onHoverExpand,
    onHoverLeave,
    onSelectFlatPath,
    onListScroll,
  }: Props = $props();
</script>

<!-- 单条搜索结果项：virtualize 与非 virtualize 两路共用同一渲染，行为一致 -->
{#snippet flatOption(p: FlatPath, fi: number)}
  <!-- 键盘经搜索框 aria-activedescendant 漫游管理，选项 tabindex=-1 click-only -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  {#if filterRender}
    <!-- 对齐 Semi item.tsx renderFlattenOptionItem：`className = cls(prefixcls,
         { flatten: true && !filterRender, ... })`——有 filterRender 时 flatten
         修饰符不加，且用 React.cloneElement 直接替换成用户节点（不是包裹在
         <li> 里）。.cd-cascader-option-flatten 是独立类选择器（自带
         padding-right），.cd-cascader-option 的 padding-top/bottom 挂在
         `ul > li` 标签选择器上——两者任一残留都会跟用户在 filterRender 里
         自己设置的 padding 叠加，虚拟化 itemSize 固定高度下把内容压挤变形。
         故此处不渲染 <li> 外壳，className 也不带这两个类。 -->
    {@const leaf = p.values[p.values.length - 1] as Key}
    {@render filterRender({
      path: p,
      data: p.nodes,
      inputValue: searchValue,
      disabled: p.disabled,
      className: 'cd-cascader-option',
      selected: isFlatSelected(p),
      onClick: () => onSelectFlatPath(p),
      onCheck: () => onSelectFlatPath(p),
      checkStatus: checkStatusOfLeaf(leaf),
    })}
  {:else}
    <li
      id={flatItemId(p.values)}
      class="cd-cascader-option cd-cascader-option-flatten"
      class:cd-cascader-option-active={isFlatActive(fi)}
      role="menuitem"
      aria-disabled={p.disabled || undefined}
      onclick={() => onSelectFlatPath(p)}
      tabindex={-1}
    >
      <span class="cd-cascader-option-label">
        {#each highlightPathParts(p.labelNodes) as part, i (i)}
          {#if part.kind === 'sep'}{separator}{:else if part.kind === 'snippet'}{@render part.snippet()}{:else if part.mark}<span class="cd-cascader-option-label-highlight">{part.text}</span>{:else}{part.text}{/if}
        {/each}
      </span>
    </li>
  {/if}
{/snippet}

{#if searchActive}
  {#if virtualizeInSearch && filteredPaths.length > 0}
    <!-- 搜索结果虚拟滚动：仅在传入 virtualizeInSearch 且有命中时启用 -->
    <div
      class="cd-cascader-option-lists cd-cascader-flatten"
      id={flatListId}
      aria-label={searchResultsLabel}
      style:inline-size="{virtualizeInSearch.width}px"
    >
      <VirtualList
        data={filteredPaths}
        getKey={(p: FlatPath) => p.values.join('/')}
        itemSize={virtualizeInSearch.itemSize}
        height={virtualizeInSearch.height}
      >
        {#snippet renderItem(p: FlatPath, fi: number)}
          {@render flatOption(p, fi)}
        {/snippet}
      </VirtualList>
    </div>
  {:else}
    <ul
      class={['cd-cascader-option-lists', 'cd-cascader-flatten', filteredPaths.length === 0 && 'cd-cascader-option-lists-empty'].filter(Boolean).join(' ')}
      id={flatListId}
      aria-label={searchResultsLabel}
    >
      {#if filteredPaths.length === 0}
        {#if !hideEmpty}
          {#if emptySnippet}
            <li class="cd-cascader-option-empty">{@render emptySnippet()}</li>
          {:else}
            <li class="cd-cascader-option-empty">{emptyText}</li>
          {/if}
        {/if}
      {:else}
        {#each filteredPaths as p, fi (p.values.join('/'))}
          {@render flatOption(p, fi)}
        {/each}
      {/if}
    </ul>
  {/if}
{:else}
  <div class={['cd-cascader-option-lists', (columns[0]?.length ?? 0) === 0 && 'cd-cascader-option-lists-empty'].filter(Boolean).join(' ')}>
    {#each columns as column, colIndex (colIndex)}
      <ul
        class="cd-cascader-option-list"
        role="menu"
        aria-label={columnLabel(colIndex + 1)}
        onscroll={(e) => onListScroll(e, colIndex)}
      >
        {#if column.length === 0 && !hideEmpty}
          {#if emptySnippet}
            <li class="cd-cascader-option-empty">{@render emptySnippet()}</li>
          {:else}
            <li class="cd-cascader-option-empty">{emptyText}</li>
          {/if}
        {/if}
        {#each column as node (node.value)}
          {@const cs = multiple ? nodeCheck(node) : { checked: false, half: false }}
          <!-- 键盘经触发器 aria-activedescendant 漫游管理，选项 tabindex=-1 click-only -->
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <li
            id={colItemId(colIndex, node.value)}
            class="cd-cascader-option"
            class:cd-cascader-option-active={isActiveAt(colIndex, node)}
            class:cd-cascader-option-kbactive={isKbActive(colIndex, node)}
            class:cd-cascader-option-select={isSelectedLeaf(colIndex, node)}
            class:cd-cascader-option-disabled={node.disabled}
            role="menuitem"
            aria-expanded={isActiveAt(colIndex, node)}
            aria-haspopup={canExpand(node) || undefined}
            aria-disabled={node.disabled || undefined}
            aria-owns={columnParentId(colIndex)}
            onclick={() => onSelectNode(colIndex, node)}
            onpointerenter={() => onHoverExpand(colIndex, node)}
            onpointerleave={onHoverLeave}
            tabindex={-1}
          >
            <span class="cd-cascader-option-label">
              {#if !multiple}
                <!-- 单选：选中态 tick / 未选中 empty 占位二选一必渲染（对齐 Semi renderIcon('tick'|'empty')，
                     保证两态左侧文字起始位置一致，non-selected 也占据同样宽度）。 -->
                {#if isSelectedLeaf(colIndex, node)}
                  <span class="cd-cascader-option-icon cd-cascader-option-icon-active" aria-hidden="true">
                    <IconTick aria-hidden="true" />
                  </span>
                {:else}
                  <span class="cd-cascader-option-icon cd-cascader-option-icon-empty" aria-hidden="true"></span>
                {/if}
              {/if}
              {#if multiple}
                <!-- 复用已对齐的 Checkbox：勾选由其 onChange 驱动 toggleCheckNode；
                     stopPropagation 阻止冒泡到 li（否则 onSelectNode 会二次触发）。 -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <span
                  class="cd-cascader-option-label-checkbox"
                  onclick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={cs.checked}
                    indeterminate={cs.half}
                    disabled={node.disabled || disabled}
                    {...typeof node.label === 'string' ? { 'aria-label': node.label } : {}}
                    onChange={() => onToggleCheckNode(node, colIndex)}
                  />
                </span>
              {/if}
              {#if typeof node.label === 'function'}
                {@render (node.label as Snippet)()}
              {:else}
                {node.label}
              {/if}
            </span>
            {#if isLoading(node)}
              <span class="cd-cascader-option-icon cd-cascader-option-spin-icon cd-cascader-option-icon-left" aria-label={loadingLabel}>
                <IconSpin aria-hidden="true" />
              </span>
            {:else if canExpand(node)}
              <span class="cd-cascader-option-icon cd-cascader-option-icon-left" aria-hidden="true">
                {#if expandIcon}{@render expandIcon()}{:else}<IconChevronRight aria-hidden="true" />{/if}
              </span>
            {/if}
          </li>
        {/each}
      </ul>
    {/each}
  </div>
{/if}

<style>
  /* 各级菜单列容器：横向排列（对齐 Semi height:$height-cascader_option_list 固定高度，
     非 max-height；数值/token 名与 Semi $height-cascader_option_list 逐一对应）。 */
  .cd-cascader-option-lists {
    display: flex;
    overflow: hidden;
    margin: 0;
    padding: 0;
    height: var(--cd-height-cascader-option-list);
  }
  /* 空态：容器收缩为内容自适应高度并居中（对齐 Semi &-lists-empty，非固定 180px）。 */
  .cd-cascader-option-lists-empty {
    height: auto;
    justify-content: center;
    cursor: not-allowed;
  }
  /* 搜索结果扁平列表：单列纵向滚动 */
  .cd-cascader-option-lists.cd-cascader-flatten {
    display: block;
    padding-top: var(--cd-spacing-extra-tight);
    padding-bottom: var(--cd-spacing-extra-tight);
    list-style: none;
    min-width: var(--cd-cascader-column-width);
    overflow-y: auto;
  }
  .cd-cascader-option-list {
    /* 对齐 Semi display:inline-block + min-width（非 flex item + width）：
       inline-block 不参与父级 flex 压缩逻辑，min-width 是下限——列数一多容器才会
       真正溢出触发 .cd-cascader-option-lists 的 overflow-x:auto 横向滚动，
       而不是让 flex-shrink 把每列越挤越窄。height:100% 继承父容器固定高度。 */
    box-sizing: border-box;
    display: inline-block;
    min-width: var(--cd-cascader-column-width);
    height: 100%;
    margin: 0;
    padding-top: var(--cd-spacing-cascader-option-list-padding-y);
    padding-bottom: var(--cd-spacing-cascader-option-list-padding-y);
    padding-left: var(--cd-spacing-cascader-option-list-padding-x);
    padding-right: var(--cd-spacing-cascader-option-list-padding-x);
    overflow: auto;
    list-style: none;
    border-left: 1px solid var(--cd-cascader-column-border);
  }
  .cd-cascader-option-list:first-child {
    border-left: none;
  }
  .cd-cascader-option-empty {
    padding: var(--cd-spacing-cascader-option-empty-padding-y) var(--cd-spacing-cascader-option-empty-padding-x);
    color: var(--cd-color-cascader-option-empty-text-default);
    border-radius: var(--cd-radius-cascader-option-empty);
    margin: 0;
    text-align: center;
    cursor: not-allowed;
  }
  .cd-cascader-option-empty:hover {
    background-color: transparent;
  }
  /* 对齐 Semi .semi-cascader-option：Semi 是全局 CSS，这个类名本身就是完整样式
     契约，不管元素渲染在哪里、由谁渲染都生效。本库 Svelte scoped 样式默认只对
     当前组件模板渲染的元素生效——而 filterRender 场景下 className 会被原样传给
     调用方（demo）渲染的外部节点，不带 Item.svelte 的 scoped 哈希类，scoped 规则
     选不中它，必须 :global() 让这份样式跨组件边界生效，才是同一套实现逻辑而非
     恰好效果相似。 */
  :global(.cd-cascader-option) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    /* 无 gap（对齐 Semi .semi-cascader-option：无 gap 声明，label/icon 间距靠
       $spacing-cascader_icon-marginX 等各自 margin，非父级 gap）。filterRender
       场景下用户自己在 checkbox 上设 margin-right 控制间距（demo 8px），若父级再叠
       一层 gap 会让 checkbox 与文字间距变成 margin+gap 双倍叠加，比 Semi 更宽。 */
    color: var(--cd-color-cascader-option-main-text-default);
    cursor: pointer;
    /* 无过渡（对齐 Semi $transition_duration-cascader_option-bg 实际解析值为
       --semi-transition_duration-none=0，hover/active 背景色瞬时切换，非渐变）。 */
    /* 对齐 Semi `.semi-cascader-option { @include font-size-regular }`（14px/20px，
       非全局默认 16px/24px）：面板容器未单独声明字号时靠继承，虚拟化 filterRender
       场景下 padding(8+8) + 继承来的 24px 行高 = 40px，超出 itemSize:36 的虚拟行
       容器高度，内容被裁切/溢出错位——必须在这里钉死字号才与 Semi 8+8+20=36 对齐。 */
    font-size: var(--cd-font-size-regular);
    line-height: var(--cd-line-height-regular);
  }
  /* min-height + padding 都只在真正的 <li> 上生效（对齐 Semi `ul > li` 标签选择器）：
     min-height 是本库自己补的默认态下限，Semi .semi-cascader-option 本身没有声明
     （纯靠 padding + 内容行高自然撑开）；padding 同理对齐 Semi `ul > li { padding-top/... }`。
     filterRender 场景把这个类名原样透传给用户自定义的根节点（可能是 <div>），这两条都
     不该命中——否则会跟用户自己设置的高度/padding 叠加，虚拟化 itemSize 固定行高下
     把内容撑爆溢出（min-height 配合内容行高可把实际渲染高度顶到 40px，超出
     itemSize:36 的虚拟行容器）或压挤变形（padding 叠加）。 */
  li:global(.cd-cascader-option) {
    min-height: var(--cd-tree-node-height);
    padding-top: var(--cd-spacing-cascader-option-padding-top);
    padding-bottom: var(--cd-spacing-cascader-option-padding-bottom);
    padding-left: var(--cd-spacing-cascader-option-padding-left);
    padding-right: var(--cd-spacing-cascader-option-padding-right);
  }
  /* 搜索结果扁平列表项：右侧留白容纳层级面包屑（对齐 Semi &-flatten，同样只在
     真正的 <li> 上生效，理由同上）。 */
  li:global(.cd-cascader-option-flatten) {
    padding-right: var(--cd-spacing-cascader-flatten-list-padding-right);
  }
  :global(.cd-cascader-option:hover) {
    background: var(--cd-color-cascader-option-bg-hover);
  }
  :global(.cd-cascader-option:active) {
    background: var(--cd-color-cascader-option-bg-active);
  }
  /* 命中项（当前路径 active）：primary-light 底色，对齐 Semi option-bg-selected */
  .cd-cascader-option-active,
  .cd-cascader-option-active:hover {
    background: var(--cd-color-cascader-option-bg-selected);
  }
  /* 键盘 roving 高亮（aria-activedescendant 当前项），焦点环不依赖真实 DOM 焦点 */
  .cd-cascader-option-kbactive {
    box-shadow: var(--cd-focus-ring);
  }
  /* 选中叶子 / 搜索命中高亮文字：字重加粗 + primary 色 */
  .cd-cascader-option-select .cd-cascader-option-label,
  .cd-cascader-option-label-highlight {
    font-weight: var(--cd-font-cascader-select-fontweight);
    color: var(--cd-color-cascader-select-highlight);
  }
  :global(.cd-cascader-option:focus-visible) {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-cascader-option-disabled {
    color: var(--cd-color-cascader-option-disabled-text-default);
    cursor: not-allowed;
  }
  .cd-cascader-option-disabled:hover,
  .cd-cascader-option-disabled:active {
    background: transparent;
  }
  .cd-cascader-option-disabled .cd-cascader-option-label {
    color: var(--cd-color-cascader-option-disabled-text-default);
  }
  .cd-cascader-option-label {
    display: flex;
    align-items: center;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    flex: 1 1 auto;
  }
  .cd-cascader-option-label-checkbox {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
    margin-right: var(--cd-spacing-tight);
  }
  .cd-cascader-option-icon {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
    width: var(--cd-width-cascader-option-icon);
    color: var(--cd-color-cascader-option-icon-default);
  }
  /* 单选 tick（选中）/ empty（未选中占位）：右边距分隔与文字（对齐 Semi
     &-icon-active/&-icon-empty 共用 $spacing-cascader_empty_icon-marginRight）。 */
  .cd-cascader-option-icon-active,
  .cd-cascader-option-icon-empty {
    margin-right: var(--cd-spacing-cascader-empty-icon-margin-right);
  }
  /* 展开箭头 / loading：左边距分隔与文字（对齐 Semi &-icon-left
     $spacing-cascader_option-icon-marginLeft，tick/empty 不带此边距）。 */
  .cd-cascader-option-icon-left {
    margin-left: var(--cd-spacing-cascader-option-icon-margin-left);
  }
  .cd-cascader-option-spin-icon :global(svg) {
    animation: cd-cascader-spin 0.7s linear infinite;
  }
  @keyframes cd-cascader-spin {
    to {
      transform: rotate(360deg);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-cascader-option-spin-icon :global(svg) {
      animation: none;
    }
  }

  /* —— RTL（对齐 Semi cascader/rtl.scss，`.semi-rtl .semi-cascader { direction: rtl }` 作用域下
     手写镜像覆盖物理属性）。本库 RTL 触发机制是 `:global(.cd-rtl) .cd-<comp>`（非 [dir=rtl]/:dir()，
     ConfigProvider 只挂 class 不设 dir 属性，见 scripts/check-rtl-scope.mjs）。 */
  /* checkbox 右外边距改左外边距（Semi rtl.scss L58-64） */
  :global(.cd-rtl) .cd-cascader-option-label-checkbox {
    margin-right: 0;
    margin-left: var(--cd-spacing-tight);
  }
  /* 各级菜单列分割线：左边框改右边框，首列改右侧无边框（Semi rtl.scss L77-84，
     本库列表本身不额外挂 -rtl 修饰类，直接在 .cd-rtl 作用域下镜像即可，效果等价）。 */
  :global(.cd-rtl) .cd-cascader-option-list {
    border-left: none;
    border-right: 1px solid var(--cd-cascader-column-border);
  }
  :global(.cd-rtl) .cd-cascader-option-list:first-child {
    border-right: none;
  }
  /* 搜索结果扁平列表项：右侧留白改左侧留白（Semi rtl.scss L95-98） */
  :global(.cd-rtl) .cd-cascader-option-flatten {
    padding-right: 0;
    padding-left: var(--cd-spacing-cascader-flatten-list-padding-right);
  }
  /* tick/empty 图标：右边距改左边距（Semi rtl.scss L86-92，仅对调不翻转）。 */
  :global(.cd-rtl) .cd-cascader-option-icon-active,
  :global(.cd-rtl) .cd-cascader-option-icon-empty {
    margin-right: 0;
    margin-left: var(--cd-spacing-cascader-empty-icon-margin-right);
  }
  /* 展开箭头（含 loading）图标：左边距改右边距 + 镜像翻转（Semi rtl.scss L94-98，
     仅 chevron_right 本体做 scaleX(-1)，tick/empty/spin 均不翻转）。 */
  :global(.cd-rtl) .cd-cascader-option-icon-left {
    margin-left: 0;
    margin-right: var(--cd-spacing-cascader-option-icon-margin-left);
  }
  /* 仅翻转展开箭头本体（Semi 只对 chevron_right 做镜像，loading spin 不翻转）。 */
  :global(.cd-rtl) .cd-cascader-option-icon-left:not(.cd-cascader-option-spin-icon) :global(svg) {
    transform: scaleX(-1);
  }
</style>
