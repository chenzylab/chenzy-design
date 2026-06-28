<script lang="ts">
  import {
    SkeletonAvatar,
    SkeletonTitle,
    SkeletonParagraph,
    SkeletonImage,
    SkeletonButton,
    Text,
  } from '@chenzy-design/svelte';
</script>

<div style="display:flex; flex-direction:column; gap:24px; max-width:420px">
  <div>
    <Text type="tertiary">Avatar：圆形 / 方形，small / default / large</Text>
    <div style="display:flex; gap:16px; align-items:center; margin-top:8px">
      <SkeletonAvatar size="small" />
      <SkeletonAvatar size="default" />
      <SkeletonAvatar size="large" />
      <SkeletonAvatar shape="square" size="large" />
      <SkeletonAvatar size={56} />
    </div>
  </div>

  <div>
    <Text type="tertiary">Title 与 Paragraph（rows、width 数组按行取）</Text>
    <div style="margin-top:8px">
      <SkeletonTitle width="60%" />
      <div style="margin-top:12px">
        <SkeletonParagraph rows={4} width={['100%', '100%', '100%', '40%']} />
      </div>
    </div>
  </div>

  <div>
    <Text type="tertiary">Button：矩形 / 胶囊 / 块级，Image：showIcon</Text>
    <div style="display:flex; gap:12px; align-items:center; margin-top:8px">
      <SkeletonButton size="small" />
      <SkeletonButton />
      <SkeletonButton pill size="large" />
    </div>
    <div style="margin-top:12px">
      <SkeletonButton block />
    </div>
    <div style="display:flex; gap:12px; margin-top:12px">
      <SkeletonImage width={120} height={90} />
      <SkeletonImage width={120} height={90} showIcon={false} />
    </div>
  </div>
</div>
