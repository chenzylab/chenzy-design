<script lang="ts">
  import { Slider, Text } from '@chenzy-design/svelte';
</script>

<div style="max-width: 360px; display: flex; flex-direction: column; gap: 16px;">
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <Text type="tertiary">单值手柄圆点</Text>
    <Slider
      defaultValue={40}
      handleDot={{ size: '4px', color: 'var(--cd-color-primary)' }}
    />
  </div>
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <Text type="tertiary">区间两个手柄分别配置</Text>
    <Slider
      range
      defaultValue={[20, 70]}
      handleDot={[
        { size: '4px', color: 'var(--cd-color-success)' },
        { size: '4px', color: 'var(--cd-color-danger)' },
      ]}
    />
  </div>
</div>
