<script lang="ts">
  import { Table, Avatar, Button, Empty, Text, Tag, IllustrationNoResult, IllustrationNoResultDark } from '@chenzy-design/svelte';
  import { IconTickCircle, IconComment, IconClear, IconDelete } from '@chenzy-design/icons';
  import { figmaIconUrl, docsIconUrl, statusTagConfig, type FileRow } from './_data';

  const raw: FileRow[] = [
    { key: '1', name: 'Semi Design 设计稿标题可能有点长这时候应该显示 Tooltip.fig', nameIconSrc: figmaIconUrl, size: '2M', owner: '姜鹏志', status: 'success', updateTime: '2020-02-02 05:13', avatarBg: 'grey' },
    { key: '2', name: 'Semi Design 分享演示文稿', nameIconSrc: docsIconUrl, size: '2M', owner: '郝宣', status: 'pending', updateTime: '2020-01-17 05:31', avatarBg: 'red' },
    { key: '3', name: '设计文档', nameIconSrc: docsIconUrl, size: '34KB', status: 'wait', owner: 'Zoey Edwards', updateTime: '2020-01-26 11:01', avatarBg: 'light-blue' },
    { key: '4', name: 'Semi D2C 设计文档可能也有点长所以也会显示 Tooltip', nameIconSrc: docsIconUrl, size: '34KB', status: 'success', owner: '姜琪', updateTime: '2020-01-26 11:01', avatarBg: 'green' },
  ];

  let dataSource = $state<FileRow[]>([...raw]);

  const removeRecord = (key: string) => {
    dataSource = dataSource.filter((d) => d.key !== key);
  };
  const resetData = () => {
    dataSource = [...raw];
  };

  const columns = [
    { title: '标题', dataIndex: 'name', width: 400, render: renderName },
    { title: '大小', dataIndex: 'size', width: 150 },
    { title: '交付状态', dataIndex: 'status', render: renderStatus },
    { title: '所有者', dataIndex: 'owner', width: 300, render: renderOwner },
    { title: '更新日期', dataIndex: 'updateTime', width: 200 },
    { title: '', dataIndex: 'operate', render: renderOperate },
  ];
</script>

{#snippet renderName({ value, record }: { value: unknown; record: FileRow })}
  <span style="display: flex; align-items: center">
    <Avatar size="small" shape="square" src={record.nameIconSrc} style="margin-right: 12px" />
    <Text ellipsis={{ showTooltip: true }} style="width: calc(400px - 76px)">{value}</Text>
  </span>
{/snippet}

{#snippet renderStatus({ value }: { value: unknown })}
  {@const cfg = statusTagConfig[value as string] ?? {}}
  {#if cfg.text}
    <Tag shape="circle" color={cfg.color as never} prefixIcon={statusIcon} style="user-select: text">
      {cfg.text}
    </Tag>
  {/if}
  {#snippet statusIcon()}
    {#if cfg.icon === 'tick'}<IconTickCircle />{:else if cfg.icon === 'clear'}<IconClear />{:else}<IconComment />{/if}
  {/snippet}
{/snippet}

{#snippet renderOwner({ value, record }: { value: unknown; record: FileRow })}
  <div>
    <Avatar size="small" color={record.avatarBg as never} style="margin-right: 4px">
      {typeof value === 'string' ? value.slice(0, 1) : ''}
    </Avatar>
    {value}
  </div>
{/snippet}

{#snippet renderOperate({ record }: { record: FileRow })}
  <Button theme="borderless" onclick={() => removeRecord(record.key)}>
    {#snippet icon()}<IconDelete />{/snippet}
  </Button>
{/snippet}

{#snippet emptyContent()}
  <Empty imageSlot={noResult} darkModeImageSlot={noResultDark} description="搜索无结果" />
  {#snippet noResult()}<IllustrationNoResult />{/snippet}
  {#snippet noResultDark()}<IllustrationNoResultDark />{/snippet}
{/snippet}

<Button onclick={resetData} style="margin-bottom: 10px">重置</Button>
<Table
  style="min-height: 350px"
  {columns}
  {dataSource}
  pagination={false}
  emptySnippet={emptyContent}
/>
