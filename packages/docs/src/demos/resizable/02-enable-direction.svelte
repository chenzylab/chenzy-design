<script lang="ts">
  import { Resizable, Switch, Title } from '@chenzy-design/svelte';

  // 控制伸缩方向：通过 Switch 切换单个方向（left）的 enable 状态。
  let b = $state(false);
</script>

<div style="width: 500px; height: 60%; max-width: 100%;">
  <div style="display: flex; align-items: center; margin: 8px;">
    <Switch checked={b} onChange={(checked) => (b = checked)} />
    <Title heading={6} style="margin: 8px;">{b ? 'able' : 'disable'}</Title>
  </div>
  <Resizable
    enable={{ left: b }}
    defaultSize={{ width: 200, height: 200 }}
    style="border: 1px solid var(--cd-color-border); border-radius: var(--cd-border-radius-medium); background: var(--cd-color-fill-0);"
  >
    <div style="margin-left: 20%; font-size: 14px; color: var(--cd-color-text-1);">enable.left:{b}</div>
  </Resizable>
</div>
