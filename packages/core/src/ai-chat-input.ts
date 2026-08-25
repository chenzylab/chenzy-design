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
  /**
   * 类型标记。对齐 Semi：这里**不是**枚举，而是「后缀或 mime 尾段」——
   * getAttachmentType 优先取本字段，缺省时才从 name 后缀 / fileInstance.type 推导。
   */
  type?: string;
  /** 原始 File（Upload 透传），用于按 mime 判定图片与推导类型。 */
  fileInstance?: { type?: string };
  /** 上传进度百分比（配合 status='uploading' 显示环形进度）。 */
  percent?: number;
  [key: string]: unknown;
}

/**
 * 引用块（阶段 2 渲染于编辑区上方 top area）。对齐 Semi Reference：
 * type='text' 时显示 content，其它类型显示 name；图片按 isImageType 判定后显示缩略图。
 */
export interface AIChatInputReference {
  /**
   * 类型标记。**可选**：缺省时由 getAttachmentType 从 name 后缀推导
   * （如 `飞书文档.docx` → docx → word 图标）。
   *
   * Semi 的 TS 声明把它写成必填，但其官方 demo 的引用项大多不带 type、纯靠后缀推导
   * （其 demo 是无类型 JSX，编译期查不出来）。本库按**实际契约**声明为可选，
   * 否则用户照着 Semi 文档写就会被类型报错。
   */
  type?: string;
  id: string;
  /** type='text' 时的文本内容。 */
  content?: string;
  /** 非文本类型的显示名。 */
  name?: string;
  /** 图片/文件的 URL（图片类型用作缩略图 src）。 */
  url?: string;
  /** 原始 File，用于按 mime 判定图片与推导类型（与附件共用 isImageType/getAttachmentType）。 */
  fileInstance?: { type?: string };
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

/** 零宽字符（对齐 Semi ZERO_WIDTH_CHAR）：inputSlot 空态占位锚点，归一时剔除。 */
export const AI_CHAT_INPUT_ZERO_WIDTH = '﻿';

type DocNode = {
  type?: string;
  text?: string;
  content?: DocNode[];
  attrs?: Record<string, unknown>;
};

/**
 * 单节点 → AIChatInputContent（对齐 Semi transformText/transformSelectSlot/
 * transformSkillSlot/transformInputSlot/transformHardBreak）。
 * 只有 skillSlot 保留为结构化对象（type/value/label/hasTemplate），
 * 其余（text/selectSlot/inputSlot/hardBreak）一律转成 `{type:'text', text}`，
 * 供 traverse 与相邻文本块合并。
 */
function transformNode(node: DocNode): AIChatInputContent | undefined {
  switch (node.type) {
    case 'text': {
      const t = node.text ?? '';
      return { type: 'text', text: t === AI_CHAT_INPUT_ZERO_WIDTH ? '' : t };
    }
    case 'hardBreak':
      return { type: 'text', text: '\n' };
    case 'selectSlot': {
      const v = node.attrs?.value;
      return { type: 'text', text: typeof v === 'string' ? v : '' };
    }
    case 'skillSlot': {
      const { value, label, hasTemplate } = node.attrs ?? {};
      const out: AIChatInputContent = { type: 'skillSlot' };
      if (value !== undefined) out.value = value;
      if (label !== undefined) out.label = label;
      if (hasTemplate !== undefined) out.hasTemplate = hasTemplate;
      return out;
    }
    case 'inputSlot': {
      const first = node.content?.[0];
      const text = first?.text ?? '';
      const usePlaceholder = text === AI_CHAT_INPUT_ZERO_WIDTH || text.length === 0;
      return { type: 'text', text: usePlaceholder ? (node.attrs?.placeholder ?? '') : text };
    }
    default:
      return undefined;
  }
}

/**
 * 把 tiptap 文档 JSON 归一为 AIChatInputContent[]。对齐 Semi transformJSONResult：
 * 递归遍历 doc→paragraph→叶子节点，paragraph 之间插入 `\n`（与前一个 text 块合并，
 * 无前项则单独追加），叶子节点转换结果为 text 时与末项 text 合并、为空丢弃；
 * skillSlot 转换结果保留为独立结构化对象，不与相邻文本合并。
 * transformer（Map<nodeType, fn>）覆盖特定节点的转换（对齐 Semi transformer 参数，
 * 在内置 transformMap 之后兜底，即内置类型优先——与 Semi transformJSONResult 一致）。
 */
export function transformDocToContents(
  json: unknown,
  transformer?: Map<string, (node: unknown) => AIChatInputContent>,
): AIChatInputContent[] {
  const doc = json as DocNode | undefined;
  if (!doc) return [];
  const output: AIChatInputContent[] = [];

  const push = (result: AIChatInputContent): void => {
    if (result.type === 'text') {
      const last = output[output.length - 1];
      if (last && last.type === 'text') {
        last.text = `${last.text as string}${result.text as string}`;
        return;
      }
      if (typeof result.text === 'string') {
        if (result.text.length > 0) output.push(result);
        return;
      }
      output.push(result);
      return;
    }
    output.push(result);
  };

  const traverse = (node: DocNode): void => {
    const content = node.content ?? [];
    if (node.type === 'doc') {
      content.forEach(traverse);
      return;
    }
    if (node.type === 'paragraph') {
      if (output.length > 0) {
        const last = output[output.length - 1];
        if (last && last.type === 'text') last.text = `${last.text as string}\n`;
        else output.push({ type: 'text', text: '\n' });
      }
      content.forEach(traverse);
      return;
    }
    const result = transformNode(node) ?? transformer?.get(node.type ?? '')?.(node);
    if (result) push(result);
  };

  traverse(doc);
  return output;
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

/** 图片 mime 前缀（对齐 Semi strings.PIC_PREFIX）。 */
export const AI_CHAT_INPUT_PIC_PREFIX = 'image/';

/** 按图片处理的后缀白名单（对齐 Semi strings.PIC_SUFFIX_ARRAY，逐条一致，不含 svg）。 */
export const AI_CHAT_INPUT_PIC_SUFFIX = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'];

/**
 * 取附件/引用的类型标记（对齐 Semi getAttachmentType）：
 * 显式 type 优先，其次取 name 的后缀，再退到 fileInstance.type 的尾段，最后 'UNKNOWN'。
 */
export function getAttachmentType(item: AIChatInputAttachment | AIChatInputReference): string {
  const { type, name, fileInstance } = item;
  if (type) return type;
  const suffix = name?.split('.').pop();
  return suffix ?? fileInstance?.type?.split('/').pop() ?? 'UNKNOWN';
}

/**
 * 是否按图片渲染（对齐 Semi isImageType）：fileInstance.type 以 image/ 开头，
 * 或 name 的后缀命中图片白名单。
 *
 * 注意与 Semi 一致地**只看 name 不看 url**，且白名单不含 svg。
 */
export function isImageType(item: AIChatInputAttachment | AIChatInputReference): boolean {
  const { name, fileInstance } = item;
  const suffix = name?.split('.').pop();
  return (
    Boolean(fileInstance?.type?.startsWith(AI_CHAT_INPUT_PIC_PREFIX)) ||
    (suffix !== undefined && AI_CHAT_INPUT_PIC_SUFFIX.includes(suffix))
  );
}

/**
 * 后缀 → 图标分类（对齐 Semi getContentType，逐条照搬）。
 *
 * `ts` 在 Semi 的 Map 里出现两次（code 与 video），Map 后写覆盖前写故实际取 'video'。
 * 这是 Semi 的既定行为，作为契约照搬，不"修正"。
 */
export function getContentType(type: string): string {
  return AI_CHAT_INPUT_CONTENT_TYPE_MAP.get(type) ?? 'unknown';
}

const AI_CHAT_INPUT_CONTENT_TYPE_MAP = new Map<string, string>([
  // 文档
  ['docx', 'word'], ['doc', 'word'], ['txt', 'word'], ['epub', 'word'], ['mobi', 'word'],
  // 代码
  ['js', 'code'], ['ts', 'code'], ['jsx', 'code'], ['tsx', 'code'], ['java', 'code'],
  ['py', 'code'], ['c', 'code'], ['cpp', 'code'], ['go', 'code'], ['rust', 'code'],
  ['php', 'code'], ['sql', 'code'], ['html', 'code'], ['css', 'code'], ['scss', 'code'],
  ['less', 'code'], ['md', 'code'], ['json', 'code'],
  // 表格 / 演示
  ['xlsx', 'excel'], ['xls', 'excel'], ['pptx', 'ppt'], ['ppt', 'ppt'],
  // 视频
  ['mp4', 'video'], ['mkv', 'video'], ['avi', 'video'], ['mov', 'video'], ['wmv', 'video'],
  ['prores', 'video'], ['flv', 'video'], ['ts', 'video'], ['webm', 'video'], ['3gp', 'video'],
  // 音频
  ['flac', 'audio'], ['wav', 'audio'], ['alac', 'audio'], ['ape', 'audio'], ['mp3', 'audio'],
  ['aac', 'audio'], ['ogg', 'audio'], ['wma', 'audio'], ['m4a', 'audio'], ['amr', 'audio'],
  ['midi', 'audio'],
  // 图片
  ['png', 'image'], ['jpg', 'image'], ['jpeg', 'image'], ['gif', 'image'], ['bmp', 'image'],
  ['webp', 'image'],
  // pdf
  ['pdf', 'pdf'],
]);

/** 该引用是否应按图片渲染。对齐 Semi：引用与附件共用 isImageType。 */
export function isImageReference(ref: AIChatInputReference): boolean {
  return isImageType(ref);
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
  /**
   * 技能项前置图标（对齐 Semi `Skill.icon?: ReactNode`）。
   * core 是无框架层，故此处只声明为未知；Svelte 侧按 Snippet 渲染。
   */
  icon?: unknown;
  [key: string]: unknown;
}

/** 取技能项的显示文本（label 优先，回退 value，再回退空串）。 */
export function skillLabel(skill: AIChatInputSkill): string {
  return skill.label ?? skill.value ?? '';
}

/**
 * 从编辑器 HTML 反解析 skillSlot（对齐 Semi findSkillSlotInString）。
 * 供 onContentChange 时同步 currentSkill 状态——不论 skillSlot 是通过技能面板选中插入的，
 * 还是用户直接 setContent() 注入 `<skill-slot data-value=... data-label=...>` 字符串，
 * 内容变化后都应据此更新技能追踪状态（Semi handleContentChange 的行为）。
 * 无 data-value 视为无效技能标记，返回 undefined。
 */
export function findSkillSlotInString(html: string): AIChatInputSkill | undefined {
  const match = /<skill-slot\s+([^>]*)><\/skill-slot>/i.exec(html);
  if (!match) return undefined;
  const attrs: Record<string, string> = {};
  const attrRe = /([\w-]+)=["']([^"']*)["']/g;
  let attrMatch: RegExpExecArray | null;
  while ((attrMatch = attrRe.exec(match[1] ?? '')) !== null) {
    attrs[attrMatch[1] as string] = attrMatch[2] as string;
  }
  if (!attrs['data-value']) return undefined;
  const skill: AIChatInputSkill = { value: attrs['data-value'] };
  if (attrs['data-label']) skill.label = attrs['data-label'];
  if (attrs['data-template']) skill.hasTemplate = attrs['data-template'] === 'true';
  return skill;
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

/**
 * tiptap 自定义节点 `isCustomSlot` 属性描述（对齐 Semi `AIChatInput.getCustomSlotAttribute` /
 * `getCustomSlotAttribute`）。用户自定义扩展（如 docSlot）接入 AIChatInput 的光标/零宽字符
 * plugin 时需要这个属性标记：`addAttributes() { return { isCustomSlot: getCustomSlotAttribute() } }`。
 * parseHTML 恒真（该类节点从 HTML 反解析时总归一为 isCustomSlot），renderHTML 输出
 * `data-custom-slot` 供 CSS/调试选择器命中。
 */
export function getCustomSlotAttribute(): {
  default: boolean;
  parseHTML: (element: unknown) => boolean;
  renderHTML: (attributes: { isCustomSlot?: boolean }) => Record<string, unknown>;
} {
  return {
    default: true,
    parseHTML: () => true,
    renderHTML: (attributes) => ({
      'data-custom-slot': attributes.isCustomSlot ? true : undefined,
    }),
  };
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

/** 附件是否应按图片处理。与渲染层共用 Semi 的 isImageType，避免两套判定漂移。 */
function isImageAttachment(att: AIChatInputAttachment): boolean {
  return isImageType(att);
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
