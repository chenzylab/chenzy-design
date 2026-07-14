<!-- 自定义行事件与属性：onRow 返回 className / style / onClick（第 3 行可点击，点击写入日志） -->
<script lang="ts">
  import { Table, Text } from '@chenzy-design/svelte';

  type Row = {
    key: string;
    name: string;
    size: number;
    owner: string;
    [k: string]: unknown;
  };

  const columns = [
    { dataIndex: 'name', title: '标题', width: 240 },
    { dataIndex: 'size', title: '大小', align: 'right' as const },
    { dataIndex: 'owner', title: '所有者' },
  ];

  const data: Row[] = [
    { key: '1', name: 'Semi Design 设计稿1.fig', size: 128, owner: '姜鹏志' },
    { key: '2', name: 'Semi D2C 设计稿2.fig', size: 64, owner: '郝宣' },
    { key: '3', name: 'Semi Design 设计稿3.fig', size: 199, owner: '姜鹏志' },
    { key: '4', name: 'Semi D2C 设计稿4.fig', size: 32, owner: '郝宣' },
    { key: '5', name: 'Semi Design 设计稿5.fig', size: 88, owner: '姜鹏志' },
  ];

  let lastClicked = $state<string>('（未点击）');

  // 每行统一加 className；仅第 3 行（index === 2）附带 onClick
  const onRow = (record: Row, index: number) => {
    if (index === 2) {
      return {
        className: 'my-tr-class',
        onClick: () => (lastClicked = `${record.name}（第 ${index + 1} 行）`),
        style: 'cursor:pointer',
      };
    }
    return { className: 'my-tr-class' };
  };
</script>

<Table {columns} dataSource={data} rowKey="key" bordered {onRow} />
<Text type="tertiary">最近点击（仅第 3 行可点）：{lastClicked}</Text>
