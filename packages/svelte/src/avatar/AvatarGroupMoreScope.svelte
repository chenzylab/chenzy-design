<!--
  内部辅助组件：包裹 renderMore 渲染出的内容，完全脱离父 AvatarGroup context。

  背景一（折叠误判）：renderMore snippet 内手写的 <Avatar>（如
  `<Avatar>{`+${n}`}</Avatar>`）仍处于 AvatarGroup 组件树下，会调用
  group.register() 拿到序号；若不隔离，这个序号恰好落在 maxCount 位置，
  被 isHidden 判定为「应折叠」，导致 renderMore 内的 Avatar 自己选择不
  渲染内容——这不是折叠协议的目标对象，必须切断折叠判断。

  背景二（size/shape 不该强制下发）：对齐 Semi avatarGroup.tsx，组级
  size/shape 是靠 `React.cloneElement(itm, {size, shape})` 强制覆盖的，
  但 renderMore 返回值在 Semi 里被包在 <Fragment> 里参与这次
  cloneElement——Fragment 不接受 size/shape 这类 props（被静默忽略），
  故 renderMore 渲染出的内容实际完全不受组级 size/shape 影响，内部头像
  该用多大/什么形状完全由业务自己在 renderMore 里指定。因此这里不透传
  getShape/getSize（子 Avatar 落回自身 prop 默认值），也不透传
  getOverlapFrom（renderMore 内容不参与组内层叠 z-index 排布）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { setAvatarGroupContext } from './context.js';

  interface Props {
    children?: Snippet;
  }
  let { children }: Props = $props();

  setAvatarGroupContext({
    getShape: () => undefined,
    getSize: () => undefined,
    isCollapsing: () => false,
  });
</script>

{@render children?.()}
