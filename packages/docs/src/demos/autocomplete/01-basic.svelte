<script lang="ts">
  import { AutoComplete } from '@chenzy-design/svelte';
  import { IconSearch } from '@chenzy-design/icons';

  let stringData = $state<string[]>([]);
  let value = $state('');

  const handleStringSearch = (v: string) => {
    stringData = v ? ['gmail.com', '163.com', 'qq.com'].map((domain) => `${v}@${domain}`) : [];
  };
</script>

<AutoComplete
  data={stringData}
  {value}
  showClear
  placeholder="搜索... "
  onSearch={handleStringSearch}
  onChange={(v) => (value = v as string)}
  style="width: 200px"
>
  {#snippet prefix()}
    <IconSearch />
  {/snippet}
</AutoComplete>
