/**
 * ScrollList（容器）headless 层 — 对齐 Semi Design `semi-foundation/scrollList/foundation.ts`。
 *
 * Semi 源码：
 * ```ts
 * export default class ScrollListFoundation extends BaseFoundation<DefaultAdapter> {}
 * ```
 * 容器本身无自有状态/算法（仅继承基类），DOM 结构与样式变换完全在渲染层（ScrollList.svelte）
 * 完成。此文件按 Semi 文件边界保留为独立模块，容器级 headless 逻辑（如后续新增）落点于此，
 * 与列级算法（{@link ../scroll-list/itemFoundation.js}）分开。
 */

export {};
