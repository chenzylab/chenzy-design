<script lang="ts">
  import { Slider, Text } from '@chenzy-design/svelte';

  const marks = { 0: '低', 50: '中', 100: '高' };
</script>

<div style="max-width: 360px; display: flex; flex-direction: column; gap: 8px;">
  <Text type="tertiary">自定义刻度、手柄与气泡渲染</Text>
  <Slider defaultValue={50} {marks} alwaysShowTip>
    {#snippet mark({ label, active })}
      <span style={active ? 'font-weight: var(--cd-font-weight-bold);' : ''}>{label}</span>
    {/snippet}
    {#snippet tooltip({ value })}
      {value} 分
    {/snippet}
  </Slider>
</div>
