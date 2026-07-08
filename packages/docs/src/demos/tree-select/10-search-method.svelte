<script lang="ts">
  import { TreeSelect, Button, Text } from '@chenzy-design/svelte';

  const treeData = [
    {
      key: 'asia',
      label: '亚洲',
      children: [
        { key: 'cn', label: '中国' },
        { key: 'jp', label: '日本' },
        { key: 'kr', label: '韩国' },
      ],
    },
    {
      key: 'europe',
      label: '欧洲',
      children: [
        { key: 'fr', label: '法国' },
        { key: 'de', label: '德国' },
      ],
    },
  ];

  let value = $state<string | number | null>(null);
  let ref = $state<ReturnType<typeof TreeSelect> | undefined>(undefined);
</script>

<div style="display: flex; flex-direction: column; gap: 12px; width: 260px">
  <Button onclick={() => ref?.search('中')}>命令式搜索「中」</Button>
  <!-- bind:this 拿到实例，调用 ref.search(...) 命令式触发面板内搜索 -->
  <TreeSelect
    bind:this={ref}
    {treeData}
    {value}
    showClear
    filterable
    defaultExpandAll
    placeholder="选择国家"
    onChange={(k) => (value = Array.isArray(k) ? (k[0] ?? null) : k)}
  />
  <Text type="tertiary">点击按钮后打开面板即可看到过滤结果，当前：{value ?? '（未选）'}</Text>
</div>
