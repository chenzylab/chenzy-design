<script lang="ts">
  import { HotKeys, Text, Space } from '@chenzy-design/svelte';
</script>

<Space direction="vertical">
  <Space align="center">
    <Text>默认渲染（自动平台符号）：</Text>
    <HotKeys hotKeys={['Meta', 'K']} />
  </Space>
  <Space align="center">
    <Text>content 自定义键名文本：</Text>
    <HotKeys hotKeys={['Control', 'K']} content={['Ctrl', 'K']} />
  </Space>
  <Text type="tertiary" size="small">content 仅改提示显示，不影响监听匹配。</Text>
</Space>
