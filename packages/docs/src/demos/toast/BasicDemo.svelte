<script lang="ts">
  import { Toast, Button, Text } from '@chenzy-design/svelte';
</script>

<div style="display:flex; gap:12px; flex-wrap:wrap">
  <Button onclick={() => Toast.info('这是一条信息提示')}>info</Button>
  <Button type="primary" onclick={() => Toast.success('已保存草稿')}>success</Button>
  <Button type="warning" onclick={() => Toast.warning('存储空间不足')}>warning</Button>
  <Button type="danger" onclick={() => Toast.error('网络异常，请重试')}>error</Button>
  <Button onclick={() => Toast.loading('正在上传…', { duration: 0 })}>loading（常驻）</Button>
  <Button onclick={() => Toast.destroyAll()}>清空全部</Button>
</div>

<div style="margin-top:12px"><Text type="tertiary">6 方位（每方位独立纵向堆叠）</Text></div>
<div style="display:flex; gap:12px; flex-wrap:wrap; margin-top:4px">
  <Button onclick={() => Toast.info('左上角', { position: 'topLeft' })}>topLeft</Button>
  <Button onclick={() => Toast.info('顶部居中', { position: 'top' })}>top</Button>
  <Button onclick={() => Toast.info('右上角', { position: 'topRight' })}>topRight</Button>
  <Button onclick={() => Toast.info('左下角', { position: 'bottomLeft' })}>bottomLeft</Button>
  <Button onclick={() => Toast.info('底部居中', { position: 'bottom' })}>bottom</Button>
  <Button onclick={() => Toast.info('右下角', { position: 'bottomRight' })}>bottomRight</Button>
</div>

<div style="margin-top:12px"><Text type="tertiary">theme（卡片主题）+ promise</Text></div>
<div style="display:flex; gap:12px; flex-wrap:wrap; margin-top:4px">
  <Button onclick={() => Toast.success('深色卡片', { theme: 'dark', position: 'topRight' })}>theme dark</Button>
  <Button
    type="primary"
    onclick={() =>
      Toast.promise(
        new Promise((resolve) => setTimeout(() => resolve('done'), 1800)),
        { loading: '保存中…', success: '已保存', error: '保存失败' },
        { position: 'bottom' },
      )}>promise（resolve）</Button>
  <Button
    type="danger"
    onclick={() =>
      Toast.promise(
        new Promise((_, reject) => setTimeout(() => reject(new Error('网络中断')), 1800)),
        { loading: '提交中…', success: '已提交', error: (e) => `失败：${(e as Error).message}` },
        { position: 'bottom' },
      ).catch(() => {})}>promise（reject）</Button>
</div>
