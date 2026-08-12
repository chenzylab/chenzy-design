<script lang="ts">
  import { Tree, Button } from '@chenzy-design/svelte';

  type SimpleJson = Record<string, string | Record<string, string>>;

  const json: SimpleJson = {
    Node1: {
      'Child Node1': '0-0-1',
      'Child Node2': '0-0-2',
    },
    Node2: '0-1',
  };
  const json2: SimpleJson = {
    Node3: {
      'Child Node1': '0-0-1',
      'Child Node2': '0-0-2',
      'Child Node3': '0-0-3',
      'Child Node4': '0-0-4',
    },
    Node2: '0-1',
  };

  let tree = $state<SimpleJson>(json);
  function handleClick() {
    tree = json2;
  }
</script>

<Button onclick={handleClick} style="margin-bottom: 10px">点击更新 TreeData</Button>
<div style="display: flex">
  <div>
    <span>defaultExpandAll</span>
    <Tree
      defaultExpandAll
      treeDataSimpleJson={tree}
      style="margin-right: 20px; width: 260px; height: 420px; border: 1px solid var(--cd-color-border)"
    />
  </div>
  <div>
    <span>expandAll</span>
    <Tree
      expandAll
      treeDataSimpleJson={tree}
      style="width: 260px; height: 420px; border: 1px solid var(--cd-color-border)"
    />
  </div>
</div>
