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
  <div>
    <Numeral rule="bytes-binary" precision={2}>已使用: 1500000</Numeral>
  </div>
  <div>
    <Numeral rule="numbers" precision={2} truncate="ceil">向上取整 ceil: 2.346</Numeral>
    <span style="margin: 0 8px;">·</span>
    <Numeral rule="numbers" precision={2} truncate="round">四舍五入 round: 2.344</Numeral>
  </div>
  <div>
    <Numeral parser={(raw) => raw.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}>自定义千分位: 1234567</Numeral>
  </div>
  <div>
    <Numeral component="strong" rule="percentages" precision={0}>加粗百分比: 0.86</Numeral>
  </div>
  <div>
    <Numeral link rule="numbers" precision={0}>链接样式数值: 8.8e3</Numeral>
  </div>
</div>
