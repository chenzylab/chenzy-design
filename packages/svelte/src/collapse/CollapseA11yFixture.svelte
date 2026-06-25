<!--
  仅供 Collapse.a11y.test.ts 使用的测试夹具：数据驱动 panels + children Snippet 渲染面板内容，
  使 header button 的 aria-controls 指向真实存在的 region（axe aria-valid-attr-value 通过）。
-->
<script lang="ts">
  import { Collapse } from './index.js';
  import type { CollapsePanel } from './types.js';

  interface Props {
    accordion?: boolean;
    disabled?: boolean;
    defaultActiveKey?: string | string[];
  }
  let { accordion = false, disabled = false, defaultActiveKey = [] }: Props = $props();

  const panels: CollapsePanel[] = [
    { key: 'a', header: 'Section A' },
    { key: 'b', header: 'Section B' },
    { key: 'c', header: 'Section C', disabled: true },
  ];
</script>

<Collapse {panels} {accordion} {disabled} {defaultActiveKey}>
  {#snippet children({ key })}
    <p>Content for {key}</p>
  {/snippet}
</Collapse>
