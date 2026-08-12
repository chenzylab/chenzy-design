<script lang="ts">
  import { Transfer, Button } from '@chenzy-design/svelte';

  const data = Array.from({ length: 30 }, (_, i) => ({
    label: `选项名称 ${i}`,
    value: i,
    disabled: false,
    key: `key-${i}`,
  }));
</script>

<Transfer style="width: 568px; height: 416px" dataSource={data}>
  {#snippet renderSourceHeader({ num, showButton, allChecked, onAllClick })}
    <div style="margin: 10px 0 0 10px; height: 24px; display: flex; align-items: center">
      <span>共 {num} 项</span>
      {#if showButton}
        <Button theme="borderless" type="tertiary" size="small" onclick={onAllClick}>
          {allChecked ? '取消全选' : '全选'}
        </Button>
      {/if}
    </div>
  {/snippet}
  {#snippet renderSelectedHeader({ num, showButton, onClear })}
    <div style="margin: 10px 0 0 10px; height: 24px; display: flex; align-items: center">
      <span>{num} 项已选</span>
      {#if showButton}
        <Button theme="borderless" type="tertiary" size="small" onclick={onClear}>清空</Button>
      {/if}
    </div>
  {/snippet}
</Transfer>
