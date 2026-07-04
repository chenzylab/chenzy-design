/**
 * AIChatDialogue headless — OpenAI Response Object 消息格式类型 + 数据 Adapter。
 * 框架无关（无 DOM / 无组件依赖）。渲染层（svelte）消费这些类型与转换函数。
 * 对齐 Semi `@douyinfe/semi-foundation/aiChatDialogue`（foundation + dataAdapter）。
 * 见 specs/components/show/AIChatDialogue.spec.md。
 *
 * 本文件实现 §13 的「本次范围」：类型全谱 + 非流式 Adapter
 * （responseToMessage / chatCompletionToMessage）。流式 Adapter 为 P1，见 spec 登记。
 */

// —— 消息状态（对齐 OpenAI Response API status）——
export type AIMessageStatus =
  | 'queued'
  | 'in_progress'
  | 'incomplete'
  | 'completed'
  | 'failed'
  | 'cancelled';

// —— ContentItem 类型谱（对齐 Semi foundation）——
export interface CommonContentItem {
  id?: string;
  type?: string;
  status?: string;
  role?: string;
}

export interface InputText {
  type?: string;
  text?: string;
}
export interface InputImage {
  type?: string;
  image_url?: string;
  file_id?: string;
  detail?: string;
}
export interface InputFile {
  type?: string;
  file_id?: string;
  filename?: string;
  file_data?: string;
  file_url?: string;
}
export interface InputAudio {
  type?: string;
  input_audio?: { data?: string; format?: string };
}

export interface InputMessage extends CommonContentItem {
  content?: string | (InputText | InputImage | InputFile | InputAudio)[];
}
export interface ItemReference extends CommonContentItem {
  file_id?: string;
}

export interface URLCitation {
  type?: string;
  url?: string;
  title?: string;
  start_index?: number;
  end_index?: number;
}
export type Annotation = URLCitation | Record<string, unknown>;

export interface OutputText {
  type?: string;
  text?: string;
  annotations?: Annotation[];
}
export interface Refusal extends CommonContentItem {
  type?: string;
  refusal?: string;
}
export interface OutputMessage extends CommonContentItem {
  content?: (OutputText | Refusal)[];
}

export interface Reasoning extends CommonContentItem {
  summary?: { type?: string; text?: string }[];
  content?: { type?: string; text?: string }[];
}

/** 工具调用块（function / custom / file_search / web_search / image_generation / mcp 等）。 */
export interface ToolCallContentItem extends CommonContentItem {
  name?: string;
  arguments?: string;
  call_id?: string;
  [x: string]: unknown;
}

/** 兜底：任意自定义块（对齐 Semi CustomObject）。 */
export type CustomContentItem = { type?: string; [key: string]: unknown };

export type ContentItem =
  | InputMessage
  | ItemReference
  | OutputMessage
  | ToolCallContentItem
  | Reasoning
  | CustomContentItem;

// —— Message ——
export interface AIDialogueMessage {
  id: string;
  content?: string | ContentItem[];
  output_text?: string;
  role: string;
  name?: string;
  createdAt?: number;
  updatedAt?: number;
  model?: string;
  status?: AIMessageStatus | string;
  [x: string]: unknown;
}

// —— 角色配置 ——
export interface AIDialogueMetadata {
  name?: string;
  avatar?: string;
  color?: string;
  [x: string]: unknown;
}
export interface AIDialogueRoleConfig {
  user?: AIDialogueMetadata | Map<string, AIDialogueMetadata>;
  assistant?: AIDialogueMetadata | Map<string, AIDialogueMetadata>;
  system?: AIDialogueMetadata | Map<string, AIDialogueMetadata>;
  [role: string]: AIDialogueMetadata | Map<string, AIDialogueMetadata> | undefined;
}

// —— Reference（引用）——
export interface AIDialogueReference {
  id?: string | number;
  type?: string;
  name?: string;
  url?: string;
  content?: string;
}

// ————————————————————————————————————————————————
// 数据 Adapter（非流式，对齐 Semi dataAdapter）
// ————————————————————————————————————————————————

/** OpenAI Response Object 的最小结构（仅取用到的字段）。 */
export interface OpenAIResponseObject {
  id: string;
  model?: string;
  status?: string;
  output?: ContentItem[];
  output_text?: string;
  created_at?: number;
  [x: string]: unknown;
}

