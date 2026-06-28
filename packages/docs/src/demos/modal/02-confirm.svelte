<script lang="ts">
  import { modal, Button } from '@chenzy-design/svelte';
</script>

<div style="display: flex; gap: 8px; flex-wrap: wrap;">
  <Button
    onclick={() =>
      modal.confirm({
        title: '确认删除',
        content: '删除后数据不可恢复，确定继续？',
        onOk: () => {},
        onCancel: () => {},
      })}
  >
    confirm
  </Button>
  <Button onclick={() => modal.info({ title: '提示', content: '这是一条信息通知。' })}>info</Button>
  <Button onclick={() => modal.success({ title: '成功', content: '操作已成功完成。' })}>success</Button>
  <Button onclick={() => modal.warning({ title: '警告', content: '此操作存在风险，请谨慎。' })}>warning</Button>
  <Button onclick={() => modal.error({ title: '错误', content: '操作失败，请重试。' })}>error</Button>
</div>
