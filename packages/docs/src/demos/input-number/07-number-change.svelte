<script lang="ts">
  import { InputNumber, Text } from '@chenzy-design/svelte';

  let num = $state<number | null>(null);
</script>

<div style="display:flex;flex-direction:column;gap:8px;align-items:flex-start">
  <!-- onNumberChange 携带 number 类型的值（区别于 onChange） -->
  <div style="width:200px">
    <InputNumber
      min={0}
      max={999999}
      formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
      parser={(s) => Number(s.replace(/,/g, ''))}
      onNumberChange={(v) => (num = v)}
    />
  </div>
  <Text type="tertiary">千分位显示，onNumberChange 得纯数字：{num ?? '（空）'}</Text>
</div>
