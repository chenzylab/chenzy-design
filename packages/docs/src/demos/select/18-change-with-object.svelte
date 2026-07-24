<script lang="ts">
  import { Select } from '@chenzy-design/svelte';
  import type { OptionData } from '@chenzy-design/svelte';

  const list = [
    { value: 'douyin', label: '抖音', type: 1 },
    { value: 'ulikecam', label: '轻颜相机', type: 2 },
    { value: 'jianying', label: '剪映', type: 3 },
    { value: 'toutiao', label: '今日头条', type: 4 },
  ];

  let cbValue = $state<OptionData | OptionData[]>();
  let multipleCbValue = $state<OptionData | OptionData[]>();
</script>

<div>
  <div>
    <Select
      style="width: 150px"
      onChangeWithObject={(opt) => (cbValue = opt)}
      optionList={list}
      placeholder="单选"
      defaultValue="douyin"
    />
    <h4>onChange回调:</h4>
    <pre style="width: 320px; margin-bottom: 48px">{JSON.stringify(cbValue)}</pre>
  </div>
  <div>
    <Select
      style="width: 320px"
      onChangeWithObject={(opt) => (multipleCbValue = opt)}
      multiple
      optionList={list}
      placeholder="多选"
    />
    <h4>onChange回调:</h4>
    <pre style="width: 320px">{JSON.stringify(multipleCbValue)}</pre>
  </div>
</div>
