<script lang="ts">
  import { Empty, Typography } from '@chenzy-design/svelte';
</script>

<Empty title="暂未找到匹配的筛选结果" description={desc} />

{#snippet desc()}
  <span>
    <Typography.Text>试试 </Typography.Text>
    <Typography.Text link>重置筛选条件</Typography.Text>
  </span>
{/snippet}
