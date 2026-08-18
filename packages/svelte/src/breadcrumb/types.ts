import type { Component } from 'svelte';
import type { IconSize } from '@chenzy-design/icons';

/** 图标组件统一 props 形状（对齐 @chenzy-design/icons 具名图标，含其索引签名）。 */
export interface BreadcrumbIconProps {
  size?: IconSize;
  spin?: boolean;
  rotate?: number;
  fill?: string;
  class?: string;
  style?: string;
  [key: string]: unknown;
}

/**
 * 面包屑路由对象，字段对齐 Semi Route：`{ name, path, href, icon }`。
 * - name：展示名称（不传为空字符串；Semi 中 route 为纯字符串时字符串即 name）。
 * - path：路由路径（语义信息，随 onClick 回调透出）。
 * - href：链接目的地，挂在 <a> 上。
 * - icon：前置图标，组件引用直传（对齐 Semi icon: ReactNode + renderIcon 注入 className/size；
 *   Svelte 5 运行时无法可靠区分 Snippet 与裸 Component，故非 Snippet 形式，见 Item.svelte 头注释）。
 */
export interface BreadcrumbRoute {
  name?: string;
  path?: string;
  href?: string;
  icon?: Component<BreadcrumbIconProps>;
}
