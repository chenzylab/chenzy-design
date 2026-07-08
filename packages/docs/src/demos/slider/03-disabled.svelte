<script lang="ts">
  import { Slider, Text } from '@chenzy-design/svelte';
</script>

<div style="max-width: 360px; display: flex; flex-direction: column; gap: 16px;">
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <Text type="tertiary">禁用态</Text>
    <Slider defaultValue={30} disabled />
  </div>
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <Text type="tertiary">显示边界值</Text>
    <Slider defaultValue={60} showBoundary />
  </div>
</div>
