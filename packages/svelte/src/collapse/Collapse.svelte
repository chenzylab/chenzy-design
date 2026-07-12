<!--
  Collapse — 对齐 Semi Design collapse（DOM / API / tokens 镜像）。
  用法：children 内写 <Collapse.Panel itemKey header>...</Collapse.Panel>（对齐 Semi 唯一用法）。
  父子状态经 context.ts 传递：父提供展开态派生 isActive + onClick 回调，子 Panel 消费判断
  自身展开/渲染与点击切换。

  红线遵守:
  #1 受控 activeKey 不回写 prop：isControlled = $derived(activeKey !== undefined)，
     内部 SvelteSet $state 兜底，activeSet = $derived(...)，变更只 onChange（子经 onClick 落实）。
  #2 展开状态用本地 SvelteSet $state，isActive 为纯派生函数，经 context 传给子 Panel 只读。
  #3 展开动画由子 Panel 的 <Collapsible> 原语负责（CSS grid / JS 测高），父不测 DOM。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { SvelteSet } from 'svelte/reactivity';
  import type { CollapseIconPosition } from './context.js';
  import { setCollapseContext } from './context.js';

  interface Props {
    /** 受控属性，当前展开的面板的 key。 */
    activeKey?: string | string[];
    /** 初始化选中面板的 key。 */
    defaultActiveKey?: string | string[];
    /** 手风琴模式，每次只允许展开一个面板。 */
    accordion?: boolean;
    /** 点击 Header 展开收起，否则只响应点击箭头（对齐 Semi，默认 true）。 */
    clickHeaderToExpand?: boolean;
    /** 自定义展开图标（未展开时显示），默认 IconChevronDown。 */
    expandIcon?: Snippet;
    /** 自定义折叠图标（展开时显示），默认 IconChevronUp。 */
    collapseIcon?: Snippet;
    /** 展开图标位置。 */
    expandIconPosition?: CollapseIconPosition;
    /** 是否保留隐藏的面板 DOM 树，默认销毁。 */
    keepDOM?: boolean;
    /** 是否开启动画。 */
    motion?: boolean;
    /** 配合 keepDOM 使用，为 true 时挂载时不会渲染组件。 */
    lazyRender?: boolean;
    /** 内联 CSS 样式。 */
    style?: string;
    /** 样式类名。 */
    class?: string;
    /** 切换面板的回调（activeKey 数组 + 触发事件）。 */
    onChange?: (activeKey: string[], event: MouseEvent) => void;
    /** 面板列表：内嵌 <Collapse.Panel>。 */
    children?: Snippet;
  }

  let {
    activeKey,
    defaultActiveKey,
    accordion = false,
    clickHeaderToExpand = true,
    expandIcon,
    collapseIcon,
    expandIconPosition = 'right',
    keepDOM = false,
    motion = true,
    lazyRender = false,
    style,
    class: className,
    onChange,
    children,
  }: Props = $props();

  function normalize(value: string | string[] | undefined): string[] {
    if (value === undefined || value === '') return [];
    return Array.isArray(value) ? value : [value];
  }

  // 初始展开集：对齐 Semi foundation.initActiveKey（accordion 只取首个）。
  function getInitialKeys(): SvelteSet<string> {
    const list = normalize(activeKey ?? defaultActiveKey);
    // accordion 只保留首个 key（对齐 Semi initActiveKey）。
    return new SvelteSet(accordion ? list.slice(0, 1) : list);
  }

  // 红线 #1: 受控判定 + 内部 SvelteSet 兜底。
  const isControlled = $derived(activeKey !== undefined);
  // 红线 #2: 本地 SvelteSet $state，纯派生 isActive。
  const innerKeys = $state<SvelteSet<string>>(getInitialKeys());

  // 受控时读 prop（归一化），非受控读本地 set。
  const activeSet = $derived<Set<string>>(
    isControlled ? new Set(normalize(activeKey)) : innerKeys,
  );

  function isActive(key: string): boolean {
    return activeSet.has(key);
  }

  // 对齐 Semi foundation.handleChange：toggle 该 key，accordion 时新集只含该 key。
  function onClick(key: string, event: MouseEvent): void {
    const next = new SvelteSet(activeSet);
    if (next.has(key)) {
      next.delete(key);
    } else if (accordion) {
      next.clear();
      next.add(key);
    } else {
      next.add(key);
    }
    const nextArr = [...next];
    // 红线 #1: 受控不回写 prop，仅 onChange；非受控更新本地 set。
    if (!isControlled) {
      innerKeys.clear();
      for (const k of nextArr) innerKeys.add(k);
    }
    onChange?.(nextArr, event);
  }

  const cls = $derived(['cd-collapse', className].filter(Boolean).join(' '));

  // 经 context 暴露给子 Panel：全部 getter / 纯派生函数（红线 #1#2 落实在父级）。
  setCollapseContext({
    isActive,
    onClick,
    getClickHeaderToExpand: () => clickHeaderToExpand,
    getKeepDOM: () => keepDOM,
    getMotion: () => motion,
    getLazyRender: () => lazyRender,
    getIconPosition: () => expandIconPosition,
    getExpandIcon: () => expandIcon,
    getCollapseIcon: () => collapseIcon,
  });
