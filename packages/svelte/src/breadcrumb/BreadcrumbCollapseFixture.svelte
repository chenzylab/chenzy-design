<!--
  测试夹具：声明式 <Breadcrumb.Item> + maxItemCount 折叠（对齐 Semi children + maxItemCount）。
  验证声明式分支同样支持折叠——Item 经 context 注册序号，被折叠者自身不渲染，
  「…」由被折叠段前一项渲染，点击就地展开。
-->
<script lang="ts">
  import Breadcrumb from './Breadcrumb.svelte';
  import Item from './Item.svelte';

  let { maxItemCount = 3 }: { maxItemCount?: number } = $props();
</script>

<Breadcrumb {maxItemCount}>
  <Item>首页</Item>
  <Item>一级</Item>
  <Item>二级</Item>
  <Item>三级</Item>
  <Item>详情页</Item>
</Breadcrumb>
