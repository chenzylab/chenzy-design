<script lang="ts">
  // 严格对齐 Semi 基本用法：Radio 切换 mode（气泡/非气泡/用户会话气泡）+ align（左右分布/左对齐）；
  // 3 个角色 system/user/assistant，assistant 内容含代码块；发送后 mock 一条回复。
  import { Chat, RadioGroup, Radio } from '@chenzy-design/svelte';
  import type { ChatMessage, ChatRoleConfig, ChatMode, ChatAlign } from '@chenzy-design/svelte';

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

  const assistantCode = `以下是一个 Semi 代码的使用示例：
\`\`\`jsx
import React from 'react';
import { Button } from '@douyinfe/semi-ui';

const MyComponent = () => {
  return (
    <Button>Click me</Button>
  );
};
export default MyComponent;
\`\`\``;

  let chats = $state<ChatMessage[]>([
    { role: 'system', id: '1', content: "Hello, I'm your AI assistant." },
    { role: 'user', id: '2', content: '给一个 Semi Design 的 Button 组件的使用示例' },
    { role: 'assistant', id: '3', content: assistantCode },
  ]);

  let mode = $state<ChatMode>('bubble');
  let align = $state<ChatAlign>('leftRight');

  // 上传 action + 上传按钮提示（对齐 Semi demo uploadProps / uploadTipProps）。
  const uploadProps = { action: 'https://api.semi.design/upload' };
  const uploadTipProps = { content: '自定义上传按钮提示信息' };

  let seq = 0;
  function onMessageSend() {
    setTimeout(() => {
      chats.push({ role: 'assistant', id: `mock-${++seq}`, content: '这是一条 mock 回复信息' });
    }, 200);
  }

  // 重生成：把最后一条消息 mock 成 reset 内容（对齐 Semi demo onMessageReset）。
  function onMessageReset() {
    setTimeout(() => {
      const last = chats[chats.length - 1];
      if (last) {
        chats[chats.length - 1] = { ...last, status: 'complete', content: 'This is a mock reset message.' };
      }
    }, 200);
  }
</script>

<div style="display:flex;flex-direction:column;row-gap:8px;">
  <span style="display:flex;align-items:center;column-gap:10px;">
    模式
    <RadioGroup value={mode} type="button" onChange={(e) => (mode = e.target.value as ChatMode)}>
      <Radio value="bubble">气泡</Radio>
      <Radio value="noBubble">非气泡</Radio>
      <Radio value="userBubble">用户会话气泡</Radio>
    </RadioGroup>
  </span>
  <span style="display:flex;align-items:center;column-gap:10px;">
    会话布局方式
    <RadioGroup value={align} type="button" onChange={(e) => (align = e.target.value as ChatAlign)}>
      <Radio value="leftRight">左右分布</Radio>
      <Radio value="leftAlign">左对齐</Radio>
    </RadioGroup>
  </span>
</div>

<div style="border:1px solid var(--cd-color-border);border-radius:16px;margin:8px 0;height:550px;">
  <Chat
    {chats}
    {roleConfig}
    {mode}
    {align}
    {uploadProps}
    {uploadTipProps}
    onChatsChange={(n) => (chats = n)}
    {onMessageSend}
    {onMessageReset}
  />
</div>
