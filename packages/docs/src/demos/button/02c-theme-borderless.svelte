<script lang="ts">
  import { Button } from '@chenzy-design/svelte';

  const types = ['primary', 'secondary', 'tertiary', 'warning', 'danger'] as const;
  const labels: Record<(typeof types)[number], string> = {
    primary: '主要',
    secondary: '次要',
    tertiary: '第三',
    warning: '警告',
    danger: '危险',
  };
</script>

<div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
  {#each types as type (type)}
    <Button {type} theme="borderless">{labels[type]}</Button>
  {/each}
</div>
