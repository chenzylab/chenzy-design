<script lang="ts">
  import { Carousel } from '@chenzy-design/svelte';
</script>

{#snippet s1()}
  <div style="height:100%;display:grid;place-items:center;background:#3b5bdb;color:#fff;font-size:20px">自动播放 · 第 1 张</div>
{/snippet}
{#snippet s2()}
  <div style="height:100%;display:grid;place-items:center;background:#2f9e44;color:#fff;font-size:20px">自动播放 · 第 2 张</div>
{/snippet}
{#snippet s3()}
  <div style="height:100%;display:grid;place-items:center;background:#e8590c;color:#fff;font-size:20px">自动播放 · 第 3 张</div>
{/snippet}

<div style="width: 360px">
  <Carousel
    slides={[s1, s2, s3]}
    autoPlay={{ interval: 1500, hoverToPause: true }}
    height={160}
    theme="dark"
  />
</div>
