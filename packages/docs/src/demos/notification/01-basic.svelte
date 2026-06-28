<script lang="ts">
  import { notification, Button } from '@chenzy-design/svelte';
</script>

<div style="display:flex; gap:12px; flex-wrap:wrap">
  <Button type="primary" onclick={() => notification.success({ title: '上传完成', content: '文件已成功保存到云端。' })}>success</Button>
  <Button onclick={() => notification.info({ title: '新消息', content: '你有一条新的待办事项。' })}>info</Button>
  <Button type="warning" onclick={() => notification.warning({ title: '存储空间不足', content: '剩余空间不足 10%。' })}>warning</Button>
  <Button type="danger" onclick={() => notification.error({ title: '保存失败', content: '网络中断，未保存的更改已暂存本地。', duration: 0 })}>error（常驻）</Button>
  <Button onclick={() => notification.destroyAll()}>清空全部</Button>
</div>
