<script lang="ts">
  import { PinCode, Button } from '@chenzy-design/svelte';

  // 受控：value 传入验证码字符串，配合 onChange 受控使用。
  let value = $state('69af41');

  function setRandom() {
    value = String(Math.floor(Math.random() * 100000000)).slice(0, 6);
  }
</script>

<div style="display:flex; flex-direction:column; gap:16px; align-items:flex-start">
  <Button onclick={setRandom}>Set Random Value</Button>
  <PinCode
    format="mixed"
    {value}
    onComplete={(v) => console.log('pincode: ', v)}
    onChange={(v) => (value = v)}
  />
</div>
