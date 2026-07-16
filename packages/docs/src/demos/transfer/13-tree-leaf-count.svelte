<script lang="ts">
  import { Transfer } from '@chenzy-design/svelte';

  const treeData = [
    {
      key: 'east',
      label: '华东',
      children: [
        { key: 'hz', label: '杭州' },
        { key: 'nj', label: '南京' },
        { key: 'sh', label: '上海' },
      ],
    },
    {
      key: 'south',
      label: '华南',
      children: [
        { key: 'gz', label: '广州' },
        { key: 'sz', label: '深圳' },
      ],
    },
  ];

  let value = $state<(string | number)[]>([]);
</script>

<!-- 树穿梭框自定义头部：leafOnlyNum 显示可选叶子节点数量 -->
<Transfer type="treeList" dataSource={treeData} {value} onChange={(keys) => (value = keys)}>
  {#snippet renderSourceHeader({ leafOnlyNum })}
    <div style="padding:8px 12px;font-weight:600">共 {leafOnlyNum ?? 0} 个城市可选</div>
  {/snippet}
</Transfer>
