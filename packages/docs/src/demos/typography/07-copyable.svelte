<script lang="ts">
  import { Text, Paragraph } from '@chenzy-design/svelte';

  let copied = $state(false);

  function handleCopy(): void {
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 1500);
  }
</script>

<div style="display: flex; flex-direction: column; gap: 12px; max-width: 480px;">
  <Paragraph copyable>点击右侧图标即可复制这段文本内容。</Paragraph>
  <Paragraph copyable={{ content: '自定义复制内容' }}>
    显示的是这段文字，但复制的是自定义内容。
  </Paragraph>
  <div style="display: flex; align-items: center; gap: 8px;">
    <Text copyable onCopy={handleCopy}>复制我并触发回调</Text>
    {#if copied}
      <Text type="success" size="small">已复制</Text>
    {/if}
  </div>
</div>
