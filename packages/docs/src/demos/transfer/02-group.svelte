<script lang="ts">
  import { Transfer } from '@chenzy-design/svelte';

  // 分组：本库分组结构为 { title, items }（对齐 Semi type='groupList'；
  // 字段名 items 为本库既定命名，Semi 用 children）。
  const dataWithGroup = [
    {
      title: '类别A',
      items: [
        { label: 'A-1', value: 1, disabled: false, key: 1 },
        { label: 'A-2', value: 2, disabled: false, key: 2 },
        { label: 'A-3', value: 3, disabled: false, key: 3 },
      ],
    },
    {
      title: '类别B',
      items: [
        { label: 'B-1', value: 4, disabled: false, key: 4 },
        { label: 'B-2', value: 5, disabled: false, key: 5 },
        { label: 'B-3（disabled）', value: 6, disabled: true, key: 6 },
      ],
    },
    {
      title: '类别C',
      items: [
        { label: 'C-1', value: 7, disabled: false, key: 7 },
        { label: 'C-2', value: 8, disabled: false, key: 8 },
        { label: 'C-3', value: 9, disabled: false, key: 9 },
        { label: 'C-4', value: 10, disabled: false, key: 10 },
        { label: 'C-5', value: 11, disabled: false, key: 11 },
        { label: 'C-6', value: 12, disabled: false, key: 12 },
        { label: 'C-7', value: 13, disabled: false, key: 13 },
      ],
    },
  ];
</script>

<Transfer
  type="groupList"
  defaultValue={[6]}
  style="width: 568px"
  dataSource={dataWithGroup}
  onChange={(values, items) => console.log(values, items)}
/>
