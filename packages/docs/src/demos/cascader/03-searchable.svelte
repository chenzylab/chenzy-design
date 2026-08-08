<script lang="ts">
  import { Cascader, Title, Tooltip } from '@chenzy-design/svelte';
  import { treeData } from './_data';
  import type { CascaderNode } from '@chenzy-design/svelte';

  // label 为 Snippet（Tooltip 包裹富文本）时，额外存 labelText 纯文本字段，
  // 通过 treeNodeFilterProp 指定该字段进行搜索（对齐 Semi labelNodeTreeData）。
  const labelNodeTreeData: CascaderNode[] = [
    {
      label: zhejiangLabel,
      labelText: '浙江省',
      value: 'zhejiang',
      children: [
        {
          label: hangzhouLabel,
          labelText: '杭州市',
          value: 'hangzhou',
          children: [
            { label: xihuLabel, labelText: '西湖区', value: 'xihu' },
            { label: xiaoshanLabel, labelText: '萧山区', value: 'xiaoshan' },
            { label: linanLabel, labelText: '临安区', value: 'linan' },
          ],
        },
        {
          label: ningboLabel,
          labelText: '宁波市',
          value: 'ningbo',
          children: [
            { label: haishuLabel, labelText: '海曙区', value: 'haishu' },
            { label: jiangbeiLabel, labelText: '江北区', value: 'jiangbei' },
          ],
        },
      ],
    },
  ];
</script>

{#snippet zhejiangLabel()}<Tooltip content="说明">浙江省</Tooltip>{/snippet}
{#snippet hangzhouLabel()}<Tooltip content="说明">杭州市</Tooltip>{/snippet}
{#snippet xihuLabel()}<Tooltip content="说明">西湖区</Tooltip>{/snippet}
{#snippet xiaoshanLabel()}<Tooltip content="说明">萧山区</Tooltip>{/snippet}
{#snippet linanLabel()}<Tooltip content="说明">临安区</Tooltip>{/snippet}
{#snippet ningboLabel()}<Tooltip content="说明">宁波市</Tooltip>{/snippet}
{#snippet haishuLabel()}<Tooltip content="说明">海曙区</Tooltip>{/snippet}
{#snippet jiangbeiLabel()}<Tooltip content="说明">江北区</Tooltip>{/snippet}

<div>
  <Cascader style="width: 300px" {treeData} placeholder="默认对label值进行搜索" filterTreeNode />
  <br />
  <br />
  <Cascader
    style="width: 300px"
    {treeData}
    placeholder="对value值进行搜索"
    filterTreeNode
    treeNodeFilterProp="value"
  />
  <br />
  <br />
  <Title heading={6}>filterLeafOnly=false:</Title>
  <Cascader style="width: 300px" {treeData} placeholder="filterLeafOnly=false" filterTreeNode filterLeafOnly={false} />
  <br />
  <br />
  <Title heading={6}>Label 为 Snippet，指定其他属性进行搜索</Title>
  <Cascader
    style="width: 300px"
    treeData={labelNodeTreeData}
    placeholder="Search for labelText"
    filterTreeNode
    treeNodeFilterProp="labelText"
  />
</div>
