<script lang="ts">
  import { Upload, Button } from '@chenzy-design/svelte';
  import { IconUpload } from '@chenzy-design/icons';
  import type { UploadFileItem, UploadPromptPosition } from '@chenzy-design/svelte';

  const positions: UploadPromptPosition[] = ['right', 'left', 'bottom'];

  const picPositions: UploadPromptPosition[] = ['right', 'bottom'];
  const picDefaultList: UploadFileItem[] = [
    { uid: '1', name: 'dy.jpeg', status: 'success', size: '130.0KB', url: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/dy.png' },
    { uid: '5', name: 'resso.jpeg', percent: 50, status: 'uploading', size: '222.0KB', url: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/Resso.png' },
  ];
</script>

{#snippet promptText(pos: UploadPromptPosition, text: string)}
  <div style="display:flex;align-items:center;color:grey;{pos === 'left' ? 'margin-right:10px;' : pos === 'right' ? 'margin-left:10px;' : ''}">
    {text}
  </div>
{/snippet}

{#each positions as pos, index (pos)}
  {#if index}
    <div style="margin-block:12px;border-bottom:1px solid var(--cd-color-border);"></div>
  {/if}
  <Upload action="/api/upload" promptPosition={pos}>
    {#snippet prompt()}{@render promptText(pos, '请上传资格认证材料')}{/snippet}
    <Button theme="light">
      {#snippet icon()}<IconUpload />{/snippet}
      点击上传
    </Button>
  </Upload>
{/each}

<div style="margin-block-start:24px;"></div>

{#each picPositions as pos, index (pos)}
  {#if index}
    <div style="margin-block:12px;border-bottom:1px solid var(--cd-color-border);"></div>
  {/if}
  <Upload listType="picture" action="/api/upload" promptPosition={pos} defaultFileList={picDefaultList}>
    {#snippet prompt()}{@render promptText(pos, '请上传认证材料')}{/snippet}
  </Upload>
{/each}
