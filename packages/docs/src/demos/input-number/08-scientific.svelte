<script lang="ts">
  import { InputNumber, Text } from '@chenzy-design/svelte';
</script>

<div style="display:flex;flex-direction:column;gap:16px;align-items:flex-start">
  <!-- scientificNotation：失焦显示科学计数法，聚焦显示完整数字 -->
  <div style="display:flex;align-items:center;gap:8px">
    <div style="width:220px">
      <InputNumber scientificNotation defaultValue={123456789012345} />
    </div>
    <Text type="tertiary">默认阈值 15 位</Text>
  </div>

  <div style="display:flex;align-items:center;gap:8px">
    <div style="width:220px">
      <InputNumber scientificNotation={{ threshold: 10 }} defaultValue={1234567890} />
    </div>
    <Text type="tertiary">自定义阈值 10 位（聚焦看完整数字）</Text>
  </div>
</div>
