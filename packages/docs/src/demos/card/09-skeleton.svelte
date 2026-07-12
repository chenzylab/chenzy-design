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

  // 组件自带 loading 只覆盖内容区；结合 Skeleton 可自定义头部/封面等更丰富的预加载效果
  let loading = $state(true);
</script>

<Switch value={!loading} onChange={(v) => (loading = !v)} />
<br />
<br />
<Card style="max-width: 300px;">
  {#snippet cover()}
    <Skeleton {loading} active>
      {#snippet placeholder()}
        <SkeletonImage width="100%" height={160} />
      {/snippet}
      <div
        style="height: 160px; background: linear-gradient(135deg, var(--cd-color-primary) 0%, var(--cd-color-cyan-4) 100%);"
      ></div>
    </Skeleton>
  {/snippet}
  {#snippet title()}
    <Card.Meta>
      {#snippet avatar()}
        <Skeleton {loading} active>
          {#snippet placeholder()}
            <SkeletonAvatar />
          {/snippet}
          <Avatar size="default" color="blue">SD</Avatar>
        </Skeleton>
      {/snippet}
      {#snippet title()}
        <Skeleton {loading} active style="width: 80px;">
          {#snippet placeholder()}
            <SkeletonTitle />
          {/snippet}
          <Typography.Title heading={6}>Semi Doc</Typography.Title>
        </Skeleton>
      {/snippet}
      {#snippet description()}
        <Skeleton {loading} active style="width: 150px; margin-top: 8px;">
          {#snippet placeholder()}
            <SkeletonParagraph rows={1} />
          {/snippet}
          <Typography.Text>全面、易用、优质</Typography.Text>
        </Skeleton>
      {/snippet}
    </Card.Meta>
  {/snippet}
</Card>
