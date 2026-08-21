import { getContext, setContext } from 'svelte';
import type { ColumnDef } from './types.js';
import { arrayAdd } from './utils.js';

/**
 * 组合式 <Column> 的 context 收集机制。对齐 Semi 的 Table.Column 组合式写法，
 * 与配置式 `columns` prop 并存（照本库 Tabs/TabPane、Steps/Step 的双写法惯例）。
 *
 * 每个 <Column> 只做一件事：把自身 props 收集成与配置式 ColumnDef 等价的列树，
 * 喂给 Table 内部现有派生（leafColumns/headerRows...），渲染管道零改动。嵌套
 * （表头合并）用多级收集器树：根 Table 提供顶层收集器，每个有子的 <Column> 也
 * 向下 setContext 一个「子列收集器」，同时向上一级注册自身。
 *
 * 红线 #2（副作用写 / 渲染读分离，防 effect 自循环）：register/update/unregister
 * 在子 Column 的 mount/unmount/同步 $effect（副作用）里向父收集器写普通数组 +
 * 调 bump（= 根 Table 唯一的 version $state +1）；Table 的 collectedColumns
 * $derived 只读 version 重建根 snapshot（递归读各层普通数组，绝不写 $state）。
 * 所有层共享根 version（任意深度变化都 bump 根、重建整树），故收集器工厂无需持有
 * 自己的 $state，可留在纯 .ts。
 */

/** 一个 <Column> 注册给父收集器的元数据：ColumnDef 全字段（children 由子收集器填充）。 */
export type ColumnRegistration<T extends Record<string, unknown>> = Omit<
  ColumnDef<T>,
  'children'
>;

/** 父收集器持有的一条簿记：注册元数据 + 该列名下子列收集器（懒创建）。 */
interface CollectorNode<T extends Record<string, unknown>> {
  id: number;
  reg: ColumnRegistration<T>;
  childCollector: ColumnCollector<T>;
}

/** 一层的兄弟列收集器（顶层 = 根 Table；每个父 Column 各持一层给其 children）。 */
export interface ColumnCollector<T extends Record<string, unknown>> {
  /** 子 Column init 期注册自身，返回稳定 id。 */
  register(reg: ColumnRegistration<T>): number;
  /** 子 Column 元数据变化时同步（内部去重，仅真正变化才 bump）。 */
  update(id: number, reg: ColumnRegistration<T>): void;
  /** 子 Column unmount 时注销。 */
  unregister(id: number): void;
  /** 拿到某已注册 Column 名下的「子列收集器」，下发给它的 children 形成树。 */
  getChildCollector(id: number): ColumnCollector<T>;
  /** render 期快照：重建这一层的 ColumnDef[]（递归读子收集器 snapshot）。纯读，不写 $state。 */
  snapshot(): ColumnDef<T>[];
}

/**
 * 创建一层收集器。`bump` 是根 Table 的 version 递增（所有层共享，冒泡到根）。
 * 纯函数、无 rune，故可在 .ts；`bump` 由组件注入（$state 归属根 Table）。
 */
export function createColumnCollector<T extends Record<string, unknown>>(
  bump: () => void,
): ColumnCollector<T> {
  const order: CollectorNode<T>[] = [];
  let nextId = 0;

  const regEqual = (
    a: ColumnRegistration<T>,
    b: ColumnRegistration<T>,
  ): boolean => {
    const keys = new Set([
      ...Object.keys(a),
      ...Object.keys(b),
    ]) as Set<keyof ColumnRegistration<T>>;
    for (const k of keys) {
      // 函数 / Snippet / 对象按引用比较（父重渲染换引用会 bump，可接受，等价 Tabs 对 icon 的处理）。
      if (a[k] !== b[k]) return false;
    }
    return true;
  };

  const collector: ColumnCollector<T> = {
    register(reg) {
      const id = nextId++;
      order.push({ id, reg, childCollector: createColumnCollector<T>(bump) });
      bump();
      return id;
    },
    update(id, reg) {
      const node = order.find((n) => n.id === id);
      if (!node) return;
      if (regEqual(node.reg, reg)) return;
      node.reg = reg;
      bump();
    },
    unregister(id) {
      const i = order.findIndex((n) => n.id === id);
      if (i !== -1) {
        order.splice(i, 1);
        bump();
      }
    },
    getChildCollector(id) {
      const node = order.find((n) => n.id === id);
      // register 已建 childCollector；找不到（理论不会）兜底建一个游离收集器。
      return node ? node.childCollector : createColumnCollector<T>(bump);
    },
    snapshot() {
      return order.map((n) => {
        const children = n.childCollector.snapshot();
        return (
          children.length > 0
            ? { ...n.reg, children }
            : { ...n.reg }
        ) as ColumnDef<T>;
      });
    },
  };
  return collector;
}

const KEY = Symbol('cd-table-columns');

export function setColumnsContext<T extends Record<string, unknown>>(
  collector: ColumnCollector<T>,
): void {
  setContext(KEY, collector);
}

export function getColumnsContext<
  T extends Record<string, unknown>,
>(): ColumnCollector<T> | undefined {
  return getContext<ColumnCollector<T> | undefined>(KEY);
}

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
