<!--
  仅供 Grid.a11y.test.ts 使用的测试夹具：Row + Col 24 栅格。
  纯布局容器，不引入语义角色；本套件只断言 axe 0 violations。
-->
<script lang="ts">
  import { Row, Col } from './index.js';
</script>

<Row gutter={16}>
  <Col span={12}>Left column</Col>
  <Col span={12}>Right column</Col>
</Row>
