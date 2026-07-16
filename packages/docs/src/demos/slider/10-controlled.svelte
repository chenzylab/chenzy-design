<script lang="ts">
  import { Slider, Button, Text } from '@chenzy-design/svelte';

  let value = $state(10);
</script>

<div style="max-width: 360px; display: flex; flex-direction: column; gap: 16px;">
  <Text type="tertiary">滑块位置由 value 控制，配合 onChange 使用（对齐 Semi 受控组件）</Text>
  <Button onclick={() => (value = Math.min(100, value + 10))}>点击 +10</Button>
  <Slider value={value} onChange={(v) => (value = v as number)} />
  <Text type="tertiary">当前值：{value}</Text>
</div>
