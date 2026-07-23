<script lang="ts">
  import { Badge, Avatar, Space } from '@chenzy-design/svelte';
  import { IconLock } from '@chenzy-design/icons';

  const style = 'width: 42px; height: 42px; border-radius: 4px;';
</script>

<Space vertical align="start" spacing={20}>
  <Badge count={5}>
    <Avatar color="blue" shape="square" {style}>BM</Avatar>
  </Badge>
  <Badge dot>
    <Avatar color="blue" shape="square" {style}>YL</Avatar>
  </Badge>
  <Badge>
    {#snippet count()}
      <IconLock style="color: var(--cd-color-primary)" />
    {/snippet}
    <Avatar color="light-blue" shape="square" {style}>XZ</Avatar>
  </Badge>
  <Badge count="NEW">
    <Avatar color="light-blue" shape="square" {style}>WF</Avatar>
  </Badge>
</Space>