/**
 * Response Object → Message（对齐 Semi responseToMessage）。
 * 非流式：直接把 output 作为 content，assistant 角色。
 */
export function responseToMessage(response: OpenAIResponseObject): AIDialogueMessage {
  // exactOptionalPropertyTypes：仅在有值时写入 optional 字段，避免显式 undefined。
  const msg: AIDialogueMessage = { id: response.id, role: 'assistant' };
  if (response.output !== undefined) msg.content = response.output;
  if (response.created_at !== undefined) msg.createdAt = response.created_at;
  if (response.output_text !== undefined) msg.output_text = response.output_text;
  if (response.model !== undefined) msg.model = response.model;
  if (response.status !== undefined) msg.status = response.status;
  return msg;
}

/** ChatCompletion 的最小结构。 */
export interface ChatCompletionMessage {
  role: string;
  content?: string;
  refusal?: string;
  annotations?: ({ type?: string; url_citation?: URLCitation } & Record<string, unknown>)[];
  function_call?: { name?: string; arguments?: string; [x: string]: unknown };
  tool_calls?: {
    type?: string;
    function?: { name?: string; arguments?: string; [x: string]: unknown };
    custom?: Record<string, unknown>;
    [x: string]: unknown;
  }[];
  audio?: Record<string, unknown>;
  [x: string]: unknown;
}
export interface ChatCompletionObject {
  id: string;
  choices: { message: ChatCompletionMessage; [x: string]: unknown }[];
  [x: string]: unknown;
}

/**
 * ChatCompletion Object → Message[]（对齐 Semi chatCompletionToMessage）。
 * 每个 choice → 一条 Message；content/refusal → output_text/refusal 块，
 * function_call / tool_calls / audio 各成块。因 `n` 可 >1，返回数组。
 */
export function chatCompletionToMessage(chatCompletion: ChatCompletionObject): AIDialogueMessage[] {
  return chatCompletion.choices.map((choice) => {
    const message = choice.message;
    const role = message.role;
    const id = chatCompletion.id;
    const status: AIMessageStatus = 'completed';
    const outputResult: ContentItem[] = [];

    // text + refusal
    if (message.content !== '' || message.refusal !== '') {
      const annotations: Annotation[] = message.annotations?.length
        ? message.annotations.map((annotation) => ({
            type: annotation.type,
            ...(annotation.url_citation ?? {}),
          }))
        : [];
      const outputMessage = [
        message.content !== '' &&
          message.content !== undefined && {
            type: 'output_text',
            text: message.content,
            annotations,
          },
        message.refusal !== '' &&
          message.refusal !== undefined && { type: 'refusal', refusal: message.refusal },
      ].filter(Boolean) as (OutputText | Refusal)[];
      if (outputMessage.length > 0) {
        outputResult.push({
          type: 'message',
          id,
          role: 'assistant',
          status,
          content: outputMessage,
        } as OutputMessage);
      }
    }

    // function call
    if (message.function_call) {
      outputResult.push({
        ...message.function_call,
        type: 'function_call',
        status: 'completed',
      } as ToolCallContentItem);
    }

    // tool calls
    if (message.tool_calls?.length) {
      for (const toolCall of message.tool_calls) {
        if (toolCall.type === 'function') {
          outputResult.push({
            status: 'completed',
            ...(toolCall.function ?? {}),
            type: 'function_call',
          } as ToolCallContentItem);
        } else {
          outputResult.push({
            ...(toolCall.custom ?? {}),
            type: 'custom_call',
          } as ToolCallContentItem);
        }
      }
    }

    // audio（ChatCompletion 特有）
    if (message.audio) {
      outputResult.push({ type: 'audio', ...message.audio } as CustomContentItem);
    }

    return { id, role, content: outputResult, status };
  });
}

/** 判定 ContentItem 的展示类型（供渲染层分派）。 */
export function contentItemType(item: ContentItem): string {
  return (item as CommonContentItem).type ?? 'unknown';
}

/** 规范化 Message.content 为 ContentItem[]（string → 单个 output_text 块）。 */
export function normalizeDialogueContent(content: AIDialogueMessage['content']): ContentItem[] {
  if (content == null) return [];
  if (typeof content === 'string') {
    return [{ type: 'message', content: [{ type: 'output_text', text: content }] } as OutputMessage];
  }
  return content;
}
