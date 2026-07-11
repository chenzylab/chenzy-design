<script lang="ts">
  import { Badge, Avatar } from '@chenzy-design/svelte';
</script>

<!-- overflowCount：超过阈值显示 {overflowCount}+ -->
<div style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap;">
  <Badge count={99}>
    <Avatar color="teal" shape="square">ZH</Avatar>
  </Badge>
  <Badge count={100}>
    <Avatar color="teal" shape="square">HS</Avatar>
  </Badge>
  <Badge count={99} overflowCount={10}>
    <Avatar color="green" shape="square">DY</Avatar>
  </Badge>
  <Badge count={1000} overflowCount={999}>
    <Avatar color="green" shape="square">TT</Avatar>
  </Badge>
</div>
