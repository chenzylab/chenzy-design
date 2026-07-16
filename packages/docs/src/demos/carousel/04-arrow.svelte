<script lang="ts">
  import { Carousel, RadioGroup, Radio, Space } from '@chenzy-design/svelte';

  let show = $state(true);
  let arrowType = $state<'always' | 'hover'>('always');

  const bgs = ['var(--cd-color-primary)', 'var(--cd-color-success)', 'var(--cd-color-warning)'];
</script>

{#snippet s0()}<div style="width:100%;height:100%;background:{bgs[0]}"></div>{/snippet}
{#snippet s1()}<div style="width:100%;height:100%;background:{bgs[1]}"></div>{/snippet}
{#snippet s2()}<div style="width:100%;height:100%;background:{bgs[2]}"></div>{/snippet}

<Space vertical align="start">
  <Carousel
    slides={[s0, s1, s2]}
    showArrow={show}
    {arrowType}
    theme="dark"
    autoPlay={false}
    style="width:100%;height:320px"
  />
  <Space>
    <span>展示箭头</span>
    <RadioGroup value={show} onChange={(e) => (show = e.target.value as boolean)} type="button">
      <Radio value={true}>show</Radio>
      <Radio value={false}>hide</Radio>
    </RadioGroup>
  </Space>
  <Space>
    <span>展示时机</span>
    <RadioGroup value={arrowType} onChange={(e) => (arrowType = e.target.value as typeof arrowType)} type="button">
      <Radio value="always">always</Radio>
      <Radio value="hover">hover</Radio>
    </RadioGroup>
  </Space>
</Space>
