<!--
  ImageAttachment — 图片类附件缩略图（严格对齐 Semi chat/attachment.tsx 的 ImageAttachment）。
  固定 60x60，复用本库 Image 组件（对齐 Semi 复用 Image）。
  同时被 InputBox 已选附件预览与 ChatBoxContent 消息正文附件复用。
-->
<script lang="ts">
  import Image from '../image/Image.svelte';

  interface Props {
    src: string;
  }

  let { src }: Props = $props();
</script>

<Image class="cd-chat-attachment-img" width={60} height={60} {src} />

<style>
  :global(.cd-chat-attachment-img) {
    border-radius: var(--cd-chat-attachment-img-radius);
    vertical-align: top;
  }
  :global(.cd-chat-attachment-img img) {
    object-fit: cover;
  }
</style>
