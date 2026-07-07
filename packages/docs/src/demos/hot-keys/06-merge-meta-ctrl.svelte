<script lang="ts">
  import { HotKeys, Text, Space } from '@chenzy-design/svelte';

  let hits = $state(0);
</script>

<Space vertical>
  <Space align="center">
    <Text>mergeMetaCtrl 跨平台合并 Cmd/Ctrl：</Text>
    <HotKeys hotKeys={['Control', 'K']} mergeMetaCtrl onHotKey={() => (hits += 1)} />
    <Text type="tertiary">命中：{hits} 次</Text>
  </Space>
  <Text type="tertiary" size="small">macOS 按 ⌘K、Windows/Linux 按 Ctrl+K 均命中同一组合（Semi 该 prop 未生效，本库真正实现）。</Text>
</Space>
