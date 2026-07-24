<script lang="ts">
  import {
    Skeleton,
    SkeletonAvatar,
    SkeletonTitle,
    Avatar,
  } from '@chenzy-design/svelte';
</script>

<Skeleton loading>
  {#snippet placeholder()}
    <div style="display:flex; align-items:center">
      <SkeletonAvatar style="margin-right:12px" />
      <SkeletonTitle style="width:120px" />
    </div>
  {/snippet}
  <div style="display:flex; align-items:center">
    <Avatar color="blue" style="margin-right:12px">UI</Avatar>
    <span>Semi UI</span>
  </div>
</Skeleton>
