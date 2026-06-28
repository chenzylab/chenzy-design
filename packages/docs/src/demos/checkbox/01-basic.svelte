<script lang="ts">
  import { Checkbox } from '@chenzy-design/svelte';

  let checked = $state(false);
</script>

<div style="display: flex; flex-direction: column; gap: 8px;">
  <Checkbox bind:checked>默认复选框</Checkbox>
  <Checkbox checked={true}>已选中</Checkbox>
  <Checkbox disabled>禁用未选</Checkbox>
  <Checkbox checked={true} disabled>禁用已选</Checkbox>
</div>
