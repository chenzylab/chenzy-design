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
    /** 连续同角色消息（对齐 Semi continueSend），挂 -avatar-hidden class。 */
    continueSend?: boolean;
    renderChatBoxAvatar?: Snippet<[RenderAvatarProps]> | undefined;
  }

  let { message, role, continueSend = false, renderChatBoxAvatar }: Props = $props();
</script>

{#if renderChatBoxAvatar}
  {@render renderChatBoxAvatar({ message, role, defaultAvatar })}
{:else}
  {@render defaultAvatar()}
{/if}

{#snippet defaultAvatar()}
  {@const isAvatarString = typeof role?.avatar === 'string'}
  {@const avatarStyle = role?.color && !isAvatarString ? `background:${role.color};` : ''}
  {@const avatarClass =
    continueSend ? 'cd-chat-chatBox-avatar cd-chat-chatBox-avatar-hidden' : 'cd-chat-chatBox-avatar'}
  {#if !isAvatarString && role?.avatar}
    <Avatar class={avatarClass} size="extra-small" style={avatarStyle}>
      {@render (role.avatar as Snippet)()}
    </Avatar>
  {:else}
    <Avatar
      class={avatarClass}
      size="extra-small"
      src={isAvatarString ? (role?.avatar as string) : ''}
      style={avatarStyle}
    />
  {/if}
{/snippet}
