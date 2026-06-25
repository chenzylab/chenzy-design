<!--
  仅供 OverflowList.a11y.test.ts 使用的测试夹具：数据驱动 items + item Snippet。
  jsdom 无布局，ResizeObserver 测量拿到 0 宽，不会真的折叠出 +N 节点——
  本套件只断言容器 role=group 语义与可访问名 + axe 静态扫描，折叠行为留给 Playwright。
-->
<script lang="ts">
  import { OverflowList } from './index.js';

  interface Props {
    mode?: 'collapse' | 'scroll';
    ariaLabel?: string;
  }
  let { mode = 'collapse', ariaLabel = 'Toolbar' }: Props = $props();

  const items = ['Cut', 'Copy', 'Paste', 'Delete', 'Rename'];
</script>

<OverflowList {items} {mode} {ariaLabel}>
  {#snippet item({ item })}
    <span class="cd-tag">{item}</span>
  {/snippet}
</OverflowList>
