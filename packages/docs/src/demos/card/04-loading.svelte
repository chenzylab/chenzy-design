<script lang="ts">
  import { Card, Switch } from '@chenzy-design/svelte';

  let loading = $state(true);
</script>

<div style="display: flex; flex-direction: column; gap: 12px;">
  <div style="display: flex; align-items: center; gap: 8px;">
    <span>加载中：</span>
    <Switch bind:value={loading} />
  </div>
  <Card title="数据卡片" {loading} loadingRows={4}>
    <p>加载完成后显示的真实内容。</p>
  </Card>
</div>
