<!--
  测试夹具：验证 message 内部子块类型（input_text/output_text 等）也能被
  renderDialogueContentItem 覆盖，以及渲染器第二参数 message 是否正确传入
  （对齐 Semi dialogueContent.tsx:236/195）。仅测试用，不导出。
-->
<script lang="ts">
  import AIChatDialogue from './AIChatDialogue.svelte';
  import type { AIDialogueMessage, AIDialogueRoleConfig, ContentItem } from '@chenzy-design/core';

  interface Props {
    chats: AIDialogueMessage[];
    /** 'inner' 验证内层子块类型覆盖；'role' 验证渲染器第二参数是完整 message。 */
    mode: 'inner' | 'role';
  }
  let { chats, mode }: Props = $props();

  const roleConfig: AIDialogueRoleConfig = {
    user: { name: '我' },
    assistant: { name: '助手' },
  };

  function textOf(item: ContentItem): string {
    return (item as { text?: string }).text ?? '';
  }
</script>

{#if mode === 'inner'}
  <AIChatDialogue {chats} {roleConfig} renderDialogueContentItem={{ input_text: innerTextBlock }} />
{:else}
  <AIChatDialogue {chats} {roleConfig} renderDialogueContentItem={{ input_text: roleAwareBlock }} />
{/if}

{#snippet innerTextBlock(item: ContentItem)}
  <div data-testid="inner-block">{textOf(item)}</div>
{/snippet}

{#snippet roleAwareBlock(item: ContentItem, message: AIDialogueMessage)}
  {#if message.role === 'user'}
    <div data-testid="role-user">{textOf(item)}</div>
  {:else}
    <div data-testid="role-assistant">{textOf(item)}</div>
  {/if}
{/snippet}
