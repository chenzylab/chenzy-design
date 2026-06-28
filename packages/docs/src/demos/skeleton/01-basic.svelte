<script lang="ts">
  import {
    Skeleton,
    SkeletonAvatar,
    SkeletonTitle,
    SkeletonParagraph,
    Button,
  } from '@chenzy-design/svelte';

  let loading = $state(true);
</script>

<Button onclick={() => (loading = !loading)}>
  {loading ? '加载完成' : '重新加载'}
</Button>

<div style="width:360px; margin-top:12px; padding:16px; border:1px solid var(--cd-color-border); border-radius:8px">
  <Skeleton {loading} active>
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
