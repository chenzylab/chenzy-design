<script lang="ts">
  import {
    Skeleton,
    SkeletonAvatar,
    SkeletonImage,
    SkeletonTitle,
    SkeletonParagraph,
    SkeletonButton,
    Switch,
    Avatar,
    Button,
  } from '@chenzy-design/svelte';

  let loading = $state(true);
</script>

<span style="display:flex; align-items:center">
  <Switch onChange={() => (loading = !loading)} />
  <span style="margin-left:10px">显示加载内容</span>
</span>
<br />
<Skeleton {loading}>
  {#snippet placeholder()}
    <SkeletonAvatar />
  {/snippet}
  <Avatar color="blue" style="margin-bottom:10px">U</Avatar>
</Skeleton>
<br />
<Skeleton style="width:200px; height:150px" {loading}>
  {#snippet placeholder()}
    <SkeletonImage />
  {/snippet}
  <img
    src="https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/dy.png"
    height="150"
    alt="avatar"
  />
</Skeleton>
<br />
<Skeleton style="width:80px" {loading}>
  {#snippet placeholder()}
    <SkeletonTitle style="margin-bottom:10px" />
  {/snippet}
  <h4 style="margin-bottom:0">Semi UI</h4>
</Skeleton>
<Skeleton style="width:240px" {loading}>
  {#snippet placeholder()}
    <SkeletonParagraph rows={2} />
  {/snippet}
  <p style="width:240px">精心打磨每一个组件的用户体验，从用户的角度考虑每个组件的使用场景。</p>
</Skeleton>
<br />
<Skeleton {loading}>
  {#snippet placeholder()}
    <SkeletonButton />
  {/snippet}
  <Button>Button</Button>
</Skeleton>
