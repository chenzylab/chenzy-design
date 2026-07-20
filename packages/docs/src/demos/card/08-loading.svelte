<script lang="ts">
  import { Card, Switch } from '@chenzy-design/svelte';

  // Switch 受控不回写：值 + onChange 回填（loading = 未开启）
  let loading = $state(true);
</script>

<!-- loading 为 true 时内容区显示骨架占位 -->
<Switch checked={!loading} onChange={(v) => (loading = !v)} />
<br />
<br />
<Card style="max-width: 360px;" {loading}>
  <Card.Meta title="Semi Doc" description="全面、易用、优质" />
</Card>
