<script lang="ts">
  import { AutoComplete } from '@chenzy-design/svelte';

  let value = $state('');
  const data = ['上海', '北京', '广州', '深圳', '杭州', '成都'];
</script>

<div style="width: 260px">
  <!-- prefix 前缀标签 + clearable 一键清空 -->
  <AutoComplete
    {data}
    {value}
    clearable
    prefix="城市"
    placeholder="选择城市"
    onChange={(v) => (value = v)}
  />
</div>
