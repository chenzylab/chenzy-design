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

// ————————————————————————————————————————————————
// 流式 Adapter（P1，全功能移植自 Semi streamingResponseToMessage / streamingChatCompletionToMessage）
// ————————————————————————————————————————————————

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 流式响应块（OpenAI Response streaming event，宽松结构：type + 各事件字段）。 */
export interface ResponseStreamChunk {
  type?: string;
  sequence_number?: number;
  [key: string]: unknown;
}

/** streamingResponseToMessage 的可复用状态（跨多次调用增量累积）。 */
export interface StreamingResponseState {
  processedSeq: Set<number>;
  outputs: Map<number, any>;
  meta: { id?: string; model?: string; status?: string; created_at?: number };
  error: { code?: string; message?: string } | null;
  buffer: Map<number, ResponseStreamChunk>;
  lastProcessedSeq: number;
}

/** 深拷贝（避免修改原始 chunk 数据）。 */
function deepCloneChunk(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map((item) => deepCloneChunk(item));
  const cloned: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) cloned[key] = deepCloneChunk(obj[key]);
  }
  return cloned;
}

/**
 * streamingResponseToMessage —— 流式 Response 块的增量归约器（全功能，无序容错）。
 * 对齐 Semi：按 sequence_number 顺序处理、缓冲无序块、MAX_GAP(10) 容错跳过丢失块、
 * 逐类型累积 output_text/refusal/reasoning/function_call/custom_tool_call/mcp/code_interpreter/
 * image_generation 等 delta，快速路径 response.completed 直接返回完整消息。
 *
 * @param chunks 本次到达的流式块数组
 * @param prevState 上次调用返回的 nextState（增量处理；首次传 undefined/null）
 * @returns { message, nextState } —— message 为尽力而为的累积消息（in_progress/completed）；无块返回 null
 */
