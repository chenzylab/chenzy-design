<!--
  ModalContextHolder — useModal 的 contextHolder 渲染体。
  在组件树内（{#each}）声明式渲染 ConfirmModal，使其继承本组件所在位置的 Svelte context
  （LocaleProvider / ConfigProvider 等）。对齐 Semi useModal 的 <>{elements}</>。
-->
<script lang="ts">
  import ConfirmModal from './ConfirmModal.svelte';
  import type { HookModalItem } from './use-modal.svelte.js';

  interface Props {
    items: HookModalItem[];
  }
  let { items }: Props = $props();
</script>

{#each items as item (item.id)}
  <ConfirmModal
    type={item.type}
    {...item.config}
    onClose={item.onClose}
  />
{/each}
