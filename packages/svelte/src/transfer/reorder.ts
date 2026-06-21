/**
 * Transfer 目标列拖拽重排的纯函数 (红线 #2)：不触碰组件状态，仅做数组计算，便于单测。
 * 目标列为垂直列表，故插入侧以指针在目标项内的「垂直」位置判定。
 */

/** dragover 时根据指针在目标项内的垂直位置判断插入在其「前」或「后」。 */
export type InsertSide = 'before' | 'after';

/**
 * 以目标项中线为界：指针在上半区插入到目标之前，下半区插入到目标之后。
 * @param offsetY 指针相对目标项上边缘的垂直偏移
 * @param height 目标项高度
 */
export function computeInsertSide(offsetY: number, height: number): InsertSide {
  return offsetY < height / 2 ? 'before' : 'after';
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
