<script lang="ts">
  import { InputNumber } from '@chenzy-design/svelte';

  const log = (v: number | string | null) => {
    console.log(`Changed to: [${typeof v}] ${v}`);
  };
</script>

<div style="width: 180px">
  <div>人民币</div>
  <InputNumber
    onChange={log}
    defaultValue={1000}
    min={0}
    formatter={(value) => `￥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
    parser={(value) => Number(value.replace(/\￥\s?|(,*)/g, ''))}
  />
  <br /><br />

  <div>自定义串</div>
  <InputNumber
    onChange={log}
    defaultValue={1111}
    formatter={(value) => String(value).split('').join('-')}
    parser={(value) => Number(value.replace(/\-/g, ''))}
  />
  <br />
</div>
