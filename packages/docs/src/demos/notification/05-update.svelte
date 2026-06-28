<script lang="ts">
  import { notification, Button } from '@chenzy-design/svelte';

  function startUpload() {
    const id = notification.info({
      title: '上传中…',
      content: '正在上传 design-system.fig（0%）。',
      duration: 0,
    });
    let pct = 0;
    const timer = setInterval(() => {
      pct += 25;
      if (pct < 100) {
        notification.update(id, {
          title: '上传中…',
          content: `正在上传 design-system.fig（${pct}%）。`,
          duration: 0,
        });
      } else {
        clearInterval(timer);
        notification.update(id, {
          type: 'success',
          title: '上传完成',
          content: 'design-system.fig 已保存到云端。',
          duration: 3,
        });
      }
    }, 800);
  }
</script>

<div style="display:flex; gap:12px; flex-wrap:wrap">
  <Button type="primary" onclick={startUpload}>原地更新（进度→完成）</Button>
  <Button onclick={() => notification.open({ title: '深色主题', content: 'theme=dark 适用于深色背景界面。', theme: 'dark', duration: 0 })}>深色卡片</Button>
  <Button onclick={() => notification.destroyAll()}>清空全部</Button>
</div>
