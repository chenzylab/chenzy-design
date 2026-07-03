<script lang="ts">
  import { Avatar } from '@chenzy-design/svelte';
</script>

<div style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap;">
  <Avatar color="blue" alt="默认环" border>陈</Avatar>
  <Avatar color="teal" alt="定制色环" border={{ color: 'var(--cd-color-success)' }}>李</Avatar>
  <Avatar color="violet" alt="呼吸环" border={{ motion: true }}>王</Avatar>
  <Avatar shape="square" color="orange" alt="方形呼吸环" border={{ motion: true }}>赵</Avatar>
</div>
