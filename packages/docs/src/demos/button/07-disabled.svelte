<script lang="ts">
  import { Button } from '@chenzy-design/svelte';

  const themes = ['solid', 'light', 'outline', 'borderless'] as const;
</script>

<!-- 禁用态：各 theme 下统一降低不透明度、禁止交互 -->
<div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
  {#each themes as theme (theme)}
    <Button type="primary" {theme} disabled>{theme}</Button>
  {/each}
</div>
