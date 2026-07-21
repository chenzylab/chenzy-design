<script lang="ts">
  import { Row, Col } from '@chenzy-design/svelte';

  // 对齐 Semi：四列不等高，凸显垂直对齐差异（对应 Semi demo 的 value 100/50/120/80）。
  const heights = [100, 50, 120, 80];
</script>

<div class="grid grid-flex">
  <p>Align Top</p>
  <Row type="flex" justify="center" align="top">
    {#each heights as h, i (i)}
      <Col span={4}><div class="col-content" style="height:{h}px">col-4</div></Col>
    {/each}
  </Row>

  <p>Align Center</p>
  <Row type="flex" justify="space-around" align="middle">
    {#each heights as h, i (i)}
      <Col span={4}><div class="col-content" style="height:{h}px">col-4</div></Col>
    {/each}
  </Row>

  <p>Align Bottom</p>
  <Row type="flex" justify="space-between" align="bottom">
    {#each heights as h, i (i)}
      <Col span={4}><div class="col-content" style="height:{h}px">col-4</div></Col>
    {/each}
  </Row>
</div>

<style>
  .grid-flex :global(.cd-row-flex) {
    background: var(--cd-color-fill-0);
  }
  .col-content {
    line-height: 30px;
    text-align: center;
    background: var(--cd-color-primary-light-default);
    outline: 1px solid var(--cd-color-primary-light-active);
  }
</style>
