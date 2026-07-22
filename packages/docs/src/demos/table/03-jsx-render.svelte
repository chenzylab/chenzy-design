<script lang="ts">
  import { Table, Avatar } from '@chenzy-design/svelte';
  import { IconMore } from '@chenzy-design/icons';

  type Row = {
    key: string;
    name: string;
    nameIconSrc: string;
    size: string;
    owner: string;
    updateTime: string;
    avatarBg: string;
    [k: string]: unknown;
  };

  const figmaIconUrl =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/figma-icon.png';
  const docsIconUrl =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/docs-icon.png';

  const data: Row[] = [
    { key: '1', name: 'Semi Design 设计稿.fig', nameIconSrc: figmaIconUrl, size: '2M', owner: '姜鹏志', updateTime: '2020-02-02 05:13', avatarBg: 'grey' },
    { key: '2', name: 'Semi Design 分享演示文稿', nameIconSrc: docsIconUrl, size: '2M', owner: '郝宣', updateTime: '2020-01-17 05:31', avatarBg: 'red' },
    { key: '3', name: '设计文档', nameIconSrc: docsIconUrl, size: '34KB', owner: 'Zoey Edwards', updateTime: '2020-01-26 11:01', avatarBg: 'light-blue' },
  ];

  // 以带 render snippet 的配置式列定义（本库 Svelte 惯例，等价 Semi 的 JSX <Column>）。
  const columns  = [
    { title: '标题', dataIndex: 'name', key: 'name', render: renderName },
    { title: '大小', dataIndex: 'size', key: 'size' },
    { title: '所有者', dataIndex: 'owner', key: 'owner', render: renderOwner },
    { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime' },
    { title: '', dataIndex: 'operate', key: 'operate', render: renderOperate },
  ];
</script>

{#snippet renderName({ value, record }: { value: unknown; record: Row })}
  <div>
    <Avatar size="small" shape="square" src={record.nameIconSrc} style="margin-right: 12px" />
    {value}
  </div>
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

<Table {columns} dataSource={data} pagination={false} />
