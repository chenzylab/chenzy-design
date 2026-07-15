<!--
  Nav.Item — 声明式叶子导航项（对齐 Semi Nav.Item）。
  仅注册描述符到父级收集器，不直接渲染 DOM（渲染由 Nav 自身的 NavItemRender 统一负责）。
  安全：init 同步注册进【普通数组】，挂载后【异步】bump 触发一次 Nav 重建。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onMount } from 'svelte';
  import { getNavCollector } from './context.js';
  import type { NavKey, NavClickData } from './types.js';

  interface Props {
    /** 导航项唯一标识。 */
    itemKey: NavKey;
    /** 导航项文案（字符串或 Snippet）。 */
    text: string | Snippet;
    /** 项前置图标。 */
    icon?: Snippet;
    /** 是否禁用（默认 false）。 */
    disabled?: boolean;
    /** 链接地址（叶子项渲染为原生 <a>）。 */
    link?: string;
    /** 透传给 <a> 的属性（对齐 Semi linkOptions，如 target/rel/download）。 */
    linkOptions?: Record<string, string>;
    /** 是否保留左侧 Icon 占位（对齐 Semi indent）。 */
    indent?: boolean;
    /** 项级点击回调（富载荷对齐 Semi）。 */
    onClick?: (data: NavClickData) => void;
    /** 项级鼠标移入回调。 */
    onMouseEnter?: (e: MouseEvent) => void;
    /** 项级鼠标移出回调。 */
    onMouseLeave?: (e: MouseEvent) => void;
  }

  let {
    itemKey,
    text,
    icon,
    disabled = false,
    link,
    linkOptions,
    indent,
    onClick,
    onMouseEnter,
    onMouseLeave,
  }: Props = $props();

  const collector = getNavCollector();
  // 声明式项为「声明时读取一次」语义（对齐 Semi Nav.Item，不支持运行时改 prop）。
  // 故此处刻意静态读取 props 注册，state_referenced_locally 警告预期且无害。
  // svelte-ignore state_referenced_locally
  if (collector) {
    collector.add({
      itemKey,
      text,
      disabled,
      ...(icon !== undefined ? { icon } : {}),
      ...(link !== undefined ? { link } : {}),
      ...(linkOptions !== undefined ? { linkOptions } : {}),
      ...(indent !== undefined ? { indent } : {}),
      ...(onClick !== undefined ? { onClick } : {}),
      ...(onMouseEnter !== undefined ? { onMouseEnter } : {}),
      ...(onMouseLeave !== undefined ? { onMouseLeave } : {}),
    });
  }
  // 挂载后异步 bump，脱离挂载 effect 同步栈。
  onMount(() => collector?.bump());
</script>
