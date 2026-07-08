<!--
  SideBarImageUploadNode — tiptap imageUpload 自定义节点的 Svelte NodeView（P5）。
  对齐 Semi imageSlot.js 的 ImageUploadNodeComponent（React → Svelte 适配）：
  用 svelte-tiptap NodeViewWrapper 承载本库 Upload（draggable），选文件成功后把
  imageUpload 空节点替换为真正的 image 节点（src 来自 getUploadImageSrc / responseBody）。
  props 由 SvelteNodeViewRenderer 注入（NodeViewProps：node/editor/getPos/extension）。
  locale 走 useLocale（拖拽区主文案随上传态变化，对齐 Semi getDragMainText）。
  §9.3：状态只在事件回调里写普通 $state，render 期不读 effect 写入值，无自循环。
-->
<script lang="ts">
  import type { NodeViewProps } from '@tiptap/core';
  import { NodeViewWrapper } from 'svelte-tiptap';
  import { Upload } from '../upload/index.js';
  import type { UploadFileItem } from '../upload/index.js';
  import { useLocale } from '../locale-provider/index.js';

  let { node, editor, getPos, extension }: NodeViewProps = $props();

  const loc = useLocale();

  // 当前上传态（驱动拖拽区主文案），仅事件回调写入。
  let status = $state<string | undefined>(undefined);

  // 扩展 options 里除内部钩子外的 UploadProps 透传给 Upload。
  const options = $derived(extension.options as Record<string, unknown>);

  function dragMainText(): string {
    // Upload 文件项失败态（对齐 Semi 枚举）：网络失败 uploadFail / 校验失败 validateFail 均显示失败文案。
    if (status === 'uploadFail' || status === 'validateFail') return loc().t('SideBar.uploadFail');
    return loc().t('SideBar.uploadImage');
  }

  function handleChange(list: UploadFileItem[]): void {
    const file = list[0];
    if (file) status = file.status;
    (options.onChange as ((list: UploadFileItem[]) => void) | undefined)?.(list);
  }

  function handleSuccess(response: string, item: UploadFileItem): void {
    (options.onSuccess as ((r: string, i: UploadFileItem) => void) | undefined)?.(response, item);

    const getUploadImageSrc = options.getUploadImageSrc as
      | ((src: string) => string)
      | undefined;
    let src = item.url ?? '';
    if (getUploadImageSrc) {
      src = getUploadImageSrc(response || src);
    } else if (response) {
      // 服务端返回纯字符串 URL 或 { src } JSON。
      try {
        const parsed = JSON.parse(response) as { src?: string };
        src = parsed?.src ?? response;
      } catch {
        src = response;
      }
    }

    const imageNode = {
      type: (options.type as string) ?? 'image',
      attrs: { src, alt: item.name, title: item.name },
    };
    const pos = getPos();
    if (pos == null) return;
    editor
      .chain()
      .focus()
      .deleteRange({ from: pos, to: pos + node.nodeSize })
      .insertContentAt(pos, imageNode)
      .run();
  }

  // 透传给 Upload 的 props：剔除本节点内部钩子/字段。
  const uploadProps = $derived.by(() => {
    const {
      onChange: _oc,
      onSuccess: _os,
      getUploadImageSrc: _g,
      type: _t,
      HTMLAttributes: _h,
      ...rest
    } = options;
    return rest as Record<string, unknown>;
  });
</script>

<NodeViewWrapper class="cd-sidebar-file-image-slot" data-status={status}>
  <Upload
    {...uploadProps}
    listType="image"
    drag
    dragMainText={dragMainText()}
    onChange={handleChange}
    onSuccess={handleSuccess}
  />
</NodeViewWrapper>

<style>
  /* NodeViewWrapper 的 class 运行时注入，用 :global 命中避免 unused-selector。 */
  :global(.cd-sidebar-file-image-slot) {
    display: block;
    margin: var(--cd-sidebar-file-image-slot-margin);
  }
</style>
