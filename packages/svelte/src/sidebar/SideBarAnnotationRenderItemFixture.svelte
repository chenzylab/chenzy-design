<!--
  测试夹具：给 SideBarAnnotation 提供自定义 renderItem Snippet（jsdom 组件测用），
  验证 renderItem 覆盖默认 video/text 卡片渲染。
-->
<script lang="ts">
  import SideBarAnnotation from './SideBarAnnotation.svelte';
  import type {
    SideBarAnnotationGroup,
    SideBarAnnotationItem,
  } from './types.js';

  interface Props {
    info?: SideBarAnnotationGroup[];
    activeKey?: string | string[];
  }

  let { info = [], activeKey }: Props = $props();
</script>

<SideBarAnnotation visible {info} {activeKey} motion={false} {renderItem} />

{#snippet renderItem(item: SideBarAnnotationItem)}
  <div data-testid="custom-item">Custom: {item.title}</div>
{/snippet}
