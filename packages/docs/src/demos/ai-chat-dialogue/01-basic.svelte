<script lang="ts">
  import { AIChatDialogue, RadioGroup, Radio } from '@chenzy-design/svelte';
  import type { AIDialogueMessage, AIDialogueRoleConfig } from '@chenzy-design/svelte';

  const roleConfig: AIDialogueRoleConfig = {
    user: { name: '我', color: '#4080ff' },
    assistant: { name: '助手', color: '#00b42a' },
  };

  const chats: AIDialogueMessage[] = [
    {
      id: 'u1',
      role: 'user',
      content: [{ type: 'message', content: [{ type: 'input_text', text: '介绍一下这个组件库' }] }],
      status: 'completed',
    },
    {
      id: 'a1',
      role: 'assistant',
      content: [
        {
          type: 'message',
          content: [
            {
              type: 'output_text',
              text: '这是一套对标 **Semi Design** 的 Svelte 5 组件库，包含富媒体、AI 会话等组件。',
            },
          ],
        },
      ],
      status: 'completed',
    },
  ];

  // mode 三种气泡模式（bubble / noBubble / userBubble）、align 两种布局（leftRight / leftAlign），
  // 通过 RadioGroup 让非默认取值在文档中可见（对齐 Semi 基本用法 demo）。
  let mode = $state<'bubble' | 'noBubble' | 'userBubble'>('bubble');
  let align = $state<'leftRight' | 'leftAlign'>('leftRight');
</script>

<span style="display:flex; flex-direction:column; row-gap:8px;">
  <span style="display:flex; align-items:center; column-gap:10px;">
    模式
    <RadioGroup
      value={mode}
      onChange={(e) => (mode = e.target.value as 'bubble' | 'noBubble' | 'userBubble')}
      type="button"
    >
      <Radio value="bubble">气泡</Radio>
      <Radio value="noBubble">非气泡</Radio>
      <Radio value="userBubble">用户会话气泡</Radio>
    </RadioGroup>
  </span>
  <span style="display:flex; align-items:center; column-gap:10px;">
    会话布局方式
    <RadioGroup
      value={align}
      onChange={(e) => (align = e.target.value as 'leftRight' | 'leftAlign')}
      type="button"
    >
      <Radio value="leftRight">左右分布</Radio>
      <Radio value="leftAlign">左对齐</Radio>
    </RadioGroup>
  </span>
</span>

<div style="height: 360px; border: 1px solid var(--cd-color-border); border-radius: 8px; margin-top: 10px;">
  <AIChatDialogue {chats} {roleConfig} {align} {mode} />
</div>
