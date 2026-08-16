<script lang="ts">
  import { Upload, Space, Text } from '@chenzy-design/svelte';
  import type { UploadFileItem } from '@chenzy-design/svelte';

  // 外部持有各文件的实时进度（onProgress 仅内置 XHR 上传触发）。
  let progress = $state<Record<string, number>>({});

  function onProgress(percent: number, item: UploadFileItem) {
    progress = { ...progress, [item.name]: percent };
  }

  const entries = $derived(Object.entries(progress));
</script>

<Space vertical align="start">
  <Text type="tertiary">onProgress 进度回调：外部拿到每个文件的 percent 并展示数值。</Text>
  <Upload multiple action="/api/upload" {onProgress} />
  {#if entries.length}
    <Space vertical align="start">
      {#each entries as [name, percent] (name)}
        <Text type="secondary">{name}：{percent}%</Text>
      {/each}
    </Space>
  {/if}
</Space>
