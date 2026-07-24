<script lang="ts">
  import { Cascader, Text } from '@chenzy-design/svelte';
  import { treeData } from './_data';

  let picked = $state<string>('（未选）');
</script>

<div style="width: 300px">
  <Cascader
    style="width: 300px"
    {treeData}
    onChangeWithObject
    placeholder="onChangeWithObject 回传节点对象"
    onChange={(nodes) => {
      const path = nodes as { label: string; value: string }[];
      picked = path.map((n) => `${n.label}(${n.value})`).join(' / ');
    }}
  />
  <Text type="tertiary">选中路径节点：{picked}</Text>
</div>
