<script lang="ts">
  import { AIChatDialogue } from '@chenzy-design/svelte';
  import type {
    AIDialogueMessage,
    AIDialogueRoleConfig,
    AIDialogueReference,
  } from '@chenzy-design/svelte';

  const roleConfig: AIDialogueRoleConfig = {
    user: { name: '我', color: '#4080ff' },
    assistant: { name: '助手', color: '#00b42a' },
  };

  // 通过 message.references 定义引用；showReference 开启后在 user 消息展示可引用样式，
  // 点击触发 onReferenceClick。文本引用(content)与文件引用(name)两种形态。
  const chats: AIDialogueMessage[] = [
    {
      id: 'u1',
      role: 'user',
      content: [{ type: 'message', content: [{ type: 'input_text', text: '基于这些资料帮我总结要点' }] }],
      status: 'completed',
      references: [
        { id: '1', type: 'text', content: '这是一段被引用的长文本，用于展示纯文本引用的裁剪与展示效果，超出两行会省略。' },
        { id: '2', name: '飞书文档.docx' },
        { id: '3', name: 'Music.mp4' },
        { id: '4', name: 'Image.jpeg' },
        { id: '5', name: 'code.json' },
      ],
    },
    {
      id: 'a1',
      role: 'assistant',
      content: [{ type: 'message', content: [{ type: 'output_text', text: '好的，已根据引用资料整理出要点。' }] }],
      status: 'completed',
    },
  ];

  let lastClicked = $state('');
  function onReferenceClick(item: AIDialogueReference): void {
    lastClicked = item.name ?? item.content ?? String(item.id);
  }
</script>

<div style="height: 420px; border: 1px solid var(--cd-color-border); border-radius: 8px;">
  <AIChatDialogue {chats} {roleConfig} showReference {onReferenceClick} />
</div>
{#if lastClicked}
  <p style="margin-top: 8px; color: var(--cd-color-text-2);">点击了引用：{lastClicked}</p>
{/if}
