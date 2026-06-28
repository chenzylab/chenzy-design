<script lang="ts">
  import { Upload, Space, Text } from '@chenzy-design/svelte';

  let exceeded = $state(false);
  let invalidCount = $state(0);
</script>

<Space direction="vertical" align="start">
  <Text type="tertiary">最多 3 个文件，仅接受 .png/.jpg/.jpeg</Text>
  <Upload
    multiple
    limit={3}
    accept=".png,.jpg,.jpeg"
    action="//example.com/upload"
    prompt="超出数量或类型不符的文件会被忽略"
    onExceed={() => (exceeded = true)}
    onAcceptInvalid={(files) => (invalidCount = files.length)}
  />
  {#if exceeded}
    <Text type="warning">已超出 3 个文件上限</Text>
  {/if}
  {#if invalidCount > 0}
    <Text type="danger">{invalidCount} 个文件类型不符被拒绝</Text>
  {/if}
</Space>
