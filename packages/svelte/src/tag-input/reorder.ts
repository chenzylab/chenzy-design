/**
 * 标签拖拽重排的纯函数 (红线 #2)：不触碰组件状态，仅做数组计算，便于单测。
 */

/** dragover 时根据指针在目标标签内的水平位置判断插入在其「前」或「后」。 */
export type InsertSide = 'before' | 'after';

/**
 * 以目标标签中线为界：指针在左半区插入到目标之前，右半区插入到目标之后。
 * @param offsetX 指针相对目标标签左边缘的水平偏移
 * @param width 目标标签宽度
 */
export function computeInsertSide(offsetX: number, width: number): InsertSide {
  return offsetX < width / 2 ? 'before' : 'after';
}

/**
 * 把 `from` 处的元素移动到目标 `to` 的 `before`/`after` 侧，返回新数组（不可变）。
 * 越界或目标即自身（移动后位置不变）时原样返回原数组的浅拷贝。
 */
export function reorder<T>(
  list: readonly T[],
  from: number,
  to: number,
  side: InsertSide,
): T[] {
  const n = list.length;
  if (from < 0 || from >= n || to < 0 || to >= n) return list.slice();

  // 目标插入下标（在「移除 from 之前」的坐标系中）。
  let insert = side === 'before' ? to : to + 1;
  // 移除被拖项后，位于其右侧的插入点需左移一位。
  if (from < insert) insert -= 1;

  if (insert === from) return list.slice();

  const next = list.slice();
  const removed = next.splice(from, 1);
  next.splice(insert, 0, ...removed);
  return next;
}
