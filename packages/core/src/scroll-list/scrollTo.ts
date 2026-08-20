/**
 * ScrollItem 缓动滚动 — 对齐 Semi Design `semi-foundation/scrollList/scrollTo.ts`。
 *
 * Semi 源码用 `@douyinfe/semi-animation` 的 `Animation({from, to}, {duration})` 驱动
 * `element.scrollTop`；本仓库无该运行时依赖，渲染层用 rAF 逐帧调用 {@link scrollFrame} 并
 * 手写 `el.scrollTop`，数学上等价。
 *
 * 已核 semi-animation 源码：`scrollTo` 只传 `{duration}` 不传 `easing` → `getEasing(undefined)`
 * 落到 `'linear'` = `cubic-bezier(.25,.25,.75,.75)`，数学上即匀速线性，**非弹簧、非 ease-out**。
 * 故 {@link scrollFrame} 用线性插值；{@link easeOut} 是备用的通用缓动工具，ScrollList 落定不使用它。
 */

/**
 * 缓动滚动的单帧 scrollTop（照搬 Semi `scrollTo.ts`：from→to over duration，**线性**）。
 * elapsed>=duration 或 duration<=0 时返回 to（落定）。渲染层用 rAF 逐帧调用并写 `el.scrollTop`。
 */
export function scrollFrame(from: number, to: number, elapsed: number, duration: number): number {
  if (duration <= 0 || elapsed >= duration) return to;
  const p = elapsed / duration; // 线性，对齐 Semi
  return from + (to - from) * p;
}

/**
 * cubic ease-out（先快后缓）。t ∈ [0,1]。通用缓动工具，非 Semi ScrollList 实际使用的曲线
 * （见文件头注）；保留供其余场景（或未来 Semi 版本切换 easing）复用。
 */
export function easeOut(t: number): number {
  const clamped = t < 0 ? 0 : t > 1 ? 1 : t;
  return 1 - Math.pow(1 - clamped, 3);
}
