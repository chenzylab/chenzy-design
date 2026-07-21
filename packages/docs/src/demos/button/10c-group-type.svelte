<script lang="ts">
  import { Button, ButtonGroup } from '@chenzy-design/svelte';

  const types = ['primary', 'secondary', 'tertiary', 'warning', 'danger'] as const;
</script>

<!-- 组级 type 透传；组内单个 Button 仍可单独覆盖 -->
<div style="display: flex; gap: 10px; align-items: flex-start; flex-wrap: wrap;">
  {#each types as type (type)}
    <ButtonGroup {type} ariaLabel="操作按钮组">
      <Button>拷贝</Button>
      <Button>查询</Button>
      <Button>剪切</Button>
    </ButtonGroup>
  {/each}
</div>
