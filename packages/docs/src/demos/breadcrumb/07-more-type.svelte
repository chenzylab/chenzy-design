<script lang="ts">
  import { Breadcrumb } from '@chenzy-design/svelte';

  // moreType='popover'：省略号区域悬浮弹出可点击的折叠项菜单（对齐 Semi moreType 可选 default/popover）。
  const routes = ['首页', '当层级很多的时候', '又一层', '再一层', '上上一层', '上一层', '详情页'];
</script>

<Breadcrumb {routes} moreType="popover" />
