/**
 * Anchor 声明式子项收集上下文（<Anchor.Link>）。
 *
 * 安全约束（见记忆 svelte5-child-register-state-array-loop，与 Nav 同解法）：
 * - 子链接注册写入的 children 是【普通数组】（非 $state），子项 init 同步 push，
 *   不在 effect 里写 $state。
 * - 触发 Anchor 重建 links 的反应量是单独一个 $state revision，子项在挂载后【异步】
 *   bump 一次，脱离挂载 effect 同步栈，避免读写自循环（effect_update_depth_exceeded）。
 * - <Anchor.Link> 有 children 时向下提供一个新的 collector，其 add 写入自身
 *   descriptor 的 children 数组，从而把嵌套结构按 DOM 顺序、按层级收进普通数组树。
 */
import { getContext, hasContext } from 'svelte';
import type { AnchorLink } from './types.js';

export interface AnchorCollector {
  /** 把一个子链接描述符按声明顺序 push 进当前层级的普通数组，返回该描述符（供分支取其 children）。 */
  add: (link: AnchorLink) => AnchorLink;
  /** 挂载后异步触发一次 Anchor 重建（合并多次为一次）。 */
  bump: () => void;
}

export const ANCHOR_COLLECTOR_KEY = Symbol('cd-anchor-collector');

export function getAnchorCollector(): AnchorCollector | undefined {
  return hasContext(ANCHOR_COLLECTOR_KEY)
    ? (getContext(ANCHOR_COLLECTOR_KEY) as AnchorCollector)
    : undefined;
}
