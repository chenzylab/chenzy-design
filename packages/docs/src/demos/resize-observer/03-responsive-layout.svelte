<script lang="ts">
  import { ResizeObserver, Text, Tag } from '@chenzy-design/svelte';

  const BREAKPOINT = 360;
</script>

<Text type="tertiary">容器宽度 &lt; {BREAKPOINT}px 时纵向堆叠，否则横向并排</Text>
<div style="margin-top:8px; resize:horizontal; overflow:auto; width:480px; min-width:200px; max-width:640px; border:1px dashed var(--cd-color-border); border-radius:8px; padding:12px">
  <ResizeObserver>
    {#snippet children({ width })}
      {@const compact = width < BREAKPOINT}
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px">
        <Tag color={compact ? 'warning' : 'primary'}>
          {compact ? '紧凑（纵向）' : '宽屏（横向）'}
        </Tag>
        <Text type="tertiary" size="small">{Math.round(width)} px</Text>
      </div>
      <div
        style="display:flex; gap:8px; flex-direction:{compact ? 'column' : 'row'}"
      >
        <div style="flex:1; padding:12px; border-radius:6px; background:var(--cd-color-fill-1); color:var(--cd-color-text-1)">侧栏</div>
        <div style="flex:2; padding:12px; border-radius:6px; background:var(--cd-color-fill-0); color:var(--cd-color-text-1)">主内容区</div>
      </div>
    {/snippet}
  </ResizeObserver>
</div>
