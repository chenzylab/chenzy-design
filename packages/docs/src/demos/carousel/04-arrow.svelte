<script lang="ts">
  import { Carousel, RadioGroup, Radio } from '@chenzy-design/svelte';

  type ArrowType = 'hover' | 'always';
  let arrowType = $state<ArrowType>('hover');
</script>

{#snippet s1()}
  <div style="height:100%;display:grid;place-items:center;background:#364fc7;color:#fff;font-size:20px">箭头控制 1</div>
{/snippet}
{#snippet s2()}
  <div style="height:100%;display:grid;place-items:center;background:#0c8599;color:#fff;font-size:20px">箭头控制 2</div>
{/snippet}
{#snippet s3()}
  <div style="height:100%;display:grid;place-items:center;background:#c2255c;color:#fff;font-size:20px">箭头控制 3</div>
{/snippet}

<div style="display:flex;flex-direction:column;gap:12px;width:360px">
  <RadioGroup bind:value={arrowType}>
    <Radio value="hover">hover 悬停显示</Radio>
    <Radio value="always">always 始终显示</Radio>
  </RadioGroup>

  <Carousel
    slides={[s1, s2, s3]}
    showArrow={true}
    {arrowType}
    showIndicator={false}
    height={160}
    theme="dark"
  />
</div>
