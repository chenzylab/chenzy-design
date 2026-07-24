<script lang="ts">
  import { Select } from '@chenzy-design/svelte';

  const list = [
    { value: 'douyin', label: '抖音', otherKey: 0 },
    { value: 'ulikecam', label: '轻颜相机', disabled: true, otherKey: 1 },
    { value: 'jianying', label: '剪映', otherKey: 2 },
    { value: 'toutiao', label: '今日头条', otherKey: 3 },
  ];
</script>

<Select placeholder="请选择业务线" style="width: 180px" optionList={list} />
