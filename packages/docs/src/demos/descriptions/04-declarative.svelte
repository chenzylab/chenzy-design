<script lang="ts">
  import { Descriptions } from '@chenzy-design/svelte';
</script>

<Descriptions title="订单详情" bordered column={2}>
  <Descriptions.Item label="订单编号">ORD-20240601-001</Descriptions.Item>
  <Descriptions.Item label="下单时间">2024-06-01 10:23:45</Descriptions.Item>
  <Descriptions.Item label="收件人">李四</Descriptions.Item>
  <Descriptions.Item label="联系电话">139****0001</Descriptions.Item>
  <Descriptions.Item label="收货地址" span={2}>上海市浦东新区张江高科技园区某某路 123 号</Descriptions.Item>
  <Descriptions.Item label="备注" span={2}>请在工作日 9:00-18:00 配送，谢谢。</Descriptions.Item>
</Descriptions>
