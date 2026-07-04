/**
 * Chat headless — framework-agnostic logic ported from Semi Design `ChatFoundation`
 * (semi-foundation/chat). Pure helpers + a small adapter-driven controller; the
 * svelte layer owns DOM (scroll container, wheel/resize listeners, upload widget).
 *
 * 严格对齐 Semi：
 * - 常量 ROLE / CHAT_ALIGN / MESSAGE_STATUS / MODE / SEND_HOT_KEY / SHOW_SCROLL_GAP=100 / SCROLL_ANIMATION_TIME=300。
 * - back-bottom 显隐阈值：scrollHeight - scrollTop - clientHeight <= SHOW_SCROLL_GAP → 隐藏。
 * - enableUpload 三态判定 getUploadProps（boolean → 三态同值；对象 → 缺省各 true；其它 → 全 true）。
 * - sendHotKey 判定 shouldSendOnEnter（enter：无 shift 才发；shift+enter：有 shift 才发）。
 * - onMessageSend 组装 content（无附件 → 纯文本 string；有附件 → Content[] 图片/文件分流）。
 * - clearContext 追加 divider（末尾已是 divider 则跳过）。
 * - delete/like/dislike/reset 的 chats 变换。
 *
 * See specs/components/show/Chat.spec.md §3 + semi-foundation/lib/es/chat/foundation.js。
 */

// ---------------------------------------------------------------------------
// 常量（对齐 Semi chat.constants）
// ---------------------------------------------------------------------------

/** 消息角色。 */
export const CHAT_ROLE = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
  DIVIDER: 'divider',
} as const;
export type ChatRole = (typeof CHAT_ROLE)[keyof typeof CHAT_ROLE];

/** 布局对齐。 */
export const CHAT_ALIGN = {
  LEFT_RIGHT: 'leftRight',
  LEFT_ALIGN: 'leftAlign',
} as const;
export type ChatAlign = (typeof CHAT_ALIGN)[keyof typeof CHAT_ALIGN];

/** 气泡模式。 */
export const CHAT_MODE = {
  BUBBLE: 'bubble',
  NO_BUBBLE: 'noBubble',
  USER_BUBBLE: 'userBubble',
} as const;
export type ChatMode = (typeof CHAT_MODE)[keyof typeof CHAT_MODE];

/** 消息状态。 */
export const MESSAGE_STATUS = {
  LOADING: 'loading',
  INCOMPLETE: 'incomplete',
  COMPLETE: 'complete',
  ERROR: 'error',
} as const;
export type MessageStatus = (typeof MESSAGE_STATUS)[keyof typeof MESSAGE_STATUS];

/** 发送快捷键。 */
export const SEND_HOT_KEY = {
  ENTER: 'enter',
  SHIFT_PLUS_ENTER: 'shift+enter',
} as const;
export type SendHotKey = (typeof SEND_HOT_KEY)[keyof typeof SEND_HOT_KEY];

/** 图片后缀与前缀（用于 onMessageSend 附件图片/文件分流）。 */
export const PIC_SUFFIX_ARRAY = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'] as const;
export const PIC_PREFIX = 'image/';

/** 返回底部按钮显隐阈值（px）。 */
export const SHOW_SCROLL_GAP = 100;
/** 滚动到底动画时长（ms）。 */
export const SCROLL_ANIMATION_TIME = 300;

// ---------------------------------------------------------------------------
// 类型（对齐 Semi chat.interface.d.ts / chat.foundation.d.ts）
// ---------------------------------------------------------------------------

/** 富内容片段。 */
export interface Content {
  type: 'text' | 'image_url' | 'file_url';
  text?: string;
  image_url?: {
    url: string;
    [x: string]: unknown;
  };
  file_url?: {
    url: string;
    name: string;
    size?: string | number;
    type?: string;
    [x: string]: unknown;
  };
}

