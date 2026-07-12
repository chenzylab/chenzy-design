<script lang="ts">
  import { Carousel, Button, Space, Typography } from '@chenzy-design/svelte';

  const { Text } = Typography;

  let activeIndex = $state(0);
  const bgs = ['var(--cd-color-primary)', 'var(--cd-color-success)', 'var(--cd-color-warning)'];
</script>

{#snippet s0()}<div style="width:100%;height:100%;background:{bgs[0]}"></div>{/snippet}
{#snippet s1()}<div style="width:100%;height:100%;background:{bgs[1]}"></div>{/snippet}
{#snippet s2()}<div style="width:100%;height:100%;background:{bgs[2]}"></div>{/snippet}

<Space vertical align="start">
  <Text type="tertiary">受控 activeIndex（当前：第 {activeIndex + 1} 张）</Text>
  <Carousel
    slides={[s0, s1, s2]}
    {activeIndex}
    autoPlay={false}
    theme="dark"
    onChange={(i) => (activeIndex = i)}
    style="width:100%;height:400px"
  />
  <Space>
    {#each [0, 1, 2] as i (i)}
      <Button type={i === activeIndex ? 'primary' : 'tertiary'} onclick={() => (activeIndex = i)}>
        第 {i + 1} 张
      </Button>
    {/each}
  </Space>
</Space>
