<script lang="ts">
  import { Breadcrumb, Popover } from '@chenzy-design/svelte';
  import { IconMore } from '@chenzy-design/icons';
  import type { BreadcrumbRoute } from '@chenzy-design/svelte';

  const routes: BreadcrumbRoute[] = [
    { name: '首页', href: '#' },
    { name: '当层级很多的时候', href: '#' },
    { name: '又一层', href: '#' },
    { name: '再一层', href: '#' },
    { name: '上上一层', href: '#' },
    { name: '上一层', href: '#' },
    { name: '详情页' },
  ];

  let logged = $state('—');
</script>

<!-- renderMore：自定义折叠 … 区域的渲染（对齐 Semi renderMore(restItem)）。
     参数为被折叠的路由列表，这里用 Popover + 三点图标弹出完整折叠项。 -->
<Breadcrumb
  {routes}
  maxItemCount={3}
  onClick={(r) => (logged = r.name ?? '')}
>
  {#snippet renderMore(collapsed)}
    <Popover trigger="click" position="bottomLeft">
      <span style="display:inline-flex; align-items:center; cursor:pointer">
        <IconMore size="inherit" />
      </span>
      {#snippet content()}
        <div style="display:flex; flex-direction:column; gap:6px; padding:4px">
          {#each collapsed as c (c.index)}
            <a href={c.route.href ?? '#'} style="color:var(--cd-color-link); text-decoration:none">
              {c.route.name ?? ''}
            </a>
          {/each}
        </div>
      {/snippet}
    </Popover>
  {/snippet}
</Breadcrumb>
