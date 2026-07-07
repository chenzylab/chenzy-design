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
    播放量 <Numeral rule="numbers" precision={0}>2.4444e2</Numeral> 万次
  </div>
  <div>
    <Numeral rule="exponential" precision={2}>10000</Numeral>
  </div>
  <div>
    <Numeral rule="bytes-binary" precision={2}>已使用: 1500000</Numeral>
  </div>
  <div>
    向上取整 ceil: <Numeral rule="numbers" precision={2} truncate="ceil">2.346</Numeral>
    <span style="margin: 0 8px;">·</span>
    四舍五入 round: <Numeral rule="numbers" precision={2} truncate="round">2.344</Numeral>
  </div>
  <div>
    <Numeral parser={(raw) => raw.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}>自定义千分位: 1234567</Numeral>
  </div>
  <div>
    <Numeral component="strong" rule="percentages" precision={0}>加粗百分比: 0.86</Numeral>
  </div>
  <div>
    链接样式数值: <Numeral link rule="numbers" precision={0}>8.8e3</Numeral>
  </div>
</div>
