<!--
  browser project 夹具（真实 chromium）：ResizeGroup 初挂载于 display:none 容器，
  验证容器变可见后尺寸能被重新计算（对齐 Semi #3336 修复）。
  为什么必须真实浏览器：display:none 下 offsetWidth/offsetHeight 恒为 0，
  jsdom 同样恒为 0 但语义不同（jsdom 本就不布局），要验证的是"变可见后重算"这一时序。
-->
<script lang="ts">
  import ResizeGroup from './group/ResizeGroup.svelte';
  import ResizeItem from './group/ResizeItem.svelte';
  import ResizeHandler from './group/ResizeHandler.svelte';

  let hidden = $state(true);
</script>

<button data-testid="toggle-visible" onclick={() => (hidden = !hidden)}>toggle</button>

<div data-testid="hidden-wrap" style="width: 600px; {hidden ? 'display: none' : ''}">
  <ResizeGroup direction="horizontal" style="height: 200px">
    <ResizeItem defaultSize="50%" min="10%">
      <div data-testid="hidden-pane-a" style="height: 100%">A</div>
    </ResizeItem>
    <ResizeHandler />
    <ResizeItem defaultSize="50%" min="10%">
      <div data-testid="hidden-pane-b" style="height: 100%">B</div>
    </ResizeItem>
  </ResizeGroup>
</div>
