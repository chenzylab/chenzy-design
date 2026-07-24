<script lang="ts">
  import { Select } from '@chenzy-design/svelte';

  let value = $state<string>('xigua');

  const optionList = [
    { value: 'douyin', label: '抖音' },
    { value: 'ulikecam', label: '轻颜相机' },
    { value: 'jianying', label: '剪映' },
    { value: 'xigua', label: '西瓜视频' },
  ];
</script>

<Select
  {value}
  style="width: 300px"
  onChange={(v) => (value = v as string)}
  placeholder="受控的Select"
  {optionList}
/>
