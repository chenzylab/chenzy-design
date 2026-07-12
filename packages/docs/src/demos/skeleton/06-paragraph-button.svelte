<script lang="ts">
  import {
    Skeleton,
    SkeletonParagraph,
    SkeletonButton,
    Button,
  } from '@chenzy-design/svelte';
</script>

<Skeleton loading style="text-align:center">
  {#snippet placeholder()}
    <div style="display:flex; flex-direction:column; align-items:center; width:300px; margin-bottom:10px">
      <SkeletonParagraph style="width:100%" rows={3} />
      <SkeletonButton />
    </div>
  {/snippet}
  <div style="text-align:center">
    <p>Hi, chenzy dance dance.</p>
    <p>Hi, chenzy dance dance.</p>
    <Button>Button</Button>
  </div>
</Skeleton>
