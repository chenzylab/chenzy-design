<script lang="ts">
  import { Badge, Avatar } from '@chenzy-design/svelte';
</script>

<!-- 基本用法：count 数字 / dot 小圆点 / count 节点 / count 字符串 -->
<div style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap;">
  <Badge count={5}>
    <Avatar color="blue" shape="square">BM</Avatar>
  </Badge>
  <Badge dot>
    <Avatar color="blue" shape="square">YL</Avatar>
  </Badge>
  <Badge>
    {#snippet count()}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="var(--cd-color-primary)"
        aria-hidden="true"
      >
        <path
          d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5Zm3 8H9V6a3 3 0 1 1 6 0v3Z"
        />
      </svg>
    {/snippet}
    <Avatar color="light-blue" shape="square">XZ</Avatar>
  </Badge>
  <Badge count="NEW">
    <Avatar color="light-blue" shape="square">WF</Avatar>
  </Badge>
</div>
