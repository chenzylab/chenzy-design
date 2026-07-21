<script lang="ts">
  import { Button, ButtonGroup } from '@chenzy-design/svelte';
</script>

<!-- 组级 disabled 透传，整组按钮一并禁用 -->
<div style="display: flex;">
  <ButtonGroup disabled>
    <Button>拷贝</Button>
    <Button>查询</Button>
    <Button>剪切</Button>
  </ButtonGroup>
</div>
