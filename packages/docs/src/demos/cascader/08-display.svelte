<script lang="ts">
  import { Cascader, Tag, Typography } from '@chenzy-design/svelte';
  import { treeData } from './_data';
</script>

<div>
  <Typography.Title heading={6}>单选</Typography.Title>
  <Cascader
    style="width: 300px"
    {treeData}
    placeholder="回填时显示数据的value值"
    displayProp="value"
    defaultValue={['zhejiang', 'ningbo', 'jiangbei']}
  />
  <br />
  <br />
  <Typography.Title heading={6}>多选</Typography.Title>
  <Cascader
    multiple
    style="width: 300px"
    {treeData}
    defaultValue={['zhejiang', 'ningbo', 'jiangbei']}
    placeholder="回填时显示数据的value值"
    displayProp="value"
  />
  <br />
  <br />
  <Typography.Title heading={6}>单选</Typography.Title>
  <Cascader
    style="width: 300px"
    {treeData}
    placeholder="自定义回填时显示数据的格式"
    defaultValue={['zhejiang', 'ningbo', 'jiangbei']}
  >
    {#snippet displayRenderSingle(labelPath)}
      已选择：{labelPath.join(' -> ')}
    {/snippet}
  </Cascader>
  <br />
  <br />
  <Typography.Title heading={6}>多选</Typography.Title>
  <Cascader
    multiple
    style="width: 300px"
    {treeData}
    defaultValue={['zhejiang', 'ningbo', 'jiangbei']}
    placeholder="自定义回填时显示数据的格式"
  >
    {#snippet displayRenderTag(entity)}
      <Tag style="margin-right: 4px" color="white">{entity.data.label}</Tag>
    {/snippet}
  </Cascader>
</div>
