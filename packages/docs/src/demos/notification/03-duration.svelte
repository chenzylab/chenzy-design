<script lang="ts">
  import { notification, Button } from '@chenzy-design/svelte';
</script>

<div style="display:flex; gap:12px; flex-wrap:wrap">
  <Button onclick={() => notification.info({ title: '快速关闭', content: '2 秒后自动消失。', duration: 2 })}>duration 2s</Button>
  <Button onclick={() => notification.info({ title: '带倒计时进度条', content: '进度条随剩余时间收缩，悬停可暂停。', showProgress: true, duration: 6 })}>showProgress（6s）</Button>
  <Button onclick={() => notification.warning({ title: '常驻通知', content: 'duration 为 0 时不会自动关闭，需手动关闭。', duration: 0 })}>duration 0（常驻）</Button>
  <Button onclick={() => notification.info({ title: '悬停不暂停', content: 'pauseOnHover=false：鼠标悬停也继续倒计时。', pauseOnHover: false, showProgress: true, duration: 4 })}>pauseOnHover false</Button>
  <Button onclick={() => notification.destroyAll()}>清空全部</Button>
</div>
