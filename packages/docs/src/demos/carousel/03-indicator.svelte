<script lang="ts">
  import { Carousel, RadioGroup, Radio } from '@chenzy-design/svelte';

  type IndType = 'dot' | 'line' | 'columnar';
  type IndPos = 'left' | 'center' | 'right';
  let indicatorType = $state<IndType>('line');
  let indicatorPosition = $state<IndPos>('center');
</script>

{#snippet s1()}
  <div style="height:100%;display:grid;place-items:center;background:#7048e8;color:#fff;font-size:20px">指示器样式 1</div>
{/snippet}
{#snippet s2()}
  <div style="height:100%;display:grid;place-items:center;background:#1098ad;color:#fff;font-size:20px">指示器样式 2</div>
{/snippet}
{#snippet s3()}
  <div style="height:100%;display:grid;place-items:center;background:#f08c00;color:#fff;font-size:20px">指示器样式 3</div>
{/snippet}

<div style="display:flex;flex-direction:column;gap:12px;width:360px">
  <RadioGroup bind:value={indicatorType}>
    <Radio value="dot">dot</Radio>
    <Radio value="line">line</Radio>
    <Radio value="columnar">columnar</Radio>
  </RadioGroup>
  <RadioGroup bind:value={indicatorPosition}>
    <Radio value="left">left</Radio>
    <Radio value="center">center</Radio>
    <Radio value="right">right</Radio>
  </RadioGroup>

  <Carousel
    slides={[s1, s2, s3]}
    {indicatorType}
    {indicatorPosition}
    indicatorSize="medium"
    height={160}
    theme="dark"
  />
</div>
