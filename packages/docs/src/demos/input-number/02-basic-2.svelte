<script lang="ts">
  import { InputNumber } from '@chenzy-design/svelte';
</script>

<div style="width: 280px">
  <div>设置了默认值 defaultValue=1 </div>
  <InputNumber defaultValue={1} />
  <br /><br />

  <div>禁用 disabled=true</div>
  <InputNumber defaultValue={2} disabled />
  <br /><br />

  <div>设置了小数位数 precision=2 </div>
  <InputNumber precision={2} defaultValue={1.234} />
  <br /><br />

  <div>设置了 innerButtons=true </div>
  <InputNumber innerButtons={true} suffix="小时" defaultValue={1} style="width: 190px" />
  <br />
</div>
