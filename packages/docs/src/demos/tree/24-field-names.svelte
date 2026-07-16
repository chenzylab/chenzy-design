<script lang="ts">
  import { Tree, Text } from '@chenzy-design/svelte';
  import type { TreeNode } from '@chenzy-design/svelte';

  // 后端数据用 id/name/sub 字段，通过 keyMaps 映射为标准 key/label/children
  const raw = [
    {
      id: 'd1',
      name: '设计中心',
      sub: [
        { id: 'd1-1', name: 'Figma 规范' },
        { id: 'd1-2', name: 'Design Token' },
      ],
    },
    {
      id: 'd2',
      name: '研发中心',
      sub: [{ id: 'd2-1', name: '前端组' }],
    },
  ];

  let selected = $state<string | number | null>(null);
</script>

<div style="width:260px">
  <Tree
    style="width: 260px; height: 420px; border: 1px solid var(--cd-color-border); border-radius: 6px; box-sizing: border-box"
    treeData={raw as unknown as TreeNode[]}
    keyMaps={{ key: 'id', label: 'name', children: 'sub' }}
    defaultExpandAll
    value={selected}
    onChange={(v) => (selected = v as string | number)}
    ariaLabel="字段映射树"
  />
  <Text type="tertiary" size="small">已选：{selected ?? '（未选）'}</Text>
</div>
