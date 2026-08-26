<script lang="ts">
  import { AIChatDialogue, AIChatInput, RadioGroup, Radio } from '@chenzy-design/svelte';
  import type {
    AIDialogueMessage,
    AIDialogueRoleConfig,
    AIChatInputMessageContent,
  } from '@chenzy-design/svelte';

  // roleConfig 三个角色（含 Semi demo 里的 system）均配真实头像图片（对齐 Semi 基本用法 demo）。
  const roleConfig: AIDialogueRoleConfig = {
    user: {
      name: '我',
      color: '#4080ff',
      avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/docs-icon.png',
    },
    assistant: {
      name: '助手',
      color: '#00b42a',
      avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/other/logo.png',
    },
    system: {
      name: '系统',
      avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/other/logo.png',
    },
  };

  // chats 用 $state 并接 onChatsChange 回写（对齐 Semi「通过设置 chats 和
  // onChatsChange 实现基础对话显示和交互」——本库原来只传静态常量，点赞/删除/
  // 重置/提示词点击等操作虽然组件内部已真正维护状态，但没有 onChatsChange 回写，
  // 外部这份 chats 就跟内部实际状态脱节了）。
  let chats = $state<AIDialogueMessage[]>([
    {
      id: 's1',
      role: 'system',
      content: "Hello, I'm your AI assistant.",
      status: 'completed',
    },
    {
      id: 'u1',
      role: 'user',
      content: [
        { type: 'message', content: [{ type: 'input_text', text: '给一个 Button 组件的使用示例' }] },
      ],
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
              // 对齐 Semi demo 的问答语义（user 问 Button 组件示例，assistant 回一段完整
              // 可运行代码）：Semi 原文是 React 组件定义，这里换成本库对应的 Svelte 组件定义，
              // 同样是多行完整代码（import + 标签用法），而非单行 import 缩写。
              // 字面量里的 <script> 拆成 '<' + 'script>' 拼接：Svelte 编译器预处理阶段会把
              // 字符串里出现的裸 <script> 子串误当真实标签解析，导致 js_parse_error。
              text:
                '以下是一个 Button 组件的使用示例：\n```svelte\n' +
                '<' +
                "script>\n  import { Button } from '@chenzy-design/svelte';\n</" +
                'script>\n\n<Button>Click me</Button>\n```\n',
            },
          ],
        },
      ],
      status: 'completed',
    },
  ]);

  function onChatsChange(next: AIDialogueMessage[]): void {
    chats = next;
  }

  // messageEditRender：点击 user 消息的编辑按钮后（组件内部已切好 message.editing 并回写
  // onChatsChange），用它替代内容渲染，消费方通常放编辑器——本库用 AIChatInput 载入原文本，
  // 发送即保存回消息、退出编辑态。Semi 官方基本用法 demo 未传这个 prop，未传时 Semi 的行为
  // 是编辑态内容直接变空白（messageEditRender?.() 未传返回 undefined），点击编辑没有可操作
  // 的入口；这里额外补上让编辑按钮在基本用法里就是真正可用的，不必等到专门的编辑 demo。
  function handleEditSave(id: string, message: AIChatInputMessageContent): void {
    const text = (message.inputContents ?? []).map((c) => c.text).join('');
    chats = chats.map((m) =>
      m.id === id
        ? {
            ...m,
            editing: false,
            content: [{ type: 'message', content: [{ type: 'input_text', text }] }],
          }
        : m,
    );
  }

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

<!-- 容器样式对齐 Semi demo：border+borderRadius:12+marginTop:10+padding:20（本库原来
     漏了 padding，且圆角写成 8 而非 12；额外的固定 height 是本库自造，删掉让内容撑开）。 -->
<div style="border: 1px solid var(--cd-color-border); border-radius: 12px; margin-top: 10px; padding: 20px;">
  <AIChatDialogue {chats} {roleConfig} {align} {mode} {onChatsChange}>
    {#snippet messageEditRender(payload: AIChatInputMessageContent)}
      {@const editingMsg = chats.find((m) => m.editing)}
      <AIChatInput
        defaultContent={`<p>${(payload.inputContents ?? []).map((c) => c.text).join('')}</p>`}
        placeholder="编辑消息…"
        onMessageSend={(m) => editingMsg && handleEditSave(editingMsg.id, m)}
      />
    {/snippet}
  </AIChatDialogue>
</div>
