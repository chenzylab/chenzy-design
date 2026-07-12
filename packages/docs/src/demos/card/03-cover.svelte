<script lang="ts">
  import { Card } from '@chenzy-design/svelte';
</script>

<!-- 用 cover 设置封面，出血铺满卡片顶部 -->
<Card style="max-width: 300px;">
  {#snippet cover()}
    <div
      style="height: 160px; background: linear-gradient(135deg, var(--cd-color-primary) 0%, var(--cd-color-primary-light-active) 100%);"
    ></div>
  {/snippet}
  <Card.Meta title="卡片封面" />
</Card>
