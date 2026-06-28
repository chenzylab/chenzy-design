<script lang="ts">
  import { Toast, Button } from '@chenzy-design/svelte';
</script>

<div style="display:flex; gap:12px; flex-wrap:wrap">
  <Button onclick={() => Toast.info('这是一条信息提示')}>info</Button>
  <Button type="primary" onclick={() => Toast.success('已保存草稿')}>success</Button>
  <Button type="warning" onclick={() => Toast.warning('存储空间不足')}>warning</Button>
  <Button type="danger" onclick={() => Toast.error('网络异常，请重试')}>error</Button>
  <Button onclick={() => Toast.loading('正在上传…', { duration: 0 })}>loading（常驻）</Button>
  <Button onclick={() => Toast.destroyAll()}>清空全部</Button>
</div>
