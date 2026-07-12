<script lang="ts">
  import { Descriptions } from '@chenzy-design/svelte';

  // 通过 keyStyle 自定义 key 样式，如固定宽度实现对齐。
  const data = [
    { key: '用户名', value: '张三', keyStyle: 'width: 100px; text-align: right;' },
    {
      key: '电子邮箱',
      value: 'zhangsan@example.com',
      keyStyle: 'width: 100px; text-align: right;',
    },
    { key: '联系电话', value: '138-0000-0000', keyStyle: 'width: 100px; text-align: right;' },
    { key: '地址', value: '北京市朝阳区', keyStyle: 'width: 100px; text-align: right;' },
  ];
</script>

<div style="display: flex; flex-direction: column; gap: 24px;">
  <!-- data 写法 -->
  <Descriptions {data} align="center" />

  <!-- 也可配合声明式写法 -->
  <Descriptions align="center">
    <Descriptions.Item
      itemKey="姓名"
      keyStyle="width: 120px; color: var(--cd-color-primary);">李四</Descriptions.Item
    >
    <Descriptions.Item
      itemKey="年龄"
      keyStyle="width: 120px; color: var(--cd-color-primary);">28</Descriptions.Item
    >
    <Descriptions.Item
      itemKey="职业"
      keyStyle="width: 120px; color: var(--cd-color-primary);"
      >前端工程师</Descriptions.Item
    >
  </Descriptions>
</div>
