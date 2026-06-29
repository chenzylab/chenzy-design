<script lang="ts">
  import { Button, ButtonGroup } from '@chenzy-design/svelte';

  const sizes = ['large', 'default', 'small'] as const;
</script>

<!-- 组级 size 经 context 透传，组内 Button 无需逐个设置 -->
<div style="display: flex; gap: 24px; align-items: flex-start; flex-wrap: wrap;">
  {#each sizes as size (size)}
    <ButtonGroup {size} type="primary" theme="light" ariaLabel="文本对齐">
      <Button>左对齐</Button>
      <Button>居中</Button>
      <Button>右对齐</Button>
    </ButtonGroup>
  {/each}
</div>
