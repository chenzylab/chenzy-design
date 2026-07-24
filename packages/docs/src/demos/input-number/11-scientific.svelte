<script lang="ts">
  import { InputNumber } from '@chenzy-design/svelte';
</script>

<div style="width: 280px">
  <div>启用科学计数法（默认阈值 15 位）</div>
  <InputNumber scientificNotation defaultValue={123456789012345} />
  <br /><br />

  <div>自定义阈值（10 位）</div>
  <InputNumber scientificNotation={{ threshold: 10 }} defaultValue={1234567890} />
  <br /><br />

  <div>超大数字</div>
  <InputNumber scientificNotation defaultValue={9999999999999999} />
  <br /><br />

  <div>小数场景</div>
  <InputNumber scientificNotation precision={10} defaultValue={0.000000123456789} />
  <br /><br />
</div>
