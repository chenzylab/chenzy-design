<script lang="ts">
  import { Select } from '@chenzy-design/svelte';

  const optionList = [
    { value: 'douyin', label: '抖音' },
    { value: 'ulikecam', label: '轻颜相机' },
    { value: 'jianying', label: '剪映', disabled: true },
    { value: 'xigua', label: '西瓜视频' },
  ];
</script>

<Select defaultValue="douyin" style="width: 120px" {optionList} />
<br />
<br />
<Select
  defaultValue="douyin"
  disabled
  style="width: 120px"
  optionList={[
    { value: 'douyin', label: '抖音' },
    { value: 'ulikecam', label: '轻颜相机' },
  ]}
/>
<br />
<br />
<Select placeholder="请选择业务线" style="width: 120px" {optionList} />
