<script lang="ts">
  import { AIChatDialogue } from '@chenzy-design/svelte';
  import type {
    AIDialogueMessage,
    AIDialogueRoleConfig,
    ContentItem,
  } from '@chenzy-design/svelte';

  const roleConfig: AIDialogueRoleConfig = {
    user: { name: '我', color: '#4080ff' },
    assistant: { name: '助手', color: '#00b42a' },
  };

  // function_call 块用自定义渲染替代默认工具块样式。
  const chats: AIDialogueMessage[] = [
    {
      id: 'u1',
      role: 'user',
      content: [{ type: 'message', content: [{ type: 'input_text', text: '查一下北京天气' }] }],
      status: 'completed',
    },
    {
      id: 'a1',
      role: 'assistant',
      content: [
        { type: 'function_call', name: 'get_weather', arguments: '{"city":"Beijing"}' },
        { type: 'message', content: [{ type: 'output_text', text: '北京今天多云，24°C。' }] },
      ],
      status: 'completed',
    },
  ];

  function argsOf(item: ContentItem): string {
    return (item as { arguments?: string }).arguments ?? '';
  }
  function nameOf(item: ContentItem): string {
    return (item as { name?: string }).name ?? 'tool';
  }
</script>

<!-- renderDialogueContentItem 按 ContentItem.type 覆盖渲染，这里自定义 function_call 块。 -->
<div style="height: 380px; border: 1px solid var(--cd-color-border); border-radius: 8px;">
  <AIChatDialogue {chats} {roleConfig} renderDialogueContentItem={{ function_call: toolBlock }} />
</div>

{#snippet toolBlock(item: ContentItem)}
  <div
    style="display:flex; align-items:center; gap:8px; padding:8px 12px; margin:4px 0;
           border-radius:8px; background:var(--cd-color-warning-light-default); color:var(--cd-color-warning-active);"
  >
    <span aria-hidden="true">🛠</span>
    <span style="font-weight:600;">调用 {nameOf(item)}</span>
    <code style="font-size:12px; opacity:0.8;">{argsOf(item)}</code>
  </div>
{/snippet}
