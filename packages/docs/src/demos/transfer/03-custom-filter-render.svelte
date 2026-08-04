<script lang="ts">
  import { Transfer, Tag, Highlight } from '@chenzy-design/svelte';
  import { IconClose } from '@chenzy-design/icons';
  import type { TransferItem } from '@chenzy-design/svelte';

  const data = Array.from({ length: 10 }, (_, i) => ({
    key: `${i}`,
    label: `选项 ${i}`,
  }));

  let value = $state<(string | number)[]>(['1', '3']);
  let searchText = $state('');

  // 自定义筛选逻辑：仅按 label 前缀匹配（对齐 Semi filter 函数形态）。
  // 注：本库 onSearch 提供后会切换为远程模式（父负责过滤 dataSource），与本地 filter 二选一；
  // 借 filter 回调本身拿到实时输入文本驱动 Highlight，避免破坏本地筛选。
  function filter(input: string, item: TransferItem) {
    searchText = input;
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
      <span style="flex:1"><Highlight sourceString={item.label} searchWords={[searchText]} /></span>
      <Tag size="small" color={checked ? 'blue' : 'grey'}>{checked ? '已选' : '可选'}</Tag>
    </div>
  {/snippet}
  {#snippet renderSelectedItem({ item, onRemove })}
    <div style="display:flex;align-items:center;gap:8px;padding:6px 12px">
      <span style="flex:1">{item.label}</span>
      <button
        type="button"
        aria-label="移除"
        onclick={onRemove}
        style="border:none;background:transparent;cursor:pointer;display:inline-flex"
      >
        <IconClose size="small" />
      </button>
    </div>
  {/snippet}
</Transfer>
