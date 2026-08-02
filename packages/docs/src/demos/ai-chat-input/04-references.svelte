<script lang="ts">
  // 严格对齐 Semi「引用」demo：6 条引用逐一覆盖各类图标推导路径。
  //
  // 注意第 2–6 条**都不带 type 字段**——这正是 Semi 的写法：类型由
  // getContentType(getAttachmentType(item)) 从 name 后缀推导（docx→word、pdf→pdf、
  // mp4→video、json→code），Image.jpeg 命中图片白名单故渲染缩略图。
  //
  // 有意的偏离：Semi 的 onReferenceClick 只 console.log，文档站看不到 console，
  // 这里改为就地文字反馈（同 demo-no-alert-blocks-automation）。
  import { AIChatInput } from '@chenzy-design/svelte';
  import type { AIChatInputReference } from '@chenzy-design/svelte';

  const uploadProps = { action: 'https://api.semi.design/upload' };

  const referenceTemp: AIChatInputReference[] = [
    {
      id: '1',
      type: 'text',
      content:
        '测试文本，这里是一段很长的文字，这里是一段很长的文字，这里是一段很长的文字，这里是一段很长的文字，这里是一段很长的文字,这里是一段很长的文字，这里是一段很长的文字，这里是一段很长的文字，这里是一段很长的文字，这里是一段很长的文字',
    },
    { id: '2', name: '飞书文档.docx' },
    { id: '3', name: '飞书文档.pdf' },
    { id: '4', name: 'Music.mp4' },
    {
      id: '5',
      name: 'Image.jpeg',
      url: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/Resso.png',
    },
    { id: '6', name: 'code.json' },
  ];

  let references = $state<AIChatInputReference[]>(referenceTemp);
  let lastClicked = $state('（未点击）');

  function handleReferenceDelete(item: AIChatInputReference): void {
    references = references.filter((ref) => ref.id !== item.id);
  }

  function handleReferenceClick(item: AIChatInputReference): void {
    lastClicked = item.type === 'text' ? (item.content ?? '') : (item.name ?? item.id);
  }
</script>

<div style="margin: 12px;">
  <AIChatInput
    placeholder="用于查看引用内容的用例"
    onReferenceDelete={handleReferenceDelete}
    onReferenceClick={handleReferenceClick}
    {references}
    {uploadProps}
  />
  <p style="margin-top: 12px; color: var(--cd-color-text-2); font-size: 12px;">
    最近点击的引用：<span data-testid="clicked">{lastClicked}</span>
  </p>
</div>
