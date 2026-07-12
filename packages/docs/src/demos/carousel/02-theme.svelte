<script lang="ts">
  import { Carousel, RadioGroup, Radio, Space } from '@chenzy-design/svelte';

  type Theme = 'primary' | 'light' | 'dark';
  let theme = $state<Theme>('primary');

  const bgs = ['var(--cd-color-primary)', 'var(--cd-color-success)', 'var(--cd-color-warning)'];
</script>

{#snippet s0()}<div style="width:100%;height:100%;background:{bgs[0]}"></div>{/snippet}
{#snippet s1()}<div style="width:100%;height:100%;background:{bgs[1]}"></div>{/snippet}
{#snippet s2()}<div style="width:100%;height:100%;background:{bgs[2]}"></div>{/snippet}

<Space vertical align="start">
  <Carousel slides={[s0, s1, s2]} {theme} autoPlay={false} style="width:100%;height:320px" />
  <Space>
    <span>主题</span>
    <RadioGroup value={theme} onChange={(v) => (theme = v as Theme)} type="button">
      <Radio value="primary">primary</Radio>
      <Radio value="light">light</Radio>
      <Radio value="dark">dark</Radio>
    </RadioGroup>
  </Space>
</Space>
