<script lang="ts">
  import { TreeSelect } from '@chenzy-design/svelte';
  import { IconChevronDown } from '@chenzy-design/icons';
  import { treeData } from './_data';
</script>

<TreeSelect style="width: 300px" dropdownStyle="max-height: 400px; overflow: auto" {treeData} placeholder="请选择">
  {#snippet triggerRender({ value, placeholder })}
    <div
      style="min-width: 200px; background-color: var(--cd-color-primary-light-default); height: 32px; display: flex; align-items: center; padding: 0 12px; border-radius: 3px; color: var(--cd-color-primary)"
    >
      <div style="flex-grow: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">
        {value ? String(value) : placeholder}
      </div>
      <IconChevronDown style="flex-shrink: 0" />
    </div>
  {/snippet}
</TreeSelect>
