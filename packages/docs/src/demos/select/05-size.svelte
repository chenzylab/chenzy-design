<script lang="ts">
  import { Select } from '@chenzy-design/svelte';

  const optionList = [{ value: 'ulikecam', label: '轻颜相机' }];
</script>

<Select placeholder="请选择业务线" style="width: 180px" size="small" {optionList} />
<br />
<br />
<Select placeholder="请选择业务线" style="width: 180px" {optionList} />
<br />
<br />
<Select placeholder="请选择业务线" style="width: 180px" size="large" {optionList} />
