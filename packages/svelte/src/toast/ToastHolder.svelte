<!--
  ToastHolder — useToast Hook 的 contextHolder（对齐 Semi Toast.useToast 返回的
  contextHolder 元素）。渲染在组件树内（<ToastHolder store={contextHolder} />），
  内部复用 ToastContainer 渲染局部 store 的 toast，使这些 toast 继承 holder 所在位置的上下文
  （如 LocaleProvider）。wrapper 非 fixed（对齐 Semi useToast/HookToast：局部 Hook 路径不带
  fixed wrapper，直接渲染卡片，定位交给调用方容器，如 chat 的 .cd-chat-toast）。
-->
<script lang="ts">
  import type { ToastStore } from '@chenzy-design/core';
  import ToastContainer from './ToastContainer.svelte';

  interface Props {
    store: ToastStore;
  }

  let { store }: Props = $props();
</script>

<ToastContainer {store} fixed={false} />
