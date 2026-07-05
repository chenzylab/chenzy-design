/**
 * createAIChatInput headless — framework-agnostic logic for AIChatInput。
 * 对齐 Semi AIChatInput，纯逻辑（可单测），tiptap Editor 实例与 DOM 归 svelte 渲染层：
 * - 阶段 1：发送态判定（canSend）、快捷键判定（sendHotKey）、MessageContent 组装、doc→Content[] 归一。
 * - 阶段 2：suggestion 面板键盘导航（环绕 index）、suggestion/reference 显示文本归一。
 * - 阶段 3：skill 归一 / getSkillSlotHTML / skillHotKey 判定。
 * - 阶段 4：配置区 setField/removeField（不可变）。
 * - 阶段 5：Adapter 桥（messageToChatInput / chatInputToChatCompletion）接 AIChatDialogue / OpenAI API。
 * 见 specs/components/show/AIChatInput.spec.md §2/§4/§5。
 */
import type { AIDialogueMessage, ContentItem } from './ai-chat-dialogue.js';

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

/**
 * 引用块（阶段 2 渲染于编辑区上方 top area）。对齐 Semi Reference：
 * type='text' 时显示 content，其它类型显示 name；图片类型（type='image' 或 url 是图）显示缩略图。
 */
export interface AIChatInputReference {
  type: string;
  id: string;
  /** type='text' 时的文本内容。 */
  content?: string;
  /** 非文本类型的显示名。 */
  name?: string;
  /** 图片/文件的 URL（图片类型用作缩略图 src）。 */
  url?: string;
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

/** 零宽字符（对齐 Semi ZERO_WIDTH_CHAR）：inputSlot 空态占位锚点，归一时剔除。 */
export const AI_CHAT_INPUT_ZERO_WIDTH = '﻿';

/**
 * 递归抽取一个块内的纯文本（含 hardBreak → 换行）。内联自定义 slot 节点归一：
 * - selectSlot：取 attrs.value（用户选中的选项值）。
 * - skillSlot：取 attrs.label ?? attrs.value（技能显示文本）。
 * - inputSlot：取可编辑内容文本（剔零宽字符）；为空回退 attrs.placeholder。
 * 对齐 Semi transformSelectSlot / transformSkillSlot / transformInputSlot，使 slot 内容开箱进 content。
 */
function extractText(node: unknown): string {
  const n = node as
    | { type?: string; text?: string; content?: unknown[]; attrs?: Record<string, unknown> }
    | undefined;
  if (!n) return '';
  if (n.type === 'text') {
    const t = n.text ?? '';
    return t === AI_CHAT_INPUT_ZERO_WIDTH ? '' : t;
  }
  if (n.type === 'hardBreak') return '\n';
  if (n.type === 'selectSlot') {
    const v = n.attrs?.value;
    return typeof v === 'string' ? v : '';
  }
  if (n.type === 'skillSlot') {
    const label = n.attrs?.label ?? n.attrs?.value;
    return typeof label === 'string' ? label : '';
  }
  if (n.type === 'inputSlot') {
    const inner = Array.isArray(n.content) ? n.content.map(extractText).join('') : '';
    if (inner.length > 0) return inner;
    const ph = n.attrs?.placeholder;
    return typeof ph === 'string' ? ph : '';
  }
  if (Array.isArray(n.content)) return n.content.map(extractText).join('');
  return '';
}

// ————————————————————————————————————————————————————————————————
// 阶段 2 · 引用 + 建议
// ————————————————————————————————————————————————————————————————

/**
 * 建议项（对齐 Semi Suggestion）：纯字符串或含 content 字段的对象。
 * 面板点击/回车后把它交给 onSuggestClick，由消费方决定如何用（通常插入编辑器）。
 */
export type AIChatInputSuggestion = string | { content: string; [key: string]: unknown };

/** 取建议项的显示文本（string 直接返回，对象取 content）。 */
export function suggestionContent(suggestion: AIChatInputSuggestion): string {
  return typeof suggestion === 'string' ? suggestion : (suggestion?.content ?? '');
}

/**
 * 建议面板键盘导航：从 current 沿 dir（-1=上 / +1=下）环绕移动，返回新 activeIndex。
 * - len<=0 返回 -1（无项）。
 * - current<0（未选中）时：向下从 0 开始、向上从末项开始。
 */
export function nextSuggestionIndex(current: number, len: number, dir: -1 | 1): number {
  if (len <= 0) return -1;
  if (current < 0) return dir === 1 ? 0 : len - 1;
  return (current + dir + len) % len;
}

/**
 * 取引用项的显示文本：type='text' 用 content，否则用 name（缺省回退到 id）。
 */
export function referenceLabel(ref: AIChatInputReference): string {
  if (ref.type === 'text') return ref.content ?? '';
  return ref.name ?? ref.id;
}

/** 该引用是否应按图片渲染（type='image' 或 url 以常见图片扩展名结尾）。 */
export function isImageReference(ref: AIChatInputReference): boolean {
  if (ref.type === 'image') return true;
  const url = ref.url ?? '';
  return /\.(png|jpe?g|gif|bmp|webp|svg)(\?|#|$)/i.test(url);
}

// ————————————————————————————————————————————————————————————————
// 阶段 3 · 技能 + 模版
// ————————————————————————————————————————————————————————————————

/**
 * 技能项（对齐 Semi Skill/BaseSkill）：空编辑区按 skillHotKey 触发面板，选中后
 * 作为 skillSlot 节点插入编辑器。hasTemplate=true 的技能选中后可展开模版面板。
 * icon 由渲染层提供（Snippet/组件），此处只管数据。
 */
export interface AIChatInputSkill {
  /** 展示标签（skillSlot chip 显示，缺省回退 value）。 */
  label?: string;
  /** 技能值（唯一标识/插入值）。 */
  value?: string;
  /** 是否有配套模版（选中后展示模版按钮）。 */
  hasTemplate?: boolean;
  [key: string]: unknown;
}

/** 取技能项的显示文本（label 优先，回退 value，再回退空串）。 */
export function skillLabel(skill: AIChatInputSkill): string {
  return skill.label ?? skill.value ?? '';
}

/**
 * 生成 skillSlot 节点的 HTML（供 editor.setContent 插入）。对齐 Semi getSkillSlotString：
 * `<skill-slot data-label data-value data-template>`。属性值做 HTML 转义防注入。
 */
export function getSkillSlotHTML(skill: AIChatInputSkill): string {
  const attrs: string[] = [];
  if (skill.label) attrs.push(`data-label="${escapeAttr(skill.label)}"`);
  if (skill.value) attrs.push(`data-value="${escapeAttr(skill.value)}"`);
  if (typeof skill.hasTemplate === 'boolean') attrs.push(`data-template="${skill.hasTemplate}"`);
  return `<skill-slot ${attrs.join(' ')}></skill-slot>`;
}

/**
 * 生成 selectSlot 节点的 HTML（供 editor.setContent 插入，通常用于 renderTemplate 模版填空）。
 * 对齐 Semi selectSlot：`<select-slot options='["a","b"]' value="a">`。options 为 JSON 字符串。
 * @param options 可选项（string[]）
 * @param value   默认选中值（缺省空）
 */
export function getSelectSlotHTML(options: string[], value = ''): string {
  const optionsJson = escapeAttr(JSON.stringify(options));
  const attrs = [`options="${optionsJson}"`];
  if (value) attrs.push(`value="${escapeAttr(value)}"`);
  return `<select-slot ${attrs.join(' ')}></select-slot>`;
}

/**
 * 生成 inputSlot 节点的 HTML（供 editor.setContent 插入，用于 renderTemplate 模版填空的可编辑空格）。
 * 对齐 Semi inputSlot：`<input-slot placeholder="...">` 内含零宽字符作为空态光标锚点。
 * @param placeholder 空态占位提示
 * @param value 初始内容（缺省仅零宽锚点）
 */
export function getInputSlotHTML(placeholder = '', value = ''): string {
  const ph = placeholder ? ` placeholder="${escapeAttr(placeholder)}"` : '';
  const inner = value ? escapeHTML(value) : AI_CHAT_INPUT_ZERO_WIDTH;
  return `<input-slot${ph}>${inner}</input-slot>`;
}

/** HTML 文本内容转义（元素内容上下文）。 */
function escapeHTML(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** HTML 属性值转义（双引号上下文）。 */
function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * 是否应触发技能面板：编辑区为空、按下的键等于 skillHotKey、且有技能项。
 * 对齐 Semi：`oldValue === '' && e.key === skillHotKey && skills.length`。
 */
export function shouldOpenSkillPanel(params: {
  key: string;
  skillHotKey: string;
  isEmpty: boolean;
  skillCount: number;
}): boolean {
  const { key, skillHotKey, isEmpty, skillCount } = params;
  return isEmpty && key === skillHotKey && skillCount > 0;
}

// ————————————————————————————————————————————————————————————————
// 阶段 4 · 配置区（Configure）
// ————————————————————————————————————————————————————————————————

/** 配置区的值：字段名 → 任意值（对齐 Semi LeftMenuChangeProps / setup）。 */
export type AIChatInputConfigureValue = Record<string, unknown>;

/**
 * 配置区状态计算（纯函数，框架无关）。渲染层持有 value（$state），
 * 用这些函数算下一个 value —— 对齐 Semi Configure 的 onChange(obj)/onRemove(field)。
 */

/** 合并一个字段补丁到 value，返回新对象（不可变）。 */
export function setConfigureField(
  value: AIChatInputConfigureValue,
  patch: AIChatInputConfigureValue,
): AIChatInputConfigureValue {
  return { ...value, ...patch };
}

/** 从 value 移除一个字段，返回新对象（不可变；对齐 Semi onRemove）。 */
export function removeConfigureField(
  value: AIChatInputConfigureValue,
  field: string,
): AIChatInputConfigureValue {
  const next: AIChatInputConfigureValue = {};
  for (const key of Object.keys(value)) {
    if (key !== field) next[key] = value[key];
  }
  return next;
}

// ————————————————————————————————————————————————————————————————
// 阶段 5 · Adapter 桥（AIChatInput → AIChatDialogue / OpenAI API）
// ————————————————————————————————————————————————————————————————

/**
 * 附件是否应按图片处理。Attachment.type 是 'file'|'directory'（非 mime），故按
 * name/url 的图片扩展名判定。
 */
function isImageAttachment(att: AIChatInputAttachment): boolean {
  const s = `${att.url ?? ''} ${att.name ?? ''}`;
  return /\.(png|jpe?g|gif|bmp|webp|svg)(\?|#|\s|$)/i.test(s);
}

/**
 * messageToChatInput —— 把 AIChatInput 的 onMessageSend 载荷转成一条 AIDialogueMessage（user 角色），
 * 供直接 push 进 AIChatDialogue 的 chats 展示。对齐 OpenAI Response 输入消息形态：
 * content 为单个 InputMessage 块，其 content 数组含 input_text / input_image / input_file。
 *
 * @param message AIChatInput onMessageSend 载荷
 * @param opts.id  消息 id（AIChatDialogue 需唯一 id；调用方应提供，缺省 ''）
 * @param opts.model 可选模型标记
 */
export function messageToChatInput(
  message: AIChatInputMessageContent,
  opts: { id?: string; model?: string } = {},
): AIDialogueMessage {
  const parts: Array<Record<string, unknown>> = [];

  for (const c of message.inputContents ?? []) {
    const text = typeof c.text === 'string' ? c.text : '';
    if (text.length > 0) parts.push({ type: 'input_text', text });
  }
  for (const att of message.attachments ?? []) {
    if (isImageAttachment(att)) {
      parts.push({ type: 'input_image', image_url: att.url, file_id: att.uid });
    } else {
      parts.push({ type: 'input_file', filename: att.name, file_url: att.url, file_id: att.uid });
    }
  }

  const inputMessage: ContentItem = { type: 'message', role: 'user', content: parts } as ContentItem;
  const msg: AIDialogueMessage = { id: opts.id ?? '', role: 'user', content: [inputMessage] };
  if (opts.model !== undefined) msg.model = opts.model;
  return msg;
}

/** OpenAI ChatCompletion 请求里的一条 message（user）。content 为多模态 parts。 */
export interface ChatCompletionInputMessage {
  role: 'user';
  content: Array<Record<string, unknown>>;
}

/**
 * chatInputToChatCompletion —— 把 onMessageSend 载荷转成 OpenAI ChatCompletion 请求的 user message，
 * content 为多模态 parts（text / image_url / file）。供直接放进 messages 数组喂 API。
 * 纯文本可由调用方按需扁平化；这里统一产出 parts 数组，保真多模态。
 */
export function chatInputToChatCompletion(
  message: AIChatInputMessageContent,
): ChatCompletionInputMessage {
  const content: Array<Record<string, unknown>> = [];

  for (const c of message.inputContents ?? []) {
    const text = typeof c.text === 'string' ? c.text : '';
    if (text.length > 0) content.push({ type: 'text', text });
  }
  for (const att of message.attachments ?? []) {
    if (isImageAttachment(att)) {
      content.push({ type: 'image_url', image_url: { url: att.url } });
    } else {
      content.push({ type: 'file', file: { filename: att.name, file_data: att.url } });
    }
  }

  return { role: 'user', content };
}
