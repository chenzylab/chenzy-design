<script lang="ts">
  import { Divider, Icon } from '@chenzy-design/svelte';

  const starSvg =
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><path d="m12 2 2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 7.1-1.01z"/></svg>';
</script>

<div style="max-width: 640px;">
  <span>分割线内容也可以是图标。</span>
  <Divider margin={12}>
    <Icon svg={starSvg} size="small" />
  </Divider>
  <span>常用于区块之间放置装饰性标记。</span>
</div>
