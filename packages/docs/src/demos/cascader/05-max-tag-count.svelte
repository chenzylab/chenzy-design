<script lang="ts">
  import { Cascader } from '@chenzy-design/svelte';
  import { treeData } from './_data';
</script>

<Cascader
  style="width: 300px"
  {treeData}
  placeholder="请选择所在地区"
  multiple
  showRestTagsPopover={true}
  restTagsPopoverProps={{ position: 'top' }}
  maxTagCount={1}
  defaultValue={[
    ['zhejiang', 'ningbo', 'haishu'],
    ['zhejiang', 'hangzhou', 'xihu'],
  ]}
/>
