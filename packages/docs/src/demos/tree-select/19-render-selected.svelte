<script lang="ts">
  import { TreeSelect } from '@chenzy-design/svelte';
  import { treeDataEn as treeData } from './_data';
</script>

<TreeSelect
  style="width: 300px"
  dropdownStyle="max-height: 400px; overflow: auto"
  {treeData}
  multiple
  defaultValue={['Beijing', 'Shanghai']}
  defaultExpandAll
  placeholder="请选择"
>
  {#snippet renderSelectedItem({ node, onRemove })}
    <span
      style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; margin-right: 6px; border-radius: 12px; background-color: var(--cd-color-info-light-default); font-size: 12px"
    >
      📍 {node.label}
      <button
        type="button"
        style="border: none; background: none; cursor: pointer; padding: 0; color: var(--cd-color-text-2)"
        aria-label="移除"
        onclick={onRemove}>×</button
      >
    </span>
  {/snippet}
</TreeSelect>
