<script lang="ts">
  import { InputNumber } from '@chenzy-design/svelte';
</script>

<div style="width: 180px">
  <div>默认尺寸 size=default</div>
  <InputNumber />
  <br /><br />

  <div>大尺寸 size=large</div>
  <InputNumber size="large" />
  <br /><br />

  <div>小尺寸 size=small</div>
  <InputNumber size="small" />
  <br />
</div>
