<script lang="ts">
  import { Table, Button } from '@chenzy-design/svelte';
  import { IconArrowUp, IconArrowDown } from '@chenzy-design/icons';

  interface Row {
    key: number;
    dataKey: string;
    name: string;
    type: string;
    description: string;
    default: string;
    children?: Row[];
    [k: string]: unknown;
  }

  const raw: Row[] = [
    {
      key: 1,
      dataKey: 'videos_info',
      name: '视频信息',
      type: 'Object 对象',
      description: '视频的元信息',
      default: '无',
      children: [
        {
          key: 11,
          dataKey: 'status',
          name: '视频状态',
          type: 'Enum <Integer> 枚举',
          description: '视频的可见、推荐状态',
          default: '1',
        },
        {
          key: 12,
          dataKey: 'vid',
          name: '视频 ID',
          type: 'String 字符串',
          description: '标识视频的唯一 ID',
          default: '无',
          children: [
            {
              key: 121,
              dataKey: 'video_url',
              name: '视频地址',
              type: 'String 字符串',
              description: '视频的唯一链接',
              default: '无',
            },
          ],
        },
      ],
    },
    {
      key: 2,
      dataKey: 'text_info',
      name: '文本信息',
      type: 'Object 对象',
      description: '视频的元信息',
      default: '无',
      children: [
        {
          key: 21,
          dataKey: 'title',
          name: '视频标题',
          type: 'String 字符串',
          description: '视频的标题',
          default: '无',
        },
        {
          key: 22,
          dataKey: 'video_description',
          name: '视频描述',
          type: 'String 字符串',
          description: '视频的描述',
          default: '无',
        },
      ],
    },
  ];

  const rowKey = 'key' as const;
  const childrenRecordName = 'children' as const;

  let expandedRowKeys = $state<number[]>([1, 2]);
  let data = $state<Row[]>(raw);

  // 严格对齐 Semi 官方「行可交换的树形数据」demo 的辅助函数：
  // findRecordByKey 递归按 key 查行、coverRecord 原地覆盖字段（保持对象引用）、
  // getSameLevelRecords 找到该 key 所在的同级数组（用于算上/下邻居）。
  function findRecordByKey(key: number, records: Row[]): Row | undefined {
    for (const item of records) {
      if (item[rowKey] === key) return item;
      const children = item[childrenRecordName];
      if (Array.isArray(children) && children.length) {
        const found = findRecordByKey(key, children);
        if (found != null) return found;
      }
    }
    return undefined;
  }

  function coverRecord(obj: Row, srcObj: Row): Row {
    const srcKeys = Object.keys(srcObj);
    const copied = { ...srcObj };
    Object.assign(obj, copied);
    (Object.keys(obj) as (keyof Row)[]).forEach((key) => {
      if (!srcKeys.includes(key as string)) delete obj[key];
    });
    return obj;
  }

  function switchRecord(key1: number, key2: number): void {
    const newData = [...data];
    const item1 = findRecordByKey(key1, newData);
    const item2 = findRecordByKey(key2, newData);
    if (item1 == null || item2 == null) return;

    // 先各自拷贝一份，避免覆盖过程中互相污染
    const copiedItem1 = { ...item1 };
    const copiedItem2 = { ...item2 };
    coverRecord(item1, copiedItem2);
    coverRecord(item2, copiedItem1);

    data = newData;
  }

  function getSameLevelRecords(key: number, records: Row[] = []): Row[] {
    if (records.find((item) => item[rowKey] === key)) return records;
    for (const item of records) {
      const found = getSameLevelRecords(key, item[childrenRecordName]);
      if (found.length) return found;
    }
    return [];
  }

  const columns = [
    { title: 'Key', dataIndex: 'dataKey', key: 'dataKey' },
    { title: '名称', dataIndex: 'name', key: 'name', width: 200 },
    { title: '数据类型', dataIndex: 'type', key: 'type' },
    { title: '描述', dataIndex: 'description', key: 'description' },
    { title: '默认值', dataIndex: 'default', key: 'default', width: 100 },
    {
      key: 'operation',
      title: '',
      render: renderOperation,
    },
  ];
</script>

{#snippet renderOperation({ record }: { record: Row })}
  {@const records = getSameLevelRecords(record[rowKey], data)}
  {@const index = records.findIndex((item) => item[rowKey] === record[rowKey])}
  {@const upDisabled = index <= 0}
  {@const downDisabled = index < 0 || index >= records.length - 1}
  <Button
    theme="borderless"
    disabled={upDisabled}
    onclick={() => switchRecord(record[rowKey], (records[index - 1] as Row)[rowKey])}
  >
    {#snippet icon()}<IconArrowUp />{/snippet}
  </Button>
  <Button
    theme="borderless"
    disabled={downDisabled}
    onclick={() => switchRecord(record[rowKey], (records[index + 1] as Row)[rowKey])}
  >
    {#snippet icon()}<IconArrowDown />{/snippet}
  </Button>
{/snippet}

<Table
  {columns}
  dataSource={data}
  {rowKey}
  tree
  {childrenRecordName}
  {expandedRowKeys}
  onExpandedRowsChange={(rows) => (expandedRowKeys = rows.map((item) => item[rowKey]))}
  pagination={false}
/>
