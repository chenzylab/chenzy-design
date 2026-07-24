<script lang="ts">
  import { Select } from '@chenzy-design/svelte';

  const optionList = [{ value: 'ulikecam', label: '轻颜相机' }];
</script>

<Select style="width: 180px" {optionList} />
<br />
<br />
<Select style="width: 180px" validateStatus="warning" {optionList} />
<br />
<br />
<Select style="width: 180px" validateStatus="error" {optionList} />
