<script lang="ts">
  import { notification, Button, Link } from '@chenzy-design/svelte';
</script>

<Button
  onclick={() =>
    notification.info({
      title: 'This is a title',
      content: linkContent,
      duration: 3,
    })}
>
  Display Notification
</Button>

{#snippet linkContent()}
  <div>Hi, Bytedance dance dance</div>
  <div style="margin-top:8px">
    <Link href="#">查看详情</Link>
    <Link href="#" style="margin-left:20px">一会再看</Link>
  </div>
{/snippet}
