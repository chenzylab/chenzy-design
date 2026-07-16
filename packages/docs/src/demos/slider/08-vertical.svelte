<script lang="ts">
  import { Slider, Text } from '@chenzy-design/svelte';
</script>

<!-- 垂直高度由外层容器控制（对齐 Semi：外层 div 设 height）。 -->
<div style="display: flex; gap: 48px; align-items: flex-start;">
  <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
    <div style="height: 200px;"><Slider vertical defaultValue={40} /></div>
    <Text type="tertiary">vertical</Text>
  </div>
  <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
    <div style="height: 200px;"><Slider vertical verticalReverse defaultValue={40} /></div>
    <Text type="tertiary">reverse</Text>
  </div>
  <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
    <div style="height: 200px;"><Slider vertical range defaultValue={[20, 70]} /></div>
    <Text type="tertiary">range</Text>
  </div>
</div>
