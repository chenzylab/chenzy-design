<script lang="ts">
  import { Row, Col } from '@chenzy-design/svelte';
</script>

<div class="grid">
  <Row type="flex">
    <Col span={6} order={4}><div class="col-content">col-4</div></Col>
    <Col span={6} order={3}><div class="col-content">col-3</div></Col>
    <Col span={6} order={2}><div class="col-content">col-2</div></Col>
    <Col span={6} order={1}><div class="col-content">col-1</div></Col>
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
