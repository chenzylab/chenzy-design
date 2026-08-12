/**
 * Tree 渲染层小工具（对齐 Semi `treeUtil.tsx`）。
 * Semi 版本仅含 `cloneDeep`（虚拟化行数据快照用，规避引用变化误判 diff）；
 * 本库数据流全程不可变（headless core 纯函数 + $derived），无需该拷贝，
 * 改为收纳节点渲染共享的纯函数（如 aria-checked 值计算），保持文件职责对应。
 */
import type { TreeKey } from '@chenzy-design/core';

export function ariaCheckedFromState(checked: boolean, halfChecked: boolean): boolean | 'mixed' {
  if (checked) return true;
  if (halfChecked) return 'mixed';
  return false;
}

export function itemDomId(baseId: string, key: TreeKey): string {
  return `${baseId}-${String(key)}`;
}
