<script lang="ts">
  import { Row, Col } from '@chenzy-design/svelte';
</script>

<div class="grid grid-gutter">
  <p>horizontal</p>
  <hr />
  <Row gutter={16}>
    {#each Array(8) as _, i (i)}
      <Col span={6}><div class="col-content">col-6</div></Col>
    {/each}
  </Row>
  <p>vertical</p>
  <hr />
  <Row gutter={[16, 24]}>
    {#each Array(8) as _, i (i)}
      <Col span={6}><div class="col-content">col-6</div></Col>
    {/each}
  </Row>
</div>

<style>
  .col-content {
    min-height: 30px;
    line-height: 30px;
    text-align: center;
    background: var(--cd-color-primary-light-hover);
  }
</style>
