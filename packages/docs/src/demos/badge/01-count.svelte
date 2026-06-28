<script lang="ts">
  import { Badge, Avatar } from '@chenzy-design/svelte';
</script>

<div style="display: flex; gap: 24px; align-items: center;">
  <Badge count={5}>
    <Avatar alt="A" shape="square" />
  </Badge>
  <Badge count={0} showZero>
    <Avatar alt="B" shape="square" />
  </Badge>
  <Badge count={120} overflowCount={99}>
    <Avatar alt="C" shape="square" />
  </Badge>
</div>
