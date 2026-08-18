<script lang="ts">
  import { Breadcrumb } from '@chenzy-design/svelte';
  import RenderMore from './RenderMoreCustom.svelte';

  const routes = ['首页', '当层级很多的时候', '又一层', '再一层', '上上一层', '上一层', '详情页'];
</script>

<!-- renderMore 为组件引用直传（非 Snippet），经 props.restItems 取被折叠路由列表（对齐 Semi renderMore(restItem)）。
     仅 routes 数据驱动模式下 restItems 才有完整数据：声明式 <Breadcrumb.Item> 子组件模式下父组件无法
     取得子组件内部的路由数据（Svelte 无 React.Children.toArray 等价能力，见 Item.svelte 头注释），
     restItems 恒为空数组，renderMore/moreType='popover' 内容会渲染为空——已知限制，见 meta.ts。 -->
<Breadcrumb {routes} renderMore={RenderMore} onClick={(item, e) => console.log(item, e)} />
