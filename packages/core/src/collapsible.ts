/**
 * Collapsible headless — 折叠容器原语的渲染/可见性派生逻辑。
 * 无 DOM 依赖的纯函数，供 Collapsible.svelte 与单测复用。
 *
 * 对齐 Semi collapsible foundation：
 *  - visible：内容当前是否「视觉可见」（展开中或展开完成）；折叠过渡结束后置 false。
 *  - shouldRender：内容 DOM 是否应挂载（keepDOM × lazyRender × isOpen × collapseHeight 组合）。
 */

export interface CollapsibleRenderInput {
  /** 是否展开 */
  isOpen: boolean;
  /** 折叠时是否保留 DOM（false 则完全折叠后卸载内容） */
  keepDOM: boolean;
  /** 首次展开前不渲染（配合 keepDOM 的首帧惰性） */
  lazyRender: boolean;
  /** 折叠时保留的高度（>0 时内容常驻以呈现「展开更多」截断） */
  collapseHeight: number;
  /** 内容当前视觉可见（展开中/展开完成，折叠过渡结束前仍为 true） */
  visible: boolean;
  /** 内容此前是否已被渲染过（lazyRender 用；普通簿记，非响应式） */
  hasBeenRendered: boolean;
}

/**
 * 是否应把内容挂载到 DOM。对齐 Semi：
 *   keepDOM && (lazyRender ? hasBeenRendered : true)
 *   || collapseHeight !== 0
 *   || visible
 *   || isOpen
 *
 * - keepDOM 且非 lazyRender：内容常驻。
 * - keepDOM 且 lazyRender：首次展开（hasBeenRendered）后才常驻。
 * - collapseHeight>0：折叠仍保留部分高度，故内容必须挂载。
 * - 其余：展开中/展开完成（visible）或正在展开（isOpen）时挂载，完全折叠后卸载。
 */
export function collapsibleShouldRender(input: CollapsibleRenderInput): boolean {
  const { isOpen, keepDOM, lazyRender, collapseHeight, visible, hasBeenRendered } = input;
  const keptByDOM = keepDOM && (lazyRender ? hasBeenRendered : true);
  return keptByDOM || collapseHeight !== 0 || visible || isOpen;
}

/**
 * 折叠态实际保留高度：collapseHeightAdaptive 时不超过实测内容高度，
 * 否则直接用 collapseHeight。domHeight 为已测内容高度（无测量时传 0）。
 */
export function collapsibleCollapsedHeight(
  collapseHeight: number,
  collapseHeightAdaptive: boolean,
  domHeight: number,
): number {
  return collapseHeightAdaptive ? Math.min(domHeight, collapseHeight) : collapseHeight;
}
