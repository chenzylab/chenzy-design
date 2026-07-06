<script lang="ts">
  import { HotKeys, Text, Space } from '@chenzy-design/svelte';

  let count = $state(0);
</script>

<Space direction="vertical">
  <Space align="center">
    <Text>按下</Text>
    <HotKeys hotKeys={['Control', 'Shift', 'A']} onHotKey={() => (count += 1)} />
    <Text type="tertiary">命中次数：{count}</Text>
  </Space>
  <Text type="tertiary" size="small">修饰键精确匹配，普通键用物理键位（event.code），规避输入法/大小写。</Text>
</Space>
