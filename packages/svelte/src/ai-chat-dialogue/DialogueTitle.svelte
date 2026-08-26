<!--
  DialogueTitle — 会话框标题（1:1 对齐 Semi widgets/dialogueTitle.tsx）。

  拆成独立文件是为了跟 Semi 的文件结构一致：Semi 把它单独放在 widgets/ 下，
  本库原来内联在 DialogueBox.svelte 里当 defaultTitle snippet。

  Semi 只显 role?.name（不回退 message.name / message.role）；本库原来的
  defaultTitle 回退链（role?.name ?? message.name ?? message.role）多于 Semi，
  已收敛成与 Semi 一致的单一取值。
-->
<script lang="ts">
  import type { AIDialogueMessage, AIDialogueMetadata } from '@chenzy-design/core';

  interface Props {
    message?: AIDialogueMessage;
    role?: AIDialogueMetadata | undefined;
  }

  let { role }: Props = $props();
</script>

<!-- Semi dialogueTitle.tsx:14 用 <span> 不是 <div>：div 是块级元素默认撑满 inner 宽度，
     会导致 flex-end 对齐失效（文字仍按块内默认左对齐，看起来「跑到了最左边」而不是
     贴着头像）；span 收缩到文字本身宽度，父级 align-items:flex-end 才能让它整体贴右。
     无条件渲染（对齐 Semi `<span>{role?.name}</span>`——role?.name 为空时 span 仍在，
     只是内容为空文本，不是整个元素消失）：本库原来用 {#if role?.name} 包裹整个
     <span>，导致没有角色名时这个元素完全不出现在 DOM 里，跟 Semi 结构性不同——
     消费方若无条件依赖 .cd-ai-chat-dialogue-title 这个元素存在（自定义 CSS/JS/测试），
     在本库这种边界情况下会找不到它。 -->
<span class="cd-ai-chat-dialogue-title">{role?.name}</span>

<style>
  /* 逐条对齐 Semi aiChatDialogue.scss &-title：只有 line-height/font-size/font-weight
     三条，无 color（继承父级文字色）、无 margin-bottom——这两条是本库自造，
     且用的是通用 token 而非早就建好的专属 title-* token，一直没被消费。 */
  .cd-ai-chat-dialogue-title {
    line-height: var(--cd-ai-chat-dialogue-title-line-height);
    font-size: var(--cd-ai-chat-dialogue-title-font-size);
    font-weight: var(--cd-ai-chat-dialogue-title-font-weight);
  }
</style>
