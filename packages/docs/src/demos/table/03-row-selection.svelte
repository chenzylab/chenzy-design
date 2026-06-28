<script lang="ts">
  import { Table, Text } from '@chenzy-design/svelte';

  type Row = {
    key: number;
    name: string;
    role: string;
    locked: boolean;
    [k: string]: unknown;
  };

  const columns = [
    { dataIndex: 'name', title: '成员' },
    { dataIndex: 'role', title: '角色' },
  ];

  const data: Row[] = [
    { key: 1, name: '陈一', role: '管理员', locked: false },
    { key: 2, name: '林二', role: '编辑', locked: false },
    { key: 3, name: '王三', role: '所有者', locked: true },
    { key: 4, name: '赵四', role: '访客', locked: false },
  ];

  let selected = $state<(string | number)[]>([2]);
</script>

<Table
  {columns}
  dataSource={data}
  rowKey="key"
  bordered
  rowSelection={{
    selectedRowKeys: selected,
    onChange: (keys) => (selected = keys),
    getCheckboxProps: (record) => ({ disabled: record.locked }),
  }}
/>
<Text type="tertiary">已选 {selected.length} 名成员（所有者不可取消）</Text>
