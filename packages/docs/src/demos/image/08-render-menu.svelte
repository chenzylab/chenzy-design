<script lang="ts">
  import { Image, ImagePreview, Button } from '@chenzy-design/svelte';

  const srcList = [
    'https://picsum.photos/seed/m1/600/400',
    'https://picsum.photos/seed/m2/600/400',
    'https://picsum.photos/seed/m3/600/400',
  ];
</script>

<!-- renderPreviewMenu：拿到 MenuProps 完全自定义底部操作区。 -->
<ImagePreview>
  {#snippet renderPreviewMenu(props)}
    <div
      style="display: flex; align-items: center; gap: 8px; padding: 6px 12px; background: rgba(0,0,0,0.75); border-radius: 4px;"
    >
      <Button size="small" disabled={props.disabledPrev} onclick={props.onPrev}>上一张</Button>
      <span style="color: #fff; font-size: 13px;">{props.curPage}/{props.totalNum}</span>
      <Button size="small" disabled={props.disabledNext} onclick={props.onNext}>下一张</Button>
      <Button size="small" onclick={props.onZoomOut}>−</Button>
      <Button size="small" onclick={props.onZoomIn}>＋</Button>
      <Button size="small" onclick={props.onRotateLeft}>旋转</Button>
      <Button size="small" onclick={props.onDownload}>下载</Button>
    </div>
  {/snippet}
  <div style="display: flex; gap: 8px;">
    {#each srcList as src, i (src)}
      <Image {src} width={160} height={110} alt={`图片 ${i + 1}`} />
    {/each}
  </div>
</ImagePreview>
