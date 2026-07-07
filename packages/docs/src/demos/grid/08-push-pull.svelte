<script lang="ts">
  import { Row, Col } from '@chenzy-design/svelte';

  // push / pull 相对移动列位置（不占据实际栅格，仅视觉偏移）。
  // 常用于「内容在前、侧栏在后」的 DOM 顺序，但视觉上侧栏在左：push 主内容、pull 侧栏。
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
  .demo-col--alt {
    background: #fff4e6;
    border-color: #f7c391;
    color: #b45309;
  }
</style>

<div style="display: flex; flex-direction: column; gap: 8px;">
  <!-- DOM：主内容在前、侧栏在后；视觉：主内容 push 到右、侧栏 pull 到左 -->
  <Row gutter={8}>
    <Col span={18} push={6}><div class="demo-col">主内容 span=18 push=6（DOM 在前，视觉在右）</div></Col>
    <Col span={6} pull={18}><div class="demo-col demo-col--alt">侧栏 span=6 pull=18（DOM 在后，视觉在左）</div></Col>
  </Row>
</div>
