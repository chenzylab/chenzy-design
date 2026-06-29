<script lang="ts">
  import { Button } from '@chenzy-design/svelte';

  const types = ['primary', 'secondary', 'tertiary', 'warning', 'danger'] as const;
  const labels: Record<(typeof types)[number], string> = {
    primary: '深色主要',
    secondary: '深色次要',
    tertiary: '深色第三',
    warning: '深色警告',
    danger: '深色危险',
  };
</script>

<div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
  {#each types as type (type)}
    <Button {type} theme="solid">{labels[type]}</Button>
  {/each}
</div>
