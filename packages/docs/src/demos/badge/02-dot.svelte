<script lang="ts">
  import { Badge, Avatar } from '@chenzy-design/svelte';
</script>

<div style="display: flex; gap: 24px; align-items: center;">
  <Badge dot>
    <Avatar alt="D" shape="square" />
  </Badge>
  <Badge dot type="success">
    <Avatar alt="S" shape="square" />
  </Badge>
  <Badge dot type="warning">
    <Avatar alt="W" shape="square" />
  </Badge>
</div>
