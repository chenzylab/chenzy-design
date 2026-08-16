<script lang="ts">
  import { Upload } from '@chenzy-design/svelte';
  import { IconBolt } from '@chenzy-design/icons';

  const demoImageSrc =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="#0066ff" rx="4"/><text x="48" y="54" font-size="16" fill="#fff" text-anchor="middle">IMG</text></svg>',
    );
</script>

<Upload action="https://api.semi.design/upload" draggable dragMainText="点击上传文件或拖拽文件到这里"></Upload>

<Upload
  action="https://api.semi.design/upload"
  draggable
  accept="application/pdf,.jpeg"
  dragMainText="点击上传文件或拖拽文件到这里"
  dragSubText="仅支持jpeg、pdf"
  style="margin-block-start:10px;"
>
  {#snippet dragIcon()}<IconBolt />{/snippet}
</Upload>

<Upload
  action="https://api.semi.design/upload"
  draggable
  accept="application/pdf,.jpeg"
  style="margin-block-start:10px;"
>
  {#snippet dragIcon()}<IconBolt />{/snippet}
  <div class="upload-demo-drag-area">
    <img src={demoImageSrc} height="96" alt="demo img" style="border-radius:4px;" />
    <div class="upload-demo-drag-area-text">Wow, you can really dance.</div>
  </div>
</Upload>

<style>
  .upload-demo-drag-area {
    border-radius: var(--cd-radius-small);
    border: 2px dashed var(--cd-color-border);
    width: 100%;
    padding: 12px;
    background-color: var(--cd-color-tertiary-light-default);
    display: flex;
    cursor: pointer;
    flex-wrap: wrap;
    justify-content: center;
  }
  .upload-demo-drag-area:hover {
    background-color: var(--cd-color-primary-light-default);
    border-color: var(--cd-color-primary);
  }
  .upload-demo-drag-area-text {
    font-size: 14px;
    margin-block-start: 8px;
    flex-basis: 100%;
    text-align: center;
    color: var(--cd-color-tertiary);
  }
</style>
