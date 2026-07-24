<script lang="ts">
  import { Transfer } from '@chenzy-design/svelte';

  const treeData = [
    {
      label: 'Asia',
      value: 'Asia',
      key: '0',
      children: [
        {
          label: 'China',
          value: 'China',
          key: '0-0',
          children: [
            { label: 'Beijing', value: 'Beijing', key: '0-0-0' },
            { label: 'Shanghai', value: 'Shanghai', key: '0-0-1' },
            { label: 'Chengdu', value: 'Chengdu', key: '0-0-2' },
          ],
        },
        {
          label: 'Japan',
          value: 'Japan',
          key: '0-1',
          children: [{ label: 'Osaka', value: 'Osaka', key: '0-1-0' }],
        },
      ],
    },
    {
      label: 'North America',
      value: 'North America',
      key: '1',
      children: [
        { label: 'United States', value: 'United States', key: '1-0' },
        { label: 'Canada', value: 'Canada', key: '1-1' },
      ],
    },
  ];

  let value = $state<(string | number)[]>([]);
</script>

<!-- 树穿梭框自定义头部：leafOnlyNum 显示可选叶子节点数量 -->
<Transfer type="treeList" dataSource={treeData} {value} onChange={(keys) => (value = keys)}>
  {#snippet renderSourceHeader({ leafOnlyNum })}
    <div style="padding:8px 12px;font-weight:600">共 {leafOnlyNum ?? 0} 个叶子节点可选</div>
  {/snippet}
</Transfer>
