<script lang="ts">
  import { Badge, Avatar, Space } from '@chenzy-design/svelte';

  const style = 'width: 42px; height: 42px; border-radius: 4px;';
</script>

<Space vertical align="start" spacing={20}>
  <Badge count={99}>
    <Avatar color="teal" shape="square" {style}>ZH</Avatar>
  </Badge>
  <Badge count={100}>
    <Avatar color="teal" shape="square" {style}>HS</Avatar>
  </Badge>
  <Badge count={99} overflowCount={10}>
    <Avatar color="green" shape="square" {style}>DY</Avatar>
  </Badge>
  <Badge count={1000} overflowCount={999}>
    <Avatar color="green" shape="square" {style}>TT</Avatar>
  </Badge>
</Space>
