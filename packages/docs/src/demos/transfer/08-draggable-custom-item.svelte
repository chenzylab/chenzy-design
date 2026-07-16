<script lang="ts">
  import { Transfer } from '@chenzy-design/svelte';
  import { IconClose } from '@chenzy-design/icons';

  const data = Array.from({ length: 10 }, (_, i) => ({
    key: `${i}`,
    label: `选项 ${i}`,
  }));

  let value = $state<(string | number)[]>(['0', '1', '2', '3']);
</script>

<!-- 拖拽排序 + 自定义已选项渲染（renderSelectedItem） -->
<Transfer draggable dataSource={data} {value} onChange={(keys) => (value = keys)}>
  {#snippet renderSelectedItem({ item, onRemove })}
    <div style="display:flex;align-items:center;gap:8px;padding:6px 12px;width:100%">
      <span style="flex:1">🔖 {item.label}</span>
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
