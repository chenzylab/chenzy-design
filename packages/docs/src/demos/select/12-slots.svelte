<script lang="ts">
  import { Select } from '@chenzy-design/svelte';

  const optionList = Array.from({ length: 6 }, (_, i) => ({
    label: `选项 ${i + 1}`,
    value: i + 1,
  }));
</script>

<div style="max-width:280px">
  <!-- innerTopSlot/innerBottomSlot 随列表滚动；outerTopSlot/outerBottomSlot 固定在滚动区外 -->
  <Select {optionList} placeholder="带顶部/底部附加项" defaultOpen>
    {#snippet outerTopSlot()}
      <div style="padding:8px 12px;font-weight:600;color:var(--cd-color-text-1)">全部选项</div>
    {/snippet}
    {#snippet innerBottomSlot()}
      <div style="padding:4px 12px;color:var(--cd-color-text-2);font-size:12px">共 {optionList.length} 项</div>
    {/snippet}
    {#snippet outerBottomSlot()}
      <div style="padding:8px 12px;text-align:center;color:var(--cd-color-primary);cursor:pointer">+ 新增选项</div>
    {/snippet}
  </Select>
</div>
