<script lang="ts">
  import { Select } from '@chenzy-design/svelte';

  const singleList = [
    { value: 'douyin', label: '抖音' },
    { value: 'ulikecam', label: '轻颜相机' },
    { value: 'jianying', label: '剪映' },
    { value: 'xigua', label: '西瓜视频' },
  ];
  const multiList = [
    { value: 'semi-0', label: 'Semi-0' },
    { value: 'semi-1', label: 'Semi-1' },
    { value: 'semi-2', label: 'Semi-2' },
    { value: 'semi-3', label: 'Semi-3' },
    { value: 'semi-4', label: 'Semi-4' },
  ];
</script>

<Select filter style="width: 180px" placeholder="带搜索功能的单选" optionList={singleList} />
<br />
<br />
<Select
  filter
  multiple
  style="width: 300px"
  placeholder="带搜索功能的多选"
  autoClearSearchValue={false}
  optionList={multiList}
/>
