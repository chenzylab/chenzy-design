<script lang="ts">
  import { Row, Col } from '@chenzy-design/svelte';
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

<Row gutter={{ xs: 8, md: 16 }}>
  <Col xs={24} sm={12} md={8} lg={6}>
    <div class="demo-col">响应式列</div>
  </Col>
  <Col xs={24} sm={12} md={8} lg={6}>
    <div class="demo-col">响应式列</div>
  </Col>
  <Col xs={24} sm={12} md={8} lg={6}>
    <div class="demo-col">响应式列</div>
  </Col>
  <Col xs={24} sm={12} md={0} lg={6}>
    <div class="demo-col">≥lg 才显示</div>
  </Col>
</Row>
