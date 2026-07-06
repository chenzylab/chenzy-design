<script lang="ts">
  import { HotKeys, Text, Space } from '@chenzy-design/svelte';

  let intercepted = $state(0);
</script>

<Space direction="vertical">
  <Space align="center">
    <Text>preventDefault 拦截浏览器默认行为：</Text>
    <HotKeys hotKeys={['Control', 'S']} preventDefault onHotKey={() => (intercepted += 1)} />
    <Text type="tertiary">已拦截 Ctrl+S：{intercepted} 次</Text>
  </Space>
  <Text type="tertiary" size="small">按 Ctrl+S 不再触发浏览器「保存网页」，改为执行回调。</Text>
</Space>
