<script lang="ts">
  import { Breadcrumb } from '@chenzy-design/svelte';

  // 超 4 级折叠：第二层至倒数第三层省略，点击省略号展开显示全部级别。
  // 折叠能力作用于 routes 数据数组（Svelte Snippet children 无法被父组件切片，
  // 故折叠走 routes 模式；这是与 Semi React children 的技术栈差异）。
  const routes = ['首页', '当层级很多的时候', '又一层', '再一层', '上上一层', '上一层', '详情页'];
</script>

<Breadcrumb {routes} />
