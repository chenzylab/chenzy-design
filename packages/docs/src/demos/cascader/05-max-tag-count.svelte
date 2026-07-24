<script lang="ts">
  import { Cascader } from '@chenzy-design/svelte';
  import { treeData } from './_data';
</script>

<Cascader
  defaultValue={[
    ['zhejiang', 'hangzhou', 'xihu'],
    ['zhejiang', 'hangzhou', 'xiaoshan'],
    ['zhejiang', 'ningbo', 'haishu'],
  ]}
  style="width: 300px"
  {treeData}
  placeholder="请选择所在地区"
  multiple
  maxTagCount={2}
  showRestTagsPopover={true}
  restTagsPopoverProps={{ position: 'top' }}
/>
