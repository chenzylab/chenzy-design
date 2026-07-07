<script lang="ts">
  import { Transfer, Space, Text } from '@chenzy-design/svelte';

  const transferData = [
    { key: 'a', label: '北京' },
    { key: 'b', label: '上海' },
    { key: 'c', label: '广州' },
    { key: 'd', label: '深圳' },
  ];

  const transferGroupData = [
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

  const transferTreeData = [
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
    { key: 'cd', label: '成都' },
  ];

  // 大数据集：验证虚拟化
  const transferBigData = Array.from({ length: 2000 }, (_, i) => ({
    key: `n${i}`,
    label: `选项 ${i}`,
  }));

  // 远程搜索 mock
  const transferRemoteAll = Array.from({ length: 50 }, (_, i) => ({
    key: `r${i}`,
    label: `远程城市 ${i}`,
  }));
  let transferRemoteData = $state<{ key: string; label: string }[]>(
    transferRemoteAll.slice(0, 8),
  );
  let transferRemoteLoading = $state(false);
  let transferRemoteTimer: ReturnType<typeof setTimeout> | undefined;
  function transferRemoteSearch(q: string) {
    transferRemoteLoading = true;
    if (transferRemoteTimer) clearTimeout(transferRemoteTimer);
    transferRemoteTimer = setTimeout(() => {
      const kw = q.trim().toLowerCase();
      transferRemoteData = kw
        ? transferRemoteAll.filter((o) => o.label.toLowerCase().includes(kw))
        : transferRemoteAll.slice(0, 8);
      transferRemoteLoading = false;
    }, 500);
  }

  let transferVal = $state<(string | number)[]>(['b']);
  let transferGroupVal = $state<(string | number)[]>(['hz']);
  let transferTreeVal = $state<(string | number)[]>(['hz']);
  let transferOneWayVal = $state<(string | number)[]>(['b']);
  let transferBigVal = $state<(string | number)[]>([]);
  let transferDragVal = $state<(string | number)[]>(['a', 'b', 'c', 'd']);
  let transferRemoteVal = $state<(string | number)[]>([]);
</script>

<Space vertical align="start">
  <Transfer
    dataSource={transferData}
    value={transferVal}
    titles={['可选城市', '已选城市']}
    onChange={(keys) => (transferVal = keys)}
  />
  <Text type="tertiary">已选：{transferVal.join(', ') || '（无）'}</Text>

  <div data-testid="transfer-group">
    <Transfer
      dataSource={transferGroupData}
      value={transferGroupVal}
      titles={['可选城市', '已选城市']}
      onChange={(keys) => (transferGroupVal = keys)}
    />
  </div>
  <Text type="tertiary">分组已选：{transferGroupVal.join(', ') || '（无）'}</Text>

  <Text type="tertiary">treeList 树状源面板（勾父连带勾子叶子、半选、已迁移叶子置灰）：</Text>
  <div data-testid="transfer-tree">
    <Transfer
      dataSource={transferTreeData}
      value={transferTreeVal}
      titles={['可选城市', '已选城市']}
      onChange={(keys) => (transferTreeVal = keys)}
    />
  </div>
  <Text type="tertiary">树已选：{transferTreeVal.join(', ') || '（无）'}</Text>

  <Text type="tertiary">oneWay 单向迁移（右侧项各带移除按钮）：</Text>
  <div data-testid="transfer-oneway">
    <Transfer
      oneWay
      dataSource={transferData}
      value={transferOneWayVal}
      titles={['可选城市', '已选城市']}
      onChange={(keys) => (transferOneWayVal = keys)}
    />
  </div>
  <Text type="tertiary">单向已选：{transferOneWayVal.join(', ') || '（无）'}</Text>

  <Text type="tertiary">virtualize 虚拟化（2000 项，仅渲染视口内）：</Text>
  <div data-testid="transfer-virtual">
    <Transfer
      virtualize
      dataSource={transferBigData}
      value={transferBigVal}
      titles={['可选（2000）', '已选']}
      onChange={(keys) => (transferBigVal = keys)}
    />
  </div>

  <Text type="tertiary">draggable 目标列拖拽重排：</Text>
  <div data-testid="transfer-drag">
    <Transfer
      draggable
      filter={false}
      dataSource={transferData}
      value={transferDragVal}
      titles={['可选城市', '已选（可拖拽）']}
      onChange={(keys) => (transferDragVal = keys)}
    />
  </div>
  <Text type="tertiary">拖拽后顺序：{transferDragVal.join(', ') || '（无）'}</Text>

  <Text type="tertiary">remote onSearch 远程搜索（防抖 + loading）：</Text>
  <div data-testid="transfer-remote">
    <Transfer
      dataSource={transferRemoteData}
      value={transferRemoteVal}
      loading={transferRemoteLoading}
      onSearch={transferRemoteSearch}
      titles={['远程结果', '已选']}
      onChange={(keys) => (transferRemoteVal = keys)}
    />
  </div>
  <Text type="tertiary">远程已选：{transferRemoteVal.join(', ') || '（无）'}</Text>
</Space>
