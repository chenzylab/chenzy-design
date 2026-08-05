<!--
  仅供 Grid.responsive.a11y.test.ts 使用的测试夹具：Row（响应式 gutter）+ Col。
  用于断言 Col 从 RowContext 读取 gutters 后施加的四向 padding 是否与 Row 的负 margin 配对。
-->
<script lang="ts">
  import type { Breakpoint } from '@chenzy-design/core';
  import Row from './Row.svelte';
  import Col from './Col.svelte';

  type Gutter = number | Partial<Record<Breakpoint, number>>;

  interface Props {
    gutter: Gutter | [Gutter, Gutter];
  }

  let { gutter }: Props = $props();
</script>

<Row {gutter}>
  <Col span={12}>Left</Col>
  <Col span={12}>Right</Col>
</Row>
