<script lang="ts">
  // 严格对齐 Semi「自定义渲染会话框」第三个示例：renderChatBoxContent 自定义内容区，
  // 展示消息自带的 source（搜索来源）折叠卡片 + MarkdownRender 正文。
  import { Chat, MarkdownRender, Avatar, AvatarGroup } from '@chenzy-design/svelte';
  import type { ChatMessage, ChatRoleConfig, ChatRenderContentProps } from '@chenzy-design/svelte';
  import { IconChevronUp } from '@chenzy-design/icons';

  interface Source {
    avatar: string;
    url: string;
    title: string;
    subTitle: string;
    content: string;
  }

  const sources: Source[] = [
    {
      avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/other/logo.png',
      url: '/guide/introduction',
      title: 'Semi Design',
      subTitle: 'Semi design website',
      content: 'Semi Design 是由抖音前端团队，MED 产品设计团队设计、开发并维护的设计系统。',
    },
    {
      avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/other/logo.png',
      url: '/guide/theming',
      title: 'Semi 设计系统',
      subTitle: 'Semi DSM website',
      content: '从 Semi Design，到 Any Design 快速定义你的设计系统，并应用在设计稿和代码中。',
    },
    {
      avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/other/logo.png',
      url: '/guide/getting-started',
      title: '设计稿转代码',
      subTitle: 'Semi D2C website',
      content: 'Semi 设计稿转代码，是由抖音前端 Semi Design 团队推出的全新的提效工具。',
    },
  ];

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
    {
      role: 'assistant',
      id: '3',
      createAt: 1715676751919,
      content:
        'Semi Design 是由抖音前端团队，MED 产品设计团队设计、开发并维护的设计系统。它作为全面、易用、优质的现代应用 UI 解决方案，从字节跳动各业务线的复杂场景提炼而来，支撑近千计平台产品，服务内外部 10 万+ 用户。',
      source: sources,
    },
  ]);

  const uploadProps = { action: 'https://api.semi.design/upload' };

  let seq = 0;
  function onMessageSend(): void {
    setTimeout(() => {
      chats = [...chats, { role: 'assistant', id: `id-${++seq}`, content: 'This is a mock response' }];
    }, 200);
  }

  function onChatsChange(next: ChatMessage[]): void {
    chats = next;
  }

  let sourceOpen = $state(true);

  function onSourceOpen(): void {
    sourceOpen = false;
  }
  function onSourceClose(): void {
    sourceOpen = true;
  }
</script>

<Chat
  {chats}
  {roleConfig}
  {uploadProps}
  {onChatsChange}
  {onMessageSend}
  renderChatBoxContent={contentSnippet}
  style="height: 500px; border: 1px solid var(--cd-color-border); border-radius: 16px;"
/>

{#snippet contentSnippet({ message, className }: ChatRenderContentProps)}
  {@const source = (message?.source as Source[] | undefined) ?? undefined}
  <div class={className}>
    {#if source}
      <div
        style="transition:{sourceOpen
          ? 'height 0.4s ease, width 0.4s ease'
          : 'height 0.4s ease'};height:{sourceOpen ? '30px' : '200px'};width:{sourceOpen
          ? '190px'
          : '100%'};background:var(--cd-color-tertiary-light-hover);border-radius:16px;box-sizing:border-box;margin-bottom:10px;"
      >
        {#if sourceOpen}
          <button
            type="button"
            style="display:flex;align-items:center;width:fit-content;column-gap:10px;background:transparent;border:none;cursor:pointer;border-radius:16px;padding:5px 10px;font-size:14px;color:var(--cd-color-text-1);line-height:1;"
            onclick={onSourceOpen}
          >
            <span style="white-space:nowrap;">基于 {source.length} 个搜索来源</span>
            <span style="flex-shrink:0;">
              <AvatarGroup size="extra-extra-small" items={source.map((s) => ({ src: s.avatar }))} />
            </span>
          </button>
        {:else}
          <button
            type="button"
            style="height:100%;box-sizing:border-box;display:flex;flex-direction:column;background:transparent;border:none;cursor:pointer;border-radius:16px;padding:12px;width:100%;text-align:left;"
            onclick={onSourceClose}
          >
            <span
              style="display:flex;align-items:center;justify-content:space-between;padding:5px 10px;column-gap:10px;color:var(--cd-color-text-1);"
            >
              <span style="font-size:14px;font-weight:500;">Source</span>
              <IconChevronUp />
            </span>
            <span style="display:flex;flex-wrap:wrap;gap:10px;overflow:auto;padding:5px 10px;">
              {#each source as s, i (i)}
                <span
                  style="display:flex;flex-direction:column;row-gap:5px;flex-basis:150px;flex-grow:1;border:1px solid var(--cd-color-border);border-radius:12px;padding:12px;font-size:12px;"
                >
                  <span style="display:flex;column-gap:5px;align-items:center;">
                    <Avatar style="width:16px;height:16px;flex-shrink:0;" shape="square" src={s.avatar} />
                    <span style="color:var(--cd-color-text-2);text-overflow:ellipsis;">{s.title}</span>
                  </span>
                  <span style="color:var(--cd-color-primary);font-size:12px;">{s.subTitle}</span>
                  <span
                    style="display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;text-overflow:ellipsis;overflow:hidden;color:var(--cd-color-text-2);"
                  >
                    {s.content}
                  </span>
                </span>
              {/each}
            </span>
          </button>
        {/if}
      </div>
    {/if}
    <MarkdownRender raw={typeof message?.content === 'string' ? message.content : ''} format="md" />
  </div>
{/snippet}
