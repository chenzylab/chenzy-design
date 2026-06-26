<script lang="ts">
  import { notification, Button } from '@chenzy-design/svelte';
</script>

<div style="display:flex; gap:12px; flex-wrap:wrap">
  <Button type="primary" onclick={() => notification.success({ title: '上传完成', content: '文件已成功保存到云端。' })}>success（右上）</Button>
  <Button onclick={() => notification.info({ title: '新消息', content: '你有一条新的待办事项。', placement: 'topLeft' })}>info（左上）</Button>
  <Button type="warning" onclick={() => notification.warning({ title: '存储空间不足', content: '剩余空间不足 10%。', placement: 'bottomRight' })}>warning（右下）</Button>
  <Button type="danger" onclick={() => notification.error({ title: '保存失败', content: '网络中断，未保存的更改已暂存本地。', duration: 0 })}>error（常驻）</Button>
  <Button onclick={() => notification.destroyAll()}>清空全部</Button>
</div>

<div style="display:flex; gap:12px; flex-wrap:wrap; margin-top:12px">
  <Button onclick={() => notification.info({ title: '同步中', content: '将在倒计时结束后自动关闭，悬停暂停。', showProgress: true, duration: 6 })}>showProgress（进度条）</Button>
  <Button onclick={() => notification.open({ title: '深色通知', content: 'theme=dark 深色卡片。', theme: 'dark', duration: 0 })}>theme dark</Button>
  <Button onclick={() => notification.open({ title: '收到协作邀请', content: 'Alice 邀请你加入「设计系统」项目。', duration: 0, footer: notifFooter })}>footer（操作区）</Button>
</div>

<div style="display:flex; gap:12px; flex-wrap:wrap; margin-top:12px">
  <Button onclick={() => notification.info({ title: 'مرحبا بك', content: 'هذا إشعار باتجاه من اليمين إلى اليسار.', direction: 'rtl', duration: 0 })}>RTL（右上→镜像左上）</Button>
  <Button onclick={() => notification.success({ title: 'تم الحفظ', content: 'شريط التقدم ينكمش من اليمين.', direction: 'rtl', showProgress: true, duration: 6, placement: 'topLeft' })}>RTL + 进度（左上→镜像右上）</Button>
  <Button onclick={() => notification.open({ title: '按 Esc 关闭', content: '弹出后按 Esc 键关闭最近一条。', duration: 0 })}>Esc 关闭</Button>
</div>

{#snippet notifFooter()}
  <Button size="small" type="primary" onclick={() => notification.destroyAll()}>接受</Button>
  <Button size="small" onclick={() => notification.destroyAll()}>忽略</Button>
{/snippet}
