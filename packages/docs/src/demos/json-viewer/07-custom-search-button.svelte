<script lang="ts">
  // 对齐 Semi「自定义搜索按钮」：renderSearchButton 自定义搜索按钮渲染，
  // 实现固定位置、自定义样式等需求。
  import { JsonViewer, Button } from '@chenzy-design/svelte';
  import { IconSearch } from '@chenzy-design/icons';

  const data = `{
    "name": "Semi",
    "version": "0.0.0"
}`;
</script>

{#snippet searchIcon()}<IconSearch />{/snippet}

<JsonViewer height={200} width={700} value={data}>
  {#snippet renderSearchButton(defaultButton, controls)}
    <div style="position: absolute; top: 10px; right: 10px; z-index: 10;">
      {#if !controls.showSearchBar}
        <Button icon={searchIcon} onclick={controls.onToggleSearchBar}>搜索</Button>
      {:else}
        {@render defaultButton()}
      {/if}
    </div>
  {/snippet}
</JsonViewer>
