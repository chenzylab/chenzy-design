<script lang="ts">
  import { Select, Text } from '@chenzy-design/svelte';

  let val = $state<string[]>(['a', 'b', 'c', 'd']);
  const options = Array.from({ length: 8 }, (_, i) => ({
    label: `选项 ${String.fromCharCode(65 + i)}`,
    value: String.fromCharCode(97 + i),
  }));
</script>

<div style="max-width:320px">
  <!-- 多选 + maxTagCount 折叠 +N，hover 用 Popover 展示剩余 -->
  <Select
    {options}
    value={val}
    multiple
    maxTagCount={2}
    showRestTagsPopover
    onChange={(v) => (val = v as string[])}
    placeholder="多选（超 2 项折叠 +N）"
  />
  <Text type="tertiary">已选 {val.length} 项</Text>
</div>
