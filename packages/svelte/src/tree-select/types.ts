/** TreeSelect 节点键类型。 */
export type TreeKey = string | number;

/** TreeSelect 树形节点数据结构。 */
export interface TreeNode {
  key: TreeKey;
  label: string;
  disabled?: boolean;
  isLeaf?: boolean;
  /** 节点图标（渲染在 label 前，对齐 Semi 由节点数据 icon 字段驱动，无组件级开关）。 */
  icon?: string;
  children?: TreeNode[];
}
