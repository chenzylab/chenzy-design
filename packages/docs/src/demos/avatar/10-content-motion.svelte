<script lang="ts">
  import { Avatar } from '@chenzy-design/svelte';
</script>

<!-- border={{ motion: true }} 开启描边呼吸动画，contentMotion 开启内容区域动效 -->
<div style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap;">
  <Avatar color="amber" border={{ motion: true }} contentMotion>T</Avatar>
  <Avatar color="amber" size="large" border={{ motion: true }} contentMotion>T</Avatar>
  <Avatar color="amber" size="extra-large" border={{ motion: true }} contentMotion
    >T</Avatar
  >
</div>
