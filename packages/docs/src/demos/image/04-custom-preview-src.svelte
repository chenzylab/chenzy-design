<script lang="ts">
  import { Image } from '@chenzy-design/svelte';
</script>

<!-- 缩略图用小图，点击预览时展示高清大图（preview.src 覆盖预览图源）。 -->
<Image
  width={300}
  height={200}
  src="https://picsum.photos/seed/thumb/600/400"
  alt="缩略图"
  preview={{ src: 'https://picsum.photos/seed/thumb/1600/1067' }}
/>
