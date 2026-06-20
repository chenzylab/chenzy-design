/** Cascader 级联选择节点数据结构。 */
export interface CascaderNode {
  label: string;
  value: string | number;
  disabled?: boolean;
  children?: CascaderNode[];
  /** 标记为叶子节点（异步加载时：true 则不再触发 loadData） */
  isLeaf?: boolean;
}
