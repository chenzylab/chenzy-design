<script lang="ts">
  import { Tree, Text } from '@chenzy-design/svelte';
  import type { TreeNode } from '@chenzy-design/svelte';

  const treeData: TreeNode[] = [
    { label: '亚洲', key: 'asia', children: [{ label: '中国', key: 'china' }, { label: '日本', key: 'japan' }] },
    { label: '北美洲', key: 'na', children: [{ label: '美国', key: 'us' }] },
    { label: '欧洲', key: 'eu', children: [{ label: '法国', key: 'fr' }] },
  ];
</script>

<div style="width:260px">
  <Text type="tertiary" size="small">accordion：同层级最多展开一个</Text>
  <Tree style="width: 260px; height: 420px; border: 1px solid var(--cd-color-border); border-radius: 6px; box-sizing: border-box" {treeData} accordion ariaLabel="手风琴树" />
</div>
