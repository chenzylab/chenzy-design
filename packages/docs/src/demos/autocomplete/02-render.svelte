<script lang="ts">
  import { AutoComplete, Avatar } from '@chenzy-design/svelte';
  import type { AvatarColor } from '@chenzy-design/svelte';
  import { IconSearch } from '@chenzy-design/icons';

  type Person = { name: string; email: string; abbr: string; color: AvatarColor; value: string; label: string };

  const source = [
    { name: '夏可漫', email: 'xiakeman@example.com', abbr: 'XK', color: 'amber' as AvatarColor },
    { name: '申悦', email: 'shenyue@example.com', abbr: 'SY', color: 'indigo' as AvatarColor },
    { name: '曲晨一', email: 'quchenyi@example.com', abbr: 'CY', color: 'blue' as AvatarColor },
    { name: '文嘉茂', email: 'wenjiamao@example.com', abbr: 'JM', color: 'cyan' as AvatarColor },
  ];

  let data = $state<Person[]>([]);

  const handleStringSearch = (v: string) => {
    data = v ? source.map((item) => ({ ...item, value: item.name, label: item.email })) : [];
  };
</script>

<AutoComplete
  {data}
  showClear
  onSearch={handleStringSearch}
  style="width: 280px"
>
  {#snippet prefix()}
    <IconSearch />
  {/snippet}
  {#snippet renderItem({ item })}
    {@const p = item as unknown as Person}
    <div style="display: flex">
      <Avatar color={p.color} size="small">{p.abbr}</Avatar>
      <div style="margin-left: 4px">
        <div style="font-size: 14px; margin-left: 4px">{p.name}</div>
        <div style="margin-left: 4px">{p.email}</div>
      </div>
    </div>
  {/snippet}
  {#snippet renderSelectedItem({ item })}
    {(item as unknown as Person).email}
  {/snippet}
</AutoComplete>
