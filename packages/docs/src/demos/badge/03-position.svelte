<script lang="ts">
  import { Badge, Avatar } from '@chenzy-design/svelte';
</script>

<!-- position：rightTop（默认）/ rightBottom / leftTop / leftBottom -->
<div style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap;">
  <Badge count="VIP" position="rightTop" type="danger">
    <Avatar color="amber" shape="square">ZH</Avatar>
  </Badge>
  <Badge count="VIP" position="rightBottom" type="danger">
    <Avatar color="amber" shape="square">HS</Avatar>
  </Badge>
  <Badge count="VIP" position="leftTop" type="danger">
    <Avatar color="orange" shape="square">DY</Avatar>
  </Badge>
  <Badge count="VIP" position="leftBottom" type="danger">
    <Avatar color="orange" shape="square">TT</Avatar>
  </Badge>
</div>
