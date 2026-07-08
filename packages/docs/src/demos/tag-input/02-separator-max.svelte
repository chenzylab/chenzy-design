<script lang="ts">
  import { TagInput, Text } from '@chenzy-design/svelte';

  let tags = $state<string[]>(['react', 'vue']);
  let exceeded = $state(false);
</script>

<div style="width: 320px">
  <TagInput
    value={tags}
    max={5}
    separator={[',', ';', 'Enter']}
    placeholder="逗号、分号或回车添加，最多 5 个"
    onChange={(t) => (tags = t)}
    onExceed={() => (exceeded = true)}
  />
  <Text type="tertiary">标签（{tags.length}/5）：{tags.join(' / ') || '（无）'}</Text>
  {#if exceeded}
    <Text type="warning">已达上限（5 个），拒绝继续添加</Text>
  {/if}
</div>
