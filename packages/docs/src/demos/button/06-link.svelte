<script lang="ts">
  import { Button } from '@chenzy-design/svelte';
</script>

<div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
  <Button type="primary" href="https://github.com/bytegolang/chenzy.design">
    访问仓库
  </Button>
  <Button type="primary" theme="outline" href="https://svelte.dev">
    Svelte 官网
  </Button>
  <!-- disabled 链接按钮：移除 href、不可激活 -->
  <Button href="https://example.com" disabled>
    禁用链接
  </Button>
</div>
