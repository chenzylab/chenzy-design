<!--
  测试夹具：AIChatDialogue + messageEditRender（编辑态放一个标记 + 回显文本）。
  验证 user 消息 editing 态用 messageEditRender 替代内容渲染。仅测试用，不导出。
-->
<script lang="ts">
  import AIChatDialogue from './AIChatDialogue.svelte';
  import type {
    AIDialogueMessage,
    AIDialogueRoleConfig,
    AIChatInputMessageContent,
  } from '@chenzy-design/core';

  interface Props {
    chats?: AIDialogueMessage[];
    onMessageEdit?: (message: AIDialogueMessage) => void;
  }
  let { chats = [], onMessageEdit }: Props = $props();

  const roleConfig: AIDialogueRoleConfig = {
    user: { name: '我' },
    assistant: { name: '助手' },
  };
</script>

<AIChatDialogue {chats} {roleConfig} {onMessageEdit}>
  {#snippet messageEditRender(payload: AIChatInputMessageContent)}
    <div class="edit-marker" data-testid="edit-editor">
      编辑中：{(payload.inputContents ?? []).map((c) => c.text).join('')}
    </div>
  {/snippet}
</AIChatDialogue>
