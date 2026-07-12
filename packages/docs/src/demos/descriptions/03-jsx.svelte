<script lang="ts">
  import { Descriptions } from '@chenzy-design/svelte';
</script>

<!-- 除 data 外，还可用 <Descriptions.Item> 声明式写法，Item 须为直接子元素。 -->
<Descriptions>
  <Descriptions.Item itemKey="实际用户数量">1,480,000</Descriptions.Item>
  <Descriptions.Item itemKey="7天留存">98%</Descriptions.Item>
  <Descriptions.Item itemKey="安全等级">3级</Descriptions.Item>
  <Descriptions.Item itemKey="垂类标签">电商</Descriptions.Item>
  <Descriptions.Item itemKey="认证状态">未认证</Descriptions.Item>
</Descriptions>
