<!-- 树形数据展示：dataSource 含 children，tree 开启，默认展开首层。对齐 Semi「树形数据展示」。 -->
<script lang="ts">
  import { Table } from '@chenzy-design/svelte';

  type Row = {
    key: number;
    dataKey: string;
    name: string;
    type: string;
    description: string;
    default: string;
    children?: Row[];
    [k: string]: unknown;
  };

  const columns = [
    { dataIndex: 'dataKey', title: 'Key', width: 160 },
    { dataIndex: 'name', title: '名称', width: 160 },
    { dataIndex: 'type', title: '数据类型', width: 200 },
    { dataIndex: 'description', title: '描述' },
    { dataIndex: 'default', title: '默认值', width: 100 },
  ];

  const data: Row[] = [
    {
      key: 1,
      dataKey: 'videos_info',
      name: '视频信息',
      type: 'Object 对象',
      description: '视频的元信息',
      default: '无',
      children: [
        { key: 11, dataKey: 'status', name: '视频状态', type: 'Enum<Integer> 枚举', description: '可见、推荐状态', default: '1' },
        {
          key: 12,
          dataKey: 'vid',
          name: '视频 ID',
          type: 'String 字符串',
          description: '唯一 ID',
          default: '无',
          children: [
            { key: 121, dataKey: 'video_url', name: '视频地址', type: 'String 字符串', description: '唯一链接', default: '无' },
          ],
        },
      ],
    },
    {
      key: 2,
      dataKey: 'text_info',
      name: '文本信息',
      type: 'Object 对象',
      description: '文本的元信息',
      default: '无',
      children: [
        { key: 21, dataKey: 'title', name: '视频标题', type: 'String 字符串', description: '视频的标题', default: '无' },
        { key: 22, dataKey: 'video_description', name: '视频描述', type: 'String 字符串', description: '视频的描述', default: '无' },
      ],
    },
  ];
</script>

<Table
  {columns}
  dataSource={data}
  rowKey="key"
  bordered
  pagination={false}
  tree={{ defaultExpandedRowKeys: [1, 2] }}
/>
