<script lang="ts">
  import { Transfer } from '@chenzy-design/svelte';

  const data = Array.from({ length: 10 }, (_, i) => ({
    key: `${i}`,
    label: `选项 ${i}`,
  }));

  let value = $state<(string | number)[]>(['1', '2']);
</script>

<!-- 自定义面板头部信息（renderSourceHeader / renderSelectedHeader） -->
<Transfer dataSource={data} {value} onChange={(keys) => (value = keys)}>
  {#snippet renderSourceHeader({ num, showButton, allChecked, onAllClick })}
    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;font-weight:600">
      <span>可选 {num} 项</span>
      {#if showButton}
        <button type="button" onclick={onAllClick} style="border:none;background:transparent;color:var(--cd-color-primary);cursor:pointer">
          {allChecked ? '取消全选' : '全选'}
        </button>
      {/if}
    </div>
  {/snippet}
  {#snippet renderSelectedHeader({ num, showButton, onClear })}
    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;font-weight:600">
      <span>已选 {num} 项</span>
      {#if showButton}
        <button type="button" onclick={onClear} style="border:none;background:transparent;color:var(--cd-color-danger);cursor:pointer">
          清空
        </button>
      {/if}
    </div>
  {/snippet}
</Transfer>
