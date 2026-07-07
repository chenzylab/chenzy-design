<script lang="ts">
  import { InputNumber, Text } from '@chenzy-design/svelte';

  const v = 123456.78;
</script>

<div style="display:flex;flex-direction:column;gap:12px;align-items:flex-start">
  <!-- showCurrencySymbol=false 隐藏内置符号，用 prefix/suffix 自行展示 -->
  <Text type="tertiary">showCurrencySymbol=false + prefix/suffix 自定义</Text>
  <div style="width:220px">
    <InputNumber currency="CNY" prefix="￥" showCurrencySymbol={false} defaultValue={v} />
  </div>
  <div style="width:220px">
    <InputNumber currency="CNY" suffix="人民币" showCurrencySymbol={false} defaultValue={v} />
  </div>
</div>
