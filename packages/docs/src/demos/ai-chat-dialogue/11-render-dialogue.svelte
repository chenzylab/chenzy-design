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

  const roleConfig: AIDialogueRoleConfig = {
    system: { name: 'System', color: '#8c8c8c' },
    user: {
      name: 'User',
      color: '#4080ff',
      avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/docs-icon.png',
    },
    assistant: {
      name: 'Assistant',
      color: '#00b42a',
      avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/other/logo.png',
    },
  };

  const chats: AIDialogueMessage[] = [
    {
      id: '1',
      role: 'system',
      content: [{ type: 'message', content: [{ type: 'output_text', text: "Hello, I'm your AI assistant." }] }],
      status: 'completed',
    },
    {
      id: '2',
      role: 'user',
      content: [{ type: 'message', content: [{ type: 'input_text', text: '给一个 Button 组件的使用示例' }] }],
      status: 'completed',
    },
    {
      id: '3',
      role: 'assistant',
      content: [{ type: 'message', content: [{ type: 'output_text', text: '以下是一个 Button 的使用示例。' }] }],
      status: 'completed',
    },
  ];

  // dialogueRenderConfig 三个区块分别自定义（对齐 Semi「自定义渲染会话框」demo）：
  //   renderDialogueTitle —— 改写标题（加前缀）；
  //   renderDialogueAvatar —— 用方形 Avatar 替代默认圆形头像；
  //   renderDialogueAction —— 用 className 包一层，复用默认操作区（复制/反馈/更多等按钮）。
  const dialogueRenderConfig: DialogueRenderConfig = {
    renderDialogueTitle: titleSlot,
    renderDialogueAvatar: avatarSlot,
    renderDialogueAction: actionSlot,
  };
</script>

<div style="height: 420px; border: 1px solid var(--cd-color-border); border-radius: 8px;">
  <AIChatDialogue {chats} {roleConfig} {dialogueRenderConfig} />
</div>

{#snippet titleSlot({ role }: RenderTitleProps)}
  <div style="font-weight:700; color:var(--cd-color-primary);">My-{role?.name ?? ''}</div>
{/snippet}

{#snippet avatarSlot({ role }: RenderAvatarProps)}
  <Avatar src={role?.avatar} size="extra-small" shape="square">
    {role?.name?.[0] ?? ''}
  </Avatar>
{/snippet}

{#snippet actionSlot({ defaultAction, className }: RenderActionProps)}
  <div class={className}>
    {@render defaultAction()}
  </div>
{/snippet}
