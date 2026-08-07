<!--
  browser project 夹具（真实 chromium）：VideoProgress 拖拽 activeIndex/hover 行为。
  为什么必须在真实浏览器：拖拽依赖真实布局尺寸（getBoundingClientRect）与鼠标事件，
  jsdom 无布局、量不到 marker 段区间。max=60，三段 markers（0/20/40）等宽各占 1/3。
-->
<script lang="ts">
  import VideoProgress from './VideoProgress.svelte';

  let value = $state(15);
  const markers = [
    { start: 0, title: '第一章' },
    { start: 20, title: '第二章' },
    { start: 40, title: '第三章' },
  ];
</script>

<div style="width: 600px; background: #1c1f23; padding: 16px;" data-testid="progress-host">
  <VideoProgress
    {value}
    buffered={30}
    max={60}
    {markers}
    showTooltip={false}
    aria-label="进度条测试"
    onChange={(v) => (value = v)}
  />
</div>
