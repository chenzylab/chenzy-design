<!--
  DialogueAvatar — 会话框头像（1:1 对齐 Semi widgets/dialogueAvatar.tsx）。

  拆成独立文件是为了跟 Semi 的文件结构一致：Semi 把它单独放在 widgets/ 下，
  本库原来内联在 DialogueBox.svelte 里当 defaultAvatar snippet。

  逐条对齐 Semi：复用 Avatar，size="extra-small"；continueSend（连续同角色发言）
  时挂 -avatar-hidden（visibility:hidden 占位但不显示）。
-->
<script lang="ts">
  import type { AIDialogueMetadata } from '@chenzy-design/core';
  import { Avatar } from '../avatar/index.js';

  interface Props {
    role?: AIDialogueMetadata | undefined;
    /** 与上一条同角色的连续发言：头像占位但不显示（对齐 Semi continueSend）。 */
    continueSend?: boolean;
  }

  let { role, continueSend = false }: Props = $props();

  const avatarCls = $derived(
    ['cd-ai-chat-dialogue-avatar', continueSend && 'cd-ai-chat-dialogue-avatar-hidden']
      .filter(Boolean)
      .join(' '),
  );

  // 头像：有 avatar 用图，否则色块 + 首字（role.name 首字母大写）。
  const avatarInitial = $derived((role?.name ?? '').slice(0, 1).toUpperCase());
</script>

<!-- alt 取角色名：本库 Avatar 的文字/图片模式都带 role="img"，没有可访问名会触发
     axe role-img-alt（serious）。Semi 侧 demo 只传 src 不传 alt，那是它的 demo 疏漏，
     不是可照搬的契约——这里补上真实可访问名。 -->
{#if role?.avatar}
  <Avatar class={avatarCls} src={role.avatar} alt={role?.name ?? ''} size="extra-small" />
{:else}
  <Avatar class={avatarCls} alt={role?.name ?? ''} size="extra-small">
    {avatarInitial}
  </Avatar>
{/if}

<style>
  /* Semi &-avatar 只有这三条：圆角/底色/文字样式都由复用的 Avatar 组件承担。
     必须 :global —— 类名挂在子组件 Avatar 的根节点上，scoped 规则匹配不到。 */
  :global(.cd-ai-chat-dialogue-avatar) {
    flex-shrink: 0;
    width: var(--cd-width-ai-chat-dialogue-avatar);
    height: var(--cd-height-ai-chat-dialogue-avatar);
  }

  /* Semi &-avatar-hidden：continueSend 时占位但不显示。 */
  :global(.cd-ai-chat-dialogue-avatar-hidden) {
    visibility: hidden;
  }
</style>
