<script lang="ts">
  import { Resizable, Button } from '@chenzy-design/svelte';

  // 受控：size 由外部 state 控制；拖拽经 onChange 写回 state，按钮也能改。
  let size = $state({ width: 200, height: 100 });

  function bump(d: number) {
    size = { width: size.width + d, height: size.height + d };
  }
</script>

<div style="width: 500px; height: 60%; max-width: 100%;">
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
    <Button size="small" onclick={() => bump(10)}>+10</Button>
    <span style="font-family: ui-monospace, monospace; font-size: 13px; color: var(--cd-color-text-2);">
      {Math.round(size.width)} × {Math.round(size.height)}
    </span>
  </div>

  <Resizable
    {size}
    onChange={(s) => (size = { width: Number(s.width), height: Number(s.height) })}
    style="margin-top: 10px; border: 1px solid var(--cd-color-border); border-radius: var(--cd-border-radius-medium); background: var(--cd-color-fill-0);"
  >
    <div style="margin-left: 20%; font-size: 14px; color: var(--cd-color-text-1);">受控尺寸（按钮或拖拽都可改）</div>
  </Resizable>
</div>
