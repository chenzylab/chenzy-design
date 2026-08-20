/**
 * ScrollItem（列）headless 层 — 对齐 Semi Design `semi-foundation/scrollList/itemFoundation.ts`。
 *
 * Semi 的 ItemFoundation 是有状态、直接操作真实 DOM 的类（selectIndex/selectNode 用
 * `listWrapper.children`、`getBoundingClientRect` 读写节点）。chenzy-design 的 headless 层遵循
 * MVVM 纯函数哲学（见 specs/00-foundation/mvvm-adapter.spec.md）：本文件抽出等价的**纯几何/
 * 文案函数**，DOM 读写（滚动位置驱动、节点搬移）由 svelte 渲染层（ScrollItem.svelte）用这些
 * 函数的返回值实现，本文件不接触 DOM、无内部可变状态。
 *
 * 对齐来源（Semi 方法 → 本文件函数）：
 * - `renderItemList` 的 transform 优先级 → {@link resolveItemText}
 * - `scrollToNode` / `scrollToCenter` 的居中公式 → {@link centerOffset}
 * - `getNearestNodeInfo`（选区中线找最近非禁用节点） → {@link nearestIndex}
 * - `selectNode` 的 `indexInList % data.length` 取模 → {@link wrapIndex}
 * - `shouldPrepend` / `shouldAppend`（cycled 缓冲份数）→ 同名纯函数（参数化为相对坐标，不读 DOM）
 */
import type { ScrollItemMode } from './constants.js';

export type { ScrollItemMode };

/**
 * 单项数据（对齐 Semi itemFoundation `Item`）。
 * value 任意；text 缺省时用 value 展示；transform 选中态文案变换（优先于 ScrollItem.transform）。
 */
export interface ScrollItemData {
  value: unknown;
  text?: string;
  disabled?: boolean;
  transform?: (value: unknown, text: string) => string;
  [x: string]: unknown;
}

/** onSelect 回调载荷（对齐 Semi notifySelectItem：展开 item + value + type + index）。 */
export interface ScrollItemSelectPayload {
  value: unknown;
  /** 选中项在 list 中的原始索引（cycled 下已取模回 [0,len)）。 */
  index: number;
  /** ScrollItem.type，用于外层区分是哪一列。 */
  type?: string | number;
  [x: string]: unknown;
}

/**
 * 解析一项应展示的文案（对齐 Semi `renderItemList`）。
 * selected 时优先用 transform（item.transform > 公共 transform）变换，否则 text ?? String(value)。
 */
export function resolveItemText(
  item: ScrollItemData,
  selected: boolean,
  commonTransform?: (value: unknown, text: string) => string,
): string {
  const base = item.text == null ? String(item.value) : item.text;
  if (!selected) return base;
  const transform = typeof item.transform === 'function' ? item.transform : commonTransform;
  if (typeof transform === 'function') return transform(item.value, base);
  return base;
}

/**
 * 把某 index 的项**居中**到视窗中线所需的 scrollTop（对齐 Semi `scrollToNode`）：
 * targetTop = node.offsetTop - (wrapperHeight - itemHeight) / 2。
 * offsetTop = index * itemHeight（含 ul 顶部 `:before` 空白，见渲染层样式）。
 */
export function centerOffset(
  index: number,
  itemHeight: number,
  wrapperHeight: number,
  topPadding = 0,
): number {
  const nodeTop = topPadding + index * itemHeight;
  return nodeTop - (wrapperHeight - itemHeight) / 2;
}

/**
 * 给定当前 scrollTop 与视窗高度，求中线最近的**非禁用**项索引（对齐 Semi `getNearestNodeInfo`）。
 * 中线在视窗几何正中；每项中心 = topPadding + (i + 0.5) * itemHeight - scrollTop。
 * 返回 -1 表示无可选项（全禁用 / 空）。
 */
export function nearestIndex(
  scrollTop: number,
  itemHeight: number,
  wrapperHeight: number,
  count: number,
  isDisabled: (index: number) => boolean,
  topPadding = 0,
): number {
  if (itemHeight <= 0 || count <= 0) return -1;
  const selectorCenter = wrapperHeight / 2;
  let best = -1;
  let bestDist = Infinity;
  for (let i = 0; i < count; i += 1) {
    if (isDisabled(i)) continue;
    const itemCenter = topPadding + (i + 0.5) * itemHeight - scrollTop;
    const dist = Math.abs(itemCenter - selectorCenter);
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  }
  return best;
}

/**
 * 正取模：把任意整数索引折回 [0, count)（cycled 用）。
 * 对齐 Semi `selectNode` 里 `indexInList % data.length` 的语义（负值也回正）。
 */
export function wrapIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  return ((index % count) + count) % count;
}

/**
 * cycled 头部要补多少「份」完整数据，才能让首节点越过上缓冲区顶（对齐 Semi `shouldPrepend`）。
 * 照搬 Semi while 循环：`while (baseTop + itemHeight >= wrapperTop - wrapperHeight*ratio) { count++; baseTop -= listHeight }`，
 * 参数化为相对坐标 `firstTop = firstNodeTop - wrapperTop`（首 li 顶相对视窗顶的偏移，可负），不读 DOM。
 * ratio=缓冲区为视窗高度的倍数（init 时 2，滚动调整时 1，对齐 Semi）。
 */
export function shouldPrepend(
  firstTop: number,
  count: number,
  itemHeight: number,
  wrapperHeight: number,
  ratio = 2,
): number {
  if (count <= 0 || itemHeight <= 0) return 0;
  const listHeight = count * itemHeight;
  if (listHeight <= 0) return 0;
  const threshold = -wrapperHeight * ratio; // wrapperTop - wrapperHeight*ratio，相对坐标下 wrapperTop=0
  let baseTop = firstTop;
  let n = 0;
  while (baseTop + itemHeight >= threshold) {
    n += 1;
    baseTop -= listHeight;
  }
  return n;
}

/**
 * cycled 尾部要补多少「份」完整数据，才能让尾节点越过下缓冲区底（对齐 Semi `shouldAppend`）。
 * 照搬 Semi while 循环：`while (baseTop <= wrapperTop + wrapperHeight*ratio) { count++; baseTop += listHeight }`，
 * 参数化为相对坐标 `lastTop = lastNodeTop - wrapperTop`（尾 li 顶相对视窗顶的偏移），不读 DOM。
 */
export function shouldAppend(
  lastTop: number,
  count: number,
  itemHeight: number,
  wrapperHeight: number,
  ratio = 2,
): number {
  if (count <= 0 || itemHeight <= 0) return 0;
  const listHeight = count * itemHeight;
  if (listHeight <= 0) return 0;
  const threshold = wrapperHeight * ratio; // wrapperTop + wrapperHeight*ratio，相对坐标下 wrapperTop=0
  let baseTop = lastTop;
  let n = 0;
  while (baseTop <= threshold) {
    n += 1;
    baseTop += listHeight;
  }
  return n;
}
