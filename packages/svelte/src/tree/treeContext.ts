import { getContext, setContext } from 'svelte';
import type { Snippet } from 'svelte';
import type { TreeKey, TreeNodeData } from '@chenzy-design/core';

/**
 * Tree 节点渲染共享上下文（对齐 Semi `treeContext.tsx` 的 `TreeContextValue`）。
 * Semi 用 React Context 把树级配置与事件回调下发给每个 TreeNode 实例；
 * 本库用 Svelte context 做等价下发，避免每行都重复透传十余个 prop。
 */
export interface TreeContextValue {
  treeDisabled: boolean;
  multiple: boolean;
  directory: boolean;
  showLine: boolean;
  labelEllipsis: boolean;
  draggable: boolean;
  filterTreeNode: boolean | ((input: string, node: string, data?: TreeNodeData) => boolean);
  isSearching: boolean;
  showFilteredOnly: boolean;
  dragOverNodeKey: TreeKey | null;
  dropPosition: -1 | 0 | 1 | null;
  renderLabel?: Snippet<[{ node: TreeNodeData; level: number; searchValue: string; selected: boolean; checked: boolean }]>;
  renderFullLabel?: Snippet<[unknown]>;
  icon?: Snippet<[{ node: TreeNodeData; expanded: boolean; isLeaf: boolean }]>;
  expandIcon?: Snippet<[{ node: TreeNodeData; expanded: boolean; loading: boolean }]>;
  suffix?: Snippet<[{ node: TreeNodeData }]>;
  dragGhost?: Snippet<[{ node: TreeNodeData }]>;
  onNodeClick: (node: TreeNodeData, e: MouseEvent) => void;
  onNodeExpand: (node: TreeNodeData, e: MouseEvent) => void;
  onNodeCheck: (node: TreeNodeData, e: MouseEvent) => void;
  onNodeSelect: (node: TreeNodeData) => void;
  onNodeRightClick: (node: TreeNodeData, e: MouseEvent) => void;
  onNodeDoubleClick: (node: TreeNodeData, e: MouseEvent) => void;
  onNodeDragStart: (node: TreeNodeData, e: DragEvent) => void;
  onNodeDragEnter: (node: TreeNodeData, e: DragEvent) => void;
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
