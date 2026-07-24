<script lang="ts">
  import { Select } from '@chenzy-design/svelte';

  const optionList = [
    { value: 'douyin', label: '抖音' },
    { value: 'ulikecam', label: '轻颜相机' },
    { value: 'jianying', label: '剪映' },
    { value: 'xigua', label: '西瓜视频' },
  ];
</script>

<Select
  placeholder="自定义弹出层样式的"
  style="width: 180px"
  dropdownStyle="width: 250px"
  dropdownClassName="test"
  {optionList}
/>
