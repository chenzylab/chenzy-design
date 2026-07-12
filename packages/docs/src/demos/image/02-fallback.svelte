<script lang="ts">
  import { Image } from '@chenzy-design/svelte';
</script>

<div style="display: flex; gap: 24px; flex-wrap: wrap;">
  <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
    <span style="font-size: 12px; color: var(--cd-color-text-2);">默认破图占位</span>
    <Image width={200} height={200} src="https://load-error.jpeg" alt="加载失败" />
  </div>
  <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
    <span style="font-size: 12px; color: var(--cd-color-text-2);">自定义降级图</span>
    <Image
      width={200}
      height={200}
      src="https://load-error.jpeg"
      alt="加载失败降级"
      fallback="https://picsum.photos/seed/fallback/400/400"
    />
  </div>
</div>
