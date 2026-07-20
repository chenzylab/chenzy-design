<script lang="ts">
  import { Input, Typography } from '@chenzy-design/svelte';
  import { IconSearch } from '@chenzy-design/icons';
</script>

<Input showClear>
  {#snippet prefix()}<IconSearch />{/snippet}
</Input>
<br /><br />
<Input prefix="Prefix" showClear />
<br /><br />
<Input showClear>
  {#snippet suffix()}<IconSearch />{/snippet}
</Input>
<br /><br />
<Input showClear>
  {#snippet suffix()}
    <Typography.Text strong type="secondary" style="margin-right: 8px;">Suffix</Typography.Text>
  {/snippet}
</Input>
