<script lang="ts">
  import { Spin, Text } from '@chenzy-design/svelte';
</script>

<div style="display:flex; align-items:center; gap:48px; flex-wrap:wrap">
  <div>
    <Text type="tertiary">三种尺寸</Text>
    <div style="display:flex; align-items:center; gap:24px; margin-top:8px">
      <Spin size="small" />
      <Spin size="default" />
      <Spin size="large" />
    </div>
  </div>
  <div>
    <Text type="tertiary">带文案</Text>
    <div style="margin-top:8px"><Spin tip="加载中" /></div>
  </div>
</div>
