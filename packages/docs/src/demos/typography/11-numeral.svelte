<script lang="ts">
  import { Numeral } from '@chenzy-design/svelte';
</script>

<div style="display: flex; flex-direction: column; gap: 8px;">
  <div>
    <Numeral precision={1}>点赞量：1.6111e1 K</Numeral>
  </div>
  <div>
    <Numeral rule="percentages" precision={2}>好评率: 0.915</Numeral>
  </div>
  <div>
    <Numeral rule="bytes-decimal" precision={2} truncate="floor">已使用: 1500000</Numeral>
  </div>
  <div>
    <Numeral rule="numbers" precision={0}>播放量 2.4444e2 万次</Numeral>
  </div>
  <div>
    <Numeral rule="exponential" precision={2}>10000</Numeral>
  </div>
</div>
