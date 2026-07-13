<!--
  仅供 OverflowList.a11y.test.ts 使用的测试夹具：数据驱动 items + visibleItemRenderer/overflowRenderer Snippet。
  严格对齐 Semi：OverflowList 是纯行为组件，不注入语义角色；可见/溢出内容语义由 renderer 提供的宿主内容决定。
  jsdom 无布局，ResizeObserver 测量拿到 0 宽，不会真的折叠——本套件只断言 DOM 结构 + axe 静态扫描，
  折叠行为留给浏览器 e2e。
-->
<script lang="ts">
  import { OverflowList } from './index.js';

  interface Props {
    renderMode?: 'collapse' | 'scroll';
  }
  let { renderMode = 'collapse' }: Props = $props();

  const items = [
    { key: 'Cut' },
    { key: 'Copy' },
    { key: 'Paste' },
    { key: 'Delete' },
    { key: 'Rename' },
  ];
</script>

<OverflowList {items} {renderMode}>
  {#snippet visibleItemRenderer(item)}
    <span class="cd-tag">{item.key}</span>
  {/snippet}
  {#snippet overflowRenderer(rest)}
    {#if rest.length}<span class="cd-tag">+{rest.length}</span>{/if}
  {/snippet}
</OverflowList>
