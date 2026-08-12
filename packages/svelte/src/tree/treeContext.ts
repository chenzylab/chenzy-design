import { getContext, setContext } from 'svelte';
import type { Snippet } from 'svelte';
import type { TreeKey, TreeNodeData } from '@chenzy-design/core';

/**
 * Tree 节点渲染共享上下文（对齐 Semi `treeContext.tsx` 的 `TreeContextValue`）。
 * Semi 用 React Context 把树级配置与事件回调下发给每个 TreeNode 实例；
 * 本库用 Svelte context 做等价下发，避免每行都重复透传十余个 prop。
 */
/** renderFullLabel 整行接管渲染的上下文（对齐 Semi `renderFullLabelProps`）。 */
export interface FullLabelContext {
  /** 节点数据（自定义 keyMaps 时为原始节点） */
  data: TreeNodeData;
  /** 层级，从 0 开始 */
  level: number;
  /** 虚拟化时必须赋给渲染 DOM 的定位样式（否则行错位） */
  style: string | undefined;
  /** 内置样式类名（含缩进/选中/禁用等状态类） */
  className: string;
  /**
   * 内置展开图标 snippet（对齐 Semi `expandIcon: this.renderArrow()`，已渲染好的节点）。
   * 用法：`{@render ctx.expandIcon(ctx.expandStatus)}`（传入展开态以渲染正确朝向）。
   */
  expandIcon: Snippet<[{ expanded: boolean; loading: boolean }]>;
  /** 是否叶子节点 */
  isLeaf: boolean;
  /** 选中状态 */
  checkStatus: { checked: boolean; halfChecked: boolean };
  /** 展开状态 */
  expandStatus: { expanded: boolean; loading: boolean };
  /** 该节点是否命中当前搜索 */
  filtered: boolean;
  /** 当前搜索框输入值 */
  searchWord: string;
  /** 单选/行点击回调 */
  onClick: (e: MouseEvent) => void;
  /** 勾选回调 */
  onCheck: (e: MouseEvent) => void;
  /** 展开/收起回调 */
  onExpand: (e: MouseEvent) => void;
  /** 右键回调 */
  onContextMenu: (e: MouseEvent) => void;
  /** 双击回调 */
  onDoubleClick: (e: MouseEvent) => void;
}

export interface TreeContextValue {
  multiple: boolean;
  directory: boolean;
  showLine: boolean;
  blockNode: boolean;
  draggable: boolean;
  /** 是否需要监听双击（对齐 Semi：用户传了 onDoubleClick 或 expandAction==='doubleClick'）。 */
  wantsDoubleClick: boolean;
  /** 是否需要监听右键（对齐 Semi：用户传了 onContextMenu 才挂监听）。 */
  wantsContextMenu: boolean;
  renderLabel: Snippet<[{ node: TreeNodeData; level: number; searchValue: string; selected: boolean; checked: boolean }]> | undefined;
  renderFullLabel: Snippet<[FullLabelContext]> | undefined;
  /** keyMaps 归一化节点 → 用户原始节点（对齐 Semi 回调回传原始数据）。 */
  toOrig: (node: TreeNodeData) => TreeNodeData;
  icon: Snippet<[{ node: TreeNodeData; expanded: boolean; isLeaf: boolean }]> | undefined;
  expandIcon: Snippet<[{ node: TreeNodeData; expanded: boolean; loading: boolean }]> | undefined;
  suffix: Snippet<[{ node: TreeNodeData }]> | undefined;
  dragGhost: Snippet<[{ node: TreeNodeData }]> | undefined;
  onNodeClick: (node: TreeNodeData, e: MouseEvent) => void;
  onNodeExpand: (node: TreeNodeData, e: MouseEvent) => void;
  onNodeCheck: (node: TreeNodeData) => void;
  onNodeRightClick: (node: TreeNodeData, e: MouseEvent) => void;
  onNodeDoubleClick: (node: TreeNodeData, e: MouseEvent) => void;
  onNodeDragStart: (node: TreeNodeData, e: DragEvent) => void;
  onNodeDragOver: (node: TreeNodeData, e: DragEvent) => void;
  onNodeDragLeave: (node: TreeNodeData, e: DragEvent) => void;
  onNodeDragEnd: (node: TreeNodeData, e: DragEvent) => void;
  onNodeDrop: (node: TreeNodeData, e: DragEvent) => void;
}

const KEY = Symbol('cd-tree-context');

export function setTreeContext(ctx: TreeContextValue): void {
  setContext(KEY, ctx);
}

export function getTreeContext(): TreeContextValue {
  const ctx = getContext<TreeContextValue | undefined>(KEY);
  if (!ctx) {
    throw new Error('TreeNode must be rendered inside a Tree context provider');
  }
  return ctx;
}
