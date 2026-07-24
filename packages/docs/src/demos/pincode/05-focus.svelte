<script lang="ts">
  import { PinCode, Button } from '@chenzy-design/svelte';

  // 手动聚焦失焦：通过 bind:this 拿到组件实例，命令式调用 focus(index) / blur(index)。
  let value = $state('69af41');
  let pin = $state<ReturnType<typeof PinCode>>();
</script>

<div style="display:flex; flex-direction:column; gap:16px; align-items:flex-start">
  <Button onclick={() => pin?.focus(2)}>Focus Third Input</Button>
  <PinCode
    bind:this={pin}
    format="mixed"
    {value}
    onComplete={(v) => console.log('pincode: ', v)}
    onChange={(v) => (value = v)}
  />
</div>
