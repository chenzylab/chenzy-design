<script lang="ts">
  import {
    Skeleton,
    SkeletonAvatar,
    SkeletonTitle,
    SkeletonParagraph,
    SkeletonImage,
    SkeletonButton,
    Button,
    Text,
  } from '@chenzy-design/svelte';

  let skeletonLoading = $state(true);
</script>

<div style="display:flex; gap:48px; flex-wrap:wrap; align-items:flex-start">
  <div>
    <Text type="tertiary">静态原子形状</Text>
    <div style="display:flex; gap:16px; align-items:center; margin-top:8px">
      <SkeletonAvatar />
      <SkeletonAvatar shape="square" size="large" />
      <SkeletonButton pill />
      <SkeletonImage width={120} height={80} />
    </div>
  </div>
</div>

<div style="margin-top:16px">
  <Button onclick={() => (skeletonLoading = !skeletonLoading)}>
    {skeletonLoading ? '加载完成' : '重新加载'}
  </Button>
  <div style="width:360px; margin-top:12px; padding:16px; border:1px solid var(--cd-color-border); border-radius:8px">
    <Skeleton loading={skeletonLoading} active>
      {#snippet placeholder()}
        <div style="display:flex; gap:16px">
          <SkeletonAvatar size="large" />
          <div style="flex:1">
            <SkeletonTitle width="50%" />
            <div style="margin-top:12px">
              <SkeletonParagraph rows={3} />
            </div>
          </div>
        </div>
      {/snippet}
      <div style="display:flex; gap:16px">
        <div style="width:40px; height:40px; border-radius:50%; background:var(--cd-color-primary); flex:0 0 auto"></div>
        <div>
          <strong>陈一</strong>
          <p style="margin:8px 0 0; color:var(--cd-color-text-1); line-height:1.6">
            这是加载完成后的真实内容。骨架屏在数据返回前占位，避免布局抖动。
          </p>
        </div>
      </div>
    </Skeleton>
  </div>

  <div style="margin-top:16px">
    <Text type="tertiary">keepDOM 模式（unmountPlaceholder=false，display:none 切换，保留 DOM）</Text>
  </div>
  <div style="width:360px; margin-top:8px; padding:16px; border:1px solid var(--cd-color-border); border-radius:8px">
    <Skeleton loading={skeletonLoading} active unmountPlaceholder={false}>
      {#snippet placeholder()}
        <div style="display:flex; gap:16px">
          <SkeletonAvatar size="large" />
          <div style="flex:1">
            <SkeletonTitle width="50%" />
            <div style="margin-top:12px">
              <SkeletonParagraph rows={2} />
            </div>
          </div>
        </div>
      {/snippet}
      <div style="display:flex; gap:16px">
        <div style="width:40px; height:40px; border-radius:50%; background:var(--cd-color-primary); flex:0 0 auto"></div>
        <div>
          <strong>陈一</strong>
          <p style="margin:8px 0 0; color:var(--cd-color-text-1); line-height:1.6">
            keepDOM 模式下真实内容始终在 DOM，靠 display 切换。
          </p>
        </div>
      </div>
    </Skeleton>
  </div>
</div>
