<!-- 无资源态：不传 src 时展示 -resource-not-found 提示。严格对齐 Semi NoResource（dark/light 两主题）。 -->
<script lang="ts">
  import { VideoPlayer } from '@chenzy-design/svelte';
</script>

<VideoPlayer height={280} />
<br />
<VideoPlayer height={280} theme="light" />
