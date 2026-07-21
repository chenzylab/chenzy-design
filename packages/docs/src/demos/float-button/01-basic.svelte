<script lang="ts">
  import { FloatButton } from '@chenzy-design/svelte';
  import { IconAIEditLevel1 } from '@chenzy-design/icons';

  const onClick = () => {
    console.log('float button clicked');
  };
</script>

<div style="position:relative; height:120px">
  <FloatButton style="position:absolute; bottom:16px; right:16px" {onClick}>
    {#snippet icon()}
      <IconAIEditLevel1 />
    {/snippet}
  </FloatButton>
</div>
