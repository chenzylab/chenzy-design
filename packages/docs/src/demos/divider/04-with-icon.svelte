<script lang="ts">
  import { Divider } from '@chenzy-design/svelte';
  import { IconStar } from '@chenzy-design/icons';
</script>

<div style="max-width: 640px;">
  <span>分割线内容也可以是图标。</span>
  <Divider margin={12}>
    <IconStar size="small" />
  </Divider>
  <span>常用于区块之间放置装饰性标记。</span>
</div>
