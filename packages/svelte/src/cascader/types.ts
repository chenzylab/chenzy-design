import type { Snippet } from 'svelte';

/** Cascader 级联选择节点数据结构。 */
export interface CascaderNode {
  /**
   * 展示文本（对齐 Semi CascaderData.label: ReactNode）。传 Snippet 时仅树节点渲染处生效，
   * 触发器回显文字/aria-label 等场景仍按字符串处理（与 Semi 行为一致：这些场景内部对 label
   * 直接 join/赋值，非字符串会得到非预期结果，需自行避免在这些链路上依赖富文本 label）。
   */
  label: string | Snippet;
  value: string | number;
  disabled?: boolean;
  children?: CascaderNode[];
  /** 标记为叶子节点（异步加载时：true 则不再触发 loadData） */
  isLeaf?: boolean;
  /** 其余透传字段（如自定义搜索用的纯文本字段，配合 treeNodeFilterProp 指定）。 */
  [key: string]: unknown;
}

/**
 * 对齐 Semi cascader/util.ts traverseDataNodes 生成的公开 Entity 类型
 * （displayRender 多选场景第一参数）：children/data/ind/key/level/parent/parentKey/
 * path/valuePath 逐字段对应（不含 Semi 内部实现细节 _notExist/pos，文档公开的 Entity
 * 类型本身也不含这两个字段）。
 */
export interface CascaderEntity {
  children?: CascaderEntity[];
  data: CascaderNode;
  ind: number;
  key: string;
  level: number;
  parent?: CascaderEntity;
  parentKey?: string;
  path: string[];
  valuePath: string[];
}
