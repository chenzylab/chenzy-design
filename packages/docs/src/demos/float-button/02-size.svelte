<script lang="ts">
  import { FloatButton, Text } from '@chenzy-design/svelte';
</script>

<Text type="tertiary">尺寸三档：small / default / large（24 / 32 / 40px）。此处用 static 定位以便并排预览。</Text>
<div style="display:flex; gap:16px; align-items:center; flex-wrap:wrap; margin-top:8px">
  {#each ['small', 'default', 'large'] as size (size)}
    <FloatButton size={size as 'small' | 'default' | 'large'} style="position:static">
      {#snippet icon()}
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="6" fill="currentColor" /></svg>
      {/snippet}
    </FloatButton>
  {/each}
</div>
