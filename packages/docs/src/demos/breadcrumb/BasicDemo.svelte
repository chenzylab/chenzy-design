<script lang="ts">
  import { Breadcrumb, Text } from '@chenzy-design/svelte';

  let breadcrumbMore = $state('—');
</script>

<div style="display:flex; flex-direction:column; gap:16px; align-items:flex-start">
  <Breadcrumb
    routes={[
      { label: '首页', href: '#' },
      { label: '组件', href: '#' },
      { label: '导航' },
    ]}
  />

  <div data-testid="breadcrumb-collapse">
    <Breadcrumb
      maxItemCount={3}
      routes={[
        { label: '首页', href: '#' },
        { label: '一级', href: '#' },
        { label: '二级', href: '#' },
        { label: '三级', href: '#' },
        { label: '四级', href: '#' },
        { label: '当前页' },
      ]}
    />
  </div>

  <div data-testid="breadcrumb-declarative">
    <Breadcrumb>
      <Breadcrumb.Item href="#">首页</Breadcrumb.Item>
      <Breadcrumb.Item href="#">组件</Breadcrumb.Item>
      <Breadcrumb.Item>导航</Breadcrumb.Item>
    </Breadcrumb>
  </div>

  <div data-testid="breadcrumb-tooltip" style="max-inline-size: 360px">
    <Breadcrumb
      showTooltip
      routes={[
        { label: '首页', href: '#' },
        { label: '这是一个非常非常非常长以至于会被截断的中间项标题', href: '#' },
        { label: '另一个同样很长很长很长很长会被省略号截断的当前页标题' },
      ]}
    />
  </div>

  <div data-testid="breadcrumb-more-popover">
    <Breadcrumb
      maxItemCount={3}
      moreType="popover"
      onClick={(r) => (breadcrumbMore = r.label)}
      routes={[
        { label: '首页', href: '#' },
        { label: '一级', href: '#' },
        { label: '二级', href: '#' },
        { label: '三级', href: '#' },
        { label: '四级', href: '#' },
        { label: '当前页' },
      ]}
    />
    <Text type="tertiary">popover 点击折叠项：{breadcrumbMore}</Text>
  </div>

  <div data-testid="breadcrumb-more-tooltip">
    <Breadcrumb
      maxItemCount={3}
      moreType="tooltip"
      routes={[
        { label: '首页', href: '#' },
        { label: '一级', href: '#' },
        { label: '二级', href: '#' },
        { label: '三级', href: '#' },
        { label: '四级', href: '#' },
        { label: '当前页' },
      ]}
    />
  </div>
</div>
