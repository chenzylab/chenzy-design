<script lang="ts">
  import { Select, Text } from '@chenzy-design/svelte';

  const {
    disabled = false,
    size = 'default',
    placeholder = '请选择',
  }: {
    disabled?: boolean;
    size?: 'small' | 'default' | 'large';
    placeholder?: string;
  } = $props();

  const fruitOptions = [
    { label: '苹果', value: 'apple' },
    { label: '香蕉', value: 'banana' },
    { label: '橙子', value: 'orange' },
    { label: '葡萄', value: 'grape' },
  ];

  const longTagOptions = [
    { label: '人工智能与机器学习', value: 'ai' },
    { label: '云原生基础设施', value: 'cloud' },
    { label: '前端工程化', value: 'fe' },
  ];

  const bigOptions = Array.from({ length: 2000 }, (_, i) => ({
    label: `选项 ${i + 1}`,
    value: i + 1,
  }));

  let selVal = $state<string | number>('');
  let selGroupVal = $state<string | number>('');

  let remoteVal = $state<string | number>('');
  let remoteOptions = $state<{ label: string; value: string }[]>([]);
  let remoteLoading = $state(false);
  let remoteTimer: ReturnType<typeof setTimeout> | undefined;
  function handleRemoteSearch(q: string) {
    if (remoteTimer) clearTimeout(remoteTimer);
    if (!q.trim()) {
      remoteOptions = [];
      remoteLoading = false;
      return;
    }
    remoteLoading = true;
    remoteTimer = setTimeout(() => {
      remoteOptions = [1, 2, 3].map((i) => ({ label: `${q} 结果 ${i}`, value: `${q}-${i}` }));
      remoteLoading = false;
    }, 500);
  }

  let multiVal = $state<(string | number)[]>([]);
  let multiTruncVal = $state<(string | number)[]>(['ai', 'cloud']);
  let bigVal = $state<string | number>('');
</script>

<!-- 单选 -->
<div style="width: 220px">
  <Select
    optionList={fruitOptions}
    value={selVal}
    showClear
    {disabled}
    {size}
    {placeholder}
    onChange={(v) => (selVal = v as string | number)}
  />
  <Text type="tertiary">单选：{selVal || '（未选）'}</Text>
</div>

<!-- 分组 + 搜索 -->
<div style="width: 220px; margin-top: 12px" data-testid="select-group">
  <Select
    optionList={[
      { label: '水果', options: [
        { label: '苹果', value: 'apple' },
        { label: '香蕉', value: 'banana' },
      ] },
      { label: '蔬菜', options: [
        { label: '番茄', value: 'tomato' },
        { label: '黄瓜', value: 'cucumber' },
      ] },
    ]}
    filter
    showClear
    placeholder="分组选择"
    value={selGroupVal}
    onChange={(v) => (selGroupVal = v as string | number)}
  />
  <Text type="tertiary">分组单选：{selGroupVal || '（未选）'}</Text>
</div>

<!-- 远程搜索 -->
<div style="width: 220px; margin-top: 12px" data-testid="select-remote">
  <Select
    optionList={remoteOptions}
    filter
    remote
    loading={remoteLoading}
    onSearch={handleRemoteSearch}
    showClear
    placeholder="远程搜索（输入触发）"
    value={remoteVal}
    onChange={(v) => (remoteVal = v as string | number)}
  />
  <Text type="tertiary">远程：{remoteVal || '（未选）'}</Text>
</div>

<!-- 多选 + allowCreate + maxTagCount -->
<div style="width: 260px; margin-top: 12px" data-testid="select-multi">
  <Select
    optionList={fruitOptions}
    multiple
    filter
    allowCreate
    maxTagCount={2}
    value={multiVal}
    onChange={(v) => (multiVal = v as (string | number)[])}
  />
  <Text type="tertiary">多选（折叠 2 / 可创建）：{multiVal.join(', ') || '（无）'}</Text>
</div>

<!-- 多选单 tag 截断 -->
<div style="width: 260px; margin-top: 12px" data-testid="select-multi-trunc">
  <Select
    optionList={longTagOptions}
    multiple
    maxTagTextLength={4}
    value={multiTruncVal}
    onChange={(v) => (multiTruncVal = v as (string | number)[])}
  />
  <Text type="tertiary">多选单 tag 截断（maxTagTextLength=4）：{multiTruncVal.join(', ') || '（无）'}</Text>
</div>

<!-- 虚拟化大数据 -->
<div style="width: 260px; margin-top: 12px" data-testid="select-virtualized">
  <Select
    optionList={bigOptions}
    virtualize={{ itemSize: 32 }}
    filter
    showClear
    placeholder="虚拟化（2000 选项）"
    value={bigVal}
    onChange={(v) => (bigVal = v as string | number)}
  />
  <Text type="tertiary">虚拟化单选：{bigVal || '（未选）'}</Text>
</div>
