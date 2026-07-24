<script lang="ts">
  import { Breadcrumb, Popover } from '@chenzy-design/svelte';
  import { IconMore } from '@chenzy-design/icons';

  const separator = '-'; // 用于拼接 restItem 数组项的分隔符
  const routes = ['首页', '当层级很多的时候', '又一层', '再一层', '上上一层', '上一层', '详情页'];
</script>

<!-- 若想为省略号区域自定义其他形式的渲染，可使用 renderMore()（对齐 Semi）。 -->
<Breadcrumb {routes} onClick={(item, e) => console.log(item, e)}>
  {#snippet renderMore(restItem)}
    <Popover showArrow style="padding:12px" trigger="click">
      {#snippet content()}
        <span>
          {#each restItem as item, idx (idx)}
            {item.route.name ?? ''}{#if idx !== restItem.length - 1}<span
                style="color:var(--cd-color-text-2); margin-right:6px">{separator}</span
              >{/if}
          {/each}
        </span>
      {/snippet}
      <IconMore />
    </Popover>
  {/snippet}
</Breadcrumb>
