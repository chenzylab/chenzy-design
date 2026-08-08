<script lang="ts">
  // 覆盖三个对齐 Semi 的能力：
  //   escapeHtml —— 用户消息里的 HTML 标签被转义、不被 Markdown 当标签吞掉；
  //   onAnnotationClick —— output_text 的 annotations 渲染成可点击来源徽标（已过滤 file_citation）；
  //   onMessageShare —— 传了该回调才在操作区渲染分享按钮（对齐 Semi shareNode）。
  import { AIChatDialogue } from '@chenzy-design/svelte';
  import type { AIDialogueMessage } from '@chenzy-design/svelte';

  let lastAction = $state('');

  const roleConfig = {
    user: { name: '我', color: 'blue' },
    assistant: { name: '助手', color: 'grey' },
  };

  const chats: AIDialogueMessage[] = [
    {
      id: 'u1',
      role: 'user',
      status: 'completed',
      // 含 HTML 标签：escapeHtml 默认 true，标签会原样显示而非被解析吞掉
      content: '帮我看看 <AgentChat /> 这个组件',
    },
    {
      id: 'a1',
      role: 'assistant',
      status: 'completed',
      content: [
        {
          type: 'message',
          content: [
            {
              type: 'output_text',
              text: '这是一个 AI 会话组件，详见下方来源。',
              annotations: [
                {
                  type: 'url_citation',
                  url_citation: { title: 'Svelte 官方文档', url: 'https://svelte.dev' },
                },
                {
                  type: 'url_citation',
                  url_citation: { title: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
                },
                // file_citation 会被过滤掉，不渲染
                { type: 'file_citation', file_id: 'f-1' },
              ],
            },
          ],
        },
      ],
    },
  ];
</script>

<AIChatDialogue
  {chats}
  {roleConfig}
  onAnnotationClick={(list) =>
    (lastAction = `点击引用标注：${(list as unknown[]).length} 条`)}
  onMessageShare={(m) => (lastAction = `分享消息：${(m as { id?: string }).id}`)}
/>

{#if lastAction}
  <p style="margin-top: 8px; color: var(--cd-color-text-2);">{lastAction}</p>
{/if}
