<script lang="ts">
  import { FloatButton } from '@chenzy-design/svelte';
  import { IconAIEditLevel1 } from '@chenzy-design/icons';

  const onClick = () => {
    console.log('float button clicked');
  };
</script>

<div style="display:flex; gap:16px; align-items:center">
  <FloatButton shape="round" style="position:static" {onClick}>
    {#snippet icon()}
      <IconAIEditLevel1 />
    {/snippet}
  </FloatButton>
  <FloatButton shape="square" style="position:static" {onClick}>
    {#snippet icon()}
      <IconAIEditLevel1 />
    {/snippet}
  </FloatButton>
</div>
