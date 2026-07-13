<script lang="ts">
  // Modal.useModal 返回 [modal, holder]；holder 传给 <ModalContextHolder>，命令式弹窗
  // 在其位置（组件树内）渲染，从而继承 LocaleProvider / ConfigProvider 等 context（对齐 Semi）。
  import { Modal, ModalContextHolder, Button, LocaleProvider } from '@chenzy-design/svelte';

  const [modal, holder] = Modal.useModal();
</script>

<LocaleProvider locale="en_US">
  <Button onclick={() => modal.confirm({ title: 'This is a confirm', content: 'Context consumer' })}>
    Confirm Modal
  </Button>
  <ModalContextHolder items={holder.items} />
</LocaleProvider>
