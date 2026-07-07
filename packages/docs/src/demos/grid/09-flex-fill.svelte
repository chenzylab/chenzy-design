<script lang="ts">
  import { Row, Col } from '@chenzy-design/svelte';

  // Col 的 flex 自适应（本库相较 Semi 额外提供）：
  // - flex 数值 → 按比例分配剩余空间
  // - flex 字符串 → 直接写 CSS flex 值（如 '0 0 120px' 固定宽）
  // - 不设 span/flex → 自动列，等分剩余空间
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
  .demo-col--fixed { background: #fff4e6; border-color: #f7c391; color: #b45309; }
  .demo-label {
    font-size: 12px;
    color: var(--cd-color-text-2);
    margin: 12px 0 4px;
    font-family: ui-monospace, monospace;
  }
</style>

<div style="display: flex; flex-direction: column;">
  <p class="demo-label">按比例：flex 1 / 2 / 3</p>
  <Row gutter={8}>
    <Col flex={1}><div class="demo-col">flex=1</div></Col>
    <Col flex={2}><div class="demo-col">flex=2</div></Col>
    <Col flex={3}><div class="demo-col">flex=3</div></Col>
  </Row>

  <p class="demo-label">固定宽 + 自适应：flex=&quot;0 0 120px&quot; + 自动列</p>
  <Row gutter={8}>
    <Col flex="0 0 120px"><div class="demo-col demo-col--fixed">固定 120px</div></Col>
    <Col><div class="demo-col">自动填充剩余</div></Col>
  </Row>
</div>
