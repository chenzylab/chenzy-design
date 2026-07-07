<script lang="ts">
  import { HotKeys, Text, Space, Input } from '@chenzy-design/svelte';

  let panelEl = $state<HTMLDivElement | null>(null);
  let hits = $state(0);
</script>

<Space vertical>
  <Text type="tertiary" size="small">getListenerTarget 局部监听：仅当焦点在下方面板内按 Enter 才命中。</Text>
  <div
    bind:this={panelEl}
    style="padding:16px;border:1px dashed var(--cd-color-border);border-radius:8px;"
  >
    <Space vertical>
      <Input placeholder="聚焦此处后按 Enter" />
      <Text type="tertiary">面板内 Enter 命中：{hits} 次</Text>
    </Space>
  </div>
  {#if panelEl}
    <HotKeys hotKeys={['Enter']} getListenerTarget={() => panelEl} onHotKey={() => (hits += 1)} render={null} />
  {/if}
</Space>