export function streamingResponseToMessage(
  chunks: ResponseStreamChunk[] | null | undefined,
  prevState?: StreamingResponseState | null,
): { message: AIDialogueMessage | null; nextState: StreamingResponseState | null } | null {
  if (!chunks?.length) return null;

  // 快速路径：末块是 response.completed，直接返回完整响应。
  const tail = chunks[chunks.length - 1] as any;
  if (tail?.type === 'response.completed' && tail.response) {
    const { id, model, status, output, output_text, created_at } = tail.response;
    const message: AIDialogueMessage = { id, role: 'assistant' };
    if (output !== undefined) message.content = output;
    if (created_at !== undefined) message.createdAt = created_at;
    if (output_text !== undefined) message.output_text = output_text;
    if (model !== undefined) message.model = model;
    if (status !== undefined) message.status = status;
    return { message, nextState: null };
  }

  // 初始化 / 从上次状态恢复。
  const state: StreamingResponseState = prevState
    ? {
        processedSeq: new Set(prevState.processedSeq),
        outputs: new Map(prevState.outputs),
        meta: { ...prevState.meta },
        error: prevState.error ?? null,
        buffer: new Map(prevState.buffer),
        lastProcessedSeq: prevState.lastProcessedSeq ?? -1,
      }
    : {
        processedSeq: new Set<number>(),
        outputs: new Map<number, any>(),
        meta: {},
        error: null,
        buffer: new Map<number, ResponseStreamChunk>(),
        lastProcessedSeq: -1,
      };

  // 过滤已处理块，未处理块入缓冲（无 sequence_number 的用 lastProcessedSeq+0.5 临时键）。
  const unprocessed = chunks.filter((c) => {
    const seq = c?.sequence_number;
    return typeof seq !== 'number' || !state.processedSeq.has(seq);
  });
  for (const chunk of unprocessed) {
    const seq = chunk?.sequence_number;
    if (typeof seq === 'number') state.buffer.set(seq, chunk);
    else state.buffer.set(state.lastProcessedSeq + 0.5, chunk);
  }

  // 逐块处理（累积各类型 delta）。
  const processChunk = (chunk: any): void => {
    switch (chunk.type) {
      case 'response.created': {
        const r = chunk.response;
        if (r) {
          state.meta.id = r.id ?? state.meta.id;
          state.meta.model = r.model ?? state.meta.model;
          state.meta.status = r.status ?? state.meta.status;
          state.meta.created_at = r.created_at ?? state.meta.created_at;
        }
        break;
      }
      case 'response.output_item.added': {
        const outIdx = typeof chunk.output_index === 'number' ? chunk.output_index : 0;
        if (!state.outputs.has(outIdx)) state.outputs.set(outIdx, deepCloneChunk(chunk.item ?? {}));
        break;
      }
      case 'response.output_item.done':
        state.outputs.set(chunk.output_index, deepCloneChunk(chunk.item));
        break;
      case 'response.content_part.added':
      case 'response.content_part.done': {
        const item = state.outputs.get(chunk.output_index);
        item.content = item.content ?? [];
        item.content[chunk.content_index] = deepCloneChunk(chunk.part);
        break;
      }
      case 'response.output_text.delta': {
        const item = state.outputs.get(chunk.output_index);
        item.content = item.content ?? [];
        item.content[chunk.content_index] = item.content[chunk.content_index] ?? {
          type: 'output_text',
          text: '',
        };
        item.content[chunk.content_index].text =
          (item.content[chunk.content_index].text ?? '') + (chunk.delta ?? '');
        break;
      }
      case 'response.output_text.done': {
        const item = state.outputs.get(chunk.output_index);
        item.content = item.content ?? [];
        item.content[chunk.content_index] = item.content[chunk.content_index] ?? {
          type: 'output_text',
          text: '',
        };
        item.content[chunk.content_index].text = chunk.text;
        break;
      }
      case 'response.output_text.annotation.added': {
        const item = state.outputs.get(chunk.output_index);
        item.content = item.content ?? [];
        item.content[chunk.content_index] = item.content[chunk.content_index] ?? {
          type: 'output_text',
          text: '',
          annotations: [],
        };
        item.content[chunk.content_index].annotations =
          item.content[chunk.content_index].annotations ?? [];
        item.content[chunk.content_index].annotations[chunk.annotation_index] = deepCloneChunk(
          chunk.annotation,
        );
        break;
      }
      case 'response.refusal.delta': {
        const item = state.outputs.get(chunk.output_index);
        item.content = item.content ?? [];
        item.content[chunk.content_index] = item.content[chunk.content_index] ?? {
          type: 'refusal',
          refusal: '',
        };
        item.content[chunk.content_index].refusal =
          (item.content[chunk.content_index].refusal ?? '') + (chunk.delta ?? '');
        break;
      }
      case 'response.refusal.done': {
        const item = state.outputs.get(chunk.output_index);
        item.content = item.content ?? [];
        item.content[chunk.content_index] = item.content[chunk.content_index] ?? {
          type: 'refusal',
          refusal: '',
        };
        item.content[chunk.content_index].refusal = chunk.refusal;
        break;
      }
      case 'response.reasoning_summary_part.added':
      case 'response.reasoning_summary_part.done': {
        const item = state.outputs.get(chunk.output_index);
        item.summary = item.summary ?? [];
        item.summary[chunk.summary_index] = deepCloneChunk(chunk.part);
        break;
      }
      case 'response.reasoning_summary_text.delta': {
        const item = state.outputs.get(chunk.output_index);
        item.summary = item.summary ?? [];
        item.summary[chunk.summary_index] = item.summary[chunk.summary_index] ?? {
          type: 'reasoning',
          text: '',
        };
        item.summary[chunk.summary_index].text =
          (item.summary[chunk.summary_index].text ?? '') + (chunk.delta ?? '');
        break;
      }
      case 'response.reasoning_summary_text.done': {
        const item = state.outputs.get(chunk.output_index);
        item.summary = item.summary ?? [];
        item.summary[chunk.summary_index] = item.summary[chunk.summary_index] ?? {
          type: 'reasoning',
          text: '',
        };
        item.summary[chunk.summary_index].text = chunk.text;
        break;
      }
      case 'response.reasoning_text.delta': {
        const item = state.outputs.get(chunk.output_index);
        item.content = item.content ?? [];
        item.content[chunk.content_index] = item.content[chunk.content_index] ?? {
          type: 'reasoning',
          text: '',
        };
        item.content[chunk.content_index].text =
          (item.content[chunk.content_index].text ?? '') + (chunk.delta ?? '');
        break;
      }
      case 'response.reasoning_text.done': {
        const item = state.outputs.get(chunk.output_index);
        item.content = item.content ?? [];
        item.content[chunk.content_index] = item.content[chunk.content_index] ?? {
          type: 'reasoning',
          text: '',
        };
        item.content[chunk.content_index].text = chunk.text;
        break;
      }
      case 'response.function_call_arguments.delta': {
        const item = state.outputs.get(chunk.output_index);
        item.arguments = (item.arguments ?? '') + (chunk.delta ?? '');
        break;
      }
      case 'response.function_call_arguments.done': {
        const item = state.outputs.get(chunk.output_index);
        item.arguments = chunk.arguments;
        item.name = chunk.name;
        break;
      }
      case 'response.custom_tool_call_input.delta': {
        const item = state.outputs.get(chunk.output_index);
        item.input = (item.input ?? '') + (chunk.delta ?? '');
        break;
      }
      case 'response.custom_tool_call_input.done': {
        const item = state.outputs.get(chunk.output_index);
        item.input = chunk.input;
        break;
      }
      case 'response.mcp_call_arguments.delta': {
        const item = state.outputs.get(chunk.output_index);
        item.arguments = (item.arguments ?? '') + (chunk.delta ?? '');
        break;
      }
      case 'response.mcp_call_arguments.done': {
        const item = state.outputs.get(chunk.output_index);
        item.arguments = chunk.arguments;
        break;
      }
      case 'response.file_search_call.in_progress':
      case 'response.web_search_call.in_progress':
      case 'response.image_generation_call.in_progress':
      case 'response.mcp_call.in_progress':
      case 'response.mcp_list_tools.in_progress':
      case 'response.code_interpreter_call.in_progress': {
        const out = state.outputs.get(chunk.output_index);
        if (out) out.status = 'in_progress';
        break;
      }
      case 'response.mcp_call.failed':
      case 'response.mcp_list_tools.failed': {
        const out = state.outputs.get(chunk.output_index);
        if (out) out.status = 'failed';
        break;
      }
      case 'response.file_search_call.completed':
      case 'response.web_search_call.completed':
      case 'response.image_generation_call.completed':
      case 'response.mcp_call.completed':
      case 'response.mcp_list_tools.completed':
      case 'response.code_interpreter_call.completed': {
        const out = state.outputs.get(chunk.output_index);
        if (out) out.status = 'completed';
        break;
      }
      case 'response.code_interpreter_call_code.delta': {
        const item = state.outputs.get(chunk.output_index);
        item.code = (item.code ?? '') + (chunk.delta ?? '');
        break;
      }
      case 'response.code_interpreter_call_code.done': {
        const item = state.outputs.get(chunk.output_index);
        item.code = chunk.code;
        break;
      }
      case 'response.image_generation_call.partial_image': {
        const item = state.outputs.get(chunk.output_index);
        if (item) item.result = chunk.partial_image_b64;
        break;
      }
      case 'error':
        state.error = { code: chunk.code, message: chunk.message };
        break;
      case 'response.completed':
        state.meta.status = chunk.response?.status ?? 'completed';
        break;
      default:
        break;
    }
  };

  // 顺序处理：从 lastProcessedSeq+1 开始，处理连续块（含无 seq 的 N.5 块）。
  let nextExpected = state.lastProcessedSeq + 1;
  let processed = false;
  do {
    processed = false;
    const chunk = state.buffer.get(nextExpected);
    if (chunk) {
      processChunk(chunk);
      state.processedSeq.add(nextExpected);
      state.buffer.delete(nextExpected);
      state.lastProcessedSeq = nextExpected;
      nextExpected++;
      processed = true;
    } else {
      const decimalKey = state.lastProcessedSeq + 0.5;
      const noSeqChunk = state.buffer.get(decimalKey);
      if (noSeqChunk) {
        processChunk(noSeqChunk);
        state.buffer.delete(decimalKey);
        state.lastProcessedSeq = nextExpected;
        nextExpected++;
        processed = true;
      }
    }
  } while (processed);

  // 容错：缓冲积压超过 MAX_GAP(10) 时，假设中间块永久丢失，继续处理剩余连续块。
  const MAX_GAP = 10;
  const bufferedSeqs = Array.from(state.buffer.keys())
    .filter((k) => typeof k === 'number' && k === Math.floor(k))
    .sort((a, b) => a - b);
  if (bufferedSeqs.length > MAX_GAP) {
    let lastSeq = state.lastProcessedSeq;
    for (const seq of bufferedSeqs) {
      if (seq === lastSeq + 1) {
        const chunk = state.buffer.get(seq);
        if (chunk) {
          processChunk(chunk);
          state.processedSeq.add(seq);
          state.buffer.delete(seq);
          state.lastProcessedSeq = seq;
          lastSeq = seq;
        }
      } else break;
    }
  }

  // 构建尽力而为消息。
  const content = Array.from(state.outputs.values()).filter((item) => item !== null);
  const output_text = content
    .filter((p) => p?.type === 'output_text')
    .map((p) => p?.text ?? '')
    .join('');
  let message: AIDialogueMessage | null = null;
  if (content.length || state.meta.id) {
    // exactOptionalPropertyTypes：仅在有值时写入 optional 字段。
    message = {
      id: state.meta.id ?? '',
      role: 'assistant',
      content,
      output_text,
      status: state.meta.status ?? 'in_progress',
      error: state.error ?? null,
    };
    if (state.meta.created_at !== undefined) message.createdAt = state.meta.created_at;
    if (state.meta.model !== undefined) message.model = state.meta.model;
  }

  return { message, nextState: state };
}

