<script lang="ts">
  import { Row, Col } from '@chenzy-design/svelte';

  // wrap（本库相较 Semi 额外提供）：默认 true 超出换行；false 时强制单行不换行。
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
  .demo-label {
    font-size: 12px;
    color: var(--cd-color-text-2);
    margin: 12px 0 4px;
    font-family: ui-monospace, monospace;
  }
</style>

<div style="display: flex; flex-direction: column;">
  <p class="demo-label">wrap 默认（true）：总 span 超 24 自动换行</p>
  <Row gutter={8}>
    {#each [1, 2, 3, 4, 5] as n (n)}
      <Col span={6}><div class="demo-col">span=6</div></Col>
    {/each}
  </Row>

  <p class="demo-label">wrap={'{false}'}：强制单行，列被压缩不换行</p>
  <Row gutter={8} wrap={false}>
    {#each [1, 2, 3, 4, 5] as n (n)}
      <Col span={6}><div class="demo-col">span=6</div></Col>
    {/each}
  </Row>
</div>