/** 单条消息。 */
export interface Message {
  role?: string;
  name?: string;
  id?: string;
  content?: string | Content[];
  parentId?: string;
  createAt?: number;
  status?: MessageStatus;
  /** 用户反馈：赞。 */
  like?: boolean;
  /** 用户反馈：踩。 */
  dislike?: boolean;
  [x: string]: unknown;
}

/** 角色元数据。 */
export interface Metadata {
  name?: string;
  avatar?: unknown;
  color?: string;
  [x: string]: unknown;
}

/** 角色配置。 */
export interface RoleConfig {
  user?: Metadata;
  assistant?: Metadata;
  system?: Metadata;
  [x: string]: Metadata | undefined;
}

/** enableUpload 三态。 */
export interface EnableUploadProps {
  pasteUpload?: boolean;
  dragUpload?: boolean;
  clickUpload?: boolean;
}

/** 上传附件项（对齐 svelte/upload 的 UploadFileItem 的子集）。 */
export interface ChatAttachment {
  uid?: string;
  name?: string;
  size?: number | string;
  url?: string;
  status?: string;
  /** 原生 File 实例（用于 MIME 判定）。 */
  fileInstance?: { type?: string } | File;
  [x: string]: unknown;
}

// ---------------------------------------------------------------------------
// 纯函数（无副作用，直接单测）
// ---------------------------------------------------------------------------

/**
 * back-bottom 按钮是否应可见。
 * 对齐 Semi getScroll：距底部（scrollHeight - scrollTop - clientHeight）> SHOW_SCROLL_GAP → 显示。
 */
export function shouldShowBackBottom(
  scrollHeight: number,
  scrollTop: number,
  clientHeight: number,
  gap: number = SHOW_SCROLL_GAP,
): boolean {
  return scrollHeight - scrollTop - clientHeight > gap;
}

/**
 * enableUpload 三态归一（对齐 Semi getUploadProps）。
 * - boolean → 三态同值。
 * - 对象 → 缺省字段各默认 true。
 * - 其它（undefined 等）→ 全 true。
 */
export function resolveEnableUpload(
  enableUpload?: boolean | EnableUploadProps,
): Required<EnableUploadProps> {
  if (
    enableUpload !== null &&
    typeof enableUpload === 'object' &&
    Object.prototype.toString.call(enableUpload) === '[object Object]'
  ) {
    const { dragUpload = true, clickUpload = true, pasteUpload = true } = enableUpload;
    return { dragUpload, clickUpload, pasteUpload };
  }
  if (typeof enableUpload === 'boolean') {
    return {
      dragUpload: enableUpload,
      clickUpload: enableUpload,
      pasteUpload: enableUpload,
    };
  }
  return { dragUpload: true, clickUpload: true, pasteUpload: true };
}

/**
 * 按 sendHotKey 判定一次 Enter 是否应触发发送（对齐 Semi onEnterPress）。
 * - `'enter'`：按下 Shift 时不发送（换行）。
 * - `'shift+enter'`：未按 Shift 时不发送（换行）。
 */
export function shouldSendOnEnter(sendHotKey: SendHotKey, shiftKey: boolean): boolean {
  if (sendHotKey === SEND_HOT_KEY.SHIFT_PLUS_ENTER && shiftKey === false) {
    return false;
  }
  if (sendHotKey === SEND_HOT_KEY.ENTER && shiftKey === true) {
    return false;
  }
  return true;
}

/** 附件是否为图片（对齐 Semi：MIME 前缀 image/ 或后缀命中图片集）。 */
export function isImageAttachment(item: ChatAttachment): boolean {
  const name = typeof item.name === 'string' ? item.name : '';
  const suffix = name.split('.').pop()?.toLowerCase() ?? '';
  const mime =
    item.fileInstance && typeof (item.fileInstance as { type?: string }).type === 'string'
      ? (item.fileInstance as { type?: string }).type!
      : '';
  return mime.startsWith(PIC_PREFIX) || PIC_SUFFIX_ARRAY.includes(suffix as never);
}

