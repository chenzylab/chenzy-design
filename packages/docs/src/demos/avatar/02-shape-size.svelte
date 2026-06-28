<script lang="ts">
  import { Avatar } from '@chenzy-design/svelte';
</script>

<div style="display: flex; flex-direction: column; gap: 16px;">
  <div style="display: flex; gap: 12px; align-items: center;">
    <Avatar size="extra-small" alt="XS" />
    <Avatar size="small" alt="S" />
    <Avatar size="default" alt="D" />
    <Avatar size="large" alt="L" />
    <Avatar size="extra-large" alt="XL" />
  </div>
  <div style="display: flex; gap: 12px; align-items: center;">
    <Avatar shape="circle" alt="圆形" />
    <Avatar shape="square" alt="方形" />
  </div>
</div>
