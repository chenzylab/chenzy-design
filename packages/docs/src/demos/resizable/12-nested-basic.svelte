<script lang="ts">
  import { ResizeGroup, ResizeItem, ResizeHandler } from '@chenzy-design/svelte';

  // 嵌套：外层垂直分栏（header 20% + body 80%），body 内再套一个水平分栏（tab 25% + content 75%）。
  let text = $state('拖动调整大小');
</script>

<div style="width: 1000px; height: 600px; max-width: 100%;">
  <ResizeGroup direction="vertical">
    <ResizeItem
      defaultSize="20%"
      style="border: 1px solid var(--cd-color-border); background: var(--cd-color-fill-0);"
      onChange={() => (text = '拖动中')}
      onResizeEnd={() => (text = '拖动调整大小')}
    >
      <div style="margin-left: 20%; font-size: 14px; color: var(--cd-color-text-1);">header</div>
    </ResizeItem>
    <ResizeHandler />
    <ResizeItem defaultSize="80%" onChange={() => (text = '拖动中')}>
      <ResizeGroup direction="horizontal">
        <ResizeItem
          defaultSize="25%"
          style="border: 1px solid var(--cd-color-border); background: var(--cd-color-fill-0);"
          onChange={() => (text = '拖动中')}
          onResizeEnd={() => (text = '拖动调整大小')}
        >
          <div style="margin-left: 20%; font-size: 14px; color: var(--cd-color-text-1);">tab</div>
        </ResizeItem>
        <ResizeHandler />
        <ResizeItem
          defaultSize="75%"
          style="border: 1px solid var(--cd-color-border); background: var(--cd-color-fill-0);"
          onChange={() => (text = '拖动中')}
        >
          <div style="margin-left: 20%; font-size: 14px; color: var(--cd-color-text-1);">{text}</div>
        </ResizeItem>
      </ResizeGroup>
    </ResizeItem>
  </ResizeGroup>
</div>
