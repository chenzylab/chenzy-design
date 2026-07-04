/**
 * Chat svelte 层公共类型（对齐 Semi chat.interface.d.ts，render props → Svelte snippet 参数对象）。
 * 消息模型 / RoleConfig / Metadata 复用 core 的类型（单一事实源）。
 */
import type { Snippet } from 'svelte';
import type {
  Message,
  Metadata,
  RoleConfig,
  Content,
  ChatAlign,
  ChatMode,
  SendHotKey,
  EnableUploadProps,
  ChatAttachment,
} from '@chenzy-design/core';
import type { UploadFileItem } from '../upload/types.js';

export type { Message, Metadata, RoleConfig, Content, ChatAttachment };
export type { ChatAlign, ChatMode, SendHotKey, EnableUploadProps };

/** renderInputArea snippet 参数（对齐 Semi RenderInputAreaProps）。 */
export interface RenderInputAreaProps {
  /** 默认输入区节点（供包裹）。 */
  defaultNode?: Snippet;
  /** 触发发送。 */
  onSend: (content?: string, attachment?: UploadFileItem[]) => void;
  /** 触发清除上下文。 */
  onClear?: () => void;
}

/** renderChatBoxTitle snippet 参数。 */
export interface RenderTitleProps {
  message?: Message;
  role?: Metadata;
  /** 默认标题节点。 */
  defaultTitle?: Snippet;
}

/** renderChatBoxAvatar snippet 参数。 */
export interface RenderAvatarProps {
  message?: Message;
  role?: Metadata;
  /** 默认头像节点。 */
  defaultAvatar?: Snippet;
}

/** renderChatBoxContent snippet 参数。 */
export interface RenderContentProps {
  message?: Message;
  role?: Metadata;
  /** 默认内容节点。 */
  defaultContent?: Snippet;
  className?: string;
}

/** 默认操作节点集合（对齐 Semi DefaultActionNodeObj）。 */
export interface DefaultActionNodes {
  copy?: Snippet;
  like?: Snippet;
  dislike?: Snippet;
  reset?: Snippet;
  delete?: Snippet;
}

/** renderChatBoxAction snippet 参数。 */
export interface RenderActionProps {
  message?: Message;
  /** 默认操作区节点。 */
  defaultActions?: Snippet;
  className?: string;
  /** 拆分的默认操作节点，供自定义排布。 */
  defaultActionsObj?: DefaultActionNodes;
}

/** 完整 chatBox 各部分节点（对齐 Semi FullChatBoxNodes）。 */
export interface FullChatBoxNodes {
  avatar?: Snippet;
  title?: Snippet;
  content?: Snippet;
  action?: Snippet;
}

/** renderFullChatBox snippet 参数。 */
export interface RenderFullChatBoxProps {
  message?: Message;
  role?: Metadata;
  defaultNodes?: FullChatBoxNodes;
  className?: string;
}

/** renderHintBox snippet 参数（对齐 Semi renderHintBox props）。 */
export interface RenderHintBoxProps {
  content: string;
  index: number;
  onHintClick: () => void;
}
