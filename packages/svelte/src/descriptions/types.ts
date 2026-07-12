import type { Snippet } from 'svelte';

/**
 * Descriptions 数据项，镜像 Semi `Data`：key/value/hidden/span/keyStyle。
 */
export interface DescriptionData {
  /** 键值（label）。 */
  key?: string;
  /** 属性值；字符串/数字直渲，Snippet 渲染富内容（对齐 Semi value?: () => ReactNode）。 */
  value?: unknown | Snippet;
  /** 该数据是否隐藏不展示。 */
  hidden?: boolean;
  /** 单元格跨越的列数（horizontal 布局下生效）。 */
  span?: number;
  /** key 的自定义样式（宽度、对齐等）。 */
  keyStyle?: string;
}
