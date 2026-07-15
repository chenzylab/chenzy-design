<script lang="ts">
  import { Row, Col } from '@chenzy-design/svelte';
</script>

<style>
  .demo-col {
    background: #e6f0ff;
    border: 1px solid #91b0f7;
    border-radius: 4px;
    padding: 12px 0;
    text-align: center;
    font-size: 14px;
    color: #1e40af;
  }
  .demo-label {
    font-size: 12px;
    color: var(--cd-color-text-2);
    margin: 12px 0 4px;
    font-family: ui-monospace, monospace;
  }
</style>

<!-- gutter 传 [水平, 垂直] 数组：水平 16 + 垂直 24，靠 Row 四向负 margin + Col 四向 padding 抵消。 -->
<p class="demo-label">gutter=[16, 24]（水平 + 垂直间距）</p>
<Row gutter={[16, 24]}>
  {#each Array(8) as _, i}
    <Col span={6}><div class="demo-col">Col {i + 1}</div></Col>
  {/each}
</Row>

<!-- gutter 传响应式对象：按断点从大到小降级取值（xs=8 / md=16 / xl=32）。 -->
<p class="demo-label">gutter=&#123;{'{ xs: 8, md: 16, xl: 32 }'}&#125;（响应式间距，缩放窗口生效）</p>
<Row gutter={{ xs: 8, md: 16, xl: 32 }}>
  {#each Array(8) as _, i}
    <Col span={6}><div class="demo-col">Col {i + 1}</div></Col>
  {/each}
</Row>
