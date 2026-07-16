<script lang="ts">
  import { AutoComplete, Text } from '@chenzy-design/svelte';

  const suffixes = ['gmail.com', 'outlook.com', 'qq.com', '163.com'];
  let value = $state('');
  let data = $state<string[]>([]);

  // 对齐 Semi：组件不做本地过滤，输入时按 query 准备候选 data。
  function onSearch(query: string) {
    const at = query.indexOf('@');
    if (at === -1) {
      data = query ? suffixes.map((s) => `${query}@${s}`) : [];
    } else {
      const prefix = query.slice(0, at);
      const rest = query.slice(at + 1).toLowerCase();
      data = suffixes.filter((s) => s.startsWith(rest)).map((s) => `${prefix}@${s}`);
    }
  }
</script>

<div style="width: 220px">
  <AutoComplete
    {data}
    {value}
    placeholder="输入邮箱"
    {onSearch}
    onChange={(v) => (value = String(v))}
  />
  <Text type="tertiary">输入：{value || '（空）'}</Text>
</div>
