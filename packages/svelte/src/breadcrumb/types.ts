import type { Snippet } from 'svelte';

/**
 * 面包屑路由对象，字段对齐 Semi Route：`{ name, path, href, icon }`。
 * - name：展示名称（不传为空字符串；Semi 中 route 为纯字符串时字符串即 name）。
 * - path：路由路径（语义信息，随 onClick 回调透出）。
 * - href：链接目的地，挂在 <a> 上。
 * - icon：前置图标 Snippet（Semi 为 ReactNode，此处为 Svelte Snippet）。
 */
export interface BreadcrumbRoute {
  name?: string;
  path?: string;
  href?: string;
  icon?: Snippet;
}
