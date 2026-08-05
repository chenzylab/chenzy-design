<script lang="ts">
  import { ResizeGroup, ResizeItem, ResizeHandler } from '@chenzy-design/svelte';

  // 组合基本使用：defaultSize 支持多单位——px（400px）、百分比（20%）、
  // 纯数字比例（0.5 / 1，按比例分配剩余空间）。
  let text = $state('拖动调整大小');
</script>

<div style="width: 1000px; height: 100px; max-width: 100%;">
  <ResizeGroup direction="horizontal">
    <ResizeItem
      defaultSize="400px"
      min="10%"
      style="border: 1px solid var(--cd-color-border); background: var(--cd-color-fill-0);"
      onChange={() => (text = '拖动中')}
      onResizeEnd={() => (text = '拖动调整大小')}
    >
      <div style="margin-left: 20%; font-size: 14px; color: var(--cd-color-text-1);">{text + ' min:10%'}</div>
    </ResizeItem>
    <ResizeHandler />
    <ResizeItem
      defaultSize="20%"
      min="10%"
      max="30%"
      style="border: 1px solid var(--cd-color-border); background: var(--cd-color-fill-0);"
      onChange={() => (text = '拖动中')}
    >
      <div style="margin-left: 20%; font-size: 14px; color: var(--cd-color-text-1);">{text + ' min:10% max:30%'}</div>
    </ResizeItem>
    <ResizeHandler />
    <ResizeItem
      defaultSize="0.5"
      style="border: 1px solid var(--cd-color-border); background: var(--cd-color-fill-0);"
      onChange={() => (text = '拖动中')}
    >
      <div style="margin-left: 20%; font-size: 14px; color: var(--cd-color-text-1);">{text}</div>
    </ResizeItem>
    <ResizeHandler />
    <ResizeItem
      defaultSize={1}
      style="border: 1px solid var(--cd-color-border); background: var(--cd-color-fill-0);"
      onChange={() => (text = '拖动中')}
    >
      <div style="margin-left: 20%; font-size: 14px; color: var(--cd-color-text-1);">{text}</div>
    </ResizeItem>
  </ResizeGroup>
</div>
