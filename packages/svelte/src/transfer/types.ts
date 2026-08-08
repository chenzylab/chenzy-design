export interface TransferItem {
  key: string | number;
  label: string;
  disabled?: boolean;
  /** Optional group name; items sharing a group render under one group header. */
  group?: string;
  /** 完整路径（treeList + showPath 时右侧已选项的祖先路径，对齐 Semi fullPath）。 */
  fullPath?: { key: string | number; label: string }[];
}

/**
 * Grouped data source: each group renders a header + its items.
 * 字段名对齐 Semi `GroupItem`（`{ title, children }`）——分组子项用 `children`，
 * 与 `TransferTreeNode.children` 保持一致。
 */
export interface TransferGroup {
  /** Group title shown as the group header. */
  title: string;
  /** 该分组下的条目（对齐 Semi GroupItem.children）。 */
  children: TransferItem[];
}

/** A computed group used for rendering one panel side. */
export interface TransferRenderGroup {
  title: string;
  items: TransferItem[];
}

/**
 * Tree data source node (`treeList`): the source panel renders a tree. Checking a
 * parent conducts to all enabled leaf descendants; only leaf keys are migrated to
 * the target panel (which stays flat). A node with `children` is a parent.
 */
export interface TransferTreeNode {
  key: string | number;
  label: string;
  disabled?: boolean;
  children?: TransferTreeNode[];
}
