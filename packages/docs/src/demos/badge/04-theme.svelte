<script lang="ts">
  import { Badge, Avatar } from '@chenzy-design/svelte';
</script>

<!-- theme：solid（默认）/ light / inverted，作用于 count 与 dot -->
<div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
  <Badge count={5} theme="solid">
    <Avatar color="indigo" shape="square">XZ</Avatar>
  </Badge>
  <Badge count={5} theme="light">
    <Avatar color="indigo" shape="square">YB</Avatar>
  </Badge>
  <Badge count={5} theme="inverted">
    <Avatar color="light-green" shape="square">LX</Avatar>
  </Badge>
  <Badge dot theme="solid">
    <Avatar color="light-green" shape="square">YZ</Avatar>
  </Badge>
  <Badge dot theme="light">
    <Avatar color="lime" shape="square">HW</Avatar>
  </Badge>
  <div style="padding: 8px; border-radius: 4px; background-color: var(--cd-color-fill-0);">
    <Badge dot theme="inverted">
      <Avatar color="lime" shape="square">XM</Avatar>
    </Badge>
  </div>
</div>
