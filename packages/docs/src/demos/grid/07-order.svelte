<script lang="ts">
  import { Row, Col } from '@chenzy-design/svelte';

  // 通过 order 改变列的视觉排列顺序（DOM 顺序不变，仅渲染顺序变）。
  const cols = [
    { label: '源 1 · order=4', order: 4 },
    { label: '源 2 · order=3', order: 3 },
    { label: '源 3 · order=2', order: 2 },
    { label: '源 4 · order=1', order: 1 },
  ];
</script>

<style>
  .demo-col {
    background: #e6f0ff;
    border: 1px solid #91b0f7;
    border-radius: 4px;
    padding: 8px 0;
    text-align: center;
    font-size: 14px;
    color: #1e40af;
  }
</style>

<!-- order 作用于 flex item，需 Row type="flex" 启用 flex 布局。 -->
<Row type="flex" gutter={8}>
  {#each cols as c (c.order)}
    <Col span={6} order={c.order}><div class="demo-col">{c.label}</div></Col>
  {/each}
</Row>
