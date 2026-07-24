<script lang="ts">
  import { InputNumber } from '@chenzy-design/svelte';

  const defaultValue = 123456.78;
</script>

<div>
  <div>🇨🇳 CNY ➕ code</div>
  <InputNumber style="width: 200px" currency="CNY" prefix="CNY" showCurrencySymbol={false} {defaultValue} />
  <br />
  <br />
  <div>🇨🇳 CNY ➕ symbol</div>
  <InputNumber style="width: 200px" currency="CNY" prefix="￥" showCurrencySymbol={false} {defaultValue} />
  <br />
  <br />
  <div>🇨🇳 CNY ➕ name</div>
  <InputNumber style="width: 200px" currency="CNY" suffix="人民币" showCurrencySymbol={false} {defaultValue} />
  <br />
  <br />
</div>
