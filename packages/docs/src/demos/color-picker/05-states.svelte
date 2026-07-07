<script lang="ts">
  import { ColorPicker, Text, Space } from '@chenzy-design/svelte';

  let small = $state('#3366ff');
  let large = $state('#16a34a');
  let warn = $state('#f59e0b');
  let err = $state('#ef4444');
</script>

<Space vertical align="start">
  <Space align="center">
    <ColorPicker size="small" value={small} onChange={(c) => (small = c)} />
    <ColorPicker size="default" value={large} onChange={(c) => (large = c)} />
    <ColorPicker size="large" value={large} onChange={(c) => (large = c)} />
    <Text type="tertiary">small / default / large</Text>
  </Space>

  <Space align="center">
    <ColorPicker status="warning" value={warn} onChange={(c) => (warn = c)} />
    <ColorPicker status="error" value={err} onChange={(c) => (err = c)} />
    <Text type="tertiary">warning：{warn} / error：{err}</Text>
  </Space>

  <Space align="center">
    <ColorPicker disabled value="#64748b" />
    <Text type="tertiary">禁用态</Text>
  </Space>
</Space>