</script>

<div class={cls} {style}>
  {@render children?.()}
</div>

<style>
  /*
    对齐 Semi collapse.scss：.cd-collapse-item 用 border-bottom 分隔，
    .cd-collapse-* 各后代样式用 :global 包裹，覆盖 <Collapse.Panel> 在子组件作用域内
    渲染的结构（参考 Timeline）。token 直接消费原始层 --cd-*-collapse-*（无中间变量）。
  */
  .cd-collapse :global(.cd-collapse-item) {
    border-bottom: var(--cd-width-collapse-item-border) solid
      var(--cd-color-collapse-item-border-default);
  }

  .cd-collapse :global(.cd-collapse-header) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: var(--cd-spacing-collapse-header-marginy) var(--cd-spacing-collapse-header-marginx);
    padding: var(--cd-spacing-collapse-header-padding);
    border-radius: var(--cd-radius-collapse-header);
    outline: none;
    cursor: pointer;
    color: var(--cd-color-collapse-header-text-default);
    font-weight: var(--cd-font-collapse-header-fontweight);
    font-size: var(--cd-font-size-regular);
    line-height: var(--cd-line-height-regular);
  }
  .cd-collapse :global(.cd-collapse-header-right) {
    display: flex;
    align-items: center;
  }
  .cd-collapse :global(.cd-collapse-header-right > span) {
    display: flex;
    padding-right: var(--cd-spacing-collapse-right-paddingright);
  }
  .cd-collapse :global(.cd-collapse-header-right > span:last-child) {
    padding-right: 0;
  }
  .cd-collapse :global(.cd-collapse-header-icon) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--cd-size-collapse-icon-default);
    height: var(--cd-size-collapse-icon-default);
    /* 图标 SVG 以 1em 撑满容器（对齐 Semi $width-icon-medium 16px 图标位）。 */
    font-size: var(--cd-size-collapse-icon-default);
    color: var(--cd-color-collapse-header-icon-default);
  }
  .cd-collapse :global(.cd-collapse-header-icon svg) {
    display: block;
  }
  .cd-collapse :global(.cd-collapse-header-iconLeft) {
    justify-content: flex-start;
  }
  .cd-collapse :global(.cd-collapse-header-iconLeft .cd-collapse-header-icon) {
    margin-right: var(--cd-spacing-collapse-header-iconleft-marginright);
  }
  .cd-collapse :global(.cd-collapse-header-iconDisabled) {
    color: var(--cd-color-disabled-text);
  }
  .cd-collapse :global(.cd-collapse-header:hover) {
    background-color: var(--cd-color-collapse-header-bg-hover);
  }
  .cd-collapse :global(.cd-collapse-header:active) {
    background-color: var(--cd-color-collapse-header-bg-active);
  }
  .cd-collapse :global(.cd-collapse-header:focus-visible) {
    box-shadow: var(--cd-focus-ring);
  }
  .cd-collapse :global(.cd-collapse-header-disabled) {
    color: var(--cd-color-collapse-header-text-disabled);
    cursor: not-allowed;
  }
  .cd-collapse :global(.cd-collapse-header-disabled:hover) {
    background-color: transparent;
  }

  .cd-collapse :global(.cd-collapse-content) {
    padding: var(--cd-spacing-collapse-content-paddingtop)
      var(--cd-spacing-collapse-content-paddingright)
      var(--cd-spacing-collapse-content-paddingbottom)
      var(--cd-spacing-collapse-content-paddingleft);
    color: var(--cd-color-collapse-content-text-default);
    font-size: var(--cd-font-size-regular);
    line-height: var(--cd-line-height-regular);
  }
  .cd-collapse :global(.cd-collapse-content p) {
    margin: 0;
  }
</style>
