<script lang="ts">
  import { Toast, ToastHolder, Button } from '@chenzy-design/svelte';

  // 通过 Toast.useToast 创建支持读取 context 的 contextHolder。
  // 此时的 toast 会渲染在 contextHolder（ToastHolder）所在的节点处，继承该处上下文（对齐 Semi）。
  const [toast, contextHolder] = Toast.useToast();
</script>

<div>
  <Button onclick={() => toast.success({ content: 'This is a hook toast', duration: 3 })}>
    Hook Toast
  </Button>
</div>

<ToastHolder store={contextHolder} />
