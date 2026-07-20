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
    Text,
  } from '@chenzy-design/svelte';

  let loading = $state(true);
</script>

<div style="display:flex; align-items:center; gap:10px; margin-bottom:16px">
  <Switch checked={loading} onChange={(v) => (loading = v)} />
  <Text type="tertiary">显示加载内容</Text>
</div>

<div style="display:flex; flex-direction:column; gap:16px">
  <Skeleton {loading}>
    {#snippet placeholder()}
      <SkeletonAvatar />
    {/snippet}
    <Avatar color="blue">U</Avatar>
  </Skeleton>

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

  <Skeleton style="width:80px" {loading}>
    {#snippet placeholder()}
      <SkeletonTitle style="margin-bottom:10px" />
    {/snippet}
    <h4 style="margin-bottom:0">chenzy UI</h4>
  </Skeleton>

  <Skeleton style="width:240px" {loading}>
    {#snippet placeholder()}
      <SkeletonParagraph rows={2} />
    {/snippet}
    <p style="width:240px">精心打磨每一个组件的用户体验，从用户的角度考虑每个组件的使用场景。</p>
  </Skeleton>

  <Skeleton {loading}>
    {#snippet placeholder()}
      <SkeletonButton />
    {/snippet}
    <Button>Button</Button>
  </Skeleton>
</div>
