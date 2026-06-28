<script lang="ts">
  import { Card, Button } from '@chenzy-design/svelte';
</script>

<Card title="带操作卡片">
  {#snippet extra()}
    <Button type="primary" size="small">更多</Button>
  {/snippet}
  <p>右上角可放置额外操作，如查看更多、编辑、删除等。</p>
</Card>
