<script lang="ts">
  import { notification, Button } from '@chenzy-design/svelte';

  function openInvite() {
    notification.open({
      title: '收到协作邀请',
      content: 'Alice 邀请你加入「设计系统」项目。',
      duration: 0,
      footer: inviteFooter,
    });
  }
</script>

<div style="display:flex; gap:12px; flex-wrap:wrap">
  <Button type="primary" onclick={openInvite}>带操作按钮的通知</Button>
  <Button onclick={() => notification.destroyAll()}>清空全部</Button>
</div>

{#snippet inviteFooter()}
  <Button size="small" type="primary" onclick={() => notification.destroyAll()}>接受</Button>
  <Button size="small" onclick={() => notification.destroyAll()}>忽略</Button>
{/snippet}
