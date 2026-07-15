<script lang="ts">
  import { Row, Col } from '@chenzy-design/svelte';

  // 五种水平排列（justify），对齐 Semi。需配 type="flex" 启用 flex 布局。
  const modes = ['start', 'center', 'end', 'space-between', 'space-around'] as const;
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
  .demo-row-box {
    border: 1px dashed var(--cd-color-border);
    border-radius: 4px;
    padding: 4px;
  }
</style>

<div style="display: flex; flex-direction: column;">
  {#each modes as mode (mode)}
    <p class="demo-label">justify=&quot;{mode}&quot;</p>
    <div class="demo-row-box">
      <Row type="flex" justify={mode}>
        {#each [1, 2, 3, 4] as n (n)}
          <Col span={4}><div class="demo-col">col-4</div></Col>
        {/each}
      </Row>
    </div>
  {/each}
</div>
