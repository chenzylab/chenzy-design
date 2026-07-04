<!-- 测试夹具：验证 renderChatBoxContent 自定义 snippet 生效。 -->
<script lang="ts">
  import Chat from './Chat.svelte';
  import type { Message } from './types.js';

  let { chats }: { chats: Message[] } = $props();
</script>

<Chat {chats}>
  {#snippet renderChatBoxContent({ message })}
    <div class="custom-content">custom: {message?.content}</div>
  {/snippet}
</Chat>
