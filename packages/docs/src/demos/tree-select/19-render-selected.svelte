<script lang="ts">
  import { TreeSelect, Tag, Title } from '@chenzy-design/svelte';
  import { treeDataFourContinents as treeData } from './_data';
</script>

<Title heading={6} style="margin: 20px 0 10px">单选</Title>
<TreeSelect style="width: 300px" {treeData}>
  {#snippet renderSelectedItem({ node })}
    {node.label}
  {/snippet}
</TreeSelect>

<Title heading={6} style="margin: 20px 0 10px">多选 + isRenderInTag=true</Title>
<TreeSelect style="width: 300px" {treeData} multiple>
  {#snippet renderSelectedItem({ node, onRemove })}
    <Tag color="white" closable onClose={onRemove}>{node.label}</Tag>
  {/snippet}
</TreeSelect>

<Title heading={6} style="margin: 20px 0 10px">多选 + isRenderInTag=false</Title>
<TreeSelect style="width: 300px" {treeData} multiple maxTagCount={2}>
  {#snippet renderSelectedItem({ node, onRemove })}
    <Tag color="white" closable onClose={onRemove}>{node.value}</Tag>
  {/snippet}
</TreeSelect>
