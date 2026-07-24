<script lang="ts">
  import { Cascader, Toast } from '@chenzy-design/svelte';
  import { treeData } from './_data';
</script>

<Cascader
  style="width: 300px"
  {treeData}
  placeholder="最多选择两项"
  multiple
  max={2}
  onExceed={() => Toast.warning('最多只允许选择两项')}
/>
