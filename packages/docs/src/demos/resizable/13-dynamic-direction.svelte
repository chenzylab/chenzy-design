<script lang="ts">
  import { ResizeGroup, ResizeItem, ResizeHandler, Button } from '@chenzy-design/svelte';

  // 动态方向：运行时切换 horizontal / vertical，外层 item 内又嵌套一个 horizontal 分栏。
  let text = $state('拖动调整大小');
  let direction = $state<'horizontal' | 'vertical'>('horizontal');

  function changeDirection() {
    direction = direction === 'horizontal' ? 'vertical' : 'horizontal';
  }
</script>

<div style="width: 400px; height: 300px; max-width: 100%;">
  <Button onclick={changeDirection}>{direction}</Button>
  <ResizeGroup {direction}>
    <ResizeItem defaultSize={5} onChange={() => (text = '拖动中')} onResizeEnd={() => (text = '拖动调整大小')}>
      <ResizeGroup direction="horizontal">
        <ResizeItem
          style="background: var(--cd-color-fill-0);"
          onChange={() => (text = '拖动中')}
          onResizeEnd={() => (text = '拖动调整大小')}
        >
          <div style="margin-left: 20%; padding: 5px; font-size: 14px;">{text}</div>
        </ResizeItem>
        <ResizeHandler />
        <ResizeItem style="background: var(--cd-color-fill-0);" onChange={() => (text = '拖动中')}>
          <div style="margin-left: 20%; padding: 5px; font-size: 14px;">{text}</div>
        </ResizeItem>
      </ResizeGroup>
    </ResizeItem>
    <ResizeHandler />
    <ResizeItem defaultSize={1.3} style="background: var(--cd-color-fill-0);" onChange={() => (text = '拖动中')}>
      <div style="margin-left: 20%; padding: 5px; font-size: 14px;">{text}</div>
    </ResizeItem>
  </ResizeGroup>
</div>
