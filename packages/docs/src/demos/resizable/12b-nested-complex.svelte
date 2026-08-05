<script lang="ts">
  import { ResizeGroup, ResizeItem, ResizeHandler } from '@chenzy-design/svelte';

  // 更复杂的三层嵌套：外层 vertical（top 80% + bottom 20%），top 内是 horizontal
  // 三栏，其中中间一栏又嵌套一个 vertical 三层分栏；bottom 也是 horizontal 两栏。
  let text = $state('拖动调整大小');
</script>

<div style="width: 1000px; height: 600px; max-width: 100%;">
  <ResizeGroup direction="vertical">
    <ResizeItem defaultSize="80%">
      <ResizeGroup direction="horizontal">
        <ResizeItem
          defaultSize="25%"
          min="10%"
          max="30%"
          style="border: 1px solid var(--cd-color-border); background: var(--cd-color-fill-0);"
        >
          <div style="margin-left: 20%; font-size: 14px; color: var(--cd-color-text-1);">{text + ' min:10% max:30%'}</div>
        </ResizeItem>
        <ResizeHandler />
        <ResizeItem defaultSize="50%" style="border: 1px solid var(--cd-color-border);">
          <div style="height: 100%;">
            <ResizeGroup direction="vertical">
              <ResizeItem
                defaultSize="33%"
                min="10%"
                style="border: 1px solid var(--cd-color-border); background: var(--cd-color-fill-0);"
                onChange={() => (text = '拖动中')}
                onResizeEnd={() => (text = '拖动调整大小')}
              >
                <div style="margin-left: 20%; font-size: 14px; color: var(--cd-color-text-1);">{text + ' min:10%'}</div>
              </ResizeItem>
              <ResizeHandler />
              <ResizeItem
                defaultSize="33%"
                min="10%"
                max="40%"
                style="border: 1px solid var(--cd-color-border); background: var(--cd-color-fill-0);"
              >
                <div style="margin-left: 20%; font-size: 14px; color: var(--cd-color-text-1);">{text + ' min:10% max:40%'}</div>
              </ResizeItem>
              <ResizeHandler />
              <ResizeItem style="border: 1px solid var(--cd-color-border); background: var(--cd-color-fill-0);">
                <div style="margin-left: 20%; font-size: 14px; color: var(--cd-color-text-1);">{text}</div>
              </ResizeItem>
            </ResizeGroup>
          </div>
        </ResizeItem>
        <ResizeHandler />
        <ResizeItem
          defaultSize="1"
          max="30%"
          style="border: 1px solid var(--cd-color-border); background: var(--cd-color-fill-0);"
        >
          <div style="margin-left: 20%; font-size: 14px; color: var(--cd-color-text-1);">{text + ' max:30%'}</div>
        </ResizeItem>
      </ResizeGroup>
    </ResizeItem>
    <ResizeHandler />
    <ResizeItem defaultSize="20%" onChange={() => (text = '拖动中')}>
      <ResizeGroup direction="horizontal">
        <ResizeItem defaultSize="50%" style="border: 1px solid var(--cd-color-border); background: var(--cd-color-fill-0);">
          <div style="margin-left: 20%; font-size: 14px; color: var(--cd-color-text-1);">tab</div>
        </ResizeItem>
        <ResizeHandler />
        <ResizeItem defaultSize="50%" style="border: 1px solid var(--cd-color-border); background: var(--cd-color-fill-0);">
          <div style="margin-left: 20%; font-size: 14px; color: var(--cd-color-text-1);">content</div>
        </ResizeItem>
      </ResizeGroup>
    </ResizeItem>
  </ResizeGroup>
</div>
