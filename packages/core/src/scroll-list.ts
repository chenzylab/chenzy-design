/**
 * createScrollList helpers — framework-agnostic single-column picker math.
 * Pure functions only: scroll offset ↔ selected index mapping, disabled-item
 * skipping, and keyboard target resolution. No DOM, no framework deps, no
 * internal mutable state — the render layer (svelte) owns scroll state and the
 * actual CSS scroll-snap. See specs/components/show/ScrollList.spec.md §3
 * (single-column subset; momentum/cyclic/multi-column deferred).
 */

export type ScrollListValue = string | number;

export interface ScrollListItem {
  value: ScrollListValue;
  label: string;
  disabled?: boolean;
}

/** Map a scrollTop offset to the centered item index (clamped to range). */
export function offsetToIndex(scrollTop: number, itemHeight: number, count: number): number {
  if (itemHeight <= 0 || count <= 0) return 0;
  const raw = Math.round(scrollTop / itemHeight);
  return Math.max(0, Math.min(count - 1, raw));
}

/** The scrollTop that centers a given index. */
export function indexToOffset(index: number, itemHeight: number): number {
  return index * itemHeight;
}

/** Index of an item by value, or -1. */
export function indexOfValue(
  items: readonly ScrollListItem[],
  value: ScrollListValue | undefined,
): number {
  if (value === undefined) return -1;
  return items.findIndex((it) => it.value === value);
}

/**
 * Resolve the nearest enabled index at or after `from` in `dir` (+1/-1).
 * If none exists in that direction, returns the original `from` unchanged.
 */
export function nextEnabledIndex(
  items: readonly ScrollListItem[],
  from: number,
  dir: 1 | -1,
): number {
  let i = from + dir;
  while (i >= 0 && i < items.length) {
    if (!items[i]?.disabled) return i;
    i += dir;
  }
  return from;
}

/** First enabled index (for Home / value resolution), or -1 if all disabled. */
export function firstEnabledIndex(items: readonly ScrollListItem[]): number {
  for (let i = 0; i < items.length; i += 1) {
    if (!items[i]?.disabled) return i;
  }
  return -1;
}

/** Last enabled index (for End), or -1 if all disabled. */
export function lastEnabledIndex(items: readonly ScrollListItem[]): number {
  for (let i = items.length - 1; i >= 0; i -= 1) {
    if (!items[i]?.disabled) return i;
  }
  return -1;
}

export type ScrollListKey =
  | 'ArrowUp'
  | 'ArrowDown'
  | 'PageUp'
  | 'PageDown'
  | 'Home'
  | 'End';

/**
 * Resolve the target index for a keyboard action from the current index.
 * Returns the current index when the action can't move (boundary / all
 * neighbors disabled). `page` is how many rows PageUp/PageDown move.
 */
export function keyboardTarget(
  items: readonly ScrollListItem[],
  current: number,
  key: ScrollListKey,
  page = 3,
): number {
  switch (key) {
    case 'ArrowUp':
      return nextEnabledIndex(items, current, -1);
    case 'ArrowDown':
      return nextEnabledIndex(items, current, 1);
    case 'Home': {
      const f = firstEnabledIndex(items);
      return f === -1 ? current : f;
    }
    case 'End': {
      const l = lastEnabledIndex(items);
      return l === -1 ? current : l;
    }
    case 'PageUp': {
      let target = current;
      for (let n = 0; n < page; n += 1) {
        const nxt = nextEnabledIndex(items, target, -1);
        if (nxt === target) break;
        target = nxt;
      }
      return target;
    }
    case 'PageDown': {
      let target = current;
      for (let n = 0; n < page; n += 1) {
        const nxt = nextEnabledIndex(items, target, 1);
        if (nxt === target) break;
        target = nxt;
      }
      return target;
    }
    default:
      return current;
  }
}

// ---------------------------------------------------------------------------
// cyclic（循环列）—— 无限轮：用「重复 N 份」+ 中段定位实现。
// 渲染层把 data 重复 `repeat` 份铺成一个长列表（virtual count = count*repeat），
// 滚到靠近首/尾时命令式跳回中段（无动画），视觉无缝。下面是纯索引数学。
// ---------------------------------------------------------------------------

