<script lang="ts">
  import { AutoComplete } from '@chenzy-design/svelte';
  import { IconSearch } from '@chenzy-design/icons';
  import { IconSelect, IconForm, IconTable, IconInput, IconButton } from '@chenzy-design/icons-lab';
  import type { Component } from 'svelte';

  type Biz = { value: string; label: string; icon: Component };

  const initList: Biz[] = [
    { value: 'select', label: '选择器', icon: IconSelect },
    { value: 'input', label: '输入框', icon: IconInput },
    { value: 'form', label: '表单', icon: IconForm },
    { value: 'button', label: '按钮', icon: IconButton },
    { value: 'table', label: '表格', icon: IconTable },
  ];

  let loading = $state(false);
  let list = $state<Biz[]>(initList);

  let timer: ReturnType<typeof setTimeout> | undefined;
  const handleSearch = (inputValue: string) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      loading = true;
      const newList = inputValue ? initList.filter((item) => item.value.includes(inputValue)) : initList;
      setTimeout(() => {
        list = newList;
        loading = false;
      }, 1000);
    }, 200);
  };
</script>

<AutoComplete
  data={list}
  style="width: 250px"
  onSearch={handleSearch}
  {loading}
  onSelect={(item) => console.log(item)}
>
  {#snippet prefix()}
    <IconSearch />
  {/snippet}
  {#snippet renderItem({ item })}
    {@const biz = item as unknown as Biz}
    <div style="display: flex; align-items: center">
      <div style="font-size: 32px">
        <biz.icon />
      </div>
      <div style="margin-left: 12px">
        <p>{biz.value}</p>
        <p>{biz.label}</p>
      </div>
    </div>
  {/snippet}
</AutoComplete>
