<script lang="ts">
  import { PinCode } from '@chenzy-design/svelte';
</script>

<div style="display:flex; flex-direction:column; gap:16px; align-items:flex-start">
  <PinCode
    size="small"
    defaultValue="123456"
    onComplete={(v) => console.log('pincode: ', v)}
    onChange={(v) => console.log(v)}
  />
  <PinCode
    size="default"
    defaultValue="123456"
    onComplete={(v) => console.log('pincode: ', v)}
    onChange={(v) => console.log(v)}
  />
  <PinCode
    size="large"
    defaultValue="123456"
    onComplete={(v) => console.log('pincode: ', v)}
    onChange={(v) => console.log(v)}
  />
</div>