/** 正取模（结果恒非负），把任意整数索引折回 [0, count)。 */
export function wrapIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  return ((index % count) + count) % count;
}

/**
 * cyclic 列的「虚拟总行数」。把真实 count 重复 repeat 份，
 * repeat 必须为奇数且 >= 3，使「中段」居中。count<=0 返回 0。
 */
export function cyclicVirtualCount(count: number, repeat: number): number {
  if (count <= 0) return 0;
  return count * Math.max(3, repeat | 1);
}

/**
 * cyclic 列的「中段基准虚拟索引」：把真实索引 logical 映射到位于正中那一份的虚拟索引。
 * 例如 count=24、repeat=5 → 中段从 2*24=48 起，logical=9 → 57。
 */
export function cyclicCenterIndex(logical: number, count: number, repeat: number): number {
  if (count <= 0) return 0;
  const r = Math.max(3, repeat | 1);
  const mid = Math.floor(r / 2);
  return mid * count + wrapIndex(logical, count);
}

/**
 * cyclic 滚动落定后，判断是否需要把虚拟索引「重定位」回中段（避免滚出重复区边界）。
 * 返回新的虚拟索引（与传入逻辑值同余、但落在中段），渲染层据此命令式无动画跳转。
 * 当 virtualIndex 已在安全中段（距首尾各至少 count 行）时返回原值（无需跳）。
 */
export function cyclicRecenter(virtualIndex: number, count: number, repeat: number): number {
  if (count <= 0) return 0;
  const r = Math.max(3, repeat | 1);
  const total = count * r;
  // 安全区：[count, total-count)。在区内不动。
  if (virtualIndex >= count && virtualIndex < total - count) return virtualIndex;
  const logical = wrapIndex(virtualIndex, count);
  return cyclicCenterIndex(logical, count, repeat);
}

// ---------------------------------------------------------------------------
// 惯性物理（inertia / momentum）—— 拖拽释放后按速度指数减速，落定吸附到最近整行。
// 纯函数：给定初速度与每帧 dt，算出位移；并提供「按当前位置 + 速度预测落点行」。
// 渲染层用 rAF 驱动，把几何（scrollTop）读出传入，写回 scrollTop。
// ---------------------------------------------------------------------------

export interface MomentumStep {
  /** 本帧后的速度（px/ms）。 */
  velocity: number;
  /** 本帧位移增量（px，velocity*dt 的积分近似）。 */
  delta: number;
  /** 速度是否已低于阈值（应停止动画进入吸附）。 */
  done: boolean;
}

/**
 * 推进一帧惯性：指数衰减 v' = v * decay^(dt/16.67)，位移取平均速度积分。
 * @param velocity 当前速度（px/ms，正=向下/scrollTop 增大）
 * @param dt       帧间隔（ms）
 * @param decay    每 ~16.67ms（60fps 一帧）的衰减系数，默认 0.95
 * @param minV     停止阈值（px/ms），默认 0.02
 */
export function momentumStep(
  velocity: number,
  dt: number,
  decay = 0.95,
  minV = 0.02,
): MomentumStep {
  const frames = dt / (1000 / 60);
  const next = velocity * Math.pow(decay, frames);
  // 平均速度积分（梯形）得位移，避免高速时单帧跨度过大。
  const delta = ((velocity + next) / 2) * dt;
  return { velocity: next, delta, done: Math.abs(next) < minV };
}

/**
 * 根据当前 scrollTop 与剩余速度预测「最终吸附目标行」（含一点惯性前瞻），clamp 到 [0,count)。
 * 用于释放瞬间直接算出目标行，再 smooth 吸附（比逐帧更稳，避免抖动）。
 * @param scrollTop 当前偏移
 * @param velocity  当前速度（px/ms）
 * @param itemHeight 行高
 * @param count     行数
 * @param projection 速度前瞻系数（默认 80：v*80 px 的滑行预估）
 */
export function projectSettleIndex(
  scrollTop: number,
  velocity: number,
  itemHeight: number,
  count: number,
  projection = 80,
): number {
  if (itemHeight <= 0 || count <= 0) return 0;
  const projected = scrollTop + velocity * projection;
  const raw = Math.round(projected / itemHeight);
  return Math.max(0, Math.min(count - 1, raw));
}
