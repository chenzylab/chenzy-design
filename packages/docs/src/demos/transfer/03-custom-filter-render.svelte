<script lang="ts">
  import { Transfer, Tag } from '@chenzy-design/svelte';
  import type { TransferItem } from '@chenzy-design/svelte';

  const data = Array.from({ length: 10 }, (_, i) => ({
    key: `${i}`,
    label: `选项 ${i}`,
  }));

  let value = $state<(string | number)[]>(['1', '3']);

  // 自定义筛选逻辑：仅按 label 前缀匹配（对齐 Semi filter 函数形态）。
  function filter(input: string, item: TransferItem) {
    return item.label.toLowerCase().startsWith(input.trim().toLowerCase());
  }
</script>

<Transfer dataSource={data} {value} {filter} onChange={(keys) => (value = keys)}>
  {#snippet renderSourceItem({ item, onChange, checked })}
    <div
      style="display:flex;align-items:center;gap:8px;padding:6px 12px;cursor:pointer"
      onclick={onChange}
      role="presentation"
    >
      <input type="checkbox" {checked} tabindex={-1} />
      <span style="flex:1">{item.label}</span>
      <Tag size="small" color={checked ? 'blue' : 'grey'}>{checked ? '已选' : '可选'}</Tag>
    </div>
  {/snippet}
</Transfer>
