<script lang="ts">
  import { notification, Button, Text } from '@chenzy-design/svelte';
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
    <Text link={{ href: '#' }}>查看详情</Text>
    <Text link={{ href: '#' }} style="margin-left:20px">一会再看</Text>
  </div>
{/snippet}
