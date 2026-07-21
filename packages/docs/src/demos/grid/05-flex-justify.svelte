<script lang="ts">
  import { Row, Col } from '@chenzy-design/svelte';
</script>

<div class="grid">
  <p>sub-element align left</p>
  <Row type="flex" justify="start">
    {#each [1, 2, 3, 4] as n (n)}
      <Col span={4}><div class="col-content">col-4</div></Col>
    {/each}
  </Row>

  <p>sub-element align center</p>
  <Row type="flex" justify="center">
    {#each [1, 2, 3, 4] as n (n)}
      <Col span={4}><div class="col-content">col-4</div></Col>
    {/each}
  </Row>

  <p>sub-element align right</p>
  <Row type="flex" justify="end">
    {#each [1, 2, 3, 4] as n (n)}
      <Col span={4}><div class="col-content">col-4</div></Col>
    {/each}
  </Row>

  <p>sub-element monospaced arrangement</p>
  <Row type="flex" justify="space-between">
    {#each [1, 2, 3, 4] as n (n)}
      <Col span={4}><div class="col-content">col-4</div></Col>
    {/each}
  </Row>

  <p>sub-element align full</p>
  <Row type="flex" justify="space-around">
    {#each [1, 2, 3, 4] as n (n)}
      <Col span={4}><div class="col-content">col-4</div></Col>
    {/each}
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
