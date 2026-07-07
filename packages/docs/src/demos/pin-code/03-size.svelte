<script lang="ts">
  import { PinCode, Space } from '@chenzy-design/svelte';
</script>

<Space vertical>
  <PinCode count={4} size="small" />
  <PinCode count={4} size="default" />
  <PinCode count={4} size="large" />
</Space>
