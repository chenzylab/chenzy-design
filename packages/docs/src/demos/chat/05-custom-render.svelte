<script lang="ts">
  // 严格对齐 Semi「自定义渲染会话框」第一个示例：renderChatBoxAvatar / renderChatBoxTitle
  // 分别按 Radio 三态切换（默认/无/自定义）。default 态传 undefined（组件内置渲染），
  // null/custom 态传自定义 snippet 接管。
  import { Chat, RadioGroup, Radio, Avatar } from '@chenzy-design/svelte';
  import type {
    ChatMessage,
    ChatRoleConfig,
    ChatRenderAvatarProps,
    ChatRenderTitleProps,
  } from '@chenzy-design/svelte';

  type Mode = 'default' | 'null' | 'custom';

  const roleConfig: ChatRoleConfig = {
    user: {
      name: 'User',
      avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/docs-icon.png',
    },
    assistant: {
      name: 'Assistant',
      avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/other/logo.png',
    },
    system: {
      name: 'System',
      avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/other/logo.png',
    },
  };

  let chats = $state<ChatMessage[]>([
    { role: 'system', id: '1', createAt: 1715676751919, content: "Hello, I'm your AI assistant." },
    {
      role: 'user',
      id: '2',
      createAt: 1715676751919,
      content: [
        { type: 'text', text: '这张图片里有什么？' },
        {
          type: 'image_url',
          image_url: {
            url: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/edit-bag.jpeg',
          },
        },
      ],
    },
    { role: 'assistant', id: '3', createAt: 1715676751919, content: '图片中是一个有卡通画像装饰的黄色背包。' },
  ]);

  const uploadProps = { action: 'https://api.semi.design/upload' };

  let avatarMode = $state<Mode>('null');
  let titleMode = $state<Mode>('null');

  let seq = 0;
  function getId(): string {
    return `id-${++seq}`;
  }

  function onMessageSend(): void {
    setTimeout(() => {
      chats = [...chats, { role: 'assistant', id: getId(), content: 'This is a mock response' }];
    }, 200);
  }

  function onChatsChange(next: ChatMessage[]): void {
    chats = next;
  }

  function formatTime(createAt?: unknown): string {
    const date = new Date(typeof createAt === 'number' ? createAt : Date.now());
    const hours = `0${date.getHours()}`.slice(-2);
    const minutes = `0${date.getMinutes()}`.slice(-2);
    return `${hours}:${minutes}`;
  }
</script>

<div style="display:flex;flex-direction:column;row-gap:8px;margin-bottom:5px;">
  <span style="display:flex;align-items:center;column-gap:10px;">
    头像渲染模式
    <RadioGroup value={avatarMode} type="button" onChange={(e) => (avatarMode = e.target.value as Mode)}>
      <Radio value="default">默认头像</Radio>
      <Radio value="null">无头像</Radio>
      <Radio value="custom">自定义头像</Radio>
    </RadioGroup>
  </span>
  <span style="display:flex;align-items:center;column-gap:10px;">
    标题渲染模式
    <RadioGroup value={titleMode} type="button" onChange={(e) => (titleMode = e.target.value as Mode)}>
      <Radio value="default">默认标题</Radio>
      <Radio value="null">无标题</Radio>
      <Radio value="custom">自定义标题</Radio>
    </RadioGroup>
  </span>
</div>

<Chat
  {chats}
  {roleConfig}
  {uploadProps}
  {onChatsChange}
  {onMessageSend}
  renderChatBoxAvatar={avatarMode === 'default' ? undefined : avatarSnippet}
  renderChatBoxTitle={titleMode === 'default' ? undefined : titleSnippet}
  style="height: 400px; border: 1px solid var(--cd-color-border); border-radius: 16px;"
/>

{#snippet avatarSnippet({ role }: ChatRenderAvatarProps)}
  {#if avatarMode === 'custom'}
    <Avatar size="extra-small" shape="square" style="flex-shrink:0;">{role?.name}</Avatar>
  {/if}
{/snippet}

{#snippet titleSnippet({ role, message }: ChatRenderTitleProps)}
  {#if titleMode === 'custom'}
    <span style="display:flex;align-items:center;column-gap:6px;">
      {role?.name}
      <span style="color:var(--cd-color-text-2);font-size:12px;">{formatTime(message?.createAt)}</span>
    </span>
  {/if}
{/snippet}
