<script lang="ts">
  import { TimePicker, Text } from '@chenzy-design/svelte';
</script>

<div style="display:flex; flex-direction:column; gap:12px">
  <div style="display:flex; align-items:center; gap:12px">
    <TimePicker />
    <Text type="tertiary">默认 destroyOnClose=true：关闭即卸载浮层 DOM</Text>
  </div>
  <div style="display:flex; align-items:center; gap:12px">
    <TimePicker destroyOnClose={false} />
    <Text type="tertiary">destroyOnClose=false：首次打开后保留 DOM，关闭仅隐藏（频繁开关更省重挂载）</Text>
  </div>
</div>
