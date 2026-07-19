<!--
  ChatBoxAvatar — 消息头像（严格对齐 Semi chat/chatBox/chatBoxAvatar.tsx）。
  用本库 Avatar 组件；renderChatBoxAvatar 可覆盖（提供 defaultAvatar 供包裹）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { Message, Metadata } from '@chenzy-design/core';
  import Avatar from '../avatar/Avatar.svelte';
  import type { RenderAvatarProps } from './types.js';

  interface Props {
    message: Message;
    role?: Metadata | undefined;
    title: string;
    renderChatBoxAvatar?: Snippet<[RenderAvatarProps]> | undefined;
  }

  let { message, role, title, renderChatBoxAvatar }: Props = $props();
</script>

{#if renderChatBoxAvatar}
  {@render renderChatBoxAvatar({ message, role, defaultAvatar })}
{:else}
  {@render defaultAvatar()}
{/if}

{#snippet defaultAvatar()}
  {@const avatarSrc = typeof role?.avatar === 'string' ? role.avatar : ''}
  {@const avatarStyle =
    role?.color && typeof role.avatar !== 'string' ? `background:${role.color};` : ''}
  <Avatar
    class="cd-chat-chatBox-avatar"
    size="extra-small"
    src={avatarSrc}
    alt={title}
    style={avatarStyle}
  >
    {(title || '?').slice(0, 1).toUpperCase()}
  </Avatar>
{/snippet}
