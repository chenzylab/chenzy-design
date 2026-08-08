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
      content: [{ type: 'message', content: [{ type: 'input_text', text: '第一条消息' }] }],
      status: 'completed',
    },
    {
      id: 'a1',
      role: 'assistant',
      content: [{ type: 'message', content: [{ type: 'output_text', text: '第二条消息（助手）。' }] }],
      status: 'completed',
    },
    {
      id: 'u2',
      role: 'user',
      content: [{ type: 'message', content: [{ type: 'input_text', text: '第三条消息' }] }],
      status: 'completed',
    },
  ];

  // selecting 开启选择模式，前置 checkbox；onSelect 返回选中的 id 列表。
  // 组件暴露 selectAll / deselectAll ref 方法；align 切换验证选择模式在两种布局下都可用（对齐 Semi「选择」demo）。
  let dialogue = $state<{ selectAll: () => void; deselectAll: () => void }>();
  let selected = $state<string[]>([]);
  let align = $state<'leftRight' | 'leftAlign'>('leftRight');
</script>

<span style="display:flex; align-items:center; column-gap:10px; margin-bottom: 8px;">
  会话布局方式
  <RadioGroup value={align} onChange={(e) => (align = e.target.value as 'leftRight' | 'leftAlign')} type="button">
    <Radio value="leftRight">左右分布</Radio>
    <Radio value="leftAlign">左对齐</Radio>
  </RadioGroup>
</span>
<div style="margin-bottom: 8px; display: flex; gap: 8px;">
  <button type="button" onclick={() => dialogue?.selectAll()}>全选</button>
  <button type="button" onclick={() => dialogue?.deselectAll()}>取消全选</button>
  <span style="color: var(--cd-color-text-2);">已选 {selected.length} 条</span>
</div>
<div style="height: 360px; border: 1px solid var(--cd-color-border); border-radius: 8px;">
  <AIChatDialogue
    bind:this={dialogue}
    {chats}
    {roleConfig}
    {align}
    mode="bubble"
    selecting
    onSelect={(ids) => (selected = ids)}
  />
</div>
