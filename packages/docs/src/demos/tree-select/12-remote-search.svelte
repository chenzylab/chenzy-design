<script lang="ts">
  import { TreeSelect, Text } from '@chenzy-design/svelte';
  import type { TreeNode } from '@chenzy-design/svelte';

  // 模拟远程数据源：输入关键字后异步返回匹配的城市树
  const remoteDb: Record<string, TreeNode[]> = {
    北: [
      {
        key: 'north',
        label: '华北',
        children: [
          { key: 'bj', label: '北京' },
          { key: 'tj', label: '天津' },
        ],
      },
    ],
    上: [
      {
        key: 'east',
        label: '华东',
        children: [{ key: 'sh', label: '上海' }],
      },
    ],
    广: [
      {
        key: 'south',
        label: '华南',
        children: [
          { key: 'gz', label: '广州' },
          { key: 'sz', label: '深圳' },
        ],
      },
    ],
  };

  let treeData = $state<TreeNode[]>([]);
  let loading = $state(false);
  let value = $state<string | number | null>(null);

  // remote 开启后，输入只触发 onSearch，由外部更新 treeData
  function handleSearch(query: string) {
    if (!query) {
      treeData = [];
      loading = false;
      return;
    }
    loading = true;
    setTimeout(() => {
      treeData = remoteDb[query] ?? [];
      loading = false;
    }, 500);
  }
</script>

<div style="width: 300px">
  <TreeSelect
    {treeData}
    {value}
    remote
    showClear
    defaultExpandAll
    searchAutoFocus
    placeholder="输入「北」「上」「广」搜索"
    emptyContent={loading ? '搜索中…' : '输入关键字远程搜索'}
    onSearch={handleSearch}
    onChange={(k) => (value = Array.isArray(k) ? (k[0] ?? null) : k)}
  />
  <Text type="tertiary">remote 只触发 onSearch，结果由外部异步回填。当前：{value ?? '（未选）'}</Text>
</div>
