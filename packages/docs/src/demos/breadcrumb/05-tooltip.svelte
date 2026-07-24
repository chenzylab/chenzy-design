<script lang="ts">
  import { Breadcrumb, Text } from '@chenzy-design/svelte';

  const routes = ['首页', '当这个页面标题很长很长很长时需要省略', '详情页'];
</script>

<Text size="small">默认行为</Text>
<Breadcrumb {routes} />
<br />
<Text size="small">省略但不显示 Tooltip</Text>
<Breadcrumb showTooltip={false} {routes} />
<br />
<Text size="small">不截断</Text>
<Breadcrumb showTooltip={{ width: 'auto' }} {routes} />
<br />
<Text size="small">从标题中间开始省略</Text>
<Breadcrumb showTooltip={{ ellipsisPos: 'middle' }} {routes} />
<br />
<Text size="small">自定义 Tooltip 参数</Text>
<Breadcrumb showTooltip={{ opts: { position: 'topLeft' } }} {routes} />
