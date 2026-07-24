<script lang="ts">
  import { AutoComplete } from '@chenzy-design/svelte';
  import { IconSearch } from '@chenzy-design/icons';

  type Biz = { value: string; label: string };

  const initList: Biz[] = [
    { value: 'select', label: '选择器' },
    { value: 'input', label: '输入框' },
    { value: 'form', label: '表单' },
    { value: 'button', label: '按钮' },
    { value: 'table', label: '表格' },
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
>
  {#snippet prefix()}
    <IconSearch />
  {/snippet}
  {#snippet renderItem({ item })}
    {@const biz = item as unknown as Biz}
    <div style="display: flex; align-items: center">
      <div>
        <p>{biz.value}</p>
        <p>{biz.label}</p>
      </div>
    </div>
  {/snippet}
</AutoComplete>
