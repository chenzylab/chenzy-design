<script lang="ts">
  import { Slider, Text } from '@chenzy-design/svelte';
</script>

<div style="display: flex; gap: 48px; align-items: flex-start;">
  <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
    <Slider vertical defaultValue={40} height={200} />
    <Text type="tertiary">vertical</Text>
  </div>
  <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
    <Slider vertical verticalReverse defaultValue={40} height={200} />
    <Text type="tertiary">reverse</Text>
  </div>
  <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
    <Slider vertical range defaultValue={[20, 70]} height={200} />
    <Text type="tertiary">range</Text>
  </div>
</div>
