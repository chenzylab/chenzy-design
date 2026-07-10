<script lang="ts">
  import { Avatar } from '@chenzy-design/svelte';
</script>

<!-- border 渲染一圈额外描边环；对象形式可定制 color -->
<div style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap;">
  <Avatar color="amber" border>T</Avatar>
  <Avatar color="amber" size="large" border>T</Avatar>
  <Avatar
    color="amber"
    size="extra-large"
    border={{ color: 'var(--cd-color-success)' }}
   >T</Avatar
  >
</div>
