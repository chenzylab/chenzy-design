<!--
  browser project 夹具（真实 chromium）：单体 Resizable 右边缘拖拽 + 分栏 ResizeGroup 拖把手。
  为什么必须在真实浏览器：拖拽依赖真实布局尺寸（getBoundingClientRect）与指针事件，
  jsdom 无布局、量不到宽度变化。
-->
<script lang="ts">
  import Resizable from './single/Resizable.svelte';
  import ResizeGroup from './group/ResizeGroup.svelte';
  import ResizeItem from './group/ResizeItem.svelte';
  import ResizeHandler from './group/ResizeHandler.svelte';
</script>

<!-- 单体：仅右边缘可拖，minWidth/maxWidth 约束 -->
<Resizable
  enable={{ right: true }}
  defaultSize={{ width: 240, height: 140 }}
  minWidth={120}
  maxWidth={480}
>
  <div data-testid="single-content">单体</div>
</Resizable>

<!--
  分栏：两个面板 + 中间把手。
  ⚠️ ResizeGroup 必须有确定高度，否则面板高度塌陷、宽度也量不准（同 docs demo 的写法）。
-->
<div style="width: 600px">
  <ResizeGroup direction="horizontal" style="height: 200px">
    <ResizeItem defaultSize="50%" min="10%">
      <div data-testid="pane-a" style="height: 100%">A</div>
    </ResizeItem>
    <ResizeHandler />
    <ResizeItem defaultSize="50%" min="10%">
      <div data-testid="pane-b" style="height: 100%">B</div>
    </ResizeItem>
  </ResizeGroup>
</div>
