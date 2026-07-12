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
  <Switch value={active} onChange={(v) => (active = v)} />
  <Text type="tertiary">{active ? 'active：shimmer 流光动画开启' : 'active 关闭：静态底色'}</Text>
</div>

<Skeleton loading {active}>
  {#snippet placeholder()}
    <div style="display:flex; align-items:flex-start">
      <SkeletonAvatar style="margin-right:12px" />
      <div>
        <SkeletonTitle style="width:120px; margin-bottom:12px; margin-top:12px" />
        <SkeletonParagraph style="width:240px" rows={3} />
      </div>
    </div>
  {/snippet}
</Skeleton>
