export interface TimelineItemData {
  key?: string;
  content: string;
  time?: string;
  color?: string;
  dotColor?: string;
  /** interactive 模式下按 Enter/Space 或点击该节点触发（非 interactive 时忽略）。 */
  onClick?: () => void;
}
