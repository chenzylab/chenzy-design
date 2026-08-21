/**
 * 固定列偏移计算：数组区间求和，对齐 Semi packages/semi-foundation/table/utils.ts 的 arrayAdd。
 *
 * 语义：对 arr 在 [beginIndex, endIndex) 区间内的数值求和（非数值项按 0 处理）。
 * beginIndex 非法（<0 或非 number）时归零；endIndex 非法或越界时归为 arr.length。
 *
 * 用途：headWidths 是「某一层表头/某一行 body 的叶子列宽度数组，按列在该层的顺序排列」，
 * 左固定列的 sticky left = 该列左侧所有列宽之和 = arrayAdd(headWidths, 0, indexOfCol)；
 * 右固定列的 sticky right = 该列右侧所有列宽之和 = arrayAdd(headWidths, indexOfCol + 1)。
 */
export function arrayAdd(arr: number[] = [], beginIndex = 0, endIndex?: number): number {
  const begin = beginIndex < 0 || typeof beginIndex !== 'number' ? 0 : beginIndex;
  const end = endIndex === undefined || endIndex > arr.length || typeof endIndex !== 'number' ? arr.length : endIndex;

  let result = 0;
  for (let i = 0; i < arr.length; i++) {
    if (i >= begin && i < end) {
      const value = arr[i];
      result += typeof value === 'number' && !Number.isNaN(value) ? value : 0;
    }
  }
  return result;
}