/**
 * 组装一条发送消息的 content（对齐 Semi onMessageSend）。
 * - 无附件（attachment 为空数组）→ 返回纯文本 string。
 * - 有附件 → 返回 Content[]：先文本（若有），再各附件按图片/文件分流。
 */
export function buildSendContent(
  input: string,
  attachment?: ChatAttachment[],
): string | Content[] {
  if (Boolean(attachment) && attachment!.length === 0) {
    return input;
  }
  const content: Content[] = [];
  if (input) {
    content.push({ type: 'text', text: input });
  }
  for (const item of attachment ?? []) {
    const { name = '', url = '', size } = item;
    if (isImageAttachment(item)) {
      content.push({ type: 'image_url', image_url: { url } });
    } else {
      const fileType =
        item.fileInstance && typeof (item.fileInstance as { type?: string }).type === 'string'
          ? (item.fileInstance as { type?: string }).type
          : undefined;
      const file_url: NonNullable<Content['file_url']> = { url, name };
      if (size !== undefined) file_url.size = size;
      if (fileType !== undefined) file_url.type = fileType;
      content.push({ type: 'file_url', file_url });
    }
  }
  return content;
}

/**
 * clearContext：末尾追加一条 divider 消息（对齐 Semi clearContext）。
 * 若末尾已是 divider，则原样返回（不重复追加）。
 * id / createAt 由调用方注入（保持核心纯净、可测）。
 */
export function appendDivider(
  chats: Message[],
  makeId: () => string,
  now: () => number = Date.now,
): Message[] {
  const last = chats[chats.length - 1];
  if (last && last.role === CHAT_ROLE.DIVIDER) {
    return chats;
  }
  return [...chats, { role: CHAT_ROLE.DIVIDER, id: makeId(), createAt: now() }];
}

/** 构造一条 user 消息（对齐 Semi onMessageSend / onHintClick 的 newMessage）。 */
export function makeUserMessage(
  content: string | Content[],
  makeId: () => string,
  now: () => number = Date.now,
): Message {
  return {
    role: CHAT_ROLE.USER,
    id: makeId(),
    createAt: now(),
    content,
  };
}

/** 删除指定 id 的消息（对齐 Semi deleteMessage）。 */
export function deleteMessageFrom(chats: Message[], target: Message): Message[] {
  return chats.filter((item) => item.id !== target.id);
}

/**
 * 切换 like（对齐 Semi likeMessage）：目标消息 like 取反、dislike 置 false，其余不变。
 */
export function toggleLike(chats: Message[], target: Message): Message[] {
  const index = chats.findIndex((item) => item.id === target.id);
  if (index === -1) return chats;
  const current = chats[index]!;
  const next = [...chats];
  next[index] = { ...current, like: !current.like, dislike: false };
  return next;
}

/**
 * 切换 dislike（对齐 Semi dislikeMessage）：目标消息 dislike 取反、like 置 false，其余不变。
 */
export function toggleDislike(chats: Message[], target: Message): Message[] {
  const index = chats.findIndex((item) => item.id === target.id);
  if (index === -1) return chats;
  const current = chats[index]!;
  const next = [...chats];
  next[index] = { ...current, like: false, dislike: !current.dislike };
  return next;
}

/**
 * 重置最后一条消息为 loading（对齐 Semi resetMessage）：
 * 复制末条并置 status=loading / content='' / 新 id / 新 createAt，替换末条。
 */
export function resetLastMessage(
  chats: Message[],
  makeId: () => string,
  now: () => number = Date.now,
): Message[] {
  if (chats.length === 0) return chats;
  const last = chats[chats.length - 1];
  const reset: Message = {
    ...last,
    status: MESSAGE_STATUS.LOADING,
    content: '',
    id: makeId(),
    createAt: now(),
  };
  return chats.slice(0, -1).concat(reset);
}
