<script lang="ts">
  import { Cascader, Toast } from '@chenzy-design/svelte';
  import { treeData } from './_data';
</script>

<Cascader
  style="width: 300px"
  {treeData}
  placeholder="请选择所在地区"
  multiple
  max={1}
  onExceed={(v) => {
    Toast.warning('exceed max');
    console.log(v);
  }}
  defaultValue={['zhejiang', 'ningbo', 'haishu']}
/>
