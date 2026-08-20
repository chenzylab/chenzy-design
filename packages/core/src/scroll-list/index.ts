/**
 * ScrollList / ScrollItem headless 层 — 目录结构对齐 Semi Design `semi-foundation/scrollList/`
 * （constants.ts / foundation.ts / itemFoundation.ts / scrollTo.ts 四文件边界一致）。
 */
export { type ScrollItemMode, SCROLL_LIST_DEFAULT_ITEM_HEIGHT, SCROLL_LIST_DEFAULT_SCROLL_DURATION } from './constants.js';
export {
  resolveItemText,
  centerOffset,
  nearestIndex,
  wrapIndex,
  shouldPrepend,
  shouldAppend,
  type ScrollItemData,
  type ScrollItemSelectPayload,
} from './itemFoundation.js';
export { scrollFrame, easeOut } from './scrollTo.js';
