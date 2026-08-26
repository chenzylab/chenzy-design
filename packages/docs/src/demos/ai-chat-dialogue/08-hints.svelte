<script lang="ts">
  import { AIChatDialogue } from '@chenzy-design/svelte';
  import type { AIDialogueMessage, AIDialogueRoleConfig } from '@chenzy-design/svelte';

  // avatar 对齐 Semi demo（roleConfig 各角色均配真实头像图片）。
  const roleConfig: AIDialogueRoleConfig = {
    user: {
      name: '我',
      color: '#4080ff',
      avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/docs-icon.png',
    },
    assistant: {
      name: '助手',
      color: '#00b42a',
      avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/other/logo.png',
    },
  };

  // 对齐 Semi 官方「提示」demo（content/ai/aiChatDialogue/index.md:625-684）：chats/hints
  // 都是受控 state；点击提示只做两件事——onChatsChange 把提示词接住变成新用户消息，
  // onHintClick 里 setHints([]) 清空提示区。组件内部（Semi foundation.onHintClick）
  // 只负责把点击内容插入 chats + 触发回调通知，不会自动清空 hints——是否清空、清空
  // 成什么完全由消费方决定。本库原 demo 用 const 静态数组、且没接 onChatsChange，
  // 点击后提示区不消失、提示词也不会真正出现在对话里，两处都补齐。
  let chats = $state<AIDialogueMessage[]>([
    {
      id: 'a1',
      role: 'assistant',
      content: [{ type: 'message', content: [{ type: 'output_text', text: '你好，我是 AI 助手，试试下面的提示词。' }] }],
      status: 'completed',
    },
  ]);
  let hints = $state(['介绍一下这个组件库', '如何自定义主题？', '支持哪些 AI 组件？']);

  function onChatsChange(next: AIDialogueMessage[]): void {
    chats = next;
  }

  function onHintClick(): void {
    hints = [];
  }
</script>

<div style="height: 360px; border: 1px solid var(--cd-color-border); border-radius: 8px;">
  <AIChatDialogue {chats} {roleConfig} {hints} {onChatsChange} {onHintClick} />
</div>
