<script lang="ts">
  import { InputNumber } from '@chenzy-design/svelte';

  const defaultValue = 123456.78;
</script>

<div>
  <div>🇨🇳 人民币</div>
  <InputNumber localeCode="zh-CN" currency="CNY" {defaultValue} />
  <br />
  <br />
  <div>🇪🇺 欧元</div>
  <InputNumber localeCode="de-DE" currency="EUR" {defaultValue} />
  <br />
  <br />
  <div>🇯🇵 日元</div>
  <InputNumber localeCode="ja-JP" currency="JPY" {defaultValue} />
  <br />
  <br />
  <div>🇻🇳 越南盾</div>
  <InputNumber localeCode="vi-VN" currency="VND" {defaultValue} />
  <br />
  <br />
</div>
