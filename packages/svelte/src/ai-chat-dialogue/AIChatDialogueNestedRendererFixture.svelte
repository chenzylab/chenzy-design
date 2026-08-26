<!--
  测试夹具：给 AIChatDialogue 传 renderDialogueContentItem 的二级映射（工具调用类型按
  item.name 细分渲染器）+ default 键（字符串/output_text content 的独立渲染通道）。
  对齐 Semi DialogueContentItemRendererMap / dialogueContent.tsx:171-199,340-360。仅测试用。
-->
<script lang="ts">
  import AIChatDialogue from './AIChatDialogue.svelte';
  import type { AIDialogueMessage, AIDialogueRoleConfig } from '@chenzy-design/core';

  interface Props {
    chats: AIDialogueMessage[];
  }
  let { chats }: Props = $props();

  const roleConfig: AIDialogueRoleConfig = {
    user: { name: '我' },
    assistant: { name: '助手' },
  };
</script>

<AIChatDialogue
  {chats}
  {roleConfig}
  renderDialogueContentItem={{
    function_call: { get_weather: weatherToolBlock, search_web: searchToolBlock },
    default: defaultTextBlock,
  }}
/>

{#snippet weatherToolBlock()}
  <div data-testid="weather-tool">天气工具块</div>
{/snippet}

{#snippet searchToolBlock()}
  <div data-testid="search-tool">搜索工具块</div>
{/snippet}

{#snippet defaultTextBlock(text: string)}
  <div data-testid="default-block">默认块：{text}</div>
{/snippet}
