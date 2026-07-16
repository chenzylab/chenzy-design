/**
 * Anchor 组合式子项上下文（<Anchor.Link>，对齐 Semi anchor-context）。
 *
 * Semi 是 children + <Anchor.Link> 组合式，links 是内部 state 非公开 prop。
 * 本库同构：<Anchor.Link> 挂载时向父级注册 href 描述符（构成嵌套树），并读取共享
 * 反应态（activeHref/showTooltip/position/size/autoCollapse/childMap）自渲染 DOM。
 *
 * 安全约束（对齐 Nav，见记忆 svelte5-child-register-state-array-loop）：
 * - 子链接注册写入的 children 是【普通数组】（非 $state），子项 init 同步 push，
 *   不在 effect 里写 $state。
 * - 触发 Anchor 重建 links 的反应量是单独一个 $state revision，子项挂载后【异步】
 *   bump 一次，脱离挂载 effect 同步栈，避免读写自循环（effect_update_depth_exceeded）。
 */
import { getContext, hasContext } from 'svelte';
import type { AnchorLinkNode, AnchorShowTooltip, AnchorSize } from './types.js';
import type { Placement } from '@chenzy-design/core';

/** 子项挂载注册收集器：把描述符按声明顺序收进当前层级普通数组树。 */
export interface AnchorCollector {
  /** 把子链接描述符按声明顺序 push 进当前层级，返回该描述符（供分支取其 children）。 */
  add: (link: AnchorLinkNode) => AnchorLinkNode;
  /** 挂载后异步触发一次 Anchor 重建（合并多次为一次）。 */
  bump: () => void;
  /** 当前嵌套层级（顶层为 1，对齐 Semi level）。 */
  level: number;
}

/** Anchor → Link 的共享反应态与回调（对齐 Semi AnchorContext）。 */
export interface AnchorContext {
  /** 当前激活链接 href（getter 保持反应性）。 */
  getActiveHref: () => string;
  /** showTooltip 归一化配置（null=不装浮层）。 */
  getTooltip: () => import('./types.js').AnchorTooltipConfig | null;
  /** 浮层弹出位置（12 方位）；仅 showTooltip 开启时生效。 */
  getPosition: () => Placement | undefined;
  /** 尺寸（影响文字大小/浮层字号）。 */
  getSize: () => AnchorSize;
  /** autoCollapse：滚动时仅展开激活路径的子级。 */
  getAutoCollapse: () => boolean;
  /** childMap：每个 href → 其所有后代 href 集合（判定激活路径）。 */
  getChildMap: () => Record<string, Set<string>>;
  /** 点击链接（e.preventDefault 之后触发，滚动 + setActive + notify）。 */
  onLinkClick: (e: MouseEvent, href: string) => void;
  /** 键盘：方向键 roving / Home-End / Space 激活。 */
  onLinkKeydown: (e: KeyboardEvent, href: string) => void;
  /** 链接聚焦：更新 roving 焦点 href。 */
  onLinkFocus: (href: string) => void;
  /** 计算某链接 tabindex（roving 单停靠点）。 */
  getLinkTabindex: (href: string, disabled?: boolean) => 0 | -1;
  /** 注册链接标题 DOM 节点（激活时据其 offsetTop 定位滑轨条）。 */
  registerTitleNode: (href: string, node: HTMLElement | null) => void;
  /** raw showTooltip（用于零开销早退判定）。 */
  getShowTooltip: () => AnchorShowTooltip;
}

export const ANCHOR_COLLECTOR_KEY = Symbol('cd-anchor-collector');
export const ANCHOR_CONTEXT_KEY = Symbol('cd-anchor-context');

export function getAnchorCollector(): AnchorCollector | undefined {
  return hasContext(ANCHOR_COLLECTOR_KEY)
    ? (getContext(ANCHOR_COLLECTOR_KEY) as AnchorCollector)
    : undefined;
}

export function getAnchorContext(): AnchorContext | undefined {
  return hasContext(ANCHOR_CONTEXT_KEY)
    ? (getContext(ANCHOR_CONTEXT_KEY) as AnchorContext)
    : undefined;
}
