<script lang="ts">
  import { Transfer } from '@chenzy-design/svelte';

  const groupData = [
    {
      title: '华东',
      items: [
        { key: 'hz', label: '杭州' },
        { key: 'nj', label: '南京' },
        { key: 'sh', label: '上海' },
      ],
    },
    {
      title: '华南',
      items: [
        { key: 'gz', label: '广州' },
        { key: 'sz', label: '深圳' },
      ],
    },
  ];

  let value = $state<(string | number)[]>(['hz']);
</script>

<!-- type='groupList'：源面板按分组渲染分组标题 -->
<Transfer type="groupList" dataSource={groupData} {value} onChange={(keys) => (value = keys)} />
