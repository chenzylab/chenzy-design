<script lang="ts">
  import { Slider, Text } from '@chenzy-design/svelte';
</script>

<div style="max-width: 360px; display: flex; flex-direction: column; gap: 16px;">
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <Text type="tertiary">追加单位并常驻显示</Text>
    <Slider defaultValue={40} tipFormatter={(v) => `${v}%`} alwaysShowTip />
  </div>
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <Text type="tertiary">隐藏气泡</Text>
    <Slider defaultValue={40} tipFormatter={() => null} />
  </div>
</div>
