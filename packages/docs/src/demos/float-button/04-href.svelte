<script lang="ts">
  import { FloatButton } from '@chenzy-design/svelte';
  import { IconAIEditLevel1 } from '@chenzy-design/icons';
</script>

<div style="position:relative; height:120px">
  <FloatButton
    href="https://github.com/chenzylab/chenzy-design"
    target="_blank"
    style="position:absolute; bottom:16px; right:16px"
  >
    {#snippet icon()}
      <IconAIEditLevel1 />
    {/snippet}
  </FloatButton>
</div>
