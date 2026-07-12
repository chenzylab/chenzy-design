<script lang="ts">
  import { ImagePreview, Button } from '@chenzy-design/svelte';

  const srcList = [
    'https://picsum.photos/seed/s1/900/600',
    'https://picsum.photos/seed/s2/900/600',
    'https://picsum.photos/seed/s3/900/600',
  ];

  let visibleSingle = $state(false);
  let visibleMulti = $state(false);
</script>

<!-- 独立使用 ImagePreview：无需 children，用 src + visible 编程式控制。 -->
<div style="display: flex; gap: 12px;">
  <Button onclick={() => (visibleSingle = true)}>预览单图</Button>
  <ImagePreview
    src="https://picsum.photos/seed/s1/900/600"
    visible={visibleSingle}
    onVisibleChange={(v) => (visibleSingle = v)}
  />

  <Button onclick={() => (visibleMulti = true)}>预览多图</Button>
  <ImagePreview
    src={srcList}
    infinite
    visible={visibleMulti}
    onVisibleChange={(v) => (visibleMulti = v)}
  />
</div>
