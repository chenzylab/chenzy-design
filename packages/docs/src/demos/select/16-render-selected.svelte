<script lang="ts">
  import { Select, Avatar, Tag } from '@chenzy-design/svelte';

  const list = [
    {
      name: '夏可漫',
      email: 'xiakeman@example.com',
      avatar:
        'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/dy.png',
    },
    {
      name: '申悦',
      email: 'shenyue@example.com',
      avatar:
        'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/bag.jpeg',
    },
    {
      name: '曲晨一',
      email: 'quchenyi@example.com',
      avatar:
        'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/Viamaker.png',
    },
    {
      name: '文嘉茂',
      email: 'wenjiamao@example.com',
      avatar:
        'https://sf6-cdn-tos.douyinstatic.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/6fbafc2d-e3e6-4cff-a1e2-17709c680624.png',
    },
  ];

  const optionStyle = 'display: flex; padding-left: 24px; padding-top: 10px; padding-bottom: 10px;';
</script>

{#snippet optionContent(item: (typeof list)[number])}
  <Avatar size="small" src={item.avatar} />
  <div style="margin-left: 8px">
    <div style="font-size: 14px">{item.name}</div>
    <div style="color: var(--cd-color-text-2); font-size: 12px; line-height: 16px; font-weight: normal">
      {item.email}
    </div>
  </div>
{/snippet}

<Select
  placeholder="请选择"
  style="width: 280px; height: 40px"
  defaultValue="申悦"
  onChange={(v) => console.log(v)}
>
  {#snippet renderSelectedTag({ option })}
    <div style="display: flex; align-items: center">
      <Avatar src={option.avatar as string} size="small">{option.abbr as string}</Avatar>
      <span style="margin-left: 8px">{option.email}</span>
    </div>
  {/snippet}
  {#each list as item (item.email)}
    <Select.Option value={item.name} label={item.name} style={optionStyle} showTick {...item}>
      {@render optionContent(item)}
    </Select.Option>
  {/each}
</Select>
<br />
<br />
<Select
  placeholder="请选择"
  maxTagCount={2}
  style="width: 280px"
  defaultValue={['申悦', '曲晨一']}
  multiple
  onChange={(v) => console.log(v)}
>
  {#snippet renderSelectedItem({ option, onClose })}
    <Tag
      avatarSrc={option.avatar as string}
      avatarShape="circle"
      closable
      onClose={(_c, e) => onClose(e)}
      size="large"
    >
      {option.label}
    </Tag>
  {/snippet}
  {#each list as item (item.email)}
    <Select.Option value={item.name} label={item.name} style={optionStyle} showTick {...item}>
      {@render optionContent(item)}
    </Select.Option>
  {/each}
</Select>
<br />
<br />
<Select
  placeholder="请选择"
  maxTagCount={2}
  style="width: 280px"
  defaultValue={['申悦', '曲晨一']}
  multiple
  onChange={(v) => console.log(v)}
>
  {#snippet renderSelectedItem({ option, onClose })}
    <Tag
      avatarSrc={option.avatar as string}
      avatarShape="square"
      closable
      onClose={(_c, e) => onClose(e)}
      size="large"
    >
      {option.label}
    </Tag>
  {/snippet}
  {#each list as item (item.email)}
    <Select.Option value={item.name} label={item.name} style={optionStyle} showTick {...item}>
      {@render optionContent(item)}
    </Select.Option>
  {/each}
</Select>
