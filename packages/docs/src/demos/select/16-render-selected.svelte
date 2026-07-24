<script lang="ts">
  import { Select, Avatar } from '@chenzy-design/svelte';

  const list = [
    {
      value: '夏可漫',
      label: '夏可漫',
      email: 'xiakeman@example.com',
      avatar:
        'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/dy.png',
    },
    {
      value: '申悦',
      label: '申悦',
      email: 'shenyue@example.com',
      avatar:
        'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/bag.jpeg',
    },
    {
      value: '曲晨一',
      label: '曲晨一',
      email: 'quchenyi@example.com',
      avatar:
        'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/Viamaker.png',
    },
  ];
</script>

<Select placeholder="请选择" style="width: 280px" defaultValue="申悦" optionList={list}>
  {#snippet renderSelectedItem({ option })}
    {@const item = option as (typeof list)[number]}
    <div style="display: flex; align-items: center">
      <Avatar src={item.avatar} size="small" />
      <span style="margin-left: 8px">{item.email}</span>
    </div>
  {/snippet}
</Select>
