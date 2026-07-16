<script lang="ts">
  import { Select, Text } from '@chenzy-design/svelte';

  const optionList = Array.from({ length: 12 }, (_, i) => ({
    label: `选项 ${i + 1}`,
    value: i + 1,
  }));
</script>

<div style="display:flex;flex-direction:column;gap:12px;max-width:280px">
  <Text type="tertiary">searchPosition="trigger"（默认，输入内联在触发器上）：</Text>
  <Select {optionList} filter searchPosition="trigger" placeholder="触发器内搜索" />
  <Text type="tertiary">searchPosition="dropdown"（浮层顶部搜索框）：</Text>
  <Select {optionList} filter searchPosition="dropdown" placeholder="浮层内搜索" />
</div>
