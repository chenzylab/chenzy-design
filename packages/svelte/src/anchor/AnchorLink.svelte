<!--
  Anchor.Link — 声明式锚点链接（对齐 Semi Anchor.Link）。
  同时扮演叶子与分支：仅注册描述符到父级收集器，不直接渲染可见 DOM
  （渲染由 Anchor 递归 snippet 统一负责）。
  - 无 children：注册自身为叶子链接。
  - 有 children：向下 setContext 新收集器，内嵌的 Anchor.Link 按 DOM 顺序
    push 进自身 children 数组（嵌套树，照 NavSub）。
  安全：init 同步注册进【普通数组】，挂载后【异步】bump 触发一次 Anchor 重建，
  避免 Svelte5 读写自循环（effect_update_depth_exceeded）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onMount, setContext } from 'svelte';
  import {
    getAnchorCollector,
    ANCHOR_COLLECTOR_KEY,
    type AnchorCollector,
  } from './context.js';
  import type { AnchorLink } from './types.js';

  interface Props {
    /** 链接唯一标识；缺省用 href。 */
    key?: string;
    /** 目标锚点，形如 '#section-1'。 */
    href: string;
    /** 链接标题文案。 */
    title: string;
    /** 是否禁用（不响应点击跳转，视觉置灰，排除出 roving tabindex）。 */
    disabled?: boolean;
    /** Link 级自定义类名，透传到 <a>。 */
    className?: string;
    /** Link 级自定义内联样式，透传到 <a>。 */
    style?: string;
    /** 内嵌的 Anchor.Link（形成嵌套树）。 */
    children?: Snippet;
  }

  let { key, href, title, disabled, className, style, children }: Props = $props();

  const parent = getAnchorCollector();

  // 自身描述符：children 为普通数组，承接子链接注册。
  // 声明式项「声明时读取一次」语义（对齐 Semi，不支持运行时改 prop），静态读取，
  // state_referenced_locally 警告预期且无害。
  const childLinks: AnchorLink[] = [];
  // svelte-ignore state_referenced_locally
  const selfDescriptor: AnchorLink = {
    key: key ?? href,
    href,
    title,
    children: childLinks,
    ...(disabled !== undefined ? { disabled } : {}),
    ...(className !== undefined ? { className } : {}),
    ...(style !== undefined ? { style } : {}),
  };

  // init 同步注册到父级（普通数组）。
  if (parent) parent.add(selfDescriptor);

  // 向 children 提供收集器：add 写入自身 childLinks；bump 继续上抛父级（合并为一次）。
  const childCollector: AnchorCollector = {
    add: (link: AnchorLink) => {
      childLinks.push(link);
      return link;
    },
    bump: () => parent?.bump(),
  };
  setContext(ANCHOR_COLLECTOR_KEY, childCollector);

  // 挂载后异步 bump，脱离挂载 effect 同步栈。
  onMount(() => parent?.bump());
</script>

{#if children}{@render children()}{/if}
