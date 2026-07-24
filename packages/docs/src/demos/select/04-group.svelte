<script lang="ts">
  import { Select } from '@chenzy-design/svelte';

  // 分组：optionList 中含 { label, options } 的对象即渲染为一个分组。
  const optionList = [
    {
      label: 'Asia',
      options: [
        { value: 'a-1', label: 'China' },
        { value: 'a-2', label: 'Korea' },
      ],
    },
    {
      label: 'Europe',
      options: [
        { value: 'b-1', label: 'Germany' },
        { value: 'b-2', label: 'France' },
      ],
    },
    {
      label: 'South America',
      options: [{ value: 'c-1', label: 'Peru' }],
    },
  ];
</script>

<Select placeholder="" style="width: 180px" filter {optionList} />
