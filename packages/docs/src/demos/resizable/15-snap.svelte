<script lang="ts">
  import { Resizable } from '@chenzy-design/svelte';

  // snap：宽度吸附到 [160, 260, 360]，snapGap=24 表示接近目标 24px 内才吸附。
  let width = $state(160);
</script>

<p class="demo-tip">
  拖右边缘：宽度吸附到 160 / 260 / 360 三档（距目标 24px 内生效）。当前宽 {Math.round(width)}
</p>

<Resizable
  enable={{ right: true }}
  defaultSize={{ width: 160, height: 140 }}
  minWidth={120}
  maxWidth={400}
  snap={{ x: [160, 260, 360] }}
  snapGap={24}
  onChange={(s) => (width = Number(s.width))}
  class="demo-box"
>
  <div class="demo-content">吸附到 160 / 260 / 360</div>
</Resizable>

<style>
  .demo-tip {
    font-size: 13px;
    color: var(--cd-color-text-2);
    margin: 0 0 12px;
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
    padding: 0 12px;
    text-align: center;
    color: var(--cd-color-text-1);
  }
</style>