/** 流式 ChatCompletion 块（choices[].delta 累积）。 */
export interface ChatCompletionStreamChunk {
  id: string;
  choices: Array<{
    index: number;
    delta?: {
      content?: string;
      refusal?: string;
      function_call?: { name?: string; arguments?: string };
      tool_calls?: Array<{
        id?: string;
        function?: { name?: string; arguments?: string };
        custom?: { name?: string; input?: string };
      }>;
    };
    finish_reason?: string | null;
  }>;
  [key: string]: unknown;
}

/** streamingChatCompletionToMessage 的可复用状态。 */
export interface StreamingChatCompletionState {
  processedCountByIndex: Record<string, number>;
  previousResult?: (AIDialogueMessage | undefined)[];
}

/** 按 choice.index 分组（每 chunk 的 choices 拆成单 choice 的独立 chunk）。 */
function groupByChoiceIndex(chunks: ChatCompletionStreamChunk[]): ChatCompletionStreamChunk[][] {
  const grouped: ChatCompletionStreamChunk[][] = [];
  for (const chunk of chunks) {
    for (const choice of chunk.choices) {
      const idx = choice.index;
      if (!grouped[idx]) grouped[idx] = [];
      grouped[idx].push({ ...chunk, choices: [choice] });
    }
  }
  return grouped;
}

