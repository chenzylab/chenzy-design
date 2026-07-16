<script lang="ts">
  import { Carousel, RadioGroup, Radio, Space } from '@chenzy-design/svelte';

  let type = $state<'dot' | 'line' | 'columnar'>('dot');
  let position = $state<'left' | 'center' | 'right'>('left');
  let size = $state<'small' | 'medium'>('small');

  const bgs = ['var(--cd-color-primary)', 'var(--cd-color-success)', 'var(--cd-color-warning)'];
</script>

{#snippet s0()}<div style="width:100%;height:100%;background:{bgs[0]}"></div>{/snippet}
{#snippet s1()}<div style="width:100%;height:100%;background:{bgs[1]}"></div>{/snippet}
{#snippet s2()}<div style="width:100%;height:100%;background:{bgs[2]}"></div>{/snippet}

<Space vertical align="start">
  <Carousel
    slides={[s0, s1, s2]}
    indicatorType={type}
    indicatorPosition={position}
    indicatorSize={size}
    theme="dark"
    autoPlay={false}
    style="width:100%;height:320px"
  />
  <Space>
    <span>类型</span>
    <RadioGroup value={type} onChange={(e) => (type = e.target.value as typeof type)} type="button">
      <Radio value="dot">dot</Radio>
      <Radio value="line">line</Radio>
      <Radio value="columnar">columnar</Radio>
    </RadioGroup>
  </Space>
  <Space>
    <span>位置</span>
    <RadioGroup value={position} onChange={(e) => (position = e.target.value as typeof position)} type="button">
      <Radio value="left">left</Radio>
      <Radio value="center">center</Radio>
      <Radio value="right">right</Radio>
    </RadioGroup>
  </Space>
  <Space>
    <span>尺寸</span>
    <RadioGroup value={size} onChange={(e) => (size = e.target.value as typeof size)} type="button">
      <Radio value="small">small</Radio>
      <Radio value="medium">medium</Radio>
    </RadioGroup>
  </Space>
</Space>
