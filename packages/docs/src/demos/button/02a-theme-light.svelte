<script lang="ts">
  import { Button } from '@chenzy-design/svelte';

  const types = ['primary', 'secondary', 'tertiary', 'warning', 'danger'] as const;
  const labels: Record<(typeof types)[number], string> = {
    primary: '浅色主要',
    secondary: '浅色次要',
    tertiary: '浅色第三',
    warning: '浅色警告',
    danger: '浅色危险',
  };
</script>

<div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
  {#each types as type (type)}
    <Button {type} theme="light">{labels[type]}</Button>
  {/each}
</div>
