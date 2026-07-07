<script lang="ts">
  import { InputNumber, Text } from '@chenzy-design/svelte';
</script>

<div style="display:flex;flex-direction:column;gap:16px;align-items:flex-start">
  <!-- innerButtons：步进器内嵌，hover/focus 时显示 -->
  <div style="display:flex;align-items:center;gap:8px">
    <div style="width:190px"><InputNumber innerButtons defaultValue={1} suffix="小时" /></div>
    <Text type="tertiary">innerButtons 内嵌步进器</Text>
  </div>

  <!-- hideButtons：彻底隐藏步进器 -->
  <div style="display:flex;align-items:center;gap:8px">
    <div style="width:190px"><InputNumber hideButtons defaultValue={100} /></div>
    <Text type="tertiary">hideButtons 隐藏步进器</Text>
  </div>
</div>
