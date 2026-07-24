<script lang="ts">
  import { Cascader, Text } from '@chenzy-design/svelte';
  import { treeData } from './_data';

  const slotStyle =
    'height: 36px; display: flex; padding: 0 32px; align-items: center; cursor: pointer; border-top: 1px solid var(--cd-color-border)';
</script>

<Cascader style="width: 300px" {treeData} placeholder="请选择所在地区">
  {#snippet bottomSlot()}
    <div style={slotStyle}>
      <Text>找不到相关选项？</Text>
      <Text link>去新建</Text>
    </div>
  {/snippet}
</Cascader>
