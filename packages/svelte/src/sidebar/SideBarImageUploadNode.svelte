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
    // 三态分派严格对齐 Semi `getDragMainText`（widget/imageSlot.tsx）：校验失败与上传失败
    // 是**两条不同文案**——前者要用户换一张合法的（「验证失败，请重新上传」），后者是网络问题
    // 让用户重试（「上传失败，请重试」）。本库原先两态合并成一条 uploadFail，
    // 会把被校验拒绝的图片误导成「重试上传」。
    if (status === 'validateFail') return loc().t('SideBar.validateFailInfo');
    if (status === 'uploadFail') return loc().t('SideBar.uploadFailInfo');
    return loc().t('SideBar.uploadImgInfo');
  }

  function handleChange({ fileList }: { fileList: UploadFileItem[]; currentFile: UploadFileItem }): void {
    const file = fileList[0];
    if (file) status = file.status;
    (options.onChange as ((list: UploadFileItem[]) => void) | undefined)?.(fileList);
  }

  function handleSuccess(response: unknown, item: UploadFileItem): void {
    (options.onSuccess as ((r: unknown, i: UploadFileItem) => void) | undefined)?.(response, item);

    const getUploadImageSrc = options.getUploadImageSrc as
      | ((src: string) => string)
      | undefined;
    let src = item.url ?? '';
    // onSuccess 回传的 responseBody 已按 JSON 解析（失败回退原始文本）。
    const responseStr = typeof response === 'string' ? response : '';
    const responseObj =
      response && typeof response === 'object' ? (response as { src?: string }) : undefined;
    if (getUploadImageSrc) {
      src = getUploadImageSrc(responseObj?.src ?? responseStr ?? src);
    } else if (responseObj?.src) {
      src = responseObj.src;
    } else if (responseStr) {
      src = responseStr;
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

<!-- Semi imageSlot.tsx 没传 listType（走 Upload 默认值 'list'），本库原来多传了
     listType="picture"，与 Semi 实际渲染不符。 -->
<NodeViewWrapper class="cd-sidebar-file-image-slot" data-status={status}>
  <Upload
    {...uploadProps}
    draggable
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
  /* Semi sidebar.scss:531-537：.tiptap-image-slot 的 uploadFail/validateFail/uploading/success
     四态下隐藏 .semi-upload-drag-area（拖拽提示区）——上传完成/失败后不再需要展示拖拽提示。
     本库用 data-status 属性选择器对应这四态（原来完全没有这条隐藏规则）。 */
  :global(.cd-sidebar-file-image-slot[data-status='uploadFail'] .cd-upload-drag-area),
  :global(.cd-sidebar-file-image-slot[data-status='validateFail'] .cd-upload-drag-area),
  :global(.cd-sidebar-file-image-slot[data-status='uploading'] .cd-upload-drag-area),
  :global(.cd-sidebar-file-image-slot[data-status='success'] .cd-upload-drag-area) {
    display: none;
  }
</style>
