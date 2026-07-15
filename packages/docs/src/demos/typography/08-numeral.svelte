<script lang="ts">
  import { Typography } from '@chenzy-design/svelte';

  const { Numeral } = Typography;
</script>

<div style="display: flex; flex-direction: column; gap: 12px;">
  <Numeral precision={1}>点赞量：1.6111e1 K</Numeral>

  <div>
    播放量:
    <Numeral rule="numbers" precision={1}>2.4444e2</Numeral>
    K
  </div>

  <Numeral rule="percentages" precision={2}>好评率: 0.915</Numeral>

  <Numeral rule="percentages">这场比赛我的胜率是 0.6，输的概率是 0.4</Numeral>

  <Numeral rule="bytes-decimal" precision={2} truncate="floor">已使用: 1000</Numeral>

  <Numeral rule="bytes-binary" precision={2} truncate="floor">未使用: 2000000000000</Numeral>

  <Numeral rule="exponential" precision={2}>10000</Numeral>
</div>
