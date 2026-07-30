<script lang="ts">
  import { Checkbox } from '@chenzy-design/svelte';
</script>

<div>
  <Checkbox defaultChecked={false} disabled aria-label="Checkbox 示例">Unchecked Disabled</Checkbox>
  <br />
  <Checkbox defaultChecked disabled aria-label="Checkbox 示例">Checked Disabled</Checkbox>
</div>
