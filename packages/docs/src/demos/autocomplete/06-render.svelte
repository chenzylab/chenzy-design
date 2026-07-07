<script lang="ts">
  import { AutoComplete, Avatar } from '@chenzy-design/svelte';

  type Person = { name: string; email: string; abbr: string; color: string };
  const people: Person[] = [
    { name: '夏可漫', email: 'xiakeman@example.com', abbr: 'XK', color: 'amber' },
    { name: '申悦', email: 'shenyue@example.com', abbr: 'SY', color: 'indigo' },
    { name: '曲晨一', email: 'quchenyi@example.com', abbr: 'CY', color: 'blue' },
    { name: '文嘉茂', email: 'wenjiamao@example.com', abbr: 'JM', color: 'cyan' },
  ];

  let value = $state('');
  let data = $state<{ value: string; label: string }[]>([]);

  function search(query: string) {
    data = query
      ? people.map((p) => ({ ...p, value: p.name, label: p.email }))
      : [];
  }
  const byName = (name: string) => people.find((p) => p.name === name);
</script>

<div style="width: 320px">
  <!-- renderItem 自定义候选项渲染；renderSelectedItem 定制选中后回填文案（仅 string） -->
  <AutoComplete
    {data}
    {value}
    prefix="搜索"
    placeholder="输入姓名联想联系人"
    onSearch={search}
    onChange={(v) => (value = v)}
  >
    {#snippet renderItem({ item })}
      {@const p = byName(String(item.value))}
      <div style="display:flex;align-items:center;gap:8px;padding:2px 0">
        <Avatar color={p?.color} size="small">{p?.abbr}</Avatar>
        <div>
          <div style="font-size:14px">{p?.name}</div>
          <div style="font-size:12px;color:var(--cd-color-text-2)">{p?.email}</div>
        </div>
      </div>
    {/snippet}
    {#snippet renderSelectedItem({ item })}
      {byName(String(item.value))?.email ?? String(item.value)}
    {/snippet}
  </AutoComplete>
</div>
