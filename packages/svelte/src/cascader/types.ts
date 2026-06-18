/** Cascader 级联选择节点数据结构。 */
export interface CascaderNode {
  label: string;
  value: string | number;
  disabled?: boolean;
  children?: CascaderNode[];
}
