<!-- horizontal + children（无 data）声明式测试夹具：验证 Item 元信息收集后按 getHorizontalList 分组。 -->
<script lang="ts">
  import Descriptions from './Descriptions.svelte';
  import Item from './DescriptionsItem.svelte';

  let { column = 4, align = 'left' }: { column?: number; align?: 'center' | 'justify' | 'left' | 'plain' } =
    $props();
</script>

<Descriptions layout="horizontal" {align} {column}>
  <Item itemKey="实际用户数量">1,480,000</Item>
  <Item itemKey="7天留存">98%</Item>
  <Item itemKey="认证状态">未认证</Item>
</Descriptions>
