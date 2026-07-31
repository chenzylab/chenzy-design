<script lang="ts">
  // 严格对齐 Semi「消息发送」demo：defaultContent + 两条 defaultFileList 附件
  // （一条 success、一条 percent=50 演示上传中的环形进度）+ 一条长文本引用；
  // 发送后 toggle generating 并清空引用（引用需用户自行清除，附件与输入区由组件清）。
  //
  // 有意的偏离：Semi 原 demo 的 onContentChange / onUploadChange 只 console.log，
  // 文档站看不到 console，这里改为就地文字反馈——演示等价且真机可断言
  // （同 demo-no-alert-blocks-automation）。
  import { AIChatInput } from '@chenzy-design/svelte';
  import type {
    AIChatInputAttachment,
    AIChatInputMessageContent,
    AIChatInputReference,
  } from '@chenzy-design/svelte';

  const uploadProps = {
    action: 'https://api.semi.design/upload',
    defaultFileList: [
      {
        uid: '1',
        name: 'dy.jpeg',
        status: 'success',
        size: '130kb',
        url: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/dy.png',
      },
      {
        uid: '5',
        name: 'resso.jpeg',
        percent: 50,
        size: '222kb',
        url: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/Resso.png',
      },
    ],
  };

  let references = $state<AIChatInputReference[]>([
    {
      id: '1',
      type: 'text',
      content:
        '测试文本，这里是一段很长的文字，这里是一段很长的文字，这里是一段很长的文字，这里是一段很长的文字，这里是一段很长的文字,这里是一段很长的文字，这里是一段很长的文字，这里是一段很长的文字，这里是一段很长的文字，这里是一段很长的文字',
    },
  ]);

  let generating = $state(false);
  let contentLog = $state('（尚未输入）');
  let uploadLog = $state('（初始两条）');

  function toggleGenerate(): void {
    generating = !generating;
  }

  function onMessageSend(_content: AIChatInputMessageContent): void {
    toggleGenerate();
    references = [];
  }

  function handleReferenceDelete(item: AIChatInputReference): void {
    references = references.filter((ref) => ref.id !== item.id);
  }

  function onContentChange(payload: { text: string }): void {
    contentLog = payload.text.trim() || '（空）';
  }

  function onUploadChange(fileList: AIChatInputAttachment[]): void {
    uploadLog = fileList.length ? fileList.map((a) => a.name).join('、') : '（已清空）';
  }
</script>

<div style="margin: 12px;">
  <AIChatInput
    defaultContent="点击发送按钮，观察上传内容、引用内容、输入框内容变化"
    {generating}
    {uploadProps}
    {onContentChange}
    {onUploadChange}
    {onMessageSend}
    onStopGenerate={toggleGenerate}
    onReferenceDelete={handleReferenceDelete}
    {references}
  />
  <p style="margin-top: 12px; color: var(--cd-color-text-2); font-size: 12px;">
    onContentChange：<span data-testid="content-log">{contentLog}</span>
    <br />
    onUploadChange：<span data-testid="upload-log">{uploadLog}</span>
  </p>
</div>
