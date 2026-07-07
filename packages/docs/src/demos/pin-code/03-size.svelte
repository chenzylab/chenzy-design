<script lang="ts">
  import { PinCode, Space } from '@chenzy-design/svelte';
</script>

<Space vertical>
  <PinCode autoFocus={false} count={4} size="small" />
  <PinCode autoFocus={false} count={4} size="default" />
  <PinCode autoFocus={false} count={4} size="large" />
</Space>
