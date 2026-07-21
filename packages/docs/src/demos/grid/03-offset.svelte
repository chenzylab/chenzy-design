<script lang="ts">
  import { Row, Col } from '@chenzy-design/svelte';
</script>

<div class="grid">
  <Row>
    <Col span={8}><div class="col-content">col-8</div></Col>
    <Col span={8} offset={8}><div class="col-content">col-8</div></Col>
  </Row>
  <br />
  <Row>
    <Col span={6} offset={6}><div class="col-content">col-6</div></Col>
    <Col span={6} offset={6}><div class="col-content">col-6</div></Col>
  </Row>
  <br />
  <Row>
    <Col span={12} offset={6}><div class="col-content">col-12</div></Col>
  </Row>
</div>

<style>
  .col-content {
    min-height: 30px;
    line-height: 30px;
    text-align: center;
    background: var(--cd-color-primary-light-default);
    outline: 1px solid var(--cd-color-primary-light-active);
  }
</style>
