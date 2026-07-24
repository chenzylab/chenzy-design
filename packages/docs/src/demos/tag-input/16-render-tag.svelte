<script lang="ts">
  import { TagInput, Avatar } from '@chenzy-design/svelte';
  import { IconClose } from '@chenzy-design/icons';

  const list = [
    { name: '夏可漫', avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/dy.png' },
    { name: '申悦', avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/bag.jpeg' },
    { name: '曲晨一', avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/Viamaker.png' },
  ];
  const mapList = new Map(list.map((item) => [item.name, item]));

  let value = $state<string[]>(['夏可漫']);
</script>

<TagInput {value} onChange={(v) => (value = v)}>
  {#snippet renderTagItem({ value: tagValue, onClose })}
    {@const data = mapList.get(tagValue)}
    <div
      style="background-color: var(--cd-color-info-light-default); padding: 4px 8px; border-radius: 12px; display: flex; align-items: center; font-size: 14px; margin-right: 10px"
    >
      <Avatar
        alt="avatar"
        src={data?.avatar ?? 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/dy.png'}
        size="extra-small"
      />
      <span style="margin-left: 8px">{`${tagValue}@semi.com`}</span>
      <IconClose
        style="padding-left: 4px; color: var(--cd-color-text-3)"
        size="small"
        onclick={onClose}
      />
    </div>
  {/snippet}
</TagInput>
