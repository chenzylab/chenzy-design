<script lang="ts">
  import { Skeleton, SkeletonImage, SkeletonTitle } from '@chenzy-design/svelte';
</script>

<Skeleton loading>
  {#snippet placeholder()}
    <div>
      <SkeletonImage style="width:200px; height:150px" />
      <SkeletonTitle style="width:120px; margin-top:10px" />
    </div>
  {/snippet}
  <img
    src="https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/dy.png"
    height="150"
    alt="avatar"
  />
  <h4>Semi UI</h4>
</Skeleton>
