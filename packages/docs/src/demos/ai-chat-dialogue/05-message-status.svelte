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

  // message.status 对应三种官方样式：成功(completed) / 请求中(queued·in_progress·incomplete)
  // / 失败(failed·cancelled)——对齐 Semi dialogueContent.tsx:320 isLoading 判定的三种状态。
  // content 形态特意跟 Semi 官方 demo 保持一致：completed/failed 用纯字符串，
  // in_progress 完全不带 content 字段——避免只用结构化数组掩盖这两种输入形态的覆盖盲区。
  const chats: AIDialogueMessage[] = [
    {
      id: 'q1',
      role: 'user',
      content: '帮我写一段排序算法',
      status: 'completed',
    },
    {
      id: 'a-ok',
      role: 'assistant',
      content: '这是一段快速排序实现，已完成。',
      status: 'completed',
    },
    {
      id: 'a-loading',
      role: 'assistant',
      status: 'in_progress',
    },
    {
      id: 'a-queued',
      role: 'assistant',
      status: 'queued',
    },
    {
      id: 'a-incomplete',
      role: 'assistant',
      status: 'incomplete',
    },
    {
      id: 'a-fail',
      role: 'assistant',
      content: '（这条消息生成失败）',
      status: 'failed',
    },
  ];
</script>

<div style="height: 420px; border: 1px solid var(--cd-color-border); border-radius: 8px;">
  <AIChatDialogue {chats} {roleConfig} />
</div>
