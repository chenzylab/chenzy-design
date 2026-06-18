/** TreeSelect 节点键类型。 */
export type TreeKey = string | number;

/** TreeSelect 树形节点数据结构。 */
export interface TreeNode {
  key: TreeKey;
  label: string;
  disabled?: boolean;
  isLeaf?: boolean;
  children?: TreeNode[];
}
