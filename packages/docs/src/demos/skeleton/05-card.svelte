<script lang="ts">
  import {
    Skeleton,
    SkeletonImage,
    SkeletonTitle,
    SkeletonParagraph,
    SkeletonButton,
    Button,
    Card,
    Text,
  } from '@chenzy-design/svelte';

  let loading = $state(true);
</script>

<Button onclick={() => (loading = !loading)}>
  {loading ? '加载完成' : '重新加载'}
</Button>

<div style="width:300px; margin-top:12px">
  <Skeleton {loading} active>
    {#snippet placeholder()}
      <div style="padding:16px; border:1px solid var(--cd-color-border); border-radius:8px">
        <SkeletonImage width="100%" height={140} />
        <div style="margin-top:16px">
          <SkeletonTitle width="70%" />
        </div>
        <div style="margin-top:12px">
          <SkeletonParagraph rows={2} width={['100%', '60%']} />
        </div>
        <div style="margin-top:16px; display:flex; gap:8px">
          <SkeletonButton width={88} />
          <SkeletonButton width={88} pill />
        </div>
      </div>
    {/snippet}

    <Card title="设计系统月报">
      {#snippet cover()}
        <div
          style="height:140px; background:linear-gradient(135deg, var(--cd-color-primary), var(--cd-color-primary-hover))"
        ></div>
      {/snippet}
      <Text>本月新增 12 个组件，覆盖反馈与录入两大类，全面补齐无障碍能力。</Text>
      {#snippet actions()}
        <Button>查看</Button>
        <Button type="tertiary">分享</Button>
      {/snippet}
    </Card>
  </Skeleton>
</div>
