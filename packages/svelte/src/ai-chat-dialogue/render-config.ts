// AIChatDialogue 自定义渲染配置（对齐 Semi dialogueRenderConfig）。
// 各覆盖点为 Snippet；参数带 message / role 与 default*（默认渲染 Snippet），
// 消费方可选择性复用默认节点，或整块替换。
import type { Snippet } from 'svelte';
import type { AIDialogueMessage, AIDialogueMetadata } from '@chenzy-design/core';

/** 头像区自定义渲染参数。 */
export interface RenderAvatarProps {
  message: AIDialogueMessage;
  role?: AIDialogueMetadata | undefined;
  /** 默认头像节点（未自定义时的渲染）。 */
  defaultAvatar: Snippet;
}

/** 标题区自定义渲染参数。 */
export interface RenderTitleProps {
  message: AIDialogueMessage;
  role?: AIDialogueMetadata | undefined;
  defaultTitle: Snippet;
}

/** 内容区自定义渲染参数。 */
export interface RenderContentProps {
  message: AIDialogueMessage;
  role?: AIDialogueMetadata | undefined;
  defaultContent: Snippet;
}

/** 操作栏自定义渲染参数。 */
export interface RenderActionProps {
  message: AIDialogueMessage;
  defaultAction: Snippet;
}

/** 会话框各默认节点集合（供整块自定义时复用）。 */
export interface FullDialogueNodes {
  avatar: Snippet;
  title: Snippet;
  content: Snippet;
  action: Snippet;
}

/** 整块会话框自定义渲染参数。 */
export interface RenderFullDialogueProps {
  message: AIDialogueMessage;
  role?: AIDialogueMetadata | undefined;
  /** 默认的四个区块节点，可自由组合复用。 */
  defaultNodes: FullDialogueNodes;
}

/**
 * 自定义各区块渲染（对齐 Semi DialogueRenderConfig）。
 * 任一未提供则走默认渲染。renderFullDialogue 优先级最高，提供时整块交给它。
 */
export interface DialogueRenderConfig {
  /** 自定义渲染头像。 */
  renderDialogueAvatar?: Snippet<[RenderAvatarProps]>;
  /** 自定义渲染标题。 */
  renderDialogueTitle?: Snippet<[RenderTitleProps]>;
  /** 自定义渲染内容区。 */
  renderDialogueContent?: Snippet<[RenderContentProps]>;
  /** 自定义渲染操作栏。 */
  renderDialogueAction?: Snippet<[RenderActionProps]>;
  /** 完全自定义渲染整个会话框。 */
  renderFullDialogue?: Snippet<[RenderFullDialogueProps]>;
}
