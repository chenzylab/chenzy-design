/**
 * createAIChatInput headless — framework-agnostic logic for AIChatInput 阶段 1（基础输入）。
 * 对齐 Semi AIChatInput：发送态判定（canSend）、快捷键判定（sendHotKey）、
 * MessageContent 组装。tiptap Editor 实例与 DOM 归 svelte 渲染层，这里只做纯逻辑，可单测。
 * 见 specs/components/show/AIChatInput.spec.md §2/§4。
 */

/** 富文本输出块（tiptap JSON 经 transformer 归一后的一段内容）。阶段 1 为纯文本段。 */
export interface AIChatInputContent {
  type: string;
  [key: string]: unknown;
}

/** 上传附件（对齐 Semi Attachment，阶段 1 仅透传，不解析 children）。 */
export interface AIChatInputAttachment {
  uid?: string;
  name?: string;
  status?: string;
  size?: string | number;
  url?: string;
  type?: 'file' | 'directory';
  [key: string]: unknown;
}

/** 引用块（阶段 2 引入渲染，阶段 1 仅作为 MessageContent 透传占位）。 */
export interface AIChatInputReference {
  type: string;
  id: string;
  [key: string]: unknown;
}

/** onMessageSend 载荷，对齐 Semi MessageContent。 */
export interface AIChatInputMessageContent {
  references?: AIChatInputReference[];
  attachments?: AIChatInputAttachment[];
  inputContents?: AIChatInputContent[];
  setup?: Record<string, unknown>;
}

/** 发送快捷键：enter = Enter 发送 / Shift+Enter 换行；shift+enter 则相反。 */
export type AIChatInputSendHotKey = 'enter' | 'shift+enter';

/** onContentChange 载荷（阶段 1：纯文本 + html + json）。 */
export interface AIChatInputChangePayload {
  text: string;
  html: string;
  json: unknown;
}

/**
 * 判定一次 Enter 键是否应触发发送（而非换行）。
 * - sendHotKey='enter'：裸 Enter 发送，Shift+Enter 换行。
 * - sendHotKey='shift+enter'：Shift+Enter 发送，裸 Enter 换行。
 * IME 组字中（composing）永不发送，交由渲染层前置拦截。
 */
export function isSendHotKey(
  key: string,
  shiftKey: boolean,
  sendHotKey: AIChatInputSendHotKey,
): boolean {
  if (key !== 'Enter') return false;
  return sendHotKey === 'enter' ? !shiftKey : shiftKey;
}

/**
 * 解析当前是否可发送。
 * - 显式传入 canSend（受控）时直接返回它。
 * - 否则：富文本非空 或 有附件 即可发送。
 */
export function resolveCanSend(params: {
  canSend?: boolean | undefined;
  isEmpty: boolean;
  attachments?: AIChatInputAttachment[] | undefined;
}): boolean {
  const { canSend, isEmpty, attachments } = params;
  if (canSend !== undefined) return canSend;
  const validRichText = !isEmpty;
  const validAttachment = Array.isArray(attachments) && attachments.length > 0;
  return validRichText || validAttachment;
}

/** 组装 onMessageSend 载荷。空字段省略，保持载荷精简。 */
export function buildMessageContent(params: {
  inputContents?: AIChatInputContent[] | undefined;
  attachments?: AIChatInputAttachment[] | undefined;
  references?: AIChatInputReference[] | undefined;
  setup?: Record<string, unknown> | undefined;
}): AIChatInputMessageContent {
  const { inputContents, attachments, references, setup } = params;
  const msg: AIChatInputMessageContent = {};
  if (inputContents && inputContents.length > 0) msg.inputContents = inputContents;
  if (attachments && attachments.length > 0) msg.attachments = attachments;
  if (references && references.length > 0) msg.references = references;
  if (setup && Object.keys(setup).length > 0) msg.setup = setup;
  return msg;
}

/**
 * 把 tiptap 文档 JSON 归一为 AIChatInputContent[]（阶段 1）。
 * 阶段 1 只有段落文本：每个顶层块产出一段 `{ type:'text', text }`，空段丢弃。
 * transformer（Map<nodeType, fn>）可覆盖特定节点的转换（对齐 Semi transformer）。
 * 阶段 2+ 的 input-slot/select-slot 节点在此扩展。
 */
export function transformDocToContents(
  json: unknown,
  transformer?: Map<string, (node: unknown) => AIChatInputContent>,
): AIChatInputContent[] {
  const doc = json as { content?: Array<{ type?: string; content?: unknown[] }> } | undefined;
  if (!doc || !Array.isArray(doc.content)) return [];
  const out: AIChatInputContent[] = [];
  for (const block of doc.content) {
    const t = block?.type ?? '';
    const override = transformer?.get(t);
    if (override) {
      out.push(override(block));
      continue;
    }
    const text = extractText(block);
    if (text.length > 0) out.push({ type: 'text', text });
  }
  return out;
}

/** 递归抽取一个块内的纯文本（含 hardBreak → 换行）。 */
function extractText(node: unknown): string {
  const n = node as { type?: string; text?: string; content?: unknown[] } | undefined;
  if (!n) return '';
  if (n.type === 'text') return n.text ?? '';
  if (n.type === 'hardBreak') return '\n';
  if (Array.isArray(n.content)) return n.content.map(extractText).join('');
  return '';
}
