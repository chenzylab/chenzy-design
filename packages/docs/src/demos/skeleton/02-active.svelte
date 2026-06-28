<script lang="ts">
  import {
    Skeleton,
    SkeletonAvatar,
    SkeletonTitle,
    SkeletonParagraph,
    Switch,
    Text,
  } from '@chenzy-design/svelte';

  let active = $state(true);
</script>

<div style="display:flex; align-items:center; gap:8px; margin-bottom:12px">
  <Switch bind:value={active} />
  <Text type="tertiary">{active ? 'active：shimmer 流光动画开启' : 'active 关闭：静态底色'}</Text>
</div>

<div style="width:360px; padding:16px; border:1px solid var(--cd-color-border); border-radius:8px">
  <Skeleton loading {active}>
    {#snippet placeholder()}
      <div style="display:flex; gap:16px">
        <SkeletonAvatar size="large" />
        <div style="flex:1">
          <SkeletonTitle width="40%" />
          <div style="margin-top:12px">
            <SkeletonParagraph rows={3} />
          </div>
        </div>
      </div>
    {/snippet}
  </Skeleton>
</div>
