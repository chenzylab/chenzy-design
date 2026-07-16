<script lang="ts">
  import { Switch } from '@chenzy-design/svelte';
</script>

<!-- 三尺寸 × 关/开/加载/加载选中 矩阵，对齐 Semi「尺寸」demo。 -->
<div style="display: flex; flex-direction: column; gap: 16px;">
  <div style="display: flex; gap: 16px; align-items: center;">
    <Switch size="large" />
    <Switch size="large" defaultValue={true} />
    <Switch size="large" loading />
    <Switch size="large" loading defaultValue={true} />
  </div>
  <div style="display: flex; gap: 16px; align-items: center;">
    <Switch size="default" />
    <Switch size="default" defaultValue={true} />
    <Switch size="default" loading />
    <Switch size="default" loading defaultValue={true} />
  </div>
  <div style="display: flex; gap: 16px; align-items: center;">
    <Switch size="small" />
    <Switch size="small" defaultValue={true} />
    <Switch size="small" loading />
    <Switch size="small" loading defaultValue={true} />
  </div>
</div>
