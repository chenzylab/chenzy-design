<!--
  MdImage — MarkdownRender 默认 img 覆盖（严格对齐 Semi markdownRender components/img.tsx）。
  Semi：<div class="semi-markdownRender-component-image">
          <Image fallback={<IconUploadError/>} width="100%" {...omit(props,'children')} />
          <div class="semi-markdownRender-component-image-alt">{alt}</div>
        </div>
-->
<script lang="ts">
  import Image from '../../image/Image.svelte';
  import { IconUploadError } from '@chenzy-design/icons';

  interface Props {
    src?: string;
    alt?: string;
    [key: string]: unknown;
  }

  let { src = '', alt = '' }: Props = $props();
</script>

{#snippet errorFallback()}
  <IconUploadError />
{/snippet}

<div class="cd-markdown-render-component-image">
  <Image {src} {alt} width="100%" fallback={errorFallback} />
  <div class="cd-markdown-render-component-image-alt">{alt}</div>
</div>
