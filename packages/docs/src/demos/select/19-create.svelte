<script lang="ts">
  import { Select } from '@chenzy-design/svelte';

  const optionList = [
    { value: 'douyin', label: '抖音' },
    { value: 'ulikecam', label: '轻颜相机' },
    { value: 'jianying', label: '剪映' },
    { value: 'toutiao', label: '今日头条' },
  ];
</script>

<Select
  style="width: 400px"
  {optionList}
  allowCreate={true}
  multiple={true}
  filter={true}
  onChange={(v) => console.log(v)}
  defaultActiveFirstOption
/>
<br />
<br />
<Select
  style="width: 400px"
  {optionList}
  allowCreate={true}
  multiple={true}
  filter={true}
  placeholder="With renderCreateItem"
  onChange={(v) => console.log(v)}
  defaultActiveFirstOption
>
  {#snippet renderCreateItem(input)}
    <div style="padding: 10px">Create Item：{input}</div>
  {/snippet}
</Select>
