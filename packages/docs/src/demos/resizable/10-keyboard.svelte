<script lang="ts">
  import { Resizable } from '@chenzy-design/svelte';

  // 键盘可达（本库相较 Semi 额外强调的无障碍能力）：
  // 把手 role=separator + aria-value*，Tab 聚焦后方向键调节、Home/End 到极值。
  let size = $state({ width: 260, height: 160 });
</script>

<p class="demo-tip">
  Tab 聚焦边/角把手后：<kbd>←</kbd><kbd>→</kbd><kbd>↑</kbd><kbd>↓</kbd> 按步长调节，
  <kbd>Home</kbd> 到最小、<kbd>End</kbd> 到最大。当前 {Math.round(size.width)} × {Math.round(size.height)}
</p>

<Resizable
  defaultSize={{ width: 260, height: 160 }}
  minWidth={120}
  minHeight={100}
  maxWidth={420}
  maxHeight={300}
  keyboardStep={16}
  onChange={(s) => (size = { width: Number(s.width), height: Number(s.height) })}
  class="demo-box"
>
  <div class="demo-content">键盘无障碍缩放</div>
</Resizable>

<style>
  .demo-tip {
    font-size: 13px;
    color: var(--cd-color-text-2);
    margin: 0 0 12px;
    line-height: 1.8;
  }
  .demo-tip kbd {
    font-family: ui-monospace, monospace;
    font-size: 12px;
    padding: 1px 5px;
    margin: 0 1px;
    border: 1px solid var(--cd-color-border);
    border-radius: 4px;
    background: var(--cd-color-fill-0);
  }
  :global(.demo-box) {
    border: 1px solid var(--cd-color-border);
    border-radius: var(--cd-border-radius-medium);
    background: var(--cd-color-fill-0);
  }
  .demo-content {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--cd-color-text-1);
  }
</style>
