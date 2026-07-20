<script lang="ts">
  import { Checkbox } from '@chenzy-design/svelte';
</script>

<div>
  <Checkbox defaultChecked={false} disabled ariaLabel="Checkbox 示例">Unchecked Disabled</Checkbox>
  <br />
  <Checkbox defaultChecked disabled ariaLabel="Checkbox 示例">Checked Disabled</Checkbox>
</div>
