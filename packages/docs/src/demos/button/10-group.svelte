<script lang="ts">
  import { Button, ButtonGroup } from '@chenzy-design/svelte';

  const sizes = ['large', 'default', 'small'] as const;
</script>

<!-- 组级 size 经 context 透传，组内 Button 无需逐个设置 -->
<div style="display: flex; gap: 10px; align-items: flex-start; flex-wrap: wrap;">
  {#each sizes as size (size)}
    <ButtonGroup {size}>
      <Button>拷贝</Button>
      <Button>查询</Button>
      <Button>剪切</Button>
    </ButtonGroup>
  {/each}
</div>
