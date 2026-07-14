<!--
  NotificationHolder — useNotification Hook 的 contextHolder（对齐 Semi useNotification 返回的
  contextHolder 元素）。渲染在组件树内（<NotificationHolder store={holderStore} />），
  内部复用 NotificationContainer 渲染局部 store 的通知，使这些通知继承 holder 所在位置的上下文
  （如 LocaleProvider）。lists 仍为 position:fixed（对齐 Semi：Hook 通知照样定位到视口方位）。
-->
<script lang="ts">
  import type { NotificationStore } from '@chenzy-design/core';
  import NotificationContainer from './NotificationContainer.svelte';

  interface Props {
    store: NotificationStore;
  }

  let { store }: Props = $props();
</script>

<NotificationContainer {store} />
