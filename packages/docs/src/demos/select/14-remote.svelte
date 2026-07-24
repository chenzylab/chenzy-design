<script lang="ts">
  import { Select } from '@chenzy-design/svelte';

  let loading = $state(false);
  let list = $state([
    { value: 'douyin', label: '抖音', type: 1 },
    { value: 'xingtu', label: '醒图', type: 2 },
    { value: 'jianying', label: '剪映', type: 3 },
    { value: 'toutiao', label: '今日头条', type: 4 },
  ]);
  let value = $state<string | string[]>('');

  let timer: ReturnType<typeof setTimeout> | undefined;
  const handleSearch = (inputValue: string) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      loading = true;
      if (inputValue) {
        const length = 1 + (inputValue.length % 10);
        const result = Array.from({ length }, (_, i) => ({
          value: inputValue + i,
          label: `相近业务 ${inputValue}${i}`,
          type: i + 1,
        }));
        setTimeout(() => {
          loading = false;
          list = result;
        }, 1000);
      } else {
        loading = false;
      }
    }, 1000);
  };
</script>

<Select
  style="width: 300px"
  filter
  remote
  multiple
  {value}
  onSearch={handleSearch}
  optionList={list}
  {loading}
  onChange={(v) => (value = v as string | string[])}
/>
