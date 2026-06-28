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
</style>

<Row gutter={[16, 16]}>
  {#each Array(8) as _, i}
    <Col span={6}><div class="demo-col">Col {i + 1}</div></Col>
  {/each}
</Row>
