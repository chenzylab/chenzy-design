<script lang="ts">
  import { Resizable } from '@chenzy-design/svelte';

  // 拖拽三回调：onResizeStart / onChange（拖拽中）/ onResizeEnd。
  let status = $state('拖右下角调整大小');
  let size = $state({ width: 260, height: 160 });
</script>

<Resizable
  enable={{ right: true, bottom: true, bottomRight: true }}
  defaultSize={{ width: 260, height: 160 }}
  minWidth={140}
  minHeight={100}
  onResizeStart={() => {
    status = '开始拖拽…';
  }}
  onChange={(s) => {
    status = '拖拽中';
    size = { width: Math.round(Number(s.width)), height: Math.round(Number(s.height)) };
  }}
  onResizeEnd={(s) => {
    status = '拖拽结束';
    size = { width: Math.round(Number(s.width)), height: Math.round(Number(s.height)) };
  }}
  class="demo-box"
>
  <div class="demo-content">
    <div>{status}</div>
    <div class="demo-size">{size.width} × {size.height}</div>
  </div>
</Resizable>

<style>
  :global(.demo-box) {
    border: 1px solid var(--cd-color-border);
    border-radius: var(--cd-border-radius-medium);
    background: var(--cd-color-fill-0);
  }
  .demo-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 100%;
    color: var(--cd-color-text-1);
  }
  .demo-size {
    font-family: ui-monospace, monospace;
    font-size: 13px;
    color: var(--cd-color-text-2);
  }
</style>
