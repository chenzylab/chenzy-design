<script lang="ts">
  // 严格对齐 Semi「AddPasteRule」demo：用户自定义 tiptap 扩展（docSlot，见
  // doc-slot-extension.ts）通过 nodePasteRule 让粘贴的飞书文档链接自动转换为自定义节点；
  // transformer 把 docSlot 节点归一进 onContentChange 的输出。
  import { AIChatInput, Button, Toast } from '@chenzy-design/svelte';
  import type { AIChatInputChangePayload, AIChatInputContent } from '@chenzy-design/svelte';
  import copy from 'copy-text-to-clipboard';
  import DocSlot from './doc-slot-extension.js';

  const extensions = [DocSlot];

  let chatInputRef = $state<{
    getEditor: () => { getHTML: () => string; getJSON: () => unknown } | undefined;
  }>();
  let lastHtml = $state('');

  function onContentChange(payload: AIChatInputChangePayload): void {
    console.log('onContentChange', payload);
  }

  const transformer = new Map<string, (node: unknown) => AIChatInputContent>([
    [
      'docSlot',
      (node) => {
        const n = node as { attrs?: Record<string, unknown> };
        const { value, type = 'text', uniqueKey, urlValue } = n.attrs ?? {};
        return { type: type as string, value, urlValue, uniqueKey };
      },
    ],
  ]);

  function onCheck(): void {
    const editor = chatInputRef?.getEditor();
    lastHtml = editor?.getHTML() ?? '';
    console.log('html', lastHtml);
    console.log('json', editor?.getJSON());
  }

  function onClickCopy(): void {
    const url = 'https://bytedance.larkoffice.com/docx/UihWdOxOmoya5CxbzKEcWTfTnnf';
    copy(url);
    Toast.success('复制成功，粘贴到富文本输入框中查看效果');
  }
</script>

<div style="margin: 12px; max-width: 560px;">
  <Button onclick={onClickCopy}>点我复制文档链接</Button>
  <br /><br />
  <AIChatInput
    bind:this={chatInputRef}
    {extensions}
    {transformer}
    {onContentChange}
    placeholder="点击复制文档链接按钮，然后粘贴到这里"
  />
  <br />
  <Button onclick={onCheck}>点我获取结果</Button>
  {#if lastHtml}
    <p style="margin-top: 12px; color: var(--cd-color-text-2); word-break: break-all;">
      html：{lastHtml}
    </p>
  {/if}
</div>
