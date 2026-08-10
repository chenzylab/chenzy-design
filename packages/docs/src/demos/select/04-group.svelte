<script lang="ts">
  import { Select } from '@chenzy-design/svelte';

  // 分组仅支持组合式 <Select.OptGroup> children 声明（对齐 Semi：不支持 optionList 数组传入）。
  const data = [
    {
      label: 'Asia',
      children: [
        { value: 'a-1', label: 'China' },
        { value: 'a-2', label: 'Korea' },
      ],
    },
    {
      label: 'Europe',
      children: [
        { value: 'b-1', label: 'Germany' },
        { value: 'b-2', label: 'France' },
      ],
    },
    {
      label: 'South America',
      children: [{ value: 'c-1', label: 'Peru' }],
    },
  ];
</script>

<Select placeholder="" style="width: 180px" filter>
  <Select.OptGroup label="Asia">
    <Select.Option value="a-1" label="China" />
    <Select.Option value="a-2" label="Korea" />
  </Select.OptGroup>
  <Select.OptGroup label="Europe">
    <Select.Option value="b-1" label="Germany" />
    <Select.Option value="b-2" label="France" />
  </Select.OptGroup>
  <Select.OptGroup label="South America">
    <Select.Option value="c-1" label="Peru" />
  </Select.OptGroup>
</Select>
<br />
<br />
<Select placeholder="" style="width: 180px" filter>
  {#each data as group (group.label)}
    <Select.OptGroup label={group.label}>
      {#each group.children as option (option.value)}
        <Select.Option value={option.value} label={option.label} />
      {/each}
    </Select.OptGroup>
  {/each}
</Select>
