<script lang="ts">
  import { TimePicker, Text } from '@chenzy-design/svelte';

  let value = $state<Date | null>(null);
</script>

<div style="display:flex; align-items:center; gap:12px">
  <TimePicker {value} onChange={(t) => (value = Array.isArray(t) ? t[0] : t)} />
  <Text type="tertiary">
    选中：{value ? value.toLocaleTimeString('zh-CN') : '（未选）'}
  </Text>
</div>
