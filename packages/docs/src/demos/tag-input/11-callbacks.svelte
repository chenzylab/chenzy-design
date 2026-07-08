<script lang="ts">
  import { TagInput, Text } from '@chenzy-design/svelte';

  let logs = $state<string[]>([]);

  function push(line: string) {
    logs = [line, ...logs].slice(0, 6);
  }
</script>

<div style="width: 360px">
  <TagInput
    defaultValue={['svelte']}
    separator={[',', 'Enter']}
    placeholder="输入后回车或逗号添加，退格删除"
    onAdd={(added) => push(`onAdd：${added.join(' / ')}`)}
    onRemove={(removed, index) => push(`onRemove：${removed}（第 ${index + 1} 项）`)}
    onChange={(tags) => push(`onChange：${tags.join(' / ') || '（空）'}`)}
  />
  <div style="margin-top: 8px">
    {#if logs.length === 0}
      <Text type="tertiary">暂无事件，试试添加或删除标签</Text>
    {:else}
      {#each logs as line (line)}
        <div><Text type="tertiary">{line}</Text></div>
      {/each}
    {/if}
  </div>
</div>
