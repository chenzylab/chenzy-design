<script lang="ts">
  import {
    Skeleton,
    SkeletonAvatar,
    SkeletonTitle,
    SkeletonParagraph,
    Avatar,
  } from '@chenzy-design/svelte';
</script>

<Skeleton loading active>
  {#snippet placeholder()}
    <div style="display:flex; align-items:flex-start">
      <SkeletonAvatar style="margin-right:12px" />
      <div>
        <SkeletonTitle style="width:120px; margin-bottom:12px; margin-top:12px" />
        <SkeletonParagraph style="width:240px" rows={3} />
      </div>
    </div>
  {/snippet}
  <div style="display:flex; align-items:flex-start">
    <Avatar color="blue" style="margin-right:12px">UI</Avatar>
    <div>
      <h3>chenzy UI</h3>
      <p>Hi, chenzy dance dance.</p>
      <p>Hi, chenzy dance dance.</p>
      <p>Hi, chenzy dance dance.</p>
    </div>
  </div>
</Skeleton>
