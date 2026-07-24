<script lang="ts">
  import { PinCode } from '@chenzy-design/svelte';
</script>

<!-- 通过 count 设置位数，默认 6 位，此处设置为 4 位。 -->
<PinCode
  size="large"
  defaultValue="6688"
  count={4}
  onComplete={(v) => console.log('pincode: ', v)}
  onChange={(v) => console.log(v)}
/>
