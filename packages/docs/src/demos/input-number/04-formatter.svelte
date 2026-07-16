<script lang="ts">
  import { InputNumber, Text } from '@chenzy-design/svelte';

  let amount = $state<number | null>(1234567);
  let money = $state<number | null>(8800);
  let percent = $state<number | null>(0.25);

  // 千分位
  const thousandFormatter = (n: number) => `${n}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const thousandParser = (s: string) => Number(s.replace(/,/g, ''));

  // 货币
  const moneyFormatter = (n: number) => `¥ ${n}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const moneyParser = (s: string) => Number(s.replace(/[¥,\s]/g, ''));

  // 百分比（内部存小数，显示整数百分号）
  const percentFormatter = (n: number) => `${Math.round(n * 100)}%`;
  const percentParser = (s: string) => Number(s.replace('%', '')) / 100;
</script>

<div style="display:flex; flex-direction:column; gap:16px; align-items:flex-start">
  <div style="display:flex; align-items:center; gap:8px">
    <div style="width:200px">
      <InputNumber
        value={amount}
        step={1000}
        formatter={thousandFormatter}
        parser={thousandParser}
        onNumberChange={(v) => (amount = v)}
      />
    </div>
    <Text type="tertiary">千分位：{amount}</Text>
  </div>

  <div style="display:flex; align-items:center; gap:8px">
    <div style="width:200px">
      <InputNumber
        value={money}
        min={0}
        step={100}
        precision={0}
        formatter={moneyFormatter}
        parser={moneyParser}
        onNumberChange={(v) => (money = v)}
      />
    </div>
    <Text type="tertiary">货币：{money}</Text>
  </div>

  <div style="display:flex; align-items:center; gap:8px">
    <div style="width:200px">
      <InputNumber
        value={percent}
        min={0}
        max={1}
        step={0.05}
        precision={2}
        formatter={percentFormatter}
        parser={percentParser}
        onNumberChange={(v) => (percent = v)}
      />
    </div>
    <Text type="tertiary">百分比：{percent}</Text>
  </div>
</div>
