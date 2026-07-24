<script lang="ts">
  import { Image, ImagePreview, Button } from '@chenzy-design/svelte';
  import {
    IconChevronLeft,
    IconChevronRight,
    IconMinus,
    IconPlus,
    IconRotate,
    IconDownload,
    IconRealSizeStroked,
    IconWindowAdaptionStroked,
  } from '@chenzy-design/icons';

  const srcList = [
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/abstract.jpg',
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/sky.jpg',
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/greenleaf.jpg',
  ];
</script>

<ImagePreview>
  {#snippet renderPreviewMenu(props)}
    <div
      style="background: grey; height: 40px; width: 280px; display: flex; align-items: center; justify-content: space-around; border-radius: 3px;"
    >
      <Button
        type="tertiary"
        disabled={props.disabledPrev}
        onclick={!props.disabledPrev ? props.onPrev : undefined}
      >
        {#snippet icon()}<IconChevronLeft size="large" />{/snippet}
      </Button>
      <Button
        type="tertiary"
        disabled={props.disabledNext}
        onclick={!props.disabledNext ? props.onNext : undefined}
      >
        {#snippet icon()}<IconChevronRight size="large" />{/snippet}
      </Button>
      <Button
        type="tertiary"
        disabled={props.disabledZoomOut}
        onclick={!props.disabledZoomOut ? props.onZoomOut : undefined}
      >
        {#snippet icon()}<IconMinus size="large" />{/snippet}
      </Button>
      <Button
        type="tertiary"
        disabled={props.disabledZoomIn}
        onclick={!props.disabledZoomIn ? props.onZoomIn : undefined}
      >
        {#snippet icon()}<IconPlus size="large" />{/snippet}
      </Button>
      <Button type="tertiary" onclick={props.onRatioClick}>
        {#snippet icon()}
          {#if props.ratio === 'adaptation'}
            <IconRealSizeStroked size="large" />
          {:else}
            <IconWindowAdaptionStroked size="large" />
          {/if}
        {/snippet}
      </Button>
      <Button type="tertiary" onclick={props.onRotateLeft}>
        {#snippet icon()}<IconRotate size="large" />{/snippet}
      </Button>
      <Button
        type="tertiary"
        disabled={props.disableDownload}
        onclick={!props.disableDownload ? props.onDownload : undefined}
      >
        {#snippet icon()}<IconDownload size="large" />{/snippet}
      </Button>
    </div>
  {/snippet}
  {#each srcList as src, index (src)}
    <Image {src} width={200} alt={`lamp${index + 1}`} style="margin-right: 5px;" />
  {/each}
</ImagePreview>
