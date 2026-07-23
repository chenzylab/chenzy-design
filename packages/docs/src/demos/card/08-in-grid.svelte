<script lang="ts">
  import { Card, Row, Col } from '@chenzy-design/svelte';
</script>

<div style="background-color: var(--cd-color-fill-0); padding: 20px;">
  <Row gutter={[16, 16]}>
    <Col span={8}>
      <Card title="Card Title" bordered={false}>Card Content</Card>
    </Col>
    <Col span={8}>
      <Card title="Card Title" bordered={false}>Card Content</Card>
    </Col>
    <Col span={8}>
      <Card title="Card Title" bordered={false}>Card Content</Card>
    </Col>
  </Row>
  <Row gutter={[16, 16]}>
    <Col span={16}>
      <Card title="Card Title" bordered={false}>Card Content</Card>
    </Col>
    <Col span={8}>
      <Card title="Card Title" bordered={false}>Card Content</Card>
    </Col>
  </Row>
</div>
