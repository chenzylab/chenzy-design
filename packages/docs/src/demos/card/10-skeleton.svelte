<script lang="ts">
  import {
    Card,
    Switch,
    Skeleton,
    SkeletonTitle,
    SkeletonParagraph,
    SkeletonAvatar,
    SkeletonImage,
    Avatar,
    Typography,
  } from '@chenzy-design/svelte';

  const { Meta } = Card;

  let loading = $state(true);
</script>

<Switch onChange={(v) => (loading = !v)} />
<br />
<br />
<Card style="max-width: 300px;">
  {#snippet title()}
    <Meta>
      {#snippet title()}
        <Skeleton style="width: 80px;" {loading}>
          {#snippet placeholder()}
            <SkeletonTitle />
          {/snippet}
          <Typography.Title heading={5}>Semi Doc</Typography.Title>
        </Skeleton>
      {/snippet}
      {#snippet description()}
        <Skeleton style="width: 150px; margin-top: 12px;" {loading}>
          {#snippet placeholder()}
            <SkeletonParagraph rows={1} />
          {/snippet}
          <Typography.Text>全面、易用、优质</Typography.Text>
        </Skeleton>
      {/snippet}
      {#snippet avatar()}
        <Skeleton {loading}>
          {#snippet placeholder()}
            <SkeletonAvatar />
          {/snippet}
          <Avatar
            alt="Card meta img"
            size="default"
            src="https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/card-meta-avatar-docs-demo.jpg"
          />
        </Skeleton>
      {/snippet}
    </Meta>
  {/snippet}
  {#snippet headerExtraContent()}
    <Skeleton style="width: 50px;" {loading}>
      {#snippet placeholder()}
        <SkeletonParagraph rows={1} />
      {/snippet}
      <Typography.Text link>More</Typography.Text>
    </Skeleton>
  {/snippet}
  {#snippet cover()}
    <Skeleton style="max-width: 100%; height: 220px;" {loading}>
      {#snippet placeholder()}
        <SkeletonImage />
      {/snippet}
      <img
        alt="example"
        src="https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/card-cover-docs-demo.jpeg"
      />
    </Skeleton>
  {/snippet}
</Card>
