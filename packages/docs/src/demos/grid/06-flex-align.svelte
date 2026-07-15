<script lang="ts">
  import { Row, Col } from '@chenzy-design/svelte';

  // 三种垂直对齐（align），对齐 Semi。需配 type="flex" 启用 flex 布局。
  const modes = ['top', 'middle', 'bottom'] as const;
  // 不等高内容，凸显垂直对齐差异。
  const heights = [56, 32, 72, 44];
</script>

<style>
  .demo-col {
    background: #e6f0ff;
    border: 1px solid #91b0f7;
    border-radius: 4px;
    text-align: center;
    font-size: 14px;
    color: #1e40af;
    display: flex;
    align-items: center;
    justify-content: center;
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
    <p class="demo-label">align=&quot;{mode}&quot;</p>
    <div class="demo-row-box">
      <Row type="flex" align={mode} gutter={8}>
        {#each heights as h, i (i)}
          <Col span={6}>
            <div class="demo-col" style={`height:${h}px`}>
              {h}px
            </div>
          </Col>
        {/each}
      </Row>
    </div>
  {/each}
</div>
