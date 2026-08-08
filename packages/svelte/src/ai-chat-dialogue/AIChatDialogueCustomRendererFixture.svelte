<!--
  测试夹具：给 AIChatDialogue 传 renderDialogueContentItem 自定义某类内容块的渲染。
  用于验证自定义渲染仍被包在 -content-custom-renderer 里（对齐 Semi）。仅测试用，不导出。
-->
<script lang="ts">
  import AIChatDialogue from './AIChatDialogue.svelte';
  import type { AIDialogueMessage, AIDialogueRoleConfig } from '@chenzy-design/core';

  interface Props {
    chats: AIDialogueMessage[];
  }
  let { chats }: Props = $props();

  const roleConfig: AIDialogueRoleConfig = {
    user: { name: '我' },
    assistant: { name: '助手' },
  };
</script>

<AIChatDialogue {chats} {roleConfig} renderDialogueContentItem={{ message: customMessage }} />

{#snippet customMessage()}
  <div data-testid="custom-block">自定义内容块</div>
{/snippet}
