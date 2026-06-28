<script lang="ts">
  import { TagInput, Text } from '@chenzy-design/svelte';

  let tags = $state<string[]>(['frontend']);
</script>

<div style="width: 320px">
  <TagInput
    value={tags}
    allowDuplicates={false}
    placeholder="重复标签会被忽略"
    onChange={(t) => (tags = t)}
  />
  <Text type="tertiary">标签（{tags.length}）：{tags.join(' / ') || '（无）'}</Text>
  <Text type="tertiary">尝试重复输入 frontend，不会新增。</Text>
</div>
