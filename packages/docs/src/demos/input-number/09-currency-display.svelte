<script lang="ts">
  import { InputNumber } from '@chenzy-design/svelte';

  const defaultValue = 123456.78;
</script>

<div>
  <div>🇨🇳 CNY ➕ code</div>
  <InputNumber currency="CNY" currencyDisplay="code" {defaultValue} />
  <br />
  <br />
  <div>🇨🇳 CNY ➕ symbol</div>
  <InputNumber currency="CNY" currencyDisplay="symbol" {defaultValue} />
  <br />
  <br />
  <div>🇨🇳 CNY ➕ name</div>
  <InputNumber currency="CNY" currencyDisplay="name" {defaultValue} />
  <br />
  <br />
</div>