/** 末块 finish_reason 非 null → completed，否则 in_progress。 */
function chatCompletionStatus(chunks: ChatCompletionStreamChunk[]): string {
  const last = chunks[chunks.length - 1];
  return last?.choices?.[0]?.finish_reason != null ? 'completed' : 'in_progress';
}

/**
 * streamingChatCompletionToMessage —— 流式 ChatCompletion 块的增量归约器（全功能）。
 * 对齐 Semi：按 choice.index 分组、基于 state.processedCountByIndex 增量处理新到达片段、
 * 累积 content/refusal/function_call/tool_calls（function/custom），产出每 index 一条 Message[]。
 *
 * @param chunks 本次到达的流式块数组
 * @param prevState 上次调用返回的 state（增量；首次传 undefined）
 * @returns { messages, state }
 */
export function streamingChatCompletionToMessage(
  chunks: ChatCompletionStreamChunk[],
  prevState?: StreamingChatCompletionState,
): { messages: AIDialogueMessage[]; state: StreamingChatCompletionState } {
  const grouped = groupByChoiceIndex(chunks);
  let state = prevState;

  const results = grouped
    .map((groupChunks, groupIndex) => {
      const id = groupChunks[0]?.id ?? '';
      const status = chatCompletionStatus(groupChunks);
      const stateKey = `${id}:${groupChunks[0]?.choices?.[0]?.index ?? groupIndex}`;
      const processedCount = state?.processedCountByIndex?.[stateKey] ?? 0;
      const start = processedCount > 0 ? Math.min(processedCount, groupChunks.length) : 0;
      const chunksToProcess = state ? groupChunks.slice(start) : groupChunks;

      // 本 index 无新增内容 → 沿用上次结果。
      if (state && chunksToProcess.length === 0) return state.previousResult?.[groupIndex];

      const previousResult = state?.previousResult?.[groupIndex];
      let textContent = '';
      let refusal = '';
      const functionCall = { name: '', arguments: '' };
      const toolCalls: any[] = [];

      // 从上次结果恢复已累积内容（content 为 ContentItem[] 时遍历）。
      const prevContent = Array.isArray(previousResult?.content) ? previousResult.content : [];
      prevContent.forEach((item: any) => {
        item.content?.forEach?.((content: any) => {
          if (content.type === 'output_text') textContent += content.text;
          if (content.type === 'refusal') refusal += content.refusal;
        });
        if (item.type === 'function_call' && !item.id) {
          functionCall.name = item.name;
          functionCall.arguments = item.arguments;
        }
        if (item.type === 'tool_call' || (item.type === 'function_call' && item.id)) {
          toolCalls.push(item);
        }
      });

      // 累积本次新到达 delta。
      for (const chunk of chunksToProcess) {
        const delta = chunk.choices[0]?.delta;
        if (delta?.content) textContent += delta.content;
        if (delta?.refusal) refusal += delta.refusal;
        if (delta?.function_call) {
          if (delta.function_call.name) functionCall.name += delta.function_call.name;
          functionCall.arguments += delta.function_call.arguments ?? '';
        }
        if (delta?.tool_calls) {
          for (const toolCall of delta.tool_calls) {
            const cur = toolCalls.find((t) => t.id === toolCall.id);
            if (cur) {
              if (toolCall?.function?.name) {
                cur.name += toolCall.function.name;
                cur.arguments += toolCall.function.arguments ?? '';
              } else if (toolCall?.custom?.name) {
                cur.name += toolCall.custom.name;
                cur.input = (cur.input ?? '') + (toolCall.custom.input ?? '');
              }
              cur.status = status;
            } else {
              toolCalls.push({
                ...toolCall?.function,
                ...toolCall?.custom,
                type: toolCall?.function ? 'function_call' : 'custom_call',
                id: toolCall.id,
              });
            }
          }
        }
      }

      const outputMessage = [
        textContent !== '' && { type: 'output_text', text: textContent },
        refusal !== '' && { type: 'refusal', refusal },
      ].filter(Boolean) as any[];
      const outputResult = [
        outputMessage.length > 0 && {
          type: 'message',
          id,
          role: 'assistant',
          status,
          content: outputMessage,
        },
        functionCall.name !== '' && { type: 'function_call', ...functionCall },
        ...toolCalls,
      ].filter(Boolean) as ContentItem[];

      // 更新已处理计数。
      if (state && state.processedCountByIndex) {
        state.processedCountByIndex[stateKey] = groupChunks.length;
      } else {
        state = { processedCountByIndex: { [stateKey]: groupChunks.length } };
      }

      return { id, role: 'assistant', content: outputResult, status } as AIDialogueMessage;
    })
    .filter(Boolean) as AIDialogueMessage[];

  if (!state) state = { processedCountByIndex: {} };
  state.previousResult = results.map((r) => deepCloneChunk(r));
  return { messages: results, state };
}
