import { arrayAdd } from './utils.js';

/**
 * 表头列实测宽度：对齐 Semi Table.tsx 的 state.headWidths / setHeadWidths / getCellWidths
 * 三件套语义（本库表头 <tr> 渲染仍内联于 Table.svelte，测量与消费同在一处，故不需要
 * 跨组件 context，直接提供纯函数供 Table.svelte 在 $state 之上组合）。
 *
 * headWidths：按表头层级分组（多级表头 colSpan 场景一层一个 <tr>，index 从 0 开始）的
 * `{key, width}[]`。measureHeadRow 在每层 <tr> 挂载/更新后实测该层叶子 <th> 宽度
 * （有数值 column.width 配置则优先用配置值，否则用 getBoundingClientRect().width 实测）。
 * 固定列偏移量（表头自身 + Body 侧单元格）都从同一份数据用 arrayAdd 累加得出，保证
 * 表头与单元格数值完全一致（双 table 分离架构下视觉对齐的关键）。
 */
export interface HeadWidthEntry {
  key: string;
  width: number;
}

/** 值比较：逐项 key+width 相同即视为等价，供调用方在 $effect 里去重写入，防止无意义抖动。 */
export function headWidthsEqual(a: HeadWidthEntry[], b: HeadWidthEntry[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const ai = a[i];
    const bi = b[i];
    if (!ai || !bi || ai.key !== bi.key || ai.width !== bi.width) return false;
  }
  return true;
}

/**
 * 对齐 Semi getCellWidths：把「某一层/某一行的叶子列 key 序列」按 key 匹配到已测量宽度，
 * 产出与传入列同序的 number[]（找不到匹配的列被跳过，与 Semi reduce 行为一致）。
 * pool 缺省时聚合所有层（等价 Semi flattenDeep(state.headWidths)）。
 */
export function getCellWidths(
  columnKeys: string[],
  headWidths: HeadWidthEntry[][],
  pool?: HeadWidthEntry[],
): number[] {
  const flat = pool ?? headWidths.flat();
  if (!flat.length) return [];
  const result: number[] = [];
  for (const key of columnKeys) {
    const found = flat.find((item) => item && item.key != null && item.key === key);
    if (found) result.push(found.width);
  }
  return result;
}

export { arrayAdd };
