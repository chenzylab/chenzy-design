<script lang="ts">
  import { Resizable, Button } from '@chenzy-design/svelte';

  // 受控：size 由外部 state 控制；拖拽经 onChange 写回 state，按钮也能改。
  let size = $state({ width: 240, height: 140 });

  function bump(d: number) {
    size = { width: size.width + d, height: size.height + d };
  }
</script>

<div class="demo-toolbar">
  <Button size="small" onclick={() => bump(20)}>+20</Button>
  <Button size="small" onclick={() => bump(-20)}>−20</Button>
  <span class="demo-size">{Math.round(size.width)} × {Math.round(size.height)}</span>
</div>

<Resizable
  {size}
  minWidth={120}
  minHeight={80}
  onChange={(s) => (size = { width: Number(s.width), height: Number(s.height) })}
  class="demo-box"
>
  <div class="demo-content">受控尺寸（按钮或拖拽都可改）</div>
</Resizable>

<style>
  .demo-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }
  .demo-size {
    font-family: ui-monospace, monospace;
    font-size: 13px;
    color: var(--cd-color-text-2);
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
    padding: 0 16px;
    text-align: center;
    color: var(--cd-color-text-1);
  }
</style>
