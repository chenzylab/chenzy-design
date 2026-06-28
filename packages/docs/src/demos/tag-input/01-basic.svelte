<script lang="ts">
  import { TagInput, Text } from '@chenzy-design/svelte';

  let tags = $state<string[]>(['svelte', 'vite']);
</script>

<div style="width: 320px">
  <TagInput
    value={tags}
    separator={[',', 'Enter']}
    placeholder="输入后回车或逗号添加标签"
    onChange={(t) => (tags = t)}
  />
  <Text type="tertiary">标签：{tags.join(' / ') || '（无）'}</Text>
</div>
