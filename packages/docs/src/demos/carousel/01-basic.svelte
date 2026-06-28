<script lang="ts">
  import { Carousel, Text } from '@chenzy-design/svelte';

  let idx = $state(0);
</script>

{#snippet slide1()}
  <div style="height:100%;display:grid;place-items:center;background:var(--cd-color-primary);color:#fff;font-size:20px">幻灯片 1</div>
{/snippet}
{#snippet slide2()}
  <div style="height:100%;display:grid;place-items:center;background:var(--cd-color-success);color:#fff;font-size:20px">幻灯片 2</div>
{/snippet}
{#snippet slide3()}
  <div style="height:100%;display:grid;place-items:center;background:var(--cd-color-warning);color:#fff;font-size:20px">幻灯片 3</div>
{/snippet}

<div style="width: 360px">
  <Carousel
    slides={[slide1, slide2, slide3]}
    value={idx}
    onChange={(i) => (idx = i)}
    height={160}
  />
</div>
<Text type="tertiary">当前：第 {idx + 1} 张</Text>
