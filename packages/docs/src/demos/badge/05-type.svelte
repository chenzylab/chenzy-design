<script lang="ts">
  import { Badge, Avatar } from '@chenzy-design/svelte';
</script>

<!-- type：primary（默认）/ secondary / tertiary / warning / danger / success -->
<div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
  <Badge count={5} type="primary">
    <Avatar color="violet" shape="square">MR</Avatar>
  </Badge>
  <Badge count={5} type="secondary">
    <Avatar color="violet" shape="square">YL</Avatar>
  </Badge>
  <Badge count={5} type="tertiary">
    <Avatar color="red" shape="square">ZW</Avatar>
  </Badge>
  <Badge count={5} type="warning">
    <Avatar color="red" shape="square">JL</Avatar>
  </Badge>
  <Badge count={5} type="danger">
    <Avatar color="pink" shape="square">RT</Avatar>
  </Badge>
  <Badge dot type="primary">
    <Avatar color="pink" shape="square">YF</Avatar>
  </Badge>
</div>
