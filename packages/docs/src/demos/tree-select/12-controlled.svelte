<script lang="ts">
  import { TreeSelect } from '@chenzy-design/svelte';
  import { treeData } from './_data';

  let value = $state<string>('Shanghai');
</script>

<TreeSelect
  style="width: 300px"
  dropdownStyle="max-height: 400px; overflow: auto"
  {treeData}
  {value}
  placeholder="请选择"
  onChange={(k) => (value = k as string)}
/>
