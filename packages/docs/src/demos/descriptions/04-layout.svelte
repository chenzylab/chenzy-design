<script lang="ts">
  import { Descriptions, Space, Tag } from '@chenzy-design/svelte';

  const verticalData = [
    { key: '抖音号', value: 'ChenzyDesign' },
    { key: '主播类型', value: '自由主播' },
    { key: '安全等级', value: '3级' },
    { key: '垂类标签', value: verticalTags },
    { key: '作品数量', value: '88888888' },
    {
      key: '认证状态',
      value: '这是一个很长很长很长很长很长很长很长很长很长的值',
      span: 3,
    },
  ];

  const horizontalData = [
    { key: '抖音号', value: 'ChenzyDesign' },
    { key: '主播类型', value: '自由主播' },
    { key: '安全等级', value: '3级' },
    { key: '垂类标签', value: horizontalTag },
    { key: '作品数量', value: '88888888' },
    {
      key: '认证状态',
      value: '这是一个很长很长很长很长很长很长很长很长很长的值',
      span: 3,
    },
    { key: '上次直播时间', value: '2024-05-01 12:00:00', span: 3 },
  ];
</script>

{#snippet verticalTags()}
  <Space>
    <Tag size="small" shape="circle" color="warning">互联网资讯</Tag>
    <Tag size="small" shape="circle" color="primary">编程</Tag>
  </Space>
{/snippet}

{#snippet horizontalTag()}
  <Tag size="small" shape="circle" color="primary">编程</Tag>
{/snippet}

<div style="display: flex; flex-direction: column; gap: 24px;">
  <!-- 纵向布局（默认），align='plain'，每行最多 4 列。 -->
  <Descriptions layout="vertical" align="plain" data={verticalData} column={4} />
  <!-- 横向布局，align='plain'，每行最多 5 列。 -->
  <Descriptions
    layout="horizontal"
    align="plain"
    data={horizontalData}
    column={5}
  />
</div>
