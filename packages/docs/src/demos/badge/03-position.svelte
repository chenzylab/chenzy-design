<script lang="ts">
  import { Badge, Avatar, Space } from '@chenzy-design/svelte';

  const style = 'width: 42px; height: 42px; border-radius: 4px;';
</script>

<Space vertical align="start" spacing={20}>
  <Badge count="VIP" position="rightTop" type="danger">
    <Avatar color="amber" shape="square" {style}>ZH</Avatar>
  </Badge>
  <Badge count="VIP" position="rightBottom" type="danger">
    <Avatar color="amber" shape="square" {style}>HS</Avatar>
  </Badge>
  <Badge count="VIP" position="leftTop" type="danger">
    <Avatar color="orange" shape="square" {style}>DY</Avatar>
  </Badge>
  <Badge count="VIP" position="leftBottom" type="danger">
    <Avatar color="orange" shape="square" {style}>TT</Avatar>
  </Badge>
</Space>
