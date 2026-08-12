<script lang="ts">
  import { Tree } from '@chenzy-design/svelte';

  const json = {
    Node1: {
      'Child Node1': '0-0-1',
      'Child Node2': '0-0-2',
    },
    Node2: '0-1',
  };
</script>

<Tree
  treeDataSimpleJson={json}
  multiple
  onChange={(e) => console.log('当前所有选中项: ', e)}
  onSelect={(e) => console.log('当前选项: ', e)}
  style="width: 260px; height: 420px; border: 1px solid var(--cd-color-border)"
/>
