<script lang="ts">
  import { Badge, Avatar } from '@chenzy-design/svelte';
</script>

<div style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap;">
  <Badge count={3} type="danger">
    <Avatar alt="危险" shape="square" />
  </Badge>
  <Badge count={3} type="warning">
    <Avatar alt="警告" shape="square" />
  </Badge>
  <Badge count={3} type="success">
    <Avatar alt="成功" shape="square" />
  </Badge>
  <Badge count={3} type="primary">
    <Avatar alt="主要" shape="square" />
  </Badge>
</div>
