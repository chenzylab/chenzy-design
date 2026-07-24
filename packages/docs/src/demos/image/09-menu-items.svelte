<script lang="ts">
  import { Image, ImagePreview, Divider, Tooltip } from '@chenzy-design/svelte';
  import { IconInfoCircle } from '@chenzy-design/icons';

  const srcList = [
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/abstract.jpg',
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/sky.jpg',
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/greenleaf.jpg',
  ];
</script>

<ImagePreview>
  {#snippet renderPreviewMenu(props)}
    {@const items = props.menuItems ?? []}
    <div
      style="display: flex; background-color: rgba(0, 0, 0, 0.75); align-items: center; padding: 5px 16px; border-radius: 4px;"
    >
      {#each items.slice(0, 3) as item (item)}{@render item()}{/each}
      <Divider layout="vertical" />
      {#each items.slice(3, 7) as item (item)}{@render item()}{/each}
      <Divider layout="vertical" />
      {#each items.slice(7) as item (item)}{@render item()}{/each}
      <Divider layout="vertical" />
      <Tooltip content="我是一个自定义操作">
        <IconInfoCircle size="large" />
      </Tooltip>
    </div>
  {/snippet}
  {#each srcList as src, index (src)}
    <Image {src} width={200} alt={`lamp${index + 1}`} />
  {/each}
</ImagePreview>
