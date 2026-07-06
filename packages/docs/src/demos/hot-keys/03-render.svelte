<script lang="ts">
  import { HotKeys, Text, Space } from '@chenzy-design/svelte';

  let saved = $state(0);
</script>

<Space direction="vertical">
  <Space align="center">
    <Text>render 完全自定义提示：</Text>
    <HotKeys hotKeys={['Meta', 'S']} onHotKey={() => (saved += 1)}>
      {#snippet render()}
        <span style="padding:2px 8px;border-radius:6px;background:var(--cd-color-fill-1);">⌘S 保存</span>
      {/snippet}
    </HotKeys>
    <Text type="tertiary">保存次数：{saved}</Text>
  </Space>
  <Text type="tertiary" size="small">传 render 完全接管提示 UI；传 render 为 null 则只监听不显示。</Text>
</Space>
