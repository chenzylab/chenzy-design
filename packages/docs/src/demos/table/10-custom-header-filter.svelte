<script lang="ts">
  import { Table, Avatar, Input, Space, Tag } from '@chenzy-design/svelte';
  import { IconTickCircle, IconComment, IconClear } from '@chenzy-design/icons';
  import { figmaIconUrl, DAY, formatDate, statusTagConfig, type FileRow } from './_data';

  let filteredValue = $state<(string | number)[]>([]);

  // columns 依赖受控 filteredValue，用 $derived 使其响应式更新（对齐 Semi 受控筛选）。
  const columns = $derived([
    {
      // title 支持 Snippet：在表头内嵌筛选输入框，配合 filteredValue 受控筛选（对齐 Semi）
      title: titleWithInput,
      dataIndex: 'name',
      width: 400,
      render: renderName,
      onFilter: (value: string | number, record: FileRow) =>
        (record.name as string).includes(value as string),
      filteredValue,
    },
    { title: '大小', dataIndex: 'size', sorter: (a: FileRow, b: FileRow) => ((a.size as number) - (b.size as number) > 0 ? 1 : -1), render: renderSize },
    { title: '交付状态', dataIndex: 'status', render: renderStatus },
    { title: '所有者', dataIndex: 'owner', render: renderOwner },
    { title: '更新日期', dataIndex: 'updateTime', sorter: (a: FileRow, b: FileRow) => ((a.updateTime as number) - (b.updateTime as number) > 0 ? 1 : -1), render: renderDate },
  ]);

  const getData = (): FileRow[] => {
    const rows: FileRow[] = [];
    for (let i = 0; i < 46; i++) {
      const isSemiDesign = i % 2 === 0;
      const randomNumber = (i * 1000) % 199;
      rows.push({
        key: '' + i,
        name: isSemiDesign ? `Semi Design 设计稿${i}.fig` : `Semi D2C 首页${i}.fig`,
        owner: isSemiDesign ? '姜鹏志' : '郝宣',
        size: randomNumber,
        status: isSemiDesign ? 'success' : 'wait',
        updateTime: new Date('2024-01-25').valueOf() + randomNumber * DAY,
        avatarBg: isSemiDesign ? 'grey' : 'red',
      });
    }
    return rows;
  };
  const data = getData();

  const handleChange = (v: string) => {
    filteredValue = v ? [v] : [];
  };
</script>

{#snippet titleWithInput()}
  <Space>
    <span>标题</span>
    <!-- composition：IME 拼音组合期间不触发 onChange，确认后补触发一次（对齐 Semi 手动
         compositionRef + onCompositionStart/End 的输入法处理，本库内置为 composition prop）。 -->
    <Input
      placeholder="请输入筛选值"
      style="width: 200px"
      composition
      showClear
      onChange={handleChange}
    />
  </Space>
{/snippet}

{#snippet renderSize({ value }: { value: unknown })}{value} KB{/snippet}
{#snippet renderDate({ value }: { value: unknown })}{formatDate(value)}{/snippet}

{#snippet renderName({ value }: { value: unknown })}
  <div><Avatar size="small" shape="square" src={figmaIconUrl} style="margin-right: 12px" />{value}</div>
{/snippet}

{#snippet renderStatus({ value }: { value: unknown })}
  {@const cfg = statusTagConfig[value as string] ?? {}}
  {#if cfg.text}
    <Tag shape="circle" color={cfg.color as never} prefixIcon={statusIcon} style="user-select: text">{cfg.text}</Tag>
  {/if}
  {#snippet statusIcon()}
    {#if cfg.icon === 'tick'}<IconTickCircle />{:else if cfg.icon === 'clear'}<IconClear />{:else}<IconComment />{/if}
  {/snippet}
{/snippet}

{#snippet renderOwner({ value, record }: { value: unknown; record: FileRow })}
  <div>
    <Avatar size="small" color={record.avatarBg as never} style="margin-right: 4px">
      {typeof value === 'string' ? value.slice(0, 1) : ''}
    </Avatar>{value}
  </div>
{/snippet}

<Table {columns} dataSource={data} />
