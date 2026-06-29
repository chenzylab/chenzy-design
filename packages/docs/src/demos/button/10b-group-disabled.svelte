<script lang="ts">
  import { Button, ButtonGroup } from '@chenzy-design/svelte';
</script>

<!-- 组级 disabled 透传，整组按钮一并禁用 -->
<ButtonGroup disabled type="primary" theme="light" ariaLabel="文本对齐">
  <Button>左对齐</Button>
  <Button>居中</Button>
  <Button>右对齐</Button>
</ButtonGroup>
