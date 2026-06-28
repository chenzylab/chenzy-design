<script lang="ts">
  import { Card, Button } from '@chenzy-design/svelte';
</script>

<div style="width: 280px;">
  <Card title="底部操作卡片">
    {#snippet actions()}
      <Button type="tertiary">取消</Button>
      <Button type="primary">确认</Button>
    {/snippet}
    <p>卡片底部的等分操作区适合放置常用操作按钮。</p>
  </Card>
</div>
