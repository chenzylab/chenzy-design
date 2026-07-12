import AnchorRoot from './Anchor.svelte';
import AnchorLinkComponent from './AnchorLink.svelte';

/**
 * 命名空间聚合导出：启用 <Anchor.Link />（照 Nav 写法，保留 typeof 类型）。
 * 显式类型标注避免泄漏组件 Props 类型错误。
 * 注：声明式子组件仅经 Anchor.Link 暴露，避免与公开的 AnchorLink 数据类型重名。
 */
export const Anchor: typeof AnchorRoot & {
  Link: typeof AnchorLinkComponent;
} = Object.assign(AnchorRoot, {
  Link: AnchorLinkComponent,
});

export { meta as anchorMeta } from './meta.js';
export type { AnchorLink } from './types.js';
