<!-- 受控的动态表格：运行时增删数据行，dataSource 响应式驱动重渲染（对齐 Semi 动态表格） -->
<script lang="ts">
  import { Table, Button, Space } from '@chenzy-design/svelte';

  type Row = { key: number; name: string; age: number; city: string; [k: string]: unknown };

  const columns = [
    { dataIndex: 'name', title: '姓名' },
    { dataIndex: 'age', title: '年龄', sorter: true, align: 'right' as const },
    { dataIndex: 'city', title: '城市' },
  ];

  const cities = ['杭州', '上海', '北京', '深圳', '广州'];
  let seq = $state(3);
  let data = $state<Row[]>([
    { key: 1, name: '陈一', age: 32, city: '杭州' },
    { key: 2, name: '林二', age: 28, city: '上海' },
    { key: 3, name: '王三', age: 45, city: '北京' },
  ]);

  function addRow() {
    seq += 1;
    data = [...data, { key: seq, name: `新用户 ${seq}`, age: 20 + (seq % 30), city: cities[seq % cities.length] }];
  }
  function removeLast() {
    data = data.slice(0, -1);
  }
</script>

<Space>
  <Button onclick={addRow}>新增一行</Button>
  <Button type="danger" onclick={removeLast} disabled={data.length === 0}>删除末行</Button>
</Space>
<Table {columns} dataSource={data} rowKey="key" pagination={false} />
