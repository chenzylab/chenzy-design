<script lang="ts">
  import {
    Empty,
    IllustrationConstruction,
    IllustrationConstructionDark,
  } from '@chenzy-design/svelte';
</script>

<Empty
  title="功能建设中"
  description="当前功能暂未开放，敬请期待。"
  imageSlot={image}
  darkModeImageSlot={darkImage}
/>

{#snippet image()}
  <IllustrationConstruction style="width: 150px; height: 150px;" />
{/snippet}
{#snippet darkImage()}
  <IllustrationConstructionDark style="width: 150px; height: 150px;" />
{/snippet}
