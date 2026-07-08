<script lang="ts">
  import { TagInput } from '@chenzy-design/svelte';
</script>

<div style="width: 320px">
  <TagInput
    maxTagCount={2}
    showRestTagsPopover
    expandRestTagsOnClick
    defaultValue={['svelte', 'vite', 'vitest', 'unocss', 'shiki']}
    placeholder="输入后回车添加"
  />
</div>
