<script lang="ts">
  import { InputNumber, Text } from '@chenzy-design/svelte';

  const v = 123456.78;
</script>

<div style="display:flex;flex-direction:column;gap:16px;align-items:flex-start">
  <!-- currency + localeCode 按地区展示对应货币 -->
  <div style="display:flex;flex-direction:column;gap:8px">
    <Text type="tertiary">按 localeCode 展示对应货币</Text>
    <div style="width:220px"><InputNumber localeCode="zh-CN" currency="CNY" defaultValue={v} /></div>
    <div style="width:220px"><InputNumber localeCode="de-DE" currency="EUR" defaultValue={v} /></div>
    <div style="width:220px"><InputNumber localeCode="ja-JP" currency="JPY" defaultValue={v} /></div>
    <div style="width:220px"><InputNumber localeCode="vi-VN" currency="VND" defaultValue={v} /></div>
  </div>

  <!-- currencyDisplay 控制符号 / 代码 / 名称三种展示 -->
  <div style="display:flex;flex-direction:column;gap:8px">
    <Text type="tertiary">currencyDisplay：symbol / code / name</Text>
    <div style="width:220px"><InputNumber currency="CNY" currencyDisplay="symbol" defaultValue={v} /></div>
    <div style="width:220px"><InputNumber currency="CNY" currencyDisplay="code" defaultValue={v} /></div>
    <div style="width:220px"><InputNumber currency="CNY" currencyDisplay="name" defaultValue={v} /></div>
  </div>
</div>
