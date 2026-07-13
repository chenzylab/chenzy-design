/**
 * ScrollList / ScrollItem helpers — framework-agnostic picker math.
 *
 * 严格对齐 Semi Design（semi-foundation/scrollList）。Semi 的 itemFoundation 是有
 * 状态、直接操作真实 DOM 的类；本层遵循 chenzy-design headless 哲学，只抽出**纯函数**
 * 几何 / 文案 / 缓动数学，DOM 读写（节点搬移、getBoundingClientRect）由 svelte 渲染层
 * 用这些函数实现，无 DOM、无框架依赖、无内部可变状态。
 *
 * 对齐来源：
 * - scrollItem.tsx `scrollToNode` / `scrollToCenter` → {@link centerOffset}
 * - itemFoundation `getNearestNodeInfo`（选区中线找最近非禁用节点） → {@link nearestIndex}
 * - scrollTo.ts（semi-animation 弹簧驱动 scrollTop） → {@link scrollFrame}（rAF ease-out 等价）
 * - renderItemList `transform`（选中项文案变换） → {@link resolveItemText}
 * - constants.ts `DEFAULT_ITEM_HEIGHT=36` / `DEFAULT_SCROLL_DURATION=120`
 */

/** ScrollItem.mode：wheel（滚轮，居中吸附）| normal（普通列表，点击选中）。对齐 Semi strings.MODE。 */
export type ScrollItemMode = 'wheel' | 'normal';

/** Semi scrollList numbers 常量。 */
export const SCROLL_LIST_DEFAULT_ITEM_HEIGHT = 36;
export const SCROLL_LIST_DEFAULT_SCROLL_DURATION = 120;

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
 * 解析一项应展示的文案（对齐 Semi renderItemList）。
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
 * 把某 index 的项**居中**到视窗中线所需的 scrollTop（对齐 Semi scrollToNode）：
 * targetTop = node.offsetTop - (wrapperHeight - itemHeight) / 2。
 * offsetTop = index * itemHeight（含 ul 顶部 `:before` 空白，见样式）。
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
 * 给定当前 scrollTop 与视窗高度，求中线最近的**非禁用**项索引（对齐 getNearestNodeInfo）。
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

/** 正取模：把任意整数索引折回 [0, count)（cycled 用）。对齐 Semi `index % list.length` 语义（负值也回正）。 */
export function wrapIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  return ((index % count) + count) % count;
}

/**
 * cubic ease-out（等价 Semi semi-animation 弹簧的观感：先快后缓落定）。t ∈ [0,1]。
 */
export function easeOut(t: number): number {
  const clamped = t < 0 ? 0 : t > 1 ? 1 : t;
  return 1 - Math.pow(1 - clamped, 3);
}

/**
 * 缓动滚动的单帧 scrollTop（对齐 Semi scrollTo.ts：from→to over duration）。
 * elapsed>=duration 或 duration<=0 时返回 to（落定）。渲染层用 rAF 逐帧调用并写 el.scrollTop。
 */
export function scrollFrame(from: number, to: number, elapsed: number, duration: number): number {
  if (duration <= 0 || elapsed >= duration) return to;
  const p = easeOut(elapsed / duration);
  return from + (to - from) * p;
}

/**
 * cycled 无限列表：需要在真实列表头/尾各补多少「份」完整数据，才能填满上/下缓冲区
 * （对齐 shouldPrepend / shouldAppend）。ratio=缓冲区为视窗高度的倍数（init 时 2，调整时 1）。
 * 纯几何版：不读 DOM，用 list 高度（count*itemHeight）与视窗几何推算。
 */
export function repeatCount(
  count: number,
  itemHeight: number,
  wrapperHeight: number,
  ratio = 2,
): number {
  if (count <= 0 || itemHeight <= 0) return 0;
  const listHeight = count * itemHeight;
  if (listHeight <= 0) return 0;
  return Math.ceil((wrapperHeight * ratio) / listHeight);
}
