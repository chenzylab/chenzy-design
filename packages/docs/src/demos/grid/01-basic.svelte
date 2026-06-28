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

<div style="display: flex; flex-direction: column; gap: 8px;">
  <Row gutter={8}>
    <Col span={24}><div class="demo-col">span=24</div></Col>
  </Row>
  <Row gutter={8}>
    <Col span={12}><div class="demo-col">span=12</div></Col>
    <Col span={12}><div class="demo-col">span=12</div></Col>
  </Row>
  <Row gutter={8}>
    <Col span={8}><div class="demo-col">span=8</div></Col>
    <Col span={8}><div class="demo-col">span=8</div></Col>
    <Col span={8}><div class="demo-col">span=8</div></Col>
  </Row>
  <Row gutter={8}>
    <Col span={6}><div class="demo-col">span=6</div></Col>
    <Col span={6}><div class="demo-col">span=6</div></Col>
    <Col span={6}><div class="demo-col">span=6</div></Col>
    <Col span={6}><div class="demo-col">span=6</div></Col>
  </Row>
</div>
