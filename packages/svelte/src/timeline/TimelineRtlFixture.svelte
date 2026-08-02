<!--
  browser project 夹具（真实 chromium）：Timeline 在 LTR / RTL 下的轴线与内容几何。

  为什么必须真实浏览器：轴线（tail）、圆点（head）都是**绝对定位**，
  镜像是否正确只体现在真实坐标上；jsdom 无布局，量不到。
-->
<script lang="ts">
  // 不引则 var(--cd-*) 全失效、尺寸塌成 0、断言恒真
  import '@chenzy-design/tokens/tokens.css';
  import Timeline from './Timeline.svelte';
  import ConfigProvider from '../config-provider/ConfigProvider.svelte';

  const dataSource = [
    { time: '2026-07-01', content: '第一步' },
    { time: '2026-07-02', content: '第二步' },
  ];
</script>

<div data-testid="ltr" style="width: 400px">
  <Timeline {dataSource} />
</div>

<ConfigProvider direction="rtl">
  <div data-testid="rtl" style="width: 400px">
    <Timeline {dataSource} />
  </div>
</ConfigProvider>
