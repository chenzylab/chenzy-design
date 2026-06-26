<script lang="ts">
  import { BackTop, Switch, Text } from '@chenzy-design/svelte';

  let backtopBox = $state<HTMLDivElement | null>(null);
  let backtopControlled = $state(false);
</script>

<div style="display:flex; flex-direction:column; gap:12px; align-items:flex-start">
  <Text type="tertiary">
    下方滚动盒为自定义滚动容器：BackTop 监听该容器（而非 window）的滚动，回顶也滚该容器；右侧按钮受控显隐；回到顶部经 ARIA live 播报。
  </Text>
  <Switch
    value={backtopControlled}
    onChange={(v) => (backtopControlled = v)}
    checkedChildren="受控显示"
    uncheckedChildren="阈值自动"
  />
  <div
    bind:this={backtopBox}
    style="position:relative;inline-size:320px;block-size:200px;overflow:auto;border:1px solid var(--cd-color-border);border-radius:6px;padding:12px"
  >
    <div style="block-size:1200px">
      <Text>容器顶部（向下滚动 ≥ 120px 触发按钮）</Text>
    </div>
    {#if backtopControlled}
      <BackTop
        target={() => backtopBox}
        visible={true}
        visibilityHeight={120}
        announceOnArrive
        bottom={16}
        right={16}
        size="small"
      />
    {:else}
      <BackTop
        target={() => backtopBox}
        visibilityHeight={120}
        announceOnArrive
        bottom={16}
        right={16}
        size="small"
      />
    {/if}
  </div>
</div>
