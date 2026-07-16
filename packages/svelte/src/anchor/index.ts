import AnchorRoot from './Anchor.svelte';
import AnchorLinkComponent from './AnchorLink.svelte';

/**
 * 命名空间聚合导出：启用 <Anchor.Link />（照 Nav 写法，保留 typeof 类型）。
 * 显式类型标注避免泄漏组件 Props 类型错误。
 * 组合式 API（对齐 Semi）：children + <Anchor.Link>，无 links 数组公开 prop。
 */
export const Anchor: typeof AnchorRoot & {
  Link: typeof AnchorLinkComponent;
} = Object.assign(AnchorRoot, {
  Link: AnchorLinkComponent,
});

export { meta as anchorMeta } from './meta.js';
export type {
  AnchorShowTooltip,
  AnchorTooltipConfig,
  AnchorRailTheme,
  AnchorSize,
} from './types.js';
