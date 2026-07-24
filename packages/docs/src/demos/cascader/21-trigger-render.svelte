<script lang="ts">
  import { Cascader } from '@chenzy-design/svelte';
  import { IconChevronDown } from '@chenzy-design/icons';
  import { treeData } from './_data';
</script>

<Cascader style="width: 300px" {treeData} placeholder="请选择所在地区">
  {#snippet triggerRender({ value, placeholder })}
    <div
      style="min-width: 200px; background-color: var(--cd-color-primary-light-default); height: 32px; display: flex; align-items: center; padding: 0 12px; border-radius: 3px; color: var(--cd-color-primary)"
    >
      <div style="flex-grow: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">
        {value && value.length ? (value as (string | number)[]).join(' / ') : placeholder}
      </div>
      <IconChevronDown style="flex-shrink: 0" />
    </div>
  {/snippet}
</Cascader>
