<script lang="ts">
  import { Card, Rating } from '@chenzy-design/svelte';
</script>

<!-- actions 位于内容区底部，以 12px 水平间距排布 -->
<Card style="max-width: 300px;" headerLine={false}>
  {#snippet cover()}
    <div
      style="height: 150px; background: linear-gradient(135deg, var(--cd-color-orange-3) 0%, var(--cd-color-red-4) 100%);"
    ></div>
  {/snippet}
  {#snippet actions()}
    <Rating size="small" defaultValue={4} />
  {/snippet}
  <Card.Meta title="Semi Doc" description="全面、易用、优质" />
</Card>
