<script lang="ts">
  // 严格对齐 Semi「动态更新数据」：发送后先插入 loading 消息，模拟流式回复
  // （loading → incomplete 逐步追加内容 → complete），支持 showStopGenerate 停止生成。
  import { Chat } from '@chenzy-design/svelte';
  import type { ChatMessage, ChatRoleConfig } from '@chenzy-design/svelte';

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

  // 展示给用户看的示例代码字符串（非真依赖）；同 01-basic 用拼接躲过 vite 依赖扫描。
  const IMP = 'import';
  const assistantIntro = `Semi Design 是由抖音前端团队和 MED 产品设计团队设计、开发并维护的设计系统。作为一个全面、易用、优质的现代应用 UI 解决方案，Semi Design 从字节跳动各业务线的复杂场景中提炼而来，目前已经支撑了近千个平台产品，服务了内外部超过 10 万用户。

Semi Design 的特点包括：

1. 设计简洁、现代化。
2. 提供主题方案，可深度样式定制。
3. 提供明暗色两套模式，切换方便。
4. 国际化，覆盖了简/繁体中文、英语、日语、韩语、葡萄牙语等 20+ 种语言。
5. 采用 Foundation 和 Adapter 跨框架技术方案，方便扩展。`;

  let chats = $state<ChatMessage[]>([
    { role: 'system', id: '1', createAt: 1715676751919, content: "Hello, I'm your AI assistant." },
    { role: 'user', id: '2', createAt: 1715676751919, content: '介绍一下 Semi Design' },
    { role: 'assistant', id: '3', createAt: 1715676751919, content: assistantIntro },
  ]);

  const uploadProps = { action: 'https://api.semi.design/upload' };

  let seq = 0;
  function getId(): string {
    return `id-${++seq}`;
  }

  let intervalId: ReturnType<typeof setInterval> | undefined;

  function onMessageSend(content: string): void {
    chats.push({ role: 'assistant', status: 'loading', createAt: Date.now(), id: getId() });
    generateMockResponse(content);
  }

  function onChatsChange(next: ChatMessage[]): void {
    chats = next;
  }

  // 模拟流式回复：loading → incomplete（每 400ms 追加一段）→ 超过 200 字符后 complete。
  function generateMockResponse(content: string): void {
    intervalId = setInterval(() => {
      const lastMessage = chats[chats.length - 1];
      if (!lastMessage) return;
      let newMessage: ChatMessage = { ...lastMessage };
      if (lastMessage.status === 'loading') {
        newMessage = { ...newMessage, content: `mock Response for ${content} \n`, status: 'incomplete' };
      } else if (lastMessage.status === 'incomplete') {
        const currentContent = typeof lastMessage.content === 'string' ? lastMessage.content : '';
        if (currentContent.length > 200) {
          clearInterval(intervalId);
          intervalId = undefined;
          newMessage = { ...newMessage, content: `${currentContent} mock stream message`, status: 'complete' };
        } else {
          newMessage = { ...newMessage, content: `${currentContent} mock stream message` };
        }
      }
      chats = [...chats.slice(0, -1), newMessage];
    }, 400);
  }

  function onStopGenerator(): void {
    if (!intervalId) return;
    clearInterval(intervalId);
    intervalId = undefined;
    const lastMessage = chats[chats.length - 1];
    if (lastMessage?.status && lastMessage.status !== 'complete') {
      chats = [...chats.slice(0, -1), { ...lastMessage, status: 'complete' }];
    }
  }
</script>

<div style="height: 600px; border: 1px solid var(--cd-color-border); border-radius: 16px;">
  <Chat
    {chats}
    {roleConfig}
    {uploadProps}
    showStopGenerate
    {onChatsChange}
    {onMessageSend}
    {onStopGenerator}
  />
</div>
