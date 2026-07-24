<script lang="ts">
  import { InputNumber } from '@chenzy-design/svelte';
</script>

<div style="width: 280px">
  <div>简单数字输入框</div>
  <InputNumber />
  <br /><br />

  <div>设置了步长 step=2 </div>
  <InputNumber step={2} />
  <br /><br />

  <div>设置 shiftStep=100， 按住 shift 同时点击按钮，可以一次增加/减少100 </div>
  <InputNumber shiftStep={100} />
  <br /><br />

  <div>设置了上下界 min=1,max=10</div>
  <InputNumber min={1} max={10} defaultValue={1} />
  <br /><br />
</div>
