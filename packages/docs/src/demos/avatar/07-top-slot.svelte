<script lang="ts">
  import { Avatar } from '@chenzy-design/svelte';

  const topSlot = {
    text: '直播',
    gradientStart: 'rgb(255,23,100)',
    gradientEnd: 'rgb(237,52,148)',
  };
</script>

<div style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap;">
  <Avatar color="amber" {topSlot}>T</Avatar>
  <Avatar color="amber" size="large" {topSlot}>T</Avatar>
  <Avatar color="amber" size="extra-large" {topSlot}>T</Avatar>
</div>
