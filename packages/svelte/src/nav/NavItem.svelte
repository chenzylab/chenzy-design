<!--
  Nav.Item — 声明式叶子导航项（对齐 Semi Nav.Item）。
  仅注册描述符到父级收集器，不直接渲染 DOM（渲染由 Nav 委托的 Menu 统一负责）。
  安全：init 同步注册进【普通数组】，挂载后【异步】bump 触发一次 Nav 重建。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onMount } from 'svelte';
  import { getNavCollector } from './context.js';
  import type { NavKey } from './types.js';

  interface Props {
    /** 导航项唯一标识。 */
    itemKey: NavKey;
    /** 导航项文案。 */
    text: string;
    /** 项前置图标。 */
    icon?: Snippet;
    /** 是否禁用。 */
    disabled?: boolean;
    /** 链接地址（叶子项渲染为原生 <a>）。 */
    link?: string;
    /** 链接 target。 */
    target?: string;
    /** 链接 rel。 */
    rel?: string;
  }

  let { itemKey, text, icon, disabled, link, target, rel }: Props = $props();

  const collector = getNavCollector();
  // 声明式项为「声明时读取一次」语义（对齐 Semi Nav.Item，不支持运行时改 prop）。
  // 故此处刻意静态读取 props 注册，state_referenced_locally 警告预期且无害。
  // svelte-ignore state_referenced_locally
  if (collector) {
    collector.add({
      itemKey,
      text,
      ...(icon !== undefined ? { icon } : {}),
      ...(disabled !== undefined ? { disabled } : {}),
      ...(link !== undefined ? { link } : {}),
      ...(target !== undefined ? { target } : {}),
      ...(rel !== undefined ? { rel } : {}),
    });
  }
  // 挂载后异步 bump，脱离挂载 effect 同步栈。
  onMount(() => collector?.bump());
</script>
