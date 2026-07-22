<script lang="ts">
  import { Tag, Space } from '@chenzy-design/svelte';

  // 对齐 Semi：16 种色板 + white。
  const colors = [
    'amber', 'blue', 'cyan', 'green', 'grey', 'indigo',
    'light-blue', 'light-green', 'lime', 'orange', 'pink',
    'purple', 'red', 'teal', 'violet', 'yellow', 'white',
  ] as const;
</script>

<Space wrap>
  {#each colors as c (c)}
    <Tag color={c}>{c}</Tag>
  {/each}
</Space>
