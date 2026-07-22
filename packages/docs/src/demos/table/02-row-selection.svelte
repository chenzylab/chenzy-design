<script lang="ts">
  import { Table, Avatar, Tag } from '@chenzy-design/svelte';
  import { IconMore, IconTickCircle, IconComment, IconClear } from '@chenzy-design/icons';

  type Row = {
    key: string;
    name: string;
    nameIconSrc: string;
    size: string;
    owner: string;
    status: string;
    updateTime: string;
    avatarBg: string;
    [k: string]: unknown;
  };

  let selectedKeys = $state<(string | number)[]>([]);

  const tagConfig: Record<string, { color: string; icon: 'tick' | 'clear' | 'comment'; text: string }> = {
    success: { color: 'green', icon: 'tick', text: '已交付' },
    pending: { color: 'pink', icon: 'clear', text: '已延期' },
    wait: { color: 'cyan', icon: 'comment', text: '待评审' },
  };

  const columns  = [
    { title: '标题', dataIndex: 'name', width: 400, render: renderName },
    { title: '大小', dataIndex: 'size' },
    { title: '交付状态', dataIndex: 'status', render: renderStatus },
    { title: '所有者', dataIndex: 'owner', render: renderOwner },
    { title: '更新日期', dataIndex: 'updateTime' },
    { title: '', dataIndex: 'operate', render: renderOperate },
  ];

  const figmaIconUrl =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/figma-icon.png';
  const docsIconUrl =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/docs-icon.png';

  const data: Row[] = [
    { key: '1', name: 'Semi Design 设计稿.fig', nameIconSrc: figmaIconUrl, size: '2M', owner: '姜鹏志', status: 'success', updateTime: '2020-02-02 05:13', avatarBg: 'grey' },
    { key: '2', name: 'Semi Design 分享演示文稿', nameIconSrc: docsIconUrl, size: '2M', owner: '郝宣', status: 'pending', updateTime: '2020-01-17 05:31', avatarBg: 'red' },
    { key: '3', name: '设计文档', nameIconSrc: docsIconUrl, size: '34KB', status: 'wait', owner: 'Zoey Edwards', updateTime: '2020-01-26 11:01', avatarBg: 'light-blue' },
    { key: '4', name: 'Semi D2C 设计稿.fig', nameIconSrc: figmaIconUrl, size: '2M', owner: '姜鹏志', status: 'wait', updateTime: '2020-02-02 05:13', avatarBg: 'grey' },
    { key: '5', name: 'Semi D2C 分享演示文稿', nameIconSrc: docsIconUrl, size: '2M', owner: '郝宣', status: 'pending', updateTime: '2020-01-17 05:31', avatarBg: 'red' },
    { key: '6', name: 'Semi D2C 设计文档', nameIconSrc: docsIconUrl, size: '34KB', status: 'success', owner: 'Zoey Edwards', updateTime: '2020-01-26 11:01', avatarBg: 'light-blue' },
  ];

  const rowSelection = {
    getCheckboxProps: (record: Row) => ({
      disabled: record.name === '设计文档', // Column configuration not to be checked
    }),
    onSelect: (record: Row, selected: boolean) => {
      console.log(`select row: ${selected}`, record);
    },
    onSelectAll: (selected: boolean, selectedRows: Row[]) => {
      console.log(`select all rows: ${selected}`, selectedRows);
    },
    onChange: (keys: (string | number)[], selectedRows: Row[]) => {
      console.log(`selectedRowKeys: ${keys}`, 'selectedRows: ', selectedRows);
      selectedKeys = keys;
    },
  };

  const pagination = { pageSize: 3 };
</script>

{#snippet renderName({ value, record }: { value: unknown; record: Row })}
  <div>
    <Avatar size="small" shape="square" src={record.nameIconSrc} style="margin-right: 12px" />
    {value}
  </div>
{/snippet}

{#snippet renderStatus({ value }: { value: unknown })}
  {@const cfg = tagConfig[value as string]}
  <Tag shape="circle" color={cfg.color as never} prefixIcon={statusIcon} style="user-select: text">
    {cfg.text}
  </Tag>
  {#snippet statusIcon()}
    {#if cfg.icon === 'tick'}<IconTickCircle />{:else if cfg.icon === 'clear'}<IconClear />{:else}<IconComment />{/if}
  {/snippet}
{/snippet}

{#snippet renderOwner({ value, record }: { value: unknown; record: Row })}
  <div>
    <Avatar size="small" color={record.avatarBg as never} style="margin-right: 4px">
      {typeof value === 'string' ? value.slice(0, 1) : ''}
    </Avatar>
    {value}
  </div>
{/snippet}

{#snippet renderOperate()}
  <IconMore />
{/snippet}

<Table {columns} dataSource={data} {rowSelection} {pagination} />
