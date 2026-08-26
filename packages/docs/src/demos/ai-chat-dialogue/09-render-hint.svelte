<script lang="ts">
  import { AIChatDialogue } from '@chenzy-design/svelte';
  import type { AIDialogueMessage, AIDialogueRoleConfig } from '@chenzy-design/svelte';
  import { IconArrowRight } from '@chenzy-design/icons';

  // 对齐 Semi 官方「自定义渲染提示」demo（content/ai/aiChatDialogue/index.md:688-756）：
  // chats/hints 都是受控 state，onChatsChange 接住点击提示后插入的新消息，onHintClick
  // 清空 hints；renderHintBox 内容样式对齐官方 commonHintStyle（边框卡片 + 两端对齐 +
  // 右侧 IconArrowRight），不是本库原来自造的圆角胶囊+序号样式。本库原 demo 用 const
  // 静态 chats/hints，点击提示后既不清空提示区也不会真正插入对话消息，跟 08-hints
  // 犯了同样的疏漏。
  // roleConfig 须含 user——点击提示后会真正插入一条 user 消息（onChatsChange 接住），
  // 缺 user 配置会导致这条消息头像/名字渲染缺失。
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
  };

  let chats = $state<AIDialogueMessage[]>([
    {
      id: 'a1',
      role: 'assistant',
      content: [{ type: 'message', content: [{ type: 'output_text', text: '选一个方向开始吧。' }] }],
      status: 'completed',
    },
  ]);
  let hints = $state(['写一首诗', '解释一段代码', '翻译成英文']);

  function onChatsChange(next: AIDialogueMessage[]): void {
    chats = next;
  }

  function onHintClick(): void {
    hints = [];
  }
</script>

<!-- renderHintBox 自定义提示项渲染：参数为 { content, index, onHintClick }。 -->
<div style="height: 360px; border: 1px solid var(--cd-color-border); border-radius: 8px;">
  <AIChatDialogue {chats} {roleConfig} {hints} {onChatsChange} {onHintClick}>
    {#snippet renderHintBox({ content, index, onHintClick: onItemClick })}
      <div
        onclick={onItemClick}
        role="button"
        tabindex="0"
        onkeydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onItemClick();
        }}
        style="border:1px solid var(--cd-color-border); padding:10px; border-radius:10px;
               color:var(--cd-color-text-1); display:flex; justify-content:space-between;
               align-items:center; cursor:pointer; font-size:14px;"
      >
        {content}
        <IconArrowRight style="margin-left:10px;" />
      </div>
    {/snippet}
  </AIChatDialogue>
</div>
