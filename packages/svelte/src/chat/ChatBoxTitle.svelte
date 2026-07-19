<!--
  ChatBoxTitle — 消息标题（角色名，严格对齐 Semi chat/chatBox/chatBoxTitle.tsx）。
  renderChatBoxTitle 可覆盖（提供 defaultTitle 供包裹）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { Message, Metadata } from '@chenzy-design/core';
  import type { RenderTitleProps } from './types.js';

  interface Props {
    message: Message;
    role?: Metadata | undefined;
    title: string;
    renderChatBoxTitle?: Snippet<[RenderTitleProps]> | undefined;
  }

  let { message, role, title, renderChatBoxTitle }: Props = $props();
</script>

{#if renderChatBoxTitle}
  {@render renderChatBoxTitle({ message, role, defaultTitle })}
{:else}
  {@render defaultTitle()}
{/if}

{#snippet defaultTitle()}
  {#if title}
    <div class="cd-chat-chatBox-title">{title}</div>
  {/if}
{/snippet}

<style>
  .cd-chat-chatBox-title {
    line-height: var(--cd-chat-chatBox-title-line-height);
    font-size: var(--cd-chat-chatBox-title-font-size);
    color: var(--cd-chat-chatBox-title);
    font-weight: var(--cd-chat-chatBox-title-font-weight);
    text-overflow: ellipsis;
  }
</style>
