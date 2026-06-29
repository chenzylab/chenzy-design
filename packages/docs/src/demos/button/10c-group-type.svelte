<script lang="ts">
  import { Button, ButtonGroup } from '@chenzy-design/svelte';

  const types = ['primary', 'secondary', 'tertiary', 'warning', 'danger'] as const;
</script>

<!-- 组级 type 透传；组内单个 Button 仍可单独覆盖 -->
<div style="display: flex; gap: 24px; align-items: flex-start; flex-wrap: wrap;">
  {#each types as type (type)}
    <ButtonGroup {type} theme="light" ariaLabel="操作按钮组">
      <Button>编辑</Button>
      <Button>复制</Button>
      <Button>删除</Button>
    </ButtonGroup>
  {/each}
</div>
