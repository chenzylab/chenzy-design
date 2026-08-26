<script lang="ts">
  import { AIChatDialogue, Avatar } from '@chenzy-design/svelte';
  import type {
    AIDialogueMessage,
    AIDialogueRoleConfig,
    DialogueRenderConfig,
    RenderTitleProps,
    RenderAvatarProps,
    RenderActionProps,
  } from '@chenzy-design/svelte';

  // 对齐 Semi 官方「自定义渲染会话框」demo（content/ai/aiChatDialogue/index.md:781-922）：
  // 3 条消息（system/user/assistant，assistant 内容含 markdown 代码块），只自定义
  // renderDialogueTitle/renderDialogueAvatar/renderDialogueAction 三个区块，
  // align="leftRight" mode="bubble"。本库原来多造了第 4 条消息、多加了
  // renderDialogueContent 演示、demo 没传 align/mode、三个 snippet 的实现细节
  // （标题用自定义样式而非官方类名、头像多塞了首字母兜底内容）都跟官方源码不一致。
  const roleConfig: AIDialogueRoleConfig = {
    system: { name: 'System', color: '#8c8c8c' },
    user: {
      name: 'User',
      avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/docs-icon.png',
    },
    assistant: {
      name: 'Assistant',
      avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/other/logo.png',
    },
  };

  let chats = $state<AIDialogueMessage[]>([
    {
      id: '1',
      role: 'system',
      content: "Hello, I'm your AI assistant.",
      status: 'completed',
    },
    {
      id: '2',
      role: 'user',
      content: '给一个 Semi Design 的 Button 组件的使用示例',
      status: 'completed',
    },
    {
      id: '3',
      role: 'assistant',
      content:
        '以下是一个 Semi 代码的使用示例：\n```jsx \nimport React from \'react\';\nimport { Button } from \'@douyinfe/semi-ui\';\n\nconst MyComponent = () => {\n  return (\n    <Button>Click me</Button>\n );\n};\nexport default MyComponent;\n```\n',
      status: 'completed',
    },
  ]);

  function onChatsChange(next: AIDialogueMessage[]): void {
    chats = next;
  }

  const dialogueRenderConfig: DialogueRenderConfig = {
    renderDialogueTitle: titleSlot,
    renderDialogueAvatar: avatarSlot,
    renderDialogueAction: actionSlot,
  };
</script>

<div style="height: 420px; border: 1px solid var(--cd-color-border); border-radius: 8px;">
  <AIChatDialogue
    align="leftRight"
    mode="bubble"
    {chats}
    {roleConfig}
    {onChatsChange}
    {dialogueRenderConfig}
  />
</div>

{#snippet titleSlot({ role }: RenderTitleProps)}
  <div class="cd-ai-chat-dialogue-title">My-{role?.name ?? ''}</div>
{/snippet}

{#snippet avatarSlot({ role }: RenderAvatarProps)}
  <Avatar src={role?.avatar} size="extra-small" shape="square" />
{/snippet}

<!-- 对齐 Semi 官方 demo：renderDialogueAction 只取 defaultActions[0]（第一个按钮节点，
     completed 时是复制），不是整块 defaultAction。Svelte 没有「节点实例」概念，
     defaultActions 退化成 Snippet 数组，需要 {@render defaultActions[0]()} 才能渲染
     出来，语义等价于 Semi 的 {props.defaultActions[0]}。 -->
{#snippet actionSlot({ defaultActions, className }: RenderActionProps)}
  <div class={className}>
    {#if defaultActions[0]}{@render defaultActions[0]()}{/if}
  </div>
{/snippet}
