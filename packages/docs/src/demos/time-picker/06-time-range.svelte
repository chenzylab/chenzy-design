<script lang="ts">
  import { TimePicker, Text } from '@chenzy-design/svelte';

  let range = $state<[Date | null, Date | null]>([null, null]);
</script>

<div style="display:flex; align-items:center; gap:12px">
  <TimePicker
    type="timeRange"
    defaultValue={['10:23:15', '12:38:32']}
    onChange={(t) => (range = Array.isArray(t) ? t : [t, null])}
  />
  <Text type="tertiary">
    起：{range[0] ? range[0].toLocaleTimeString('zh-CN') : '--'}，
    止：{range[1] ? range[1].toLocaleTimeString('zh-CN') : '--'}
  </Text>
</div>
